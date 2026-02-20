const jwtUtil = require('../utils/jwt');
const User = require('../models/User');

async function optional(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next();
  const parts = auth.split(' ');
  if (parts.length !== 2) return next();
  const token = parts[1];
  try {
    const payload = jwtUtil.verifyToken(token);
    const user = await User.findById(payload.id).select('-password');
    if (user) req.user = { id: user._id, email: user.email };
  } catch (err) {
    // ignore invalid token for optional
  }
  next();
}

async function required(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Authorization required' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Malformed authorization' });
  const token = parts[1];
  try {
    const payload = jwtUtil.verifyToken(token);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = { id: user._id, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { optional, required };
