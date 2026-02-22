const rateLimit = require('express-rate-limit');
const User = require('../models/User');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for email verification
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 verification requests per hour
  message: {
    error: 'Too many verification requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Account lockout middleware
const accountLockout = async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next();
  }
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user && user.isLocked) {
      const timeLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({
        error: `Account is locked due to too many failed login attempts. Try again in ${timeLeft} minutes.`
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Update login attempts
const updateLoginAttempts = async (user, success) => {
  if (success) {
    // Reset on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  } else {
    // Increment on failed login
    user.loginAttempts += 1;
    
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Lock for 2 hours
    }
  }
  
  await user.save();
};

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

module.exports = {
  authLimiter,
  emailVerificationLimiter,
  accountLockout,
  updateLoginAttempts,
  validateEmail,
  validatePassword,
  sanitizeInput
};