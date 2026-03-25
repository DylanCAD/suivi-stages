// Middleware global de gestion d'erreurs
// Il est appelé quand on fait next(error) dans un controller

const errorHandler = (err, req, res, next) => {
  console.error('🔴 Erreur:', err.stack || err.message);

  // Erreur de validation (express-validator)
  if (err.type === 'validation') {
    return res.status(422).json({
      message: 'Données invalides.',
      errors: err.errors
    });
  }

  // Erreur MySQL : doublon (clé unique)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Cette valeur existe déjà (email ou SIRET dupliqué).'
    });
  }

  // Erreur MySQL : contrainte FK
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      message: 'Impossible de supprimer : des données liées existent.'
    });
  }

  // Fichier trop volumineux (multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'Fichier trop volumineux. Maximum 10 Mo.'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message || 'Erreur serveur interne.';

  res.status(statusCode).json({ message });
};

// Middleware pour les routes introuvables (404)
const notFound = (req, res) => {
  res.status(404).json({
    message: `Route introuvable : ${req.method} ${req.originalUrl}`
  });
};

module.exports = { errorHandler, notFound };