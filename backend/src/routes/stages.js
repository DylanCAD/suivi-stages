const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  getStages,
  getStageById,
  createStage,
  validerStage,
  changerStatut,
  updateStage,
  getStats,
} = require('../controllers/stageController');

const { uploadDocument, getDocuments, downloadDocument, deleteDocument } = require('../controllers/documentController');

// ── Validation création stage ─────────────────────────────────────────────────
const stageValidation = [
  body('titre').notEmpty().withMessage('Le titre est obligatoire.'),
  body('date_debut').isDate().withMessage('Date de début invalide.'),
  body('date_fin').isDate().withMessage('Date de fin invalide.'),
  body('date_fin').custom((val, { req }) => {
    if (new Date(val) <= new Date(req.body.date_debut)) {
      throw new Error('La date de fin doit être après la date de début.');
    }
    return true;
  }),
];

// ── Routes stages ─────────────────────────────────────────────────────────────
router.get('/stats',          authenticate, getStats);
router.get('/',               authenticate, getStages);
router.get('/:id',            authenticate, getStageById);
router.post('/',              authenticate, authorize('etudiant'), stageValidation, createStage);
router.put('/:id/valider',    authenticate, authorize('enseignant', 'admin'), validerStage);

// Changer le statut : valide → en_cours (Démarrer) / en_cours → termine (Terminer)
router.put('/:id/statut',     authenticate, authorize('enseignant', 'admin'), changerStatut);

router.put('/:id',            authenticate, authorize('etudiant'), updateStage);

// ── Routes documents liés à un stage ─────────────────────────────────────────
router.get('/:id/documents',  authenticate, getDocuments);
router.post('/:id/documents', authenticate, authorize('etudiant', 'admin'), upload.single('fichier'), uploadDocument);

router.get('/:id/documents',   authenticate, getDocuments);
router.post('/:id/documents',  authenticate, authorize('etudiant', 'admin'), upload.single('fichier'), uploadDocument);

module.exports = router;