const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// ─── Crée le dossier uploads s'il n'existe pas ───
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Configuration du stockage ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crée un sous-dossier par étudiant : uploads/<id_etudiant>/
    const userDir = path.join(uploadDir, String(req.user?.id_utilisateur || 'temp'));
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Nom unique = UUID + extension originale (évite les collisions)
    const ext      = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// ─── Filtre : types de fichiers acceptés ───
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // accepté
  } else {
    cb(new Error('Type de fichier non autorisé. Acceptés : PDF, DOCX, DOC, JPEG, PNG'), false);
  }
};

// ─── Instance multer ───
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024  // 10 Mo max
  }
});

module.exports = upload;