const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ════════════════════════════════════════════════
// HELPER — Vérifie si les deux notes sont présentes
// et finalise le stage automatiquement
// ════════════════════════════════════════════════
const verifierEtFinaliser = async (id_stage) => {
  const [rows] = await pool.execute(
    'SELECT note_enseignant, note_tuteur, note_finale FROM evaluations WHERE id_stage = ?',
    [id_stage]
  );

  const ev = rows[0];
  if (!ev) return;

  // Les deux notes doivent être renseignées (0 est valide, on teste !== null)
  if (ev.note_enseignant === null || ev.note_enseignant === undefined ||
      ev.note_tuteur     === null || ev.note_tuteur     === undefined) {
    return; // Une note manque encore, on attend
  }

  // note_finale est une colonne GÉNÉRÉE par MySQL (60% enseignant + 40% tuteur)
  // → on ne fait PAS de UPDATE dessus, MySQL la calcule automatiquement

  // Passe le stage en "evalue"
  await pool.execute(
    "UPDATE stages SET statut = 'evalue', updated_at = NOW() WHERE id_stage = ?",
    [id_stage]
  );

  // Notifie l'étudiant avec la note calculée par MySQL
  const [stageRows] = await pool.execute(
    'SELECT id_etudiant FROM stages WHERE id_stage = ?',
    [id_stage]
  );
  if (stageRows.length) {
    await pool.execute(`
      INSERT INTO notifications (id_destinataire, id_stage, type_notification, message, lien_action)
      VALUES (?, ?, 'evaluation', ?, ?)
    `, [
      stageRows[0].id_etudiant,
      id_stage,
      `🎓 Votre stage a été évalué. Note finale : ${ev.note_finale}/20`,
      `/stages/${id_stage}`,
    ]);
  }
};

