const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize DB
db.init().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.send('Smart Budget Tracker server is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Persist a transaction
app.post('/transactions', async (req, res) => {
  try {
    const tx = req.body;
    // If no category provided, try to auto-categorize
    if (!tx.category) {
      tx.category = await db.categorizeTransaction(tx);
    }
    const result = await db.addTransaction(tx);
    res.status(201).json({ message: 'Transaction saved', id: result.id, transaction: tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const rows = await db.getTransactions();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Categorize a single transaction (without saving)
app.post('/categorize', async (req, res) => {
  try {
    const tx = req.body;
    const category = await db.categorizeTransaction(tx);
    res.json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to categorize' });
  }
});

// Budgets
app.post('/budgets', async (req, res) => {
  try {
    const b = req.body;
    const result = await db.addBudget(b);
    res.status(201).json({ message: 'Budget saved', id: result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

app.get('/budgets', async (req, res) => {
  try {
    const rows = await db.getBudgets();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
