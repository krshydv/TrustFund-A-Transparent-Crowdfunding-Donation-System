const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// Protect this route so only logged-in users (or admins) can see it
router.get('/dashboard', authenticateToken, getDashboardStats);

module.exports = router;