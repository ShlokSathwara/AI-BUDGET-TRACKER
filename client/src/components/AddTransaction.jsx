import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, IndianRupee, Store, FileText, Tag } from 'lucide-react';

const AddTransaction = ({ onAdd }) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!merchant.trim()) {
      newErrors.merchant = 'Merchant is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const newTransaction = {
        amount: parseFloat(amount),
        merchant: merchant.trim(),
        description: description.trim(),
        category: category.trim() || 'Other',
        type: 'debit',
        currency: 'INR',
        date: new Date().toISOString()
      };
      
      // Simulate API call with mock response
      setTimeout(() => {
        onAdd && onAdd(newTransaction);
        setAmount('');
        setMerchant('');
        setDescription('');
        setCategory('');
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setLoading(false);
    }
  };

  const inputFields = [
    {
      id: 'amount',
      label: 'Amount (₹)',
      value: amount,
      onChange: setAmount,
      placeholder: '0.00',
      icon: IndianRupee,
      type: 'number',
      required: true,
      error: errors.amount
    },
    {
      id: 'merchant',
      label: 'Merchant/Place',
      value: merchant,
      onChange: setMerchant,
      placeholder: 'Where did you spend?',
      icon: Store,
      error: errors.merchant
    },
    {
      id: 'description',
      label: 'Description',
      value: description,
      onChange: setDescription,
      placeholder: 'What did you buy?',
      icon: FileText,
      error: errors.description
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
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Add New Transaction</h2>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg animate-classy-pulse">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm text-gray-400">INR</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputFields.map((field, index) => (
            <motion.div
              key={field.id}
              className="space-y-2 classy-element"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className="text-sm text-gray-300 flex items-center space-x-2">
                <field.icon className="h-4 w-4" />
                <span>{field.label}</span>
              </label>
              <input
                type={field.type || 'text'}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 classy-element ${
                  field.error ? 'border-red-500' : 'border-white/10'
                }`}
              />
              {field.error && (
                <p className="text-red-400 text-sm">{field.error}</p>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 classy-button"
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
};

export default AddTransaction;