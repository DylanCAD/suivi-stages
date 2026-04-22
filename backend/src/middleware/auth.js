const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant. Veuillez vous connecter.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.execute(
      'SELECT id_utilisateur, nom, prenom, email, role, actif FROM utilisateurs WHERE id_utilisateur = ?',
      [decoded.id]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: 'Utilisateur introuvable.' });

    if (!rows[0].actif)
      return res.status(403).json({ message: 'Compte désactivé.' });

    req.user = rows[0];
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide.' });
    }
    console.error('Erreur auth middleware:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'Non authentifié.' });

  if (!roles.includes(req.user.role))
    return res.status(403).json({
      message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}.`
    });

  next();
};

module.exports = { authenticate, authorize };