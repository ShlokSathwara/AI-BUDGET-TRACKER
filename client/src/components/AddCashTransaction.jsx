import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AddCashTransaction = ({ onAdd, accounts = [] }) => {
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: '',
    description: '',
    type: 'debit', // default to debit (expense)
    paymentMethod: 'cash'
  });

  const categories = [
    'Food & Dining',
    'Transportation', 
    'Shopping',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.merchant || !formData.amount || !formData.category) {
      alert('Please fill in all required fields: Merchant, Amount, and Category');
      return;
    }

    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    // Prepare transaction data
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString(), // Current date
      bankAccountId: null, // Cash transactions don't have a bank account
      paymentMethod: 'cash'
    };

    // Call parent function to add transaction
    onAdd(transactionData);

    // Reset form
    setFormData({
      merchant: '',
      amount: '',
      category: '',
      description: '',
      type: 'debit',
      paymentMethod: 'cash'
    });
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Merchant/Store *
          </label>
          <input
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleInputChange}
            placeholder="Enter merchant name"
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (₹) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Transaction Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="debit">Expense</option>
            <option value="credit">Income</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Additional details (optional)"
          rows="2"
          className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <motion.button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-300 font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Add Cash Transaction
      </motion.button>
    </motion.form>
  );
};

export default AddCashTransaction;