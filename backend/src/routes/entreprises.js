const express      = require('express');
const { pool }     = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/entreprises — Liste toutes les entreprises
router.get('/', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id_entreprise, raison_sociale, ville, secteur_activite FROM entreprises ORDER BY raison_sociale ASC'
    );
    res.json({ entreprises: rows });
  } catch (error) { next(error); }
});

// POST /api/entreprises — Créer une nouvelle entreprise (admin)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { raison_sociale, siret, secteur_activite, adresse, ville, code_postal, pays } = req.body;

    if (!raison_sociale?.trim())
      return res.status(422).json({ message: 'La raison sociale est obligatoire.' });

    const [result] = await pool.execute(
      `INSERT INTO entreprises (raison_sociale, siret, secteur_activite, adresse, ville, code_postal, pays)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        raison_sociale.trim(),
        siret            || null,
        secteur_activite || null,
        adresse          || null,
        ville            || null,
        code_postal      || null,
        pays             || 'France',
      ]
    );
    res.status(201).json({ id_entreprise: result.insertId, raison_sociale: raison_sociale.trim() });
  } catch (error) { next(error); }
});

module.exports = router;