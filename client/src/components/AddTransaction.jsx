import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, IndianRupee, Store, FileText, Tag } from 'lucide-react';
import api from '../utils/api';

export default function AddTransaction({ onAdd, currency = 'USD', currencySymbol = '$' }) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!amount) return;
    
    setLoading(true);
    try {
      const text = `${amount} ${merchant} ${description}`.trim();
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await api.post('/transactions/smart-add', { text, type: 'debit' }, { headers });
      const saved = resp.data;
      
      // Add currency information
      const transactionWithCurrency = {
        ...saved,
        currency: currency,
        amount: currency === 'INR' ? parseFloat(amount) : saved.amount
      };
      
      onAdd && onAdd(transactionWithCurrency);
      setAmount(''); setMerchant(''); setDescription(''); setCategory('');
    } catch (err) {
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  }

  const inputFields = [
    {
      id: 'amount',
      label: `Amount (${currency})`,
      value: amount,
      onChange: setAmount,
      placeholder: `0.00 ${currencySymbol}`,
      icon: currency === 'INR' ? IndianRupee : IndianRupee,
      type: 'number',
      required: true
    },
    {
      id: 'merchant',
      label: 'Merchant/Place',
      value: merchant,
      onChange: setMerchant,
      placeholder: 'Where did you spend? (e.g., BigBasket, Ola, Swiggy)',
      icon: Store
    },
    {
      id: 'description',
      label: 'Description',
      value: description,
      onChange: setDescription,
      placeholder: 'What did you buy?',
      icon: FileText
    },
    {
      id: 'category',
      label: 'Category',
      value: category,
      onChange: setCategory,
      placeholder: 'Food, Transport, Shopping, etc.',
      icon: Tag
    }
  ];

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Add New Transaction</h2>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm text-gray-400">{currency}</span>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputFields.map((field, index) => (
            <motion.div
              key={field.id}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className="text-sm text-gray-300 flex items-center space-x-2">
                <field.icon className="h-4 w-4" />
                <span>{field.label}</span>
              </label>
              <input
                required={field.required}
                type={field.type || 'text'}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </motion.div>
          ))}
        </div>

        {/* Indian-specific help text */}
        {currency === 'INR' && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-300 text-sm">
              💡 Tip: Try saying "Spent ₹250 on Swiggy" or "Paid ₹50 for Ola ride" using voice commands!
            </p>
          </div>
        )}

        <motion.button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Add Transaction</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
