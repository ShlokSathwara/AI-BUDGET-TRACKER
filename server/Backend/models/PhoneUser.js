const mongoose = require('mongoose');

const PhoneUserSchema = new mongoose.Schema({
  name: { type: String },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  email: { 
    type: String, 
    lowercase: true 
  },
  password: { 
    type: String 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  lastLogin: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('PhoneUser', PhoneUserSchema);