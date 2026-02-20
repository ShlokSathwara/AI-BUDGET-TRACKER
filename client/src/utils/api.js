import axios from 'axios';

const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const api = axios.create({
  baseURL: base,
  timeout: 5000,
});

export async function getTransactions() {
  const res = await api.get('/transactions');
  return res.data;
}

export async function createTransaction(tx) {
  const res = await api.post('/transactions', tx);
  return res.data;
}

export async function categorize(tx) {
  const res = await api.post('/categorize', tx);
  return res.data;
}

export async function getBudgets() {
  const res = await api.get('/budgets');
  return res.data;
}

export async function createBudget(b) {
  const res = await api.post('/budgets', b);
  return res.data;
}

export default api;
