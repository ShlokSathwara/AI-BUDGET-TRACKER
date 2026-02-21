import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const PredictionCard = ({ transactions = [] }) => {
  // Filter only debit (expense) transactions for prediction
  const expenseTransactions = transactions.filter(tx => tx.type === 'debit');

  // Calculate average monthly expenses
  const calculateAverageMonthlyExpenses = () => {
    if (expenseTransactions.length === 0) return 0;

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const recentTransactions = expenseTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= threeMonthsAgo;
    });

    if (recentTransactions.length === 0) return 0;

    const totalSpent = recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const months = Math.max(1, (now - threeMonthsAgo) / (1000 * 60 * 60 * 24 * 30)); // Approximate months

    return totalSpent / months;
  };

  // Predict next month's expenses based on trend
  const predictNextMonth = () => {
    if (expenseTransactions.length < 2) return 0;

    const sortedTransactions = [...expenseTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentTransactions = sortedTransactions.slice(-10); // Last 10 transactions

    const avgRecent = recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) / recentTransactions.length;
    const oldestTransactions = sortedTransactions.slice(0, 10); // First 10 transactions in the dataset
    const avgOld = oldestTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) / oldestTransactions.length;

    const trend = (avgRecent - avgOld) / avgOld;
    const predicted = avgRecent * (1 + trend);

    return Math.max(0, predicted); // Ensure non-negative prediction
  };

  const avgMonthlyExpenses = calculateAverageMonthlyExpenses();
  const predictedNextMonth = predictNextMonth();
  const trend = predictedNextMonth > avgMonthlyExpenses ? 'increasing' : 'decreasing';

  // Calculate savings recommendation
  const recommendedSavings = avgMonthlyExpenses * 0.2; // 20% of average expenses

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">AI Financial Insights</h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Avg Monthly Expenses</span>
            <span className="text-white font-semibold">₹{avgMonthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Predicted Next Month</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">₹{predictedNextMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <div className={`p-1 rounded ${trend === 'increasing' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {trend === 'increasing' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/20">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Recommended Savings</p>
              <p className="text-green-400 font-semibold">₹{recommendedSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        <p>Predictions based on your expense patterns. Income transactions are excluded from calculations.</p>
      </div>
    </motion.div>
  );
};

export default PredictionCard;