const rateLimit = require('express-rate-limit');

// Limite générale : 100 requêtes par 15 minutes par IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Trop de requêtes. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite stricte pour le login : 10 tentatives par 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, loginLimiter };