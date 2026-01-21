const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');

// FIX: Middleware export name is 'authenticateToken'
const { authenticateToken } = require('../middleware/auth'); 

// FIX: Import validators
const { validateRegistration, validateLogin, validatePasswordReset } = require('../middleware/validation');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', validatePasswordReset, resetPassword);

router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;