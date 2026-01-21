const express = require('express');
const router = express.Router();
const { uploadProfileImage } = require('../controllers/fileController');

// FIX: Middleware export name is 'authenticateToken'
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/profile-image', authenticateToken, upload.single('profileImage'), uploadProfileImage);

module.exports = router;