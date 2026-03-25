const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// ─── Génère un access token (durée courte : 2h) ───
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id_utilisateur, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
};

// ─── Génère un refresh token (durée longue : 7 jours) ───
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id_utilisateur },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// ════════════════════════════════════════════════
// POST /api/auth/login
// ════════════════════════════════════════════════
const login = async (req, res, next) => {
  try {
    // 1. Valide les données envoyées
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Données invalides.', errors: errors.array() });
    }

    const { email, mot_de_passe } = req.body;

    // 2. Cherche l'utilisateur par email
    const [rows] = await pool.execute(
      `SELECT u.*, 
              CASE 
                WHEN u.role = 'etudiant'     THEN e.formation
                WHEN u.role = 'enseignant'   THEN en.departement
                WHEN u.role = 'tuteur'       THEN t.poste
                ELSE NULL
              END as info_role
       FROM utilisateurs u
       LEFT JOIN etudiants e  ON u.id_utilisateur = e.id_utilisateur
       LEFT JOIN enseignants en ON u.id_utilisateur = en.id_utilisateur
       LEFT JOIN tuteurs t    ON u.id_utilisateur = t.id_utilisateur
       WHERE u.email = ?`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const user = rows[0];

    // 3. Vérifie que le compte est actif
    if (!user.actif) {
      return res.status(403).json({ message: 'Compte désactivé. Contactez l\'administration.' });
    }

    // 4. Compare le mot de passe avec le hash bcrypt
    const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // 5. Génère les tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 6. Sauvegarde le refresh token en base
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 jours
    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = ?, token_expiry = ? WHERE id_utilisateur = ?',
      [refreshToken, expiry, user.id_utilisateur]
    );

    // 7. Répond avec les infos (sans le mot de passe !)
    res.json({
      message: 'Connexion réussie.',
      accessToken,
      refreshToken,
      user: {
        id:        user.id_utilisateur,
        nom:       user.nom,
        prenom:    user.prenom,
        email:     user.email,
        role:      user.role,
        info_role: user.info_role
      }
    });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// POST /api/auth/refresh
// Renouvelle l'access token avec le refresh token
// ════════════════════════════════════════════════
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token manquant.' });
    }

    // Vérifie le refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Vérifie qu'il correspond bien à celui en base
    const [rows] = await pool.execute(
      'SELECT * FROM utilisateurs WHERE id_utilisateur = ? AND refresh_token = ? AND token_expiry > NOW()',
      [decoded.id, token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Refresh token invalide ou expiré.' });
    }

    const user = rows[0];
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token invalide.' });
    }
    next(error);
  }
};

// ════════════════════════════════════════════════
// POST /api/auth/logout
// ════════════════════════════════════════════════
const logout = async (req, res, next) => {
  try {
    // Efface le refresh token en base
    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = NULL, token_expiry = NULL WHERE id_utilisateur = ?',
      [req.user.id_utilisateur]
    );
    res.json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// GET /api/auth/me
// Renvoie les infos de l'utilisateur connecté
// ════════════════════════════════════════════════
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.role, u.created_at,
              e.formation, e.numero_etudiant, e.annee_promotion, e.photo_url,
              en.departement, en.specialite, en.bureau,
              t.poste, t.id_entreprise,
              a.niveau_acces
       FROM utilisateurs u
       LEFT JOIN etudiants e   ON u.id_utilisateur = e.id_utilisateur AND u.role = 'etudiant'
       LEFT JOIN enseignants en ON u.id_utilisateur = en.id_utilisateur AND u.role = 'enseignant'
       LEFT JOIN tuteurs t     ON u.id_utilisateur = t.id_utilisateur AND u.role = 'tuteur'
       LEFT JOIN administrateurs a ON u.id_utilisateur = a.id_utilisateur AND u.role = 'admin'
       WHERE u.id_utilisateur = ?`,
      [req.user.id_utilisateur]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, refreshToken, logout, getMe };