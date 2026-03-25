const express = require('express');
const router  = express.Router();
const { exportStagePDF, exportStagesCSV } = require('../controllers/exportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stage/:id',   authenticate, exportStagePDF);
router.get('/stages-csv',  authenticate, authorize('admin'), exportStagesCSV);

module.exports = router;