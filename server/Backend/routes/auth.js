const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PhoneUser = require('../models/PhoneUser');
const OTP = require('../models/OTP');
const jwtUtil = require('../utils/jwt');
const { generateOTP, getOTPExpiryTime } = require('../utils/otpGenerator');
const { sendOTP } = require('../utils/smsService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwtUtil.signToken({ id: user._id });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwtUtil.signToken({ id: user._id });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Request OTP for phone number
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

// Verify OTP and create/login user
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
    if (name) updates.name = name;
    if (email) updates.email = email;
    
    const user = await PhoneUser.findByIdAndUpdate(
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
        phoneNumber: user.phoneNumber, 
        email: user.email,
        name: user.name 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update profile failed' });
  }
});

module.exports = router;
