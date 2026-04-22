const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');

const {
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  contactAdmin
} = require('../controllers/authController');

const { authenticate } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// ================================
// VALIDATION LOGIN
// ================================
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide.'),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe obligatoire.'),
];

// ================================
// LIMITER RESET PASSWORD
// ================================
const resetLimiter = loginLimiter;

// ================================
// ROUTES AUTH
// ================================

router.post('/login', loginLimiter, loginValidation, login);

router.post('/refresh', refreshToken);

router.post('/logout', authenticate, logout);

router.get('/me', authenticate, getMe);

// 🔐 MOT DE PASSE OUBLIÉ
router.post('/forgot-password', resetLimiter, forgotPassword);

// 🔐 RESET MOT DE PASSE
router.post('/reset-password', resetPassword);

router.post('/contact-admin', contactAdmin);

module.exports = router;