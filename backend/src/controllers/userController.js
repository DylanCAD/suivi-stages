const bcrypt   = require('bcryptjs');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// ════════════════════════════════════════════════
// GET /api/users — Liste tous les utilisateurs (admin)
// ════════════════════════════════════════════════
const getUsers = async (req, res, next) => {
  try {
    const { role, search, actif } = req.query;

    let query = `
      SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.role, u.actif, u.created_at,
             e.formation, e.numero_etudiant,
             en.departement,
             t.poste
      FROM utilisateurs u
      LEFT JOIN etudiants    e  ON u.id_utilisateur = e.id_utilisateur
      LEFT JOIN enseignants  en ON u.id_utilisateur = en.id_utilisateur
      LEFT JOIN tuteurs      t  ON u.id_utilisateur = t.id_utilisateur
      WHERE 1=1
    `;
    const params = [];

    if (role)   { query += ' AND u.role = ?';  params.push(role); }
    if (actif !== undefined) { query += ' AND u.actif = ?'; params.push(actif === 'true' ? 1 : 0); }
    if (search) {
      query += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += ' ORDER BY u.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ users: rows, total: rows.length });

  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════
// POST /api/users — Créer un utilisateur (admin)
// ════════════════════════════════════════════════
const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { nom, prenom, email, mot_de_passe, role, formation, departement, poste, id_entreprise, niveau_acces } = req.body;

    // Hash le mot de passe
    const hash = await bcrypt.hash(mot_de_passe, 12);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insère dans utilisateurs
      const [result] = await connection.execute(
        'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
        [nom, prenom, email.toLowerCase(), hash, role]
      );
      const id = result.insertId;

      // Insère dans la table spécialisée selon le rôle
      if (role === 'etudiant') {
        await connection.execute(
          'INSERT INTO etudiants (id_utilisateur, formation) VALUES (?, ?)',
          [id, formation || '']
        );
      } else if (role === 'enseignant') {
        await connection.execute(
          'INSERT INTO enseignants (id_utilisateur, departement) VALUES (?, ?)',
          [id, departement || '']
        );
      } else if (role === 'tuteur') {
        await connection.execute(
          'INSERT INTO tuteurs (id_utilisateur, poste, id_entreprise) VALUES (?, ?, ?)',
          [id, poste || '', id_entreprise]
        );
      } else if (role === 'admin') {
        await connection.execute(
          'INSERT INTO administrateurs (id_utilisateur, niveau_acces) VALUES (?, ?)',
          [id, niveau_acces || 1]
        );
      }

      await connection.commit();
      res.status(201).json({ message: 'Utilisateur créé avec succès.', id_utilisateur: id });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════
// PATCH /api/users/:id/toggle — Activer/désactiver (admin)
// ════════════════════════════════════════════════
const toggleUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT actif FROM utilisateurs WHERE id_utilisateur = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const newActif = rows[0].actif ? 0 : 1;
    await pool.execute('UPDATE utilisateurs SET actif = ? WHERE id_utilisateur = ?', [newActif, id]);
    res.json({ message: `Compte ${newActif ? 'activé' : 'désactivé'} avec succès.`, actif: newActif });

  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════
// PUT /api/users/me — Modifier son propre profil
// ════════════════════════════════════════════════
const updateProfile = async (req, res, next) => {
  try {
    const { id_utilisateur, role } = req.user;
    const { nom, prenom, telephone, bureau, specialite } = req.body;

    await pool.execute(
      'UPDATE utilisateurs SET nom = ?, prenom = ?, updated_at = NOW() WHERE id_utilisateur = ?',
      [nom, prenom, id_utilisateur]
    );

    if (role === 'etudiant' && telephone) {
      await pool.execute('UPDATE etudiants SET telephone = ? WHERE id_utilisateur = ?', [telephone, id_utilisateur]);
    }
    if (role === 'enseignant') {
      await pool.execute('UPDATE enseignants SET bureau = ?, specialite = ? WHERE id_utilisateur = ?', [bureau, specialite, id_utilisateur]);
    }

    res.json({ message: 'Profil mis à jour.' });
  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════
// PUT /api/users/me/password — Changer son mot de passe
// ════════════════════════════════════════════════
const changePassword = async (req, res, next) => {
  try {
    const { id_utilisateur } = req.user;
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    const [rows] = await pool.execute('SELECT mot_de_passe FROM utilisateurs WHERE id_utilisateur = ?', [id_utilisateur]);
    const valid  = await bcrypt.compare(ancien_mot_de_passe, rows[0].mot_de_passe);
    if (!valid) return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });

    const hash = await bcrypt.hash(nouveau_mot_de_passe, 12);
    await pool.execute('UPDATE utilisateurs SET mot_de_passe = ? WHERE id_utilisateur = ?', [hash, id_utilisateur]);
    res.json({ message: 'Mot de passe modifié avec succès.' });

  } catch (error) { next(error); }
};

module.exports = { getUsers, createUser, toggleUser, updateProfile, changePassword };