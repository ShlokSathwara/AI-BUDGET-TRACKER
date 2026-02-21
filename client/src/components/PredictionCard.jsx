import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Calendar } from 'lucide-react';

export default function PredictionCard({ transactions = [] }) {
  // Simple forecast: monthly average spending
  if (!transactions.length) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">AI Forecast</h3>
        <p className="text-gray-400">Add transactions to see predictions</p>
      </motion.div>
    );
  }

  const amounts = transactions.map(t => t.amount || 0);
  const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  const forecast = avg * 30; // naive monthly projection
  const totalSpent = amounts.reduce((s, a) => s + a, 0);
  const daysOfData = transactions.length;

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">AI Forecast</h3>
        </div>
        <TrendingUp className="h-5 w-5 text-green-400" />
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-300 mb-1">
            ${forecast.toFixed(2)}
          </div>
          <p className="text-sm text-gray-400">Estimated next month</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-300">
              ${totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">Total Spent</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-purple-300">
              {daysOfData}
            </div>
            <p className="text-xs text-gray-400 mt-1">Transactions</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 pt-2">
          <Calendar className="h-3 w-3" />
          <span>Based on {daysOfData} data points</span>
        </div>
      </div>
    </motion.div>
  );
}
