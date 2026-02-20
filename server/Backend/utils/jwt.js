const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(payload, opts = {}) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d', ...opts });
}

function verifyToken(token) {
  return jwt.verify(token, config.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
