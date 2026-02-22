const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PhoneUser = require('../models/PhoneUser');
const OTP = require('../models/OTP');
const jwtUtil = require('../utils/jwt');
const { generateOTP, getOTPExpiryTime } = require('../utils/otpGenerator');
const { sendOTP } = require('../utils/smsService');
const { sendEmail, generateVerificationToken } = require('../utils/emailService');
const { 
  authLimiter, 
  emailVerificationLimiter, 
  accountLockout, 
  updateLoginAttempts,
  validateEmail,
  validatePassword,
  sanitizeInput
} = require('../middleware/security');
const config = require('../config');

// Register with email verification
router.post('/register', emailVerificationLimiter, async (req, res) => {
  try {
    console.log('Register endpoint hit with body:', req.body);
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedPassword = sanitizeInput(password);
    
    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Validate password strength
    if (!validatePassword(sanitizedPassword)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      if (existingUser.emailVerified) {
        return res.status(409).json({ error: 'User already exists with this email' });
      } else {
        // User exists but email not verified - allow re-registration
        await User.deleteOne({ _id: existingUser._id });
      }
    }
    
    // Hash password
    const hash = await bcrypt.hash(sanitizedPassword, 12);
    
    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hash,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });
    
    console.log('User created:', user._id);
    
    // Send verification email
    const verificationLink = `${config.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(sanitizedEmail)}`;
    
    const emailResult = await sendEmail(sanitizedEmail, 'verification', {
      name: sanitizedName,
      link: verificationLink
    });
    
    console.log('Email result:', emailResult);
    
    if (!emailResult.success) {
      // If email fails, delete the user
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Registration successful! Please check your email for verification.',
      email: sanitizedEmail
    });
    
    console.log('Registration response sent successfully');
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.query;
    
    if (!token || !email) {
      return res.status(400).json({ error: 'Invalid verification link' });
    }
    
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }
    
    // Verify email
    console.log('User before verification:', user);
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    console.log('User after setting verification:', user);
    await user.save();
    console.log('User after save:', user);
    
    // Send welcome email
    await sendEmail(user.email, 'welcome', { name: user.name });
    
    // Generate JWT token for immediate login
    const jwtToken = jwtUtil.signToken({ id: user._id });
    
    res.json({
      success: true,
      message: 'Email verified successfully!',
      token: jwtToken,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        emailVerified: true
      }
    });
    
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend verification email
router.post('/resend-verification', emailVerificationLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    const user = await User.findOne({ 
      email: sanitizedEmail,
      emailVerified: false 
    });
    
    if (!user) {
      return res.status(400).json({ error: 'No unverified account found with this email' });
    }
    
    if (user.emailVerificationExpires && user.emailVerificationExpires > Date.now()) {
      return res.status(400).json({ error: 'Verification email already sent. Please check your inbox.' });
    }
    
    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();
    
    // Send verification email
    const verificationLink = `${config.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(sanitizedEmail)}`;
    
    const emailResult = await sendEmail(sanitizedEmail, 'verification', {
      name: user.name,
      link: verificationLink
    });
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    res.json({ 
      success: true,
      message: 'Verification email sent successfully!',
      email: sanitizedEmail
    });
    
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Login with email verification check
router.post('/login', authLimiter, accountLockout, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedPassword = sanitizeInput(password);
    
    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    
    console.log('User found for login:', user);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if email is verified
    console.log('User email verified status:', user.emailVerified);
    if (!user.emailVerified) {
      return res.status(401).json({ 
        error: 'Please verify your email address before logging in',
        requiresEmailVerification: true
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password);
    
    if (!isPasswordValid) {
      await updateLoginAttempts(user, false);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset login attempts on successful login
    await updateLoginAttempts(user, true);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
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
    
    console.log('Login response sent successfully');
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Request password reset
router.post('/forgot-password', emailVerificationLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    const user = await User.findOne({ email: sanitizedEmail, emailVerified: true });
    
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ 
        success: true, 
        message: 'If an account exists, password reset instructions have been sent.' 
      });
    }
    
    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();
    
    // Send reset email
    const resetLink = `${config.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(sanitizedEmail)}`;
    
    const emailResult = await sendEmail(sanitizedEmail, 'passwordReset', {
      name: user.name,
      link: resetLink
    });
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }
    
    res.json({ 
      success: true,
      message: 'Password reset instructions sent to your email'
    });
    
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: 'Token, email, and new password are required' });
    }
    
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedPassword = sanitizeInput(newPassword);
    
    if (!validatePassword(sanitizedPassword)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
      });
    }
    
    const user = await User.findOne({
      email: sanitizedEmail,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const hash = await bcrypt.hash(sanitizedPassword, 12);
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = undefined;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Password reset failed' });
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
