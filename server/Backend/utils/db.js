const mongoose = require('mongoose');
const config = require('../config');

async function connect() {
  const uri = config.MONGO_URI;
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
}

module.exports = { connect };
