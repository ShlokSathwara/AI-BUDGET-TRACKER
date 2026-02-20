const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function init() {
  // Create tables
  await run(
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      keywords TEXT
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      date TEXT,
      amount REAL,
      merchant TEXT,
      description TEXT,
      category TEXT,
      subcategory TEXT,
      confidence REAL DEFAULT 1
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY,
      category TEXT,
      amount REAL,
      period TEXT
    )`
  );

  // Seed some categories if empty
  const rows = await all('SELECT COUNT(*) as c FROM categories');
  const count = rows && rows[0] ? rows[0].c : 0;
  if (count === 0) {
    const seeds = [
      { name: 'Groceries', keywords: 'grocery,supermarket,walmart,tesco,aldi' },
      { name: 'Rent', keywords: 'rent,landlord' },
      { name: 'Utilities', keywords: 'electric,water,gass,utility' },
      { name: 'Transport', keywords: 'uber,lyft,gas,transit,metro' },
      { name: 'Dining', keywords: 'restaurant,cafe,starbucks,bar' },
      { name: 'Entertainment', keywords: 'netflix,spotify,movie,cinema' }
    ];
    for (const s of seeds) {
      await run('INSERT OR IGNORE INTO categories (name, keywords) VALUES (?, ?)', [s.name, s.keywords]);
    }
  }
}

async function addTransaction(tx) {
  const { date, amount, merchant, description, category, subcategory, confidence } = tx;
  const res = await run(
    'INSERT INTO transactions (date, amount, merchant, description, category, subcategory, confidence) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [date || null, amount || 0, merchant || '', description || '', category || null, subcategory || null, confidence || 1]
  );
  return { id: res.lastID };
}

async function getTransactions() {
  return all('SELECT * FROM transactions ORDER BY date DESC');
}

async function addBudget(b) {
  const { category, amount, period } = b;
  const res = await run('INSERT INTO budgets (category, amount, period) VALUES (?, ?, ?)', [category, amount, period || 'monthly']);
  return { id: res.lastID };
}

async function getBudgets() {
  return all('SELECT * FROM budgets');
}

async function categorizeTransaction({ merchant = '', description = '' }) {
  const categories = await all('SELECT * FROM categories');
  const text = (merchant + ' ' + description).toLowerCase();
  for (const cat of categories) {
    if (!cat.keywords) continue;
    const kws = cat.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    for (const kw of kws) {
      if (text.includes(kw)) return cat.name;
    }
  }
  return 'Uncategorized';
}

module.exports = {
  init,
  addTransaction,
  getTransactions,
  addBudget,
  getBudgets,
  categorizeTransaction
};
