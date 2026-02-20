import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#7bdff2'];

export default function Analytics({ transactions = [] }) {
  // group by subcategory when available, otherwise fall back to category
  const byCategory = transactions.reduce((acc, t) => {
    const key = t.subcategory || t.category || 'Uncategorized';
    acc[key] = (acc[key] || 0) + (t.amount || 0);
    return acc;
  }, {});
  const data = Object.keys(byCategory).map((k, i) => ({ name: k, value: byCategory[k], color: COLORS[i % COLORS.length] }));

  if (data.length === 0) return <div className="glass">No data</div>;

  return (
    <div className="glass h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