// ════════════════════════════════════════════════
// GET /api/evaluations/:id_stage
// ════════════════════════════════════════════════
const getEvaluation = async (req, res, next) => {
  try {
    const { id_stage } = req.params;
    const [rows] = await pool.execute(`
      SELECT ev.*,
        CONCAT(ut.prenom,' ',ut.nom) AS tuteur_nom,
        CONCAT(ue.prenom,' ',ue.nom) AS enseignant_nom
      FROM evaluations ev
      LEFT JOIN utilisateurs ut ON ev.id_tuteur     = ut.id_utilisateur
      LEFT JOIN utilisateurs ue ON ev.id_enseignant = ue.id_utilisateur
      WHERE ev.id_stage = ?
    `, [id_stage]);

    if (rows.length === 0) return res.status(404).json({ message: 'Aucune évaluation.' });
    res.json({ evaluation: rows[0] });
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════════
// POST /api/evaluations/:id_stage/enseignant
// L'enseignant soumet sa note (stage doit être "termine")
// ════════════════════════════════════════════════
const evaluerEnseignant = async (req, res, next) => {
  try {
    const { id_stage } = req.params;
    const { id_utilisateur } = req.user;
    const { note_enseignant, commentaire_enseignant, criteres } = req.body;

    if (note_enseignant === undefined || note_enseignant < 0 || note_enseignant > 20) {
      return res.status(400).json({ message: 'Note entre 0 et 20 obligatoire.' });
    }

    // Vérifie que le stage lui est assigné ET qu'il est bien terminé
    const [stageRows] = await pool.execute(
      'SELECT * FROM stages WHERE id_stage = ? AND id_enseignant = ?',
      [id_stage, id_utilisateur]
    );
    if (!stageRows.length) return res.status(403).json({ message: 'Stage non assigné.' });

    const stage = stageRows[0];
    if (stage.statut !== 'termine') {
      return res.status(400).json({ message: 'Le stage doit être terminé avant de pouvoir être évalué.' });
    }

    // Upsert : crée ou met à jour la note enseignant
    await pool.execute(`
      INSERT INTO evaluations (id_stage, id_enseignant, note_enseignant, commentaire_enseignant, criteres_json)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        note_enseignant        = VALUES(note_enseignant),
        commentaire_enseignant = VALUES(commentaire_enseignant),
        criteres_json          = VALUES(criteres_json),
        updated_at             = NOW()
    `, [id_stage, id_utilisateur, note_enseignant, commentaire_enseignant || null,
        criteres ? JSON.stringify(criteres) : null]);

    // Notifie l'étudiant que l'enseignant a noté
    await pool.execute(`
      INSERT INTO notifications (id_destinataire, id_stage, type_notification, message, lien_action)
      VALUES (?, ?, 'evaluation_dispo', ?, ?)
    `, [stage.id_etudiant, id_stage,
        '⭐ Votre enseignant a soumis son évaluation.',
        `/stages/${id_stage}`]);

    // Vérifie si les deux notes sont là et finalise si c'est le cas
    await verifierEtFinaliser(id_stage);

    res.json({ message: 'Évaluation enseignant enregistrée.' });
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════════
// POST /api/evaluations/:id_stage/tuteur
// Le tuteur soumet sa note (via token, sans connexion)
// ════════════════════════════════════════════════
const evaluerTuteur = async (req, res, next) => {
  try {
    const { id_stage } = req.params;
    const { token, note_tuteur, commentaire_tuteur, criteres } = req.body;

    if (!token) return res.status(400).json({ message: 'Token manquant.' });
    if (note_tuteur === undefined || note_tuteur < 0 || note_tuteur > 20) {
      return res.status(400).json({ message: 'Note entre 0 et 20 obligatoire.' });
    }

    // Vérifie le token du tuteur
    const [tuteurRows] = await pool.execute(
      'SELECT * FROM tuteurs WHERE token_evaluation = ? AND (token_expiry IS NULL OR token_expiry > NOW())',
      [token]
    );
    if (!tuteurRows.length) return res.status(401).json({ message: 'Token invalide ou expiré.' });

    const tuteur = tuteurRows[0];

    // Vérifie que ce tuteur est bien lié à ce stage ET que le stage est terminé
    const [stageRows] = await pool.execute(
      'SELECT * FROM stages WHERE id_stage = ? AND id_tuteur = ?',
      [id_stage, tuteur.id_utilisateur]
    );
    if (!stageRows.length) return res.status(403).json({ message: 'Token non autorisé pour ce stage.' });

    if (stageRows[0].statut !== 'termine') {
      return res.status(400).json({ message: 'Le stage doit être terminé avant de pouvoir être évalué.' });
    }

    // Upsert : crée ou met à jour la note tuteur
    await pool.execute(`
      INSERT INTO evaluations (id_stage, id_tuteur, note_tuteur, commentaire_tuteur, criteres_json)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        note_tuteur        = VALUES(note_tuteur),
        commentaire_tuteur = VALUES(commentaire_tuteur),
        criteres_json      = VALUES(criteres_json),
        updated_at         = NOW()
    `, [id_stage, tuteur.id_utilisateur, note_tuteur, commentaire_tuteur || null,
        criteres ? JSON.stringify(criteres) : null]);

    // Invalide le token après utilisation
    await pool.execute(
      'UPDATE tuteurs SET token_evaluation = NULL, token_expiry = NULL WHERE id_utilisateur = ?',
      [tuteur.id_utilisateur]
    );

    // Vérifie si les deux notes sont là et finalise si c'est le cas
    await verifierEtFinaliser(id_stage);

    res.json({ message: '✅ Évaluation soumise avec succès. Merci !' });
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════════
// POST /api/evaluations/:id_stage/generer-token
// Génère un token pour que le tuteur puisse évaluer
// ════════════════════════════════════════════════
const genererTokenTuteur = async (req, res, next) => {
  try {
    const { id_stage } = req.params;
    const { id_utilisateur, role } = req.user;

    const [stageRows] = await pool.execute('SELECT * FROM stages WHERE id_stage = ?', [id_stage]);
    if (!stageRows.length) return res.status(404).json({ message: 'Stage introuvable.' });

    const stage = stageRows[0];

    if (role === 'enseignant' && stage.id_enseignant !== id_utilisateur) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    if (!stage.id_tuteur) {
      return res.status(400).json({ message: 'Aucun tuteur assigné à ce stage.' });
    }

    if (stage.statut !== 'termine') {
      return res.status(400).json({ message: 'Le token ne peut être généré que pour un stage terminé.' });
    }

    const token  = uuidv4();
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    await pool.execute(
      'UPDATE tuteurs SET token_evaluation = ?, token_expiry = ? WHERE id_utilisateur = ?',
      [token, expiry, stage.id_tuteur]
    );

    const evalUrl = `${process.env.FRONTEND_URL}/eval/${id_stage}/${token}`;
    res.json({ message: 'Token généré.', token, evalUrl });
  } catch (e) { next(e); }
};

module.exports = { getEvaluation, evaluerEnseignant, evaluerTuteur, genererTokenTuteur };