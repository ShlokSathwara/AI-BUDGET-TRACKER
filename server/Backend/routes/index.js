const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./auth');
const txnRoutes = require('./transactions');
const errorHandler = require('../middleware/errorHandler');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', txnRoutes);

app.use(errorHandler);

module.exports = app;
