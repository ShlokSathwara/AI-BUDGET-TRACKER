const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./auth');
const txnRoutes = require('./transactions');
const errorHandler = require('../middleware/errorHandler');

const router = express.Router();

// CORS configuration
router.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:19006', // Expo default
    'http://localhost:19000', // Expo dev tools
    process.env.FRONTEND_URL,
    process.env.MOBILE_APP_URL
  ],
  credentials: true
}));

router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

router.use('/auth', authRoutes);
router.use('/transactions', txnRoutes);

router.use(errorHandler);

module.exports = router;
