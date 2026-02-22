const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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