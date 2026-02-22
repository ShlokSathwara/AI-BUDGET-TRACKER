const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./utils/db');

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

// Import models to ensure they're registered with Mongoose
require('./models/User');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:19006', // Expo default
    'http://localhost:19000', // Expo dev tools
    process.env.FRONTEND_URL,
    process.env.MOBILE_APP_URL
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use(require('./middleware/errorHandler'));

async function start() {
  try {
    await db.connect();
    const PORT = config.PORT || 5000; // Changed to 5000 to match what was expected
    app.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start backend server', err);
    process.exit(1);
  }
}

start();
