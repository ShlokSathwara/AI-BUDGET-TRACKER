import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Eye,
  EyeOff,
  Search,
  Calendar,
  Hash
} from 'lucide-react';

const TransactionSections = ({ transactions = [], bankAccounts = [], onEditTransaction, onDeleteTransaction }) => {
  const [activeView, setActiveView] = useState('all'); // 'all', 'account-<id>'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'week', 'month', 'year'
  const [showAmounts, setShowAmounts] = useState(true);

  // Filter transactions based on search and date
  const filterTransactions = (transactionsToFilter) => {
    let filtered = transactionsToFilter;

    // Date filtering
    if (dateFilter !== 'all') {
      const now = new Date();
      let filterDate;
      
      switch (dateFilter) {
        case 'week':
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'month':
          filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'year':
          filterDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          filterDate = new Date(0);
      }
      
      filtered = filtered.filter(tx => new Date(tx.date) >= filterDate);
    }

    // Search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.merchant?.toLowerCase().includes(searchLower) ||
        tx.category?.toLowerCase().includes(searchLower) ||
        tx.description?.toLowerCase().includes(searchLower) ||
        tx.amount?.toString().includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get transactions for a specific account
  const getAccountTransactions = (accountId) => {
    return transactions.filter(tx => tx.bankAccountId === accountId);
  };

  // Get account by ID
  const getAccountById = (accountId) => {
    return bankAccounts.find(acc => acc.id === accountId);
  };

  // Format currency
  const formatAmount = (amount) => {
    if (!showAmounts) return '••••';
    return `₹${amount?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}`;
  };

  // Get all unique categories
  const getCategories = () => {
    const categories = [...new Set(transactions.map(tx => tx.category || 'Other'))];
    return categories.filter(cat => cat).sort();
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Transactions</h2>
            <p className="text-sm text-gray-400">View and manage all your transactions</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title={showAmounts ? "Hide amounts" : "Show amounts"}
        >
          {showAmounts ? <Eye className="h-4 w-4 text-white" /> : <EyeOff className="h-4 w-4 text-white" />}
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveView('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          All Transactions
        </button>
        
        {bankAccounts.map(account => (
          <button
            key={account.id}
            onClick={() => setActiveView(`account-${account.id}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === `account-${account.id}`
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <span>{account.name}</span>
            <span className="text-xs opacity-75">(****{account.lastFourDigits})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all" className="bg-gray-800">All Time</option>
            <option value="week" className="bg-gray-800">Last Week</option>
            <option value="month" className="bg-gray-800">Last Month</option>
            <option value="year" className="bg-gray-800">Last Year</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                setSearchTerm(e.target.value);
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="" className="bg-gray-800">Filter by Category</option>
            {getCategories().map(category => (
              <option key={category} value={category} className="bg-gray-800">
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activeView === 'all' ? (
          // All Transactions View
          filterTransactions(transactions).length > 0 ? (
            filterTransactions(transactions).map((transaction) => {
              const account = getAccountById(transaction.bankAccountId);
              return (
                <motion.div
                  key={transaction._id || transaction.id || `${transaction.merchant || 'unknown'}-${transaction.date || Date.now()}`}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 classy-element flex justify-between items-center hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <div className={`p-1 rounded ${transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {transaction.type === 'credit' ? 
                          <TrendingUp className="h-3 w-3 text-green-400" /> : 
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        }
                      </div>
                      <div className="font-medium text-white">{transaction.merchant || 'Unknown Merchant'}</div>
                      {account && (
                        <div className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                          {account.name} (****{account.lastFourDigits})
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{transaction.category || 'Other'}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date || transaction.createdAt).toLocaleDateString()}</span>
                      {transaction.description && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs">{transaction.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`font-semibold text-lg ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEditTransaction && onEditTransaction(transaction)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                        title="Edit transaction"
                      >
                        <Hash className="w-4 h-4 text-blue-300" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this transaction?')) {
                            const transactionId = transaction._id || transaction.id || `${transaction.merchant || 'unknown'}-${transaction.date || Date.now()}`;
                            onDeleteTransaction && onDeleteTransaction(transactionId);
                          }
                        }}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                        title="Delete transaction"
                      >
                        <TrendingDown className="w-4 h-4 text-red-300" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No transactions found</h3>
              <p className="text-gray-400">
                {searchTerm || dateFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Add your first transaction to get started'}
              </p>
            </div>
          )
        ) : (
          // Individual Account View
          (() => {
            const accountId = activeView.split('-')[1];
            const account = getAccountById(accountId);
            const accountTransactions = filterTransactions(getAccountTransactions(accountId));
            
            return accountTransactions.length > 0 ? (
              <>
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">{account.name}</h3>
                      <p className="text-sm text-gray-400">**** **** **** {account.lastFourDigits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Account Balance</p>
                      <p className="text-xl font-bold text-white">
                        {formatAmount(
                          accountTransactions
                            .filter(tx => tx.type === 'credit')
                            .reduce((sum, tx) => sum + (tx.amount || 0), 0) -
                          accountTransactions
                            .filter(tx => tx.type === 'debit')
                            .reduce((sum, tx) => sum + (tx.amount || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                {accountTransactions.map((transaction) => (
                  <motion.div
                    key={transaction._id || transaction.id || `${transaction.merchant || 'unknown'}-${transaction.date || Date.now()}`}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 classy-element flex justify-between items-center hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <div className={`p-1 rounded ${transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {transaction.type === 'credit' ? 
                            <TrendingUp className="h-3 w-3 text-green-400" /> : 
                            <TrendingDown className="h-3 w-3 text-red-400" />
                          }
                        </div>
                        <div className="font-medium text-white">{transaction.merchant || 'Unknown Merchant'}</div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{transaction.category || 'Other'}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date || transaction.createdAt).toLocaleDateString()}</span>
                        {transaction.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{transaction.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`font-semibold text-lg ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onEditTransaction && onEditTransaction(transaction)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                          title="Edit transaction"
                        >
                          <Hash className="w-4 h-4 text-blue-300" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this transaction?')) {
                              const transactionId = transaction._id || transaction.id || `${transaction.merchant || 'unknown'}-${transaction.date || Date.now()}`;
                              onDeleteTransaction && onDeleteTransaction(transactionId);
                            }
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <TrendingDown className="w-4 h-4 text-red-300" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No transactions for this account</h3>
                <p className="text-gray-400">
                  {searchTerm || dateFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Add transactions to this account to see them here'}
                </p>
              </div>
            );
          })()
        )}
      </div>
    </motion.div>
  );
};

export default TransactionSections;