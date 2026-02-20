const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
  PORT: process.env.BACKEND_PORT || process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/smart-budget',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret'
};
