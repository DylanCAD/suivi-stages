const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { getUsers, createUser, toggleUser, updateProfile, changePassword } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const createUserValidation = [
  body('nom').notEmpty().withMessage('Nom obligatoire.'),
  body('prenom').notEmpty().withMessage('Prénom obligatoire.'),
  body('email').isEmail().withMessage('Email invalide.'),
  body('mot_de_passe')
    .isLength({ min: 12 }).withMessage('Mot de passe : 12 caractères minimum.')
    .matches(/[A-Z]/).withMessage('Mot de passe : au moins une majuscule.')
    .matches(/[a-z]/).withMessage('Mot de passe : au moins une minuscule.')
    .matches(/[0-9]/).withMessage('Mot de passe : au moins un chiffre.')
    .matches(/[^A-Za-z0-9]/).withMessage('Mot de passe : au moins un caractère spécial (ex: !@#$).'),
  body('role').isIn(['etudiant', 'enseignant', 'tuteur', 'admin']).withMessage('Rôle invalide.'),
];

router.get('/',             authenticate, authorize('admin'), getUsers);
router.post('/',            authenticate, authorize('admin'), createUserValidation, createUser);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleUser);
router.put('/me',           authenticate, updateProfile);
router.put('/me/password',  authenticate, changePassword);

module.exports = router;