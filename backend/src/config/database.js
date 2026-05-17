const mysql = require('mysql2/promise');
require('dotenv').config();

// Crée un "pool" de connexions MySQL
// Un pool = plusieurs connexions disponibles en même temps
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,       // max 10 connexions simultanées
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+01:00',        // heure française
});

// Fonction pour tester la connexion au démarrage
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connecté à MySQL avec succès !');
    connection.release();
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL :', error.message);
    process.exit(1); // Arrête le serveur si pas de BDD
  }
};

module.exports = { pool, testConnection };
