const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { detectCategoryAndSub } = require('../utils/aiUtils');
const { parseTransaction } = require('../utils/aiParser');
const { generateInsights } = require('../utils/insights');
const { detectAnomalies } = require('../utils/anomaly');
const auth = require('../middleware/auth');

// Create transaction
router.post('/', auth.optional, async (req, res) => {
  try {
    const { amount, type, description, merchant, category, bankAccountId, paymentMethod } = req.body;

    // If category not provided, detect category and subcategory from description/merchant
    let cat = category;
    let subcategory = null;
    if (!cat) {
      const detected = detectCategoryAndSub((merchant || '') + ' ' + (description || ''));
      cat = detected.category;
      subcategory = detected.subcategory;
    }

    const tx = await Transaction.create({
      user: req.user ? req.user.id : undefined,
      amount,
      type,
      merchant,
      description,
      category: cat,
      subcategory,
      bankAccountId: bankAccountId || null,
      paymentMethod: paymentMethod || null
    });

    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// List transactions (optionally by user)
router.get('/', auth.optional, async (req, res) => {
  try {
    const q = {};
    if (req.user) q.user = req.user.id;
    const tx = await Transaction.find(q).sort({ date: -1 }).limit(200);
    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

// Smart add using NLP parser
router.post('/smart-add', auth.required, async (req, res) => {
  try {
    const { text, type } = req.body;
    const parsed = parseTransaction(text);

    const tx = await Transaction.create({
      user: req.user.id,
      amount: parsed.amount,
      type: type || 'debit',
      category: parsed.category,
      subcategory: parsed.subcategory,
      description: parsed.description,
      confidence: parsed.confidence
    });

    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'AI parsing failed' });
  }
});

// Insights for user
router.get('/insights', auth.required, async (req, res) => {
  try {
    const tx = await Transaction.find({ user: req.user.id });
    const insights = generateInsights(tx);
    res.json({ insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Anomalies
router.get('/anomalies', auth.required, async (req, res) => {
  try {
    const tx = await Transaction.find({ user: req.user.id });
    const anomalies = detectAnomalies(tx);
    res.json({ anomalies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to detect anomalies' });
  }
});

module.exports = router;
