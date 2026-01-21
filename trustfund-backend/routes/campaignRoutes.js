const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns, getCampaignById, updateCampaign, deleteCampaign } = require('../controllers/campaignController');

// FIX: Middleware export name is 'authenticateToken'
const { authenticateToken } = require('../middleware/auth'); 
const { validateCampaign } = require('../middleware/validation');

router.route('/')
    .get(getCampaigns)
    .post(authenticateToken, validateCampaign, createCampaign);

router.route('/:id')
    .get(getCampaignById)
    .put(authenticateToken, updateCampaign)
    .delete(authenticateToken, deleteCampaign);

module.exports = router;