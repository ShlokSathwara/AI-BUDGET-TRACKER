import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, IndianRupee, Store, FileText, Tag, CreditCard, Wallet } from 'lucide-react';

const AddCreditTransaction = ({ onAdd, accounts = [] }) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if there are any bank accounts available
  const hasAccounts = Array.isArray(accounts) && accounts.length > 0;

  const validateForm = () => {
    const newErrors = {};
    
    // Check if there are any bank accounts available
    if (!hasAccounts && paymentMethod !== 'cash') {
      newErrors.general = 'Please add at least one bank account before adding transactions.';
      setErrors(newErrors);
      return false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!merchant.trim()) {
      newErrors.merchant = 'Source is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!bankAccount && paymentMethod !== 'cash') {
      newErrors.bankAccount = 'Bank account is required';
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Credit form submission started');
    console.log('Form values:', { amount, merchant, description, category, bankAccount, paymentMethod });
    
    if (!validateForm()) {
      console.log('Credit form validation failed');
      return;
    }
    
    setLoading(true);
    try {
      // Validate all required fields
      if (!amount || !merchant.trim() || !description.trim() || !paymentMethod) {
        throw new Error('Missing required fields');
      }

      const newTransaction = {
        amount: parseFloat(amount),
        merchant: merchant.trim(),
        description: description.trim(),
        category: category.trim() || 'Income',
        type: 'credit',
        currency: 'INR',
        date: new Date().toISOString(),
        bankAccountId: (paymentMethod === 'cash') ? null : bankAccount || null,
        paymentMethod: paymentMethod,
        mode: paymentMethod === 'cash' ? 'cash' : 'non-cash'
      };
      
      console.log('Submitting credit transaction:', newTransaction);
      console.log('onAdd function:', onAdd);
      console.log('typeof onAdd:', typeof onAdd);
      
      // Call the parent handler
      if (onAdd && typeof onAdd === 'function') {
        console.log('Calling onAdd function for credit');
        await onAdd(newTransaction);
        console.log('onAdd function completed successfully for credit');
      } else {
        console.error('onAdd is not a function for credit:', onAdd);
        throw new Error('Transaction handler not available');
      }
      
      // Reset form only after successful submission
      setAmount('');
      setMerchant('');
      setDescription('');
      setCategory('');
      setBankAccount('');
      setPaymentMethod('');
      setErrors({});
      
      console.log('Credit transaction added successfully');
      
    } catch (err) {
      console.error('Error adding credit transaction:', err);
      console.error('Error stack:', err.stack);
      setErrors({ submit: err.message || 'Failed to add income transaction. Please try again.' });
      alert('Failed to add income transaction: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getAccountOptions = () => {
    if (!Array.isArray(accounts)) return [];
    return accounts
      .filter(acc => acc && acc.id && acc.name)
      .map(acc => ({
        value: acc.id,
        label: `${acc.name} ${acc.lastFourDigits ? `(****${acc.lastFourDigits})` : ''}`
      }));
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
      error: errors.amount
    },
    {
      id: 'merchant',
      label: 'Source/From',
      value: merchant,
      onChange: setMerchant,
      placeholder: 'Where did you earn from?',
      icon: Store,
      error: errors.merchant
    },
    {
      id: 'description',
      label: 'Description',
      value: description,
      onChange: setDescription,
      placeholder: 'What was the income for?',
      icon: FileText,
      error: errors.description
    },
    {
      id: 'category',
      label: 'Category',
      value: category,
      onChange: setCategory,
      placeholder: 'Salary, Freelance, Investment, etc.',
      icon: Tag
    },
    {
      id: 'bankAccount',
      label: 'Bank Account',
      value: bankAccount,
      onChange: setBankAccount,
      icon: Wallet,
      type: 'select',
      error: errors.bankAccount,
      options: [{ value: '', label: 'Select Account' }, ...getAccountOptions()]
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      value: paymentMethod,
      onChange: setPaymentMethod,
      icon: CreditCard,
      error: errors.paymentMethod,
      type: 'select',
      options: [
        { value: '', label: 'Select Payment Method' },
        { value: 'net_banking', label: 'Net Banking' },
        { value: 'upi', label: 'UPI' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'cash', label: 'Cash' }
      ]
    }
  ];

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8 pb-2 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Add Income</h2>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm text-gray-400">INR</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputFields.map((field) => (
            <div key={field.id} className="space-y-3">
              <label className="text-sm text-gray-300 flex items-center space-x-2">
                <field.icon className="h-4 w-4" />
                <span>{field.label}</span>
              </label>
              {field.type === 'select' ? (
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className={`w-full px-4 py-4 bg-black/30 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ${
                    field.error ? 'border-red-500' : 'border-white/20'
                  }`}
                >
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ${
                    field.error ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              )}
              {field.error && (
                <p className="text-red-400 text-sm">{field.error}</p>
              )}
            </div>
          ))}
          {errors.general && (
            <div className="col-span-full">
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {errors.general}
              </p>
            </div>
          )}
          {errors.submit && (
            <div className="col-span-full">
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {errors.submit}
              </p>
            </div>
          )}
        </div>

        <motion.button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
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
              <span>Add Income</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddCreditTransaction;