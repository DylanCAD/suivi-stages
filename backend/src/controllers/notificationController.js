const { pool } = require('../config/database');

// GET /api/notifications — Mes notifications
const getNotifications = async (req, res, next) => {
  try {
    const { id_utilisateur } = req.user;
    const { lue } = req.query;

    let query = 'SELECT * FROM notifications WHERE id_destinataire = ?';
    const params = [id_utilisateur];

    if (lue !== undefined) {
      query += ' AND lue = ?';
      params.push(lue === 'true' ? 1 : 0);
    }

    query += ' ORDER BY date_envoi DESC LIMIT 50';
    const [rows] = await pool.execute(query, params);

    // Compte les non lues
    const [count] = await pool.execute(
      'SELECT COUNT(*) as nb FROM notifications WHERE id_destinataire = ? AND lue = 0',
      [id_utilisateur]
    );

    res.json({ notifications: rows, nb_non_lues: count[0].nb });
  } catch (error) { next(error); }
};

// PATCH /api/notifications/:id/lire — Marquer comme lue
const marquerLue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_utilisateur } = req.user;

    await pool.execute(
      'UPDATE notifications SET lue = 1 WHERE id_notification = ? AND id_destinataire = ?',
      [id, id_utilisateur]
    );
    res.json({ message: 'Notification marquée comme lue.' });
  } catch (error) { next(error); }
};

// PATCH /api/notifications/lire-tout — Tout marquer comme lu
const marquerToutLu = async (req, res, next) => {
  try {
    await pool.execute(
      'UPDATE notifications SET lue = 1 WHERE id_destinataire = ?',
      [req.user.id_utilisateur]
    );
    res.json({ message: 'Toutes les notifications marquées comme lues.' });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, marquerLue, marquerToutLu };