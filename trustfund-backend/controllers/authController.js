const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { welcomeEmail, resetPasswordEmail } = require('../utils/emailTemplates');

// FIX: Use 'userId' to match middleware
const generateToken = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    
    // FIX: Removed 'profile' nesting & mapped 'phone' to 'phoneNumber'
    const user = await User.create({ 
      firstName, 
      lastName, 
      phoneNumber: phone, 
      email, 
      password 
    });
    
    const token = generateToken(user._id);
    
    // Use try/catch for email so registration doesn't fail if email fails
    try {
        await sendEmail({ email: user.email, subject: 'Welcome to TrustFund!', html: welcomeEmail(user.firstName) });
    } catch (err) { console.error('Email failed:', err); }

    res.status(201).json({ success: true, token, user });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    
    const token = generateToken(user._id);
    res.status(200).json({ success: true, token, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getMe = (req, res) => res.status(200).json({ success: true, data: req.user });

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    // FIX: Removed 'profile' nesting
    const user = await User.findByIdAndUpdate(req.user.id, 
        { $set: { firstName, lastName, phoneNumber: phone } }, 
        { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        // FIX: Method name in Model is 'generatePasswordResetToken'
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/resetpassword/${resetToken}`;
        await sendEmail({ email: user.email, subject: 'Password Reset Request', html: resetPasswordEmail(resetUrl) });
        res.status(200).json({ success: true, message: `Email sent to ${user.email}` });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.resetPassword = async (req, res) => {
    try {
        // FIX: Typo 'sha266' -> 'sha256'
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        
        const token = generateToken(user._id);
        res.status(200).json({ success: true, token, message: 'Password has been reset' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};