import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wallet, IndianRupee, TrendingUp, TrendingDown, Filter, Clock, Tag } from 'lucide-react';

const IndividualAccountTransactions = ({ transactions = [], bankAccounts = [] }) => {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month', 'year'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'debit', 'credit'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get the selected account
  const selectedAccount = bankAccounts.find(acc => acc.id === selectedAccountId);

  // Filter transactions based on selected account and other filters
  const filteredTransactions = useMemo(() => {
    if (!selectedAccountId) return [];

    let filtered = transactions.filter(tx => tx.bankAccountId === selectedAccountId);

    // Apply date filter
    if (filter !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filter) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= now;
      });
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(tx => (tx.category || 'Uncategorized') === categoryFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [transactions, selectedAccountId, filter, typeFilter, categoryFilter]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!selectedAccountId) return [];
    
    const accountTransactions = transactions.filter(tx => tx.bankAccountId === selectedAccountId);
    const allCategories = accountTransactions
      .map(tx => tx.category || 'Uncategorized')
      .filter(cat => cat && cat.trim() !== '');
    return ['Uncategorized', ...Array.from(new Set(allCategories))];
  }, [transactions, selectedAccountId]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!selectedAccountId) return {};

    const groups = {};
    
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.date);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(tx);
    });

    return groups;
  }, [filteredTransactions, selectedAccountId]);

  // Get date string in readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Calculate totals for the selected account
  const totals = useMemo(() => {
    if (!selectedAccountId) return { income: 0, expense: 0 };
    
    return filteredTransactions.reduce((acc, tx) => {
      if (tx.type === 'credit') {
        acc.income += tx.amount || 0;
      } else {
        acc.expense += tx.amount || 0;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions, selectedAccountId]);

  return (
    <div className="space-y-6">
      {/* Account Selection Header */}
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Account Transactions</h1>
            <p className="text-gray-300">View transactions for a specific account</p>
          </div>
        </div>

        {/* Account Selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2 flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>Select Account</span>
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          >
            <option value="">Select an account</option>
            {bankAccounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} {account.lastFourDigits ? `(****${account.lastFourDigits})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Account Summary (only shown when an account is selected) */}
        {selectedAccount && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedAccount.name}</h3>
                <p className="text-gray-400">Current Balance: ₹{selectedAccount.balance?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Account Number</p>
                <p className="text-white font-mono">{selectedAccount.accountNumber || selectedAccount.lastFourDigits || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="flex items-center space-x-2 text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Income</span>
                </div>
                <p className="text-xl font-bold text-white">₹{totals.income.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-2 text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  <span className="text-sm">Expense</span>
                </div>
                <p className="text-xl font-bold text-white">₹{totals.expense.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Net</div>
                <p className={`text-xl font-bold ${totals.income - totals.expense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{(totals.income - totals.expense).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters (only shown when an account is selected) */}
        {selectedAccount && (
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Filter by:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="credit">Income</option>
              <option value="debit">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Transactions List */}
      {selectedAccount ? (
        <div className="space-y-6">
          {Object.keys(groupedTransactions).length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No transactions found</h3>
              <p className="text-gray-500">This account has no transactions for the selected period</p>
            </motion.div>
          ) : (
            Object.keys(groupedTransactions).map(date => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(date)}</span>
                  </h3>
                  <span className="text-sm text-gray-400">
                    {groupedTransactions[date].length} transaction{groupedTransactions[date].length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {groupedTransactions[date].map((transaction, index) => (
                    <motion.div
                      key={`${transaction._id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`p-4 bg-white/5 rounded-xl border-l-4 ${
                        transaction.type === 'credit' 
                          ? 'border-green-500' 
                          : 'border-red-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'credit' 
                              ? 'bg-green-500/20' 
                              : 'bg-red-500/20'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <TrendingUp className="h-5 w-5 text-green-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-white">
                              {transaction.merchant || transaction.description || 'Untitled'}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <span>{transaction.description}</span>
                              {transaction.bankAccountId && (
                                <>
                                  <span>•</span>
                                  <span>{selectedAccount.name}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Tag className="h-3 w-3" />
                              <span>{transaction.category || 'Uncategorized'}</span>
                              <span>•</span>
                              <span>{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'credit' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{transaction.paymentMethod}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Wallet className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Select an Account</h3>
          <p className="text-gray-500">Choose an account from the dropdown above to view its transactions</p>
        </motion.div>
      )}
    </div>
  );
};

export default IndividualAccountTransactions;