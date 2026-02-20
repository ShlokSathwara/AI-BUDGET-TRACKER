import React, { useState } from 'react';
import { createTransaction, categorize } from '../utils/api';
import api from '../utils/api';

export default function AddTransaction({ onAdd }) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Use smart AI endpoint: construct a single text blob
      const text = `${amount} ${merchant} ${description}`.trim();
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await api.post('/transactions/smart-add', { text, type: 'debit' }, { headers });
      const saved = resp.data;
      onAdd && onAdd(saved);
      setAmount(''); setMerchant(''); setDescription(''); setCategory('');
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  return (
    <form className="glass space-y-3" onSubmit={submit}>
      <div className="flex gap-2">
        <input required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" className="flex-1 p-2 bg-transparent border border-white/10 rounded" />
        <input value={merchant} onChange={e=>setMerchant(e.target.value)} placeholder="Merchant" className="flex-2 p-2 bg-transparent border border-white/10 rounded" />
      </div>
      <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 bg-transparent border border-white/10 rounded" />
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (optional)" className="w-full p-2 bg-transparent border border-white/10 rounded" />
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-indigo-600 rounded" disabled={loading}>{loading? 'Saving...' : 'Add Transaction'}</button>
      </div>
    </form>
  );
}
