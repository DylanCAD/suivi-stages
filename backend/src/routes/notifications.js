const express = require('express');
const router  = express.Router();
const { getNotifications, marquerLue, marquerToutLu } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/',                    authenticate, getNotifications);
router.patch('/lire-tout',         authenticate, marquerToutLu);
router.patch('/:id/lire',          authenticate, marquerLue);

module.exports = router;