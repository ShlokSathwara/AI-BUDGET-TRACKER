import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, X, Wallet } from 'lucide-react';

const BankAccountManager = ({ user, onUpdateAccounts }) => {
  const [accounts, setAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    lastFourDigits: ''
  });
  const [errors, setErrors] = useState({});

  // Load user accounts from localStorage
  useEffect(() => {
    if (!user || !user.id) {
      setAccounts([]);
      return;
    }
    
    try {
      const userAccountsKey = `bank_accounts_${user.id}`;
      const savedAccounts = localStorage.getItem(userAccountsKey);
      
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts);
        setAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : []);
      } else {
        setAccounts([]);
        localStorage.setItem(userAccountsKey, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      setAccounts([]);
    }
  }, [user]);

  // Save accounts to localStorage when they change
  useEffect(() => {
    if (!user || !user.id) return;
    
    try {
      const userAccountsKey = `bank_accounts_${user.id}`;
      localStorage.setItem(userAccountsKey, JSON.stringify(Array.isArray(accounts) ? accounts : []));
      if (onUpdateAccounts) {
        onUpdateAccounts(Array.isArray(accounts) ? accounts : []);
      }
    } catch (error) {
      console.error('Error saving bank accounts:', error);
    }
  }, [accounts, user, onUpdateAccounts]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!newAccount.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!newAccount.lastFourDigits.trim()) {
      newErrors.lastFourDigits = 'Last 4 digits are required';
    } else if (!/^\d{4}$/.test(newAccount.lastFourDigits)) {
      newErrors.lastFourDigits = 'Must be exactly 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Validate user exists
      if (!user || !user.id) {
        alert('User data not available. Please refresh the page and try again.');
        return;
      }
      
      // Check for duplicates
      const accountExists = Array.isArray(accounts) && accounts.some(
        acc => acc && 
               (acc.name.toLowerCase() === newAccount.name.toLowerCase() ||
                acc.lastFourDigits === newAccount.lastFourDigits)
      );
      
      if (accountExists) {
        alert('An account with this name or last 4 digits already exists');
        return;
      }
      
      const newAccountObj = {
        id: Date.now().toString(),
        name: newAccount.name.trim(),
        lastFourDigits: newAccount.lastFourDigits,
        balance: 0, // Initial balance
        createdAt: new Date().toISOString()
      };
      
      // Validate the new account object
      if (!newAccountObj.id || !newAccountObj.name || !newAccountObj.lastFourDigits) {
        console.error('Invalid account data:', newAccountObj);
        alert('Error creating account: Invalid data provided');
        return;
      }
      
      const updatedAccounts = [...(Array.isArray(accounts) ? accounts : []), newAccountObj];
      setAccounts(updatedAccounts);
      setNewAccount({ name: '', lastFourDigits: '' });
      setErrors({});
      setShowAddForm(false);
      
      // Save to localStorage immediately
      try {
        const userAccountsKey = `bank_accounts_${user.id}`;
        localStorage.setItem(userAccountsKey, JSON.stringify(updatedAccounts));
        onUpdateAccounts && onUpdateAccounts(updatedAccounts);
      } catch (storageError) {
        console.error('Error saving new account to localStorage:', storageError);
        alert('Account created but failed to save. Please refresh the page.');
      }
      
    } catch (error) {
      console.error('Error adding bank account:', error);
      alert('Failed to add bank account. Please try again.');
    }
  };

  const handleDeleteAccount = (accountId) => {
    if (!accountId) {
      console.error('Invalid account ID for deletion');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      try {
        const updatedAccounts = Array.isArray(accounts) 
          ? accounts.filter(acc => acc && acc.id !== accountId)
          : [];
        setAccounts(updatedAccounts);
        
        // Save to localStorage
        if (user && user.id) {
          try {
            const userAccountsKey = `bank_accounts_${user.id}`;
            localStorage.setItem(userAccountsKey, JSON.stringify(updatedAccounts));
            onUpdateAccounts && onUpdateAccounts(updatedAccounts);
          } catch (storageError) {
            console.error('Error saving updated accounts to localStorage:', storageError);
          }
        }
      } catch (error) {
        console.error('Error deleting bank account:', error);
        alert('Failed to delete bank account. Please try again.');
      }
    }
  };

  const resetAllAccounts = () => {
    if (window.confirm('Are you sure you want to reset all bank account data? This will remove all accounts and reset balances to 0.')) {
      try {
        setAccounts([]);
        if (user && user.id) {
          try {
            const userAccountsKey = `bank_accounts_${user.id}`;
            localStorage.setItem(userAccountsKey, JSON.stringify([]));
          } catch (storageError) {
            console.error('Error resetting accounts in localStorage:', storageError);
          }
        }
        onUpdateAccounts && onUpdateAccounts([]);
      } catch (error) {
        console.error('Error resetting bank accounts:', error);
        alert('Failed to reset bank accounts. Please try again.');
      }
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bank Accounts</h2>
            <p className="text-sm text-gray-400">Manage your bank accounts</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Bank Account List */}
      <div className="space-y-3">
        <AnimatePresence>
          {accounts.length === 0 ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Bank Accounts</h3>
              <p className="text-gray-400">Add your first bank account to get started</p>
            </motion.div>
          ) : (
            accounts.map((account) => (
              <motion.div
                key={account.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{account.name}</h3>
                    <p className="text-sm text-gray-400">**** **** **** {account.lastFourDigits}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">₹{account.balance?.toLocaleString() || '0'}</span>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Account Form Modal */}
      <AnimatePresence>
        {showAddForm && (
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
                      errors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
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
                      errors.lastFourDigits ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.lastFourDigits && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastFourDigits}</p>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAccount({ name: '', lastFourDigits: '' });
                      setErrors({});
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
      </AnimatePresence>

      {/* Reset Accounts Button */}
      {accounts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={resetAllAccounts}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Reset All Bank Accounts</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default BankAccountManager;