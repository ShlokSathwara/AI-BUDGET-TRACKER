import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, IndianRupee } from 'lucide-react';

export default function SummaryCards({ transactions = [], currency = 'USD', currencySymbol = '$' }) {
  const total = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const spending = transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + (t.amount || 0), 0);
  const income = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);

  const cards = [
    {
      title: `Total Balance (${currency})`,
      value: total.toFixed(2),
      icon: Wallet,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-300',
      prefix: currencySymbol
    },
    {
      title: `Total Spending (${currency})`,
      value: spending.toFixed(2),
      icon: TrendingDown,
      color: 'from-red-500 to-pink-600',
      textColor: 'text-red-300',
      prefix: currencySymbol
    },
    {
      title: `Total Income (${currency})`,
      value: income.toFixed(2),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-300',
      prefix: currencySymbol
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{card.title}</p>
              <p className={`text-2xl md:text-3xl font-bold ${card.textColor}`}>
                {card.prefix}{card.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
              {currency === 'INR' ? (
                <IndianRupee className="h-6 w-6 text-white" />
              ) : (
                <card.icon className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div 
                className={`bg-gradient-to-r ${card.color} h-2 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
