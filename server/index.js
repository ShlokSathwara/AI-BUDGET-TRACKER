const express = require('express');
const cors = require('cors');
const db = require('./db');
const backendApp = require('./Backend/routes');
const mongoose = require('mongoose');
const config = require('./Backend/config');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize DB
db.init().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Connect to MongoDB for authentication
mongoose.connect(config.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(() => {
  console.log('Connected to MongoDB for authentication');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// Use backend routes for authentication
app.use('/api', backendApp);

app.get('/', (req, res) => {
  res.send('Smart Budget Tracker server is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
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

// Extract transaction details from SMS
app.post('/extract-sms', async (req, res) => {
  try {
    const { smsText } = req.body;
    if (!smsText) {
      return res.status(400).json({ error: 'SMS text is required' });
    }
    
    // This would require implementing the same parsing logic as in the client
    // For now, we'll return a placeholder - in a real implementation you'd use
    // the same parsing functions from the client-side code
    const transactionDetails = extractTransactionFromSMS(smsText);
    res.json({ transaction: transactionDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to extract transaction from SMS' });
  }
});

// Extract transaction details from email
app.post('/extract-email', async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject && !body) {
      return res.status(400).json({ error: 'Either subject or body is required' });
    }
    
    const transactionDetails = extractTransactionFromEmail(subject, body);
    res.json({ transaction: transactionDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to extract transaction from email' });
  }
});

// Helper functions for transaction extraction
function extractTransactionFromSMS(smsText) {
  // Simplified extraction logic - in practice, this would be more sophisticated
  const amountMatches = smsText.match(/(?:rs|inr|rupees|₹|\$|usd)\s*([\d,]+\.?\d*)/i);
  const amount = amountMatches ? parseFloat(amountMatches[1].replace(/,/g, '')) : null;
  
  const merchantMatches = smsText.match(/(?:at|on|for)\s+([A-Z0-9\s&]{3,30})/i);
  const merchant = merchantMatches ? merchantMatches[1].trim() : 'Bank Transaction';
  
  // Determine type
  let type = 'debit';
  if (smsText.toLowerCase().includes('credited') || smsText.toLowerCase().includes('credit')) {
    type = 'credit';
  }
  
  // Extract account last 4 digits
  const accountMatches = smsText.match(/(?:XXXX-?|\*{2,4}-?)(\d{4})/);
  const lastFourDigits = accountMatches ? accountMatches[1] : null;
  
  return {
    amount,
    merchant,
    type,
    lastFourDigits,
    originalSMS: smsText
  };
}

function extractTransactionFromEmail(subject, body) {
  const fullText = (subject || '') + ' ' + (body || '');
  const amountMatches = fullText.match(/(?:rs|inr|rupees|₹|\$|usd)\s*([\d,]+\.?\d*)/i);
  const amount = amountMatches ? parseFloat(amountMatches[1].replace(/,/g, '')) : null;
  
  const merchantMatches = fullText.match(/(?:from|via|at)\s+([A-Z0-9\s&]{3,30})/i);
  const merchant = merchantMatches ? merchantMatches[1].trim() : 'Email Transaction';
  
  // Determine type
  let type = 'debit';
  if (fullText.toLowerCase().includes('credited') || fullText.toLowerCase().includes('refunded') || fullText.toLowerCase().includes('returned')) {
    type = 'credit';
  }
  
  return {
    amount,
    merchant,
    type,
    originalEmail: fullText
  };
}

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
