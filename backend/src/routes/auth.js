const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { login, refreshToken, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Validation du formulaire de login
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide.'),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe obligatoire.')
];

router.post('/login',   loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout',  authenticate, logout);
router.get('/me',       authenticate, getMe);

module.exports = router;