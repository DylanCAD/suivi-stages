const { pool } = require('../config/database');
const path = require('path');
const fs   = require('fs');

// ════════════════════════════════════════════════
// POST /api/stages/:id/documents — Uploader un fichier
// ════════════════════════════════════════════════
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });

    const { id: id_stage } = req.params;
    const { type_document } = req.body;
    const { id_utilisateur } = req.user;

    // Vérifie que l'étudiant est bien lié à ce stage
    const [rows] = await pool.execute(
      'SELECT id_etudiant FROM stages WHERE id_stage = ?', [id_stage]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Stage introuvable.' });
    if (rows[0].id_etudiant !== id_utilisateur && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Enregistre en base
    await pool.execute(`
      INSERT INTO documents (id_stage, nom_fichier, nom_original, type_document, chemin_stockage, taille_octets, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id_stage,
      req.file.filename,
      req.file.originalname,
      type_document || 'autre',
      req.file.path,
      req.file.size,
      req.file.mimetype
    ]);

    // Notifie l'enseignant
    const [stage] = await pool.execute('SELECT id_enseignant FROM stages WHERE id_stage = ?', [id_stage]);
    if (stage[0]?.id_enseignant) {
      await pool.execute(`
        INSERT INTO notifications (id_destinataire, id_stage, type_notification, message, lien_action)
        VALUES (?, ?, 'document_depose', ?, ?)
      `, [stage[0].id_enseignant, id_stage, `Un nouveau document a été déposé pour le stage #${id_stage}.`, `/stages/${id_stage}`]);
    }

    res.status(201).json({
      message: 'Document uploadé avec succès.',
      fichier: req.file.originalname
    });

  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════
// GET /api/stages/:id/documents — Lister les documents
// ════════════════════════════════════════════════
const getDocuments = async (req, res, next) => {
  try {
    const { id: id_stage } = req.params;
    const [docs] = await pool.execute(
      'SELECT * FROM documents WHERE id_stage = ? ORDER BY date_depot DESC', [id_stage]
    );
    res.json({ documents: docs });
  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════
// GET /api/documents/:id/download — Télécharger
// ════════════════════════════════════════════════
const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM documents WHERE id_document = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Document introuvable.' });

    const doc = rows[0];
    const filePath = doc.chemin_stockage;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier introuvable sur le serveur.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${doc.nom_original}"`);
    res.setHeader('Content-Type', doc.mime_type);
    res.sendFile(path.resolve(filePath));

  } catch (error) { next(error); }
};

// ════════════════════════════════════════════════
// DELETE /api/documents/:id — Supprimer un document
// ════════════════════════════════════════════════
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_utilisateur, role } = req.user;

    const [rows] = await pool.execute(`
      SELECT d.*, s.id_etudiant FROM documents d
      JOIN stages s ON d.id_stage = s.id_stage
      WHERE d.id_document = ?`, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Document introuvable.' });
    const doc = rows[0];

    if (role !== 'admin' && doc.id_etudiant !== id_utilisateur) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Supprime le fichier physique
    if (fs.existsSync(doc.chemin_stockage)) {
      fs.unlinkSync(doc.chemin_stockage);
    }

    await pool.execute('DELETE FROM documents WHERE id_document = ?', [id]);
    res.json({ message: 'Document supprimé.' });

  } catch (error) { next(error); }
};

module.exports = { uploadDocument, getDocuments, downloadDocument, deleteDocument };