const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
exports.authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // --- 🔍 DEBUG LOGS START ---
    console.log('\n🔍 --- AUTH MIDDLEWARE DEBUG ---');
    console.log('1. Authorization Header:', authHeader ? 'Present' : 'Missing');
    console.log('2. Received Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'None');
    // --- 🔍 DEBUG LOGS END ---

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- 🔍 DEBUG TIME LOGS ---
    const expirationTime = new Date(decoded.exp * 1000);
    const currentTime = new Date();
    console.log('3. Decoded Payload:', decoded);
    console.log('4. Token Expires At:', expirationTime.toString());
    console.log('5. Current Server Time:', currentTime.toString());
    
    if (currentTime > expirationTime) {
        console.log('❌ RESULT: Token is EXPIRED');
    } else {
        console.log('✅ RESULT: Token is VALID');
    }
    console.log('-----------------------------\n');
    // --- 🔍 DEBUG LOGS END ---

    // Get user from database
    // FIX: Ensure we look for 'userId' because that's how we signed it in authController
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('❌ Error: User not found in DB with ID:', decoded.userId);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        error: 'Your account has been deactivated.' 
      });
    }

    if (!user.isVerified) {
      // Note: You might want to temporarily disable this check if you haven't built email verification yet
      // return res.status(403).json({ 
      //   success: false,
      //   error: 'Please verify your email first.' 
      // });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ AUTH CRASH:', error.name, error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired. Please login again.' 
      });
    }
    return res.status(500).json({ 
      success: false,
      error: 'Authentication error.' 
    });
  }
};

// Optional Authentication
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Admin Only Middleware
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin privileges required.' 
    });
  }

  next();
};

// Check Campaign Ownership
exports.isCampaignOwner = async (req, res, next) => {
  try {
    const Campaign = require('../models/Campaign');
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        error: 'Campaign not found' 
      });
    }

    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'You are not authorized to perform this action' 
      });
    }

    req.campaign = campaign;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Authorization error' 
    });
  }
};