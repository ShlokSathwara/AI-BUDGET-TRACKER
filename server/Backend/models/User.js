const mongoose = require('mongoose');

// Mock User class for development
class MockUser {
  constructor(userData) {
    this._id = userData._id || MockUser.idCounter++;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.emailVerified = userData.emailVerified || false;
    this.emailVerificationToken = userData.emailVerificationToken;
    this.emailVerificationExpires = userData.emailVerificationExpires;
    this.resetPasswordToken = userData.resetPasswordToken;
    this.resetPasswordExpires = userData.resetPasswordExpires;
    this.lastLogin = userData.lastLogin;
    this.loginAttempts = userData.loginAttempts || 0;
    this.lockUntil = userData.lockUntil;
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  static async findOne(query) {
    if (query.email) {
      const user = MockUser.users.find(u => u.email === query.email);
      return user ? new MockUser(user) : null;
    }
    if (query._id) {
      const user = MockUser.users.find(u => u._id === query._id);
      return user ? new MockUser(user) : null;
    }
    return null;
  }

  static async create(userData) {
    const user = new MockUser(userData);
    MockUser.users.push(user);
    return user;
  }

  static async deleteOne(query) {
    if (query._id) {
      MockUser.users = MockUser.users.filter(u => u._id !== query._id);
    }
  }

  static async findByIdAndUpdate(id, updates, options) {
    const userIndex = MockUser.users.findIndex(u => u._id === id);
    if (userIndex === -1) return null;
    
    MockUser.users[userIndex] = { ...MockUser.users[userIndex], ...updates, updatedAt: new Date() };
    return new MockUser(MockUser.users[userIndex]);
  }

  save() {
    const userIndex = MockUser.users.findIndex(u => u._id === this._id);
    if (userIndex !== -1) {
      MockUser.users[userIndex] = { ...this, updatedAt: new Date() };
    } else {
      MockUser.users.push(this);
    }
    return Promise.resolve(this);
  }

  get isLocked() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  }
}

// Global state for mock users
MockUser.users = [];
MockUser.idCounter = 1;

// Use mock user in development, real mongoose model in production
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  console.log('Using mock User model for development');
  module.exports = MockUser;
} else {
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String
    },
    emailVerificationExpires: {
      type: Date
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    lastLogin: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  // Index for email verification
  UserSchema.index({ emailVerificationToken: 1 });
  UserSchema.index({ resetPasswordToken: 1 });

  // Virtual for account locked
  UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  });

  // Pre-save middleware to update updatedAt
  UserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  module.exports = mongoose.model('User', UserSchema);
}
