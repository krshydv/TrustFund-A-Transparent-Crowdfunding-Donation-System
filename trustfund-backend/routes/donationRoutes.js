const express = require('express');
const router = express.Router();
const { createDonation } = require('../controllers/donationController');

// FIX: Middleware export name is 'authenticateToken'
const { authenticateToken } = require('../middleware/auth');
const { validateDonation } = require('../middleware/validation');

router.post('/campaign/:campaignId', authenticateToken, createDonation);

module.exports = router;