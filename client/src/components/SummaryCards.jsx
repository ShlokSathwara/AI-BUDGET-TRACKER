import React from 'react';

export default function SummaryCards({ transactions = [] }) {
  const total = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const spending = transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + (t.amount || 0), 0);
  const income = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="glass">
        <div className="text-sm text-gray-300">Total</div>
        <div className="text-2xl font-bold">${total.toFixed(2)}</div>
      </div>
      <div className="glass">
        <div className="text-sm text-gray-300">Spending</div>
        <div className="text-2xl font-bold text-red-300">${spending.toFixed(2)}</div>
      </div>
      <div className="glass">
        <div className="text-sm text-gray-300">Income</div>
        <div className="text-2xl font-bold text-green-300">${income.toFixed(2)}</div>
      </div>
    </div>
  );
}
