import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import AddTransaction from '../components/AddTransaction';
import Analytics from '../components/Analytics';
import PredictionCard from '../components/PredictionCard';
import { getTransactions } from '../utils/api';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function handleAdd(tx) {
    // API returns saved transaction under several shapes; normalize
    const item = tx && tx.transaction ? tx.transaction : tx;
    setTransactions(prev => [item, ...prev]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <SummaryCards transactions={transactions} />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <AddTransaction onAdd={handleAdd} />
            <div className="mt-6">
              {loading ? <div className="glass p-4">Loading...</div> : <Analytics transactions={transactions} />}
            </div>
          </div>
          <div className="space-y-4">
            <PredictionCard transactions={transactions} />
            <div className="glass p-4">
              <h3 className="font-semibold">Recent</h3>
              <ul className="mt-2 text-sm text-gray-200">
                {transactions.slice(0,6).map((t, i) => (
                  <li key={t._id || i} className="py-2 border-b border-white/5">
                    <div className="flex justify-between">
                      <div>{t.merchant || t.description}</div>
                      <div>${Number(t.amount||0).toFixed(2)}</div>
                    </div>
                    <p className="text-sm text-gray-400">{t.category} • {t.subcategory || 'Other'}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
