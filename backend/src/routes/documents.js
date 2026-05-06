const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { downloadDocument, deleteDocument } = require('../controllers/documentController');

// GET /api/documents/:id/download — Télécharger un document
router.get('/:id/download', authenticate, downloadDocument);

// DELETE /api/documents/:id — Supprimer un document
router.delete('/:id', authenticate, authorize('etudiant', 'admin'), deleteDocument);

module.exports = router;