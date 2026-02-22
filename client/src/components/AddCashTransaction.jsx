import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, IndianRupee, Store, FileText, Tag, CreditCard, Wallet } from 'lucide-react';

const AddCashTransaction = ({ onAdd, accounts = [] }) => {
  // Bank Account State
  const [bankAccount, setBankAccount] = useState('');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    lastFourDigits: ''
  });
  const [accountErrors, setAccountErrors] = useState({});
  
  // Transaction State
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionErrors, setTransactionErrors] = useState({});

  // Validate bank account form
  const validateAccountForm = () => {
    const newErrors = {};
    
    if (!newAccount.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!newAccount.lastFourDigits.trim()) {
      newErrors.lastFourDigits = 'Last 4 digits are required';
    } else if (!/^\d{4}$/.test(newAccount.lastFourDigits)) {
      newErrors.lastFourDigits = 'Must be exactly 4 digits';
    }
    
    setAccountErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new bank account
  const handleAddAccount = (e) => {
    e.preventDefault();
    
    if (!validateAccountForm()) return;
    
    // In a real app, this would be handled by the parent component
    // For now, we'll just close the modal and show a success message
    alert(`Account "${newAccount.name}" (****${newAccount.lastFourDigits}) added successfully!`);
    setShowAccountForm(false);
    setNewAccount({ name: '', lastFourDigits: '' });
    setAccountErrors({});
  };

  // Validate transaction form
  const validateTransactionForm = () => {
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
    
    if (!bankAccount) {
      newErrors.bankAccount = 'Bank account is required';
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setTransactionErrors(newTransactionErrors);
    return Object.keys(newTransactionErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTransactionForm()) {
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
        category: category.trim() || 'Other',
        type: 'debit',
        currency: 'INR',
        date: new Date().toISOString(),
        bankAccountId: bankAccount || null,
        paymentMethod: paymentMethod
      };
      
      // Call the parent handler
      if (onAdd && typeof onAdd === 'function') {
        await onAdd(newTransaction);
      } else {
        throw new Error('Transaction handler not available');
      }
      
      // Reset form only after successful submission
      setAmount('');
      setMerchant('');
      setDescription('');
      setCategory('');
      setBankAccount('');
      setPaymentMethod('');
      setTransactionErrors({});
      
    } catch (err) {
      console.error('Error adding transaction:', err);
      setTransactionErrors({ submit: err.message || 'Failed to add transaction. Please try again.' });
      alert('Failed to add transaction: ' + (err.message || 'Please try again.'));
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

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Add New Expense</h2>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm text-gray-400">INR</span>
        </div>
      </div>

      {/* Bank Account Selection Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Select Bank Account</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Bank Account *</span>
            </label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                transactionErrors.bankAccount ? 'border-red-500' : 'border-white/20'
              }`}
            >
              <option value="">Select Account</option>
              {getAccountOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {transactionErrors.bankAccount && (
              <p className="text-red-400 text-sm">{transactionErrors.bankAccount}</p>
            )}
          </div>
          
          <div className="space-y-2 flex items-end">
            <button
              type="button"
              onClick={() => setShowAccountForm(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Account Form Modal */}
      {showAccountForm && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Add New Bank Account</h3>
            
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Name</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="e.g., Savings Account, Credit Card"
                  className={`w-full px-4 py-2 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    accountErrors.name ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {accountErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{accountErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last 4 Digits</label>
                <input
                  type="text"
                  value={newAccount.lastFourDigits}
                  onChange={(e) => setNewAccount({...newAccount, lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                  placeholder="e.g., 1234"
                  maxLength="4"
                  className={`w-full px-4 py-2 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    accountErrors.lastFourDigits ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {accountErrors.lastFourDigits && (
                  <p className="text-red-400 text-sm mt-1">{accountErrors.lastFourDigits}</p>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountForm(false);
                    setNewAccount({ name: '', lastFourDigits: '' });
                    setAccountErrors({});
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all"
                >
                  Add Account
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <hr className="border-white/20 my-6" />

      {/* Transaction Details Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center space-x-2">
              <IndianRupee className="h-4 w-4" />
              <span>Amount (₹) *</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                transactionErrors.amount ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {transactionErrors.amount && (
              <p className="text-red-400 text-sm">{transactionErrors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>Merchant/Place *</span>
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Where did you spend?"
              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                transactionErrors.merchant ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {transactionErrors.merchant && (
              <p className="text-red-400 text-sm">{transactionErrors.merchant}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Description *</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you buy?"
              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                transactionErrors.description ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {transactionErrors.description && (
              <p className="text-red-400 text-sm">{transactionErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Category</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Food, Transport, Shopping, etc."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Payment Method *</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                transactionErrors.paymentMethod ? 'border-red-500' : 'border-white/20'
              }`}
            >
              <option value="">Select Payment Method</option>
              <option value="net_banking">Net Banking</option>
              <option value="upi">UPI</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
            </select>
            {transactionErrors.paymentMethod && (
              <p className="text-red-400 text-sm">{transactionErrors.paymentMethod}</p>
            )}
          </div>
        </div>

        {transactionErrors.submit && (
          <div className="col-span-full">
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {transactionErrors.submit}
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
              <span>Add Expense</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddCashTransaction;