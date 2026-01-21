const express = require('express');
const router = express.Router();
const { processMockPayment } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Route for the fake payment demo
router.post('/mock', authenticateToken, processMockPayment);

module.exports = router;