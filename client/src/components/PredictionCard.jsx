import React from 'react';

export default function PredictionCard({ transactions = [] }) {
  // very simple forecast: monthly average spending
  if (!transactions.length) return <div className="glass">No forecast available</div>;
  const amounts = transactions.map(t => t.amount || 0);
  const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  const forecast = avg * 30; // naive monthly projection

  return (
    <div className="glass">
      <div className="text-sm text-gray-300">AI Forecast (naive)</div>
      <div className="text-2xl font-bold">${forecast.toFixed(2)}</div>
      <div className="text-xs text-gray-400">Estimated total next month</div>
    </div>
  );
}
