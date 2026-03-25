const express = require('express');
const router  = express.Router();
const { getEvaluation, evaluerEnseignant, evaluerTuteur, genererTokenTuteur } = require('../controllers/evaluationController');
const { authenticate, authorize } = require('../middleware/auth');

// Voir l'évaluation d'un stage
router.get('/:id_stage',                authenticate, getEvaluation);

// Enseignant note le stage
router.post('/:id_stage/enseignant',    authenticate, authorize('enseignant', 'admin'), evaluerEnseignant);

// Tuteur note via token (sans connexion)
router.post('/:id_stage/tuteur',        evaluerTuteur);

// Générer le token pour le tuteur
router.post('/:id_stage/generer-token', authenticate, authorize('enseignant', 'admin'), genererTokenTuteur);

module.exports = router;