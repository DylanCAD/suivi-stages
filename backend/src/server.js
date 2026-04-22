require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const helmet  = require('helmet');

const { testConnection } = require('./config/database');
const { testMailer } = require('./config/mailer');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// ─── Import des routes ───
const authRoutes         = require('./routes/auth');
const stageRoutes        = require('./routes/stages');
const userRoutes         = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const evaluationRoutes   = require('./routes/evaluations');
const exportRoutes       = require('./routes/export');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security ───
app.use(helmet());

// ─── CORS ───
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// ─── Body parsers ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiter global ───
app.use(generalLimiter);

// ─── Static files ───
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes API ───
app.use('/api/auth',          authRoutes);
app.use('/api/stages',        stageRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/evaluations',   evaluationRoutes);
app.use('/api/export',        exportRoutes);

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🎓 API Suivi des Stages opérationnelle',
    timestamp: new Date().toISOString()
  });
});

// ─── Error handling ───
app.use(notFound);
app.use(errorHandler);

// ─── Start server ───
const startServer = async () => {
  await testConnection();

  // 🔥 TEST EMAIL ACTIVÉ ICI
  await testMailer();

  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ════════════════════════════════════════');
    console.log(`   Serveur démarré sur http://localhost:${PORT}`);
    console.log('   ════════════════════════════════════════');
    console.log('');
  });
};

startServer();