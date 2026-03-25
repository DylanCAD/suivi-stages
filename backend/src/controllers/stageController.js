const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// ════════════════════════════════════════════════
// GET /api/stages
// Liste les stages selon le rôle de l'utilisateur
// ════════════════════════════════════════════════
const getStages = async (req, res, next) => {
  try {
    const { role, id_utilisateur } = req.user;
    const { statut, archive, annee_scolaire, search } = req.query;

    let query = `
      SELECT 
        s.*,
        CONCAT(ue.prenom, ' ', ue.nom)   AS etudiant_nom,
        CONCAT(uen.prenom, ' ', uen.nom) AS enseignant_nom,
        CONCAT(ut.prenom, ' ', ut.nom)   AS tuteur_nom,
        ent.raison_sociale               AS entreprise_nom,
        ent.ville                        AS entreprise_ville,
        et.formation,
        (SELECT COUNT(*) FROM documents d WHERE d.id_stage = s.id_stage AND d.est_valide = 1) AS nb_documents
      FROM stages s
      LEFT JOIN etudiants   e   ON s.id_etudiant    = e.id_utilisateur
      LEFT JOIN utilisateurs ue  ON e.id_utilisateur = ue.id_utilisateur
      LEFT JOIN utilisateurs uen ON s.id_enseignant  = uen.id_utilisateur
      LEFT JOIN utilisateurs ut  ON s.id_tuteur      = ut.id_utilisateur
      LEFT JOIN entreprises ent  ON s.id_entreprise  = ent.id_entreprise
      LEFT JOIN etudiants   et   ON s.id_etudiant    = et.id_utilisateur
      WHERE 1=1
    `;

    const params = [];

    // ── Filtre par rôle ──
    if (role === 'etudiant') {
      query += ' AND s.id_etudiant = ?';
      params.push(id_utilisateur);
    } else if (role === 'enseignant') {
      query += ' AND s.id_enseignant = ?';
      params.push(id_utilisateur);
    } else if (role === 'tuteur') {
      query += ' AND s.id_tuteur = ?';
      params.push(id_utilisateur);
    }
    // admin voit tout

    // ── Filtres optionnels ──
    if (statut) { query += ' AND s.statut = ?'; params.push(statut); }
    if (archive !== undefined) { query += ' AND s.archive = ?'; params.push(archive === 'true' ? 1 : 0); }
    if (annee_scolaire) { query += ' AND s.annee_scolaire = ?'; params.push(annee_scolaire); }
    if (search) {
      query += ' AND (s.titre LIKE ? OR ent.raison_sociale LIKE ? OR ue.nom LIKE ? OR ue.prenom LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    query += ' ORDER BY s.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json({ stages: rows, total: rows.length });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// GET /api/stages/:id
// Détail d'un stage
// ════════════════════════════════════════════════
const getStageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id_utilisateur } = req.user;

    const [rows] = await pool.execute(`
      SELECT 
        s.*,
        ue.nom AS etudiant_nom, ue.prenom AS etudiant_prenom, ue.email AS etudiant_email,
        et.formation, et.numero_etudiant, et.annee_promotion,
        uen.nom AS enseignant_nom, uen.prenom AS enseignant_prenom, uen.email AS enseignant_email,
        en_ref.departement, en_ref.specialite,
        ut.nom AS tuteur_nom, ut.prenom AS tuteur_prenom, ut.email AS tuteur_email,
        tut.poste AS tuteur_poste,
        ent.raison_sociale, ent.siret, ent.secteur_activite, ent.adresse, ent.ville, ent.code_postal, ent.site_web,
        ev.note_finale, ev.note_tuteur, ev.note_enseignant
      FROM stages s
      LEFT JOIN etudiants    et   ON s.id_etudiant   = et.id_utilisateur
      LEFT JOIN utilisateurs ue   ON et.id_utilisateur = ue.id_utilisateur
      LEFT JOIN enseignants  en_ref ON s.id_enseignant = en_ref.id_utilisateur
      LEFT JOIN utilisateurs uen  ON en_ref.id_utilisateur = uen.id_utilisateur
      LEFT JOIN tuteurs      tut  ON s.id_tuteur      = tut.id_utilisateur
      LEFT JOIN utilisateurs ut   ON tut.id_utilisateur = ut.id_utilisateur
      LEFT JOIN entreprises  ent  ON s.id_entreprise  = ent.id_entreprise
      LEFT JOIN evaluations  ev   ON s.id_stage       = ev.id_stage
      WHERE s.id_stage = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Stage introuvable.' });
    }

    const stage = rows[0];

    // Vérifie les droits d'accès
    if (role === 'etudiant'   && stage.id_etudiant   !== id_utilisateur) return res.status(403).json({ message: 'Accès refusé.' });
    if (role === 'enseignant' && stage.id_enseignant !== id_utilisateur) return res.status(403).json({ message: 'Accès refusé.' });
    if (role === 'tuteur'     && stage.id_tuteur     !== id_utilisateur) return res.status(403).json({ message: 'Accès refusé.' });

    // Récupère aussi les documents liés
    const [documents] = await pool.execute(
      'SELECT * FROM documents WHERE id_stage = ? ORDER BY date_depot DESC',
      [id]
    );

    res.json({ stage: { ...stage, documents } });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// POST /api/stages
// Créer un nouveau stage (étudiant seulement)
// ════════════════════════════════════════════════
const createStage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Données invalides.', errors: errors.array() });
    }

    const { id_utilisateur } = req.user;
    const {
      titre, description, missions,
      date_debut, date_fin,
      // Infos entreprise
      raison_sociale, siret, secteur_activite, adresse, ville, code_postal, site_web,
      // Infos tuteur (optionnel à la création)
      tuteur_nom, tuteur_prenom, tuteur_email, tuteur_poste
    } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Crée ou retrouve l'entreprise
      let id_entreprise = null;
      if (raison_sociale) {
        // Cherche si elle existe déjà (par SIRET ou nom)
        let entreprise_query = siret
          ? 'SELECT id_entreprise FROM entreprises WHERE siret = ?'
          : 'SELECT id_entreprise FROM entreprises WHERE raison_sociale = ?';
        const [existingEnt] = await connection.execute(entreprise_query, [siret || raison_sociale]);

        if (existingEnt.length > 0) {
          id_entreprise = existingEnt[0].id_entreprise;
        } else {
          const [entResult] = await connection.execute(
            'INSERT INTO entreprises (raison_sociale, siret, secteur_activite, adresse, ville, code_postal, site_web) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [raison_sociale, siret || null, secteur_activite || null, adresse || null, ville || null, code_postal || null, site_web || null]
          );
          id_entreprise = entResult.insertId;
        }
      }

      // 2. Calcule l'année scolaire automatiquement
      const debut = new Date(date_debut);
      const annee = debut.getMonth() >= 8
        ? `${debut.getFullYear()}-${debut.getFullYear() + 1}`
        : `${debut.getFullYear() - 1}-${debut.getFullYear()}`;

      // 3. Récupère l'enseignant référent de l'étudiant
      const [etudiant] = await connection.execute(
        'SELECT id_enseignant_ref FROM etudiants WHERE id_utilisateur = ?',
        [id_utilisateur]
      );
      const id_enseignant = etudiant[0]?.id_enseignant_ref || null;

      // 4. Crée le stage
      const [result] = await connection.execute(`
        INSERT INTO stages (id_etudiant, id_enseignant, id_entreprise, titre, description, missions, date_debut, date_fin, statut, annee_scolaire)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', ?)
      `, [id_utilisateur, id_enseignant, id_entreprise, titre, description || null, missions || null, date_debut, date_fin, annee]);

      const id_stage = result.insertId;

      // 5. Crée une notification pour l'enseignant référent
      if (id_enseignant) {
        await connection.execute(`
          INSERT INTO notifications (id_destinataire, id_stage, type_notification, message, lien_action)
          VALUES (?, ?, 'validation', ?, ?)
        `, [
          id_enseignant,
          id_stage,
          `Un nouveau stage est en attente de votre validation.`,
          `/stages/${id_stage}`
        ]);
      }

      await connection.commit();

      res.status(201).json({
        message: 'Stage déclaré avec succès. En attente de validation.',
        id_stage
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// PUT /api/stages/:id/valider
// Valider ou refuser un stage (enseignant / admin)
// ════════════════════════════════════════════════
const validerStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, motif_refus } = req.body; // decision = 'valide' | 'refuse'
    const { id_utilisateur, role } = req.user;

    if (!['valide', 'refuse'].includes(decision)) {
      return res.status(400).json({ message: 'Décision invalide. Valeurs : valide, refuse.' });
    }
    if (decision === 'refuse' && !motif_refus) {
      return res.status(400).json({ message: 'Le motif de refus est obligatoire.' });
    }

    // Récupère le stage
    const [rows] = await pool.execute(
      'SELECT * FROM stages WHERE id_stage = ?', [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Stage introuvable.' });

    const stage = rows[0];

    // Vérifie les droits
    if (role === 'enseignant' && stage.id_enseignant !== id_utilisateur) {
      return res.status(403).json({ message: 'Ce stage ne vous est pas assigné.' });
    }

    // Met à jour le statut
    await pool.execute(
      'UPDATE stages SET statut = ?, motif_refus = ?, updated_at = NOW() WHERE id_stage = ?',
      [decision, decision === 'refuse' ? motif_refus : null, id]
    );

    // Notifie l'étudiant
    const messageNotif = decision === 'valide'
      ? '✅ Votre stage a été validé !'
      : `❌ Votre stage a été refusé. Motif : ${motif_refus}`;

    await pool.execute(`
      INSERT INTO notifications (id_destinataire, id_stage, type_notification, message, lien_action)
      VALUES (?, ?, ?, ?, ?)
    `, [stage.id_etudiant, id, decision === 'valide' ? 'validation' : 'refus', messageNotif, `/stages/${id}`]);

    res.json({ message: `Stage ${decision === 'valide' ? 'validé' : 'refusé'} avec succès.` });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// PUT /api/stages/:id
// Modifier un stage (étudiant, si statut = en_attente ou refuse)
// ════════════════════════════════════════════════
const updateStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_utilisateur } = req.user;

    const [rows] = await pool.execute('SELECT * FROM stages WHERE id_stage = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Stage introuvable.' });

    const stage = rows[0];
    if (stage.id_etudiant !== id_utilisateur) return res.status(403).json({ message: 'Accès refusé.' });
    if (!['en_attente', 'refuse'].includes(stage.statut)) {
      return res.status(400).json({ message: 'Ce stage ne peut plus être modifié.' });
    }

    const { titre, description, missions, date_debut, date_fin } = req.body;

    await pool.execute(`
      UPDATE stages SET titre = ?, description = ?, missions = ?, date_debut = ?, date_fin = ?,
      statut = 'en_attente', motif_refus = NULL, updated_at = NOW()
      WHERE id_stage = ?
    `, [titre, description, missions, date_debut, date_fin, id]);

    res.json({ message: 'Stage mis à jour. Renvoyé en attente de validation.' });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// GET /api/stages/stats
// Statistiques pour le dashboard
// ════════════════════════════════════════════════
const getStats = async (req, res, next) => {
  try {
    const { role, id_utilisateur } = req.user;

    let whereClause = '';
    const params = [];

    if (role === 'etudiant') {
      whereClause = 'WHERE id_etudiant = ?';
      params.push(id_utilisateur);
    } else if (role === 'enseignant') {
      whereClause = 'WHERE id_enseignant = ?';
      params.push(id_utilisateur);
    } else if (role === 'tuteur') {
      whereClause = 'WHERE id_tuteur = ?';
      params.push(id_utilisateur);
    }

    const [stats] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(statut = 'en_attente') as en_attente,
        SUM(statut = 'valide')     as valide,
        SUM(statut = 'refuse')     as refuse,
        SUM(statut = 'en_cours')   as en_cours,
        SUM(statut = 'termine')    as termine,
        SUM(statut = 'evalue')     as evalue
      FROM stages ${whereClause}
    `, params);

    // Stats admin supplémentaires
    let adminStats = {};
    if (role === 'admin') {
      const [users] = await pool.execute(`
        SELECT
          COUNT(*) as total_users,
          SUM(role = 'etudiant')   as nb_etudiants,
          SUM(role = 'enseignant') as nb_enseignants,
          SUM(role = 'tuteur')     as nb_tuteurs
        FROM utilisateurs WHERE actif = 1
      `);
      adminStats = users[0];
    }

    res.json({ stats: { ...stats[0], ...adminStats } });

  } catch (error) {
    next(error);
  }
};

module.exports = { getStages, getStageById, createStage, validerStage, updateStage, getStats };