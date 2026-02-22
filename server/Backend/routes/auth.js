const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PhoneUser = require('../models/PhoneUser');
const OTP = require('../models/OTP');
const { generateOTP, getOTPExpiryTime } = require('../utils/otpGenerator');
const { sendOTP } = require('../utils/smsService');
const { sanitizeInput, validateEmail } = require('../middleware/security');
const config = require('../config');

const router = express.Router();

// Generate JWT token
const jwtUtil = {
  signToken: (payload) => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
  },
  verifyToken: (token) => {
    return jwt.verify(token, config.JWT_SECRET);
  }
};

// Simple login/create account (no password required)
router.post('/login', async (req, res) => {
  try {
    console.log('Simple login endpoint hit with body:', req.body);
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedName = sanitizeInput(name);
    
    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Find or create user
    let user = await User.findOne({ email: sanitizedEmail });
    
    if (!user) {
      // Create new user
      user = await User.create({
        name: sanitizedName,
        email: sanitizedEmail,
        emailVerified: true // No verification needed since no password
      });
      
      console.log('New user created:', user._id);
    } else {
      // Update name if different
      if (user.name !== sanitizedName) {
        user.name = sanitizedName;
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = jwtUtil.signToken({ id: user._id });
    
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        emailVerified: user.emailVerified
      }
    });
    
    console.log('Login response sent successfully for user:', user._id);
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Request OTP for phone number (existing functionality)
router.post('/request-otp', async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });
    
    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/; // Basic validation for 10-digit Indian numbers
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime();

    // Save OTP to database
    await OTP.updateOne(
      { phoneNumber },
      { 
        phoneNumber,
        otp,
        expiresAt,
        verified: false
      },
      { upsert: true, new: true }
    );

    // Send OTP via SMS
    const smsSent = await sendOTP(phoneNumber, otp);
    
    if (!smsSent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      phoneNumber: phoneNumber
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Request OTP failed' });
  }
});

// Verify OTP and create/login user (existing functionality)
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) return res.status(400).json({ error: 'Phone number and OTP are required' });

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      phoneNumber, 
      otp,
      expiresAt: { $gte: new Date() } // Check if OTP hasn't expired
    });

    if (!otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Check if user already exists
    let phoneUser = await PhoneUser.findOne({ phoneNumber });

    if (!phoneUser) {
      // Create new user
      phoneUser = await PhoneUser.create({ 
        phoneNumber,
        name: req.body.name || `User_${phoneNumber.substring(6)}` // Default name if not provided
      });
    } else {
      // Update last login
      phoneUser.lastLogin = new Date();
      await phoneUser.save();
    }

    // Generate JWT token
    const token = jwtUtil.signToken({ id: phoneUser._id });

    // Return success response
    res.json({ 
      token,
      user: { 
        id: phoneUser._id, 
        phoneNumber: phoneUser.phoneNumber, 
        name: phoneUser.name,
        verified: phoneUser.verified 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verify OTP failed' });
  }
});

// Update user profile
router.put('/profile', jwtUtil.verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;
    
    const updates = {};
    if (name) updates.name = sanitizeInput(name);
    if (email) {
      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      if (!validateEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }
      updates.email = sanitizedEmail;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update profile failed' });
  }
});

module.exports = router;
