const User = require('../models/User');

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
    const user = await User.findByIdAndUpdate(req.user.id, { 'profile.profileImage': req.file.path }, { new: true });
    res.status(200).json({ success: true, message: 'Image uploaded', imageUrl: req.file.path, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};