import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, TrendingUp, TrendingDown, Calendar, Filter, 
  Search, Banknote, Wallet, ChevronDown, ChevronUp, Edit3, Trash2, Check, X
} from 'lucide-react';

const EditableTransactionList = ({ 
  transactions = [], 
  bankAccounts = [], 
  title = "All Transactions",
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Get unique categories and accounts
  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
  const accounts = bankAccounts.filter(acc => acc && acc.id);

  // Filter and sort transactions
  React.useEffect(() => {
    let result = [...transactions];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.merchant?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term)
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }
    
    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }
    
    // Account filter
    if (filterAccount !== 'all') {
      result = result.filter(t => t.bankAccountId === filterAccount);
    }
    
    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, filterType, filterCategory, filterAccount, sortOrder]);

  const startEditing = (transaction) => {
    setEditingId(transaction._id);
    setEditForm({
      amount: transaction.amount,
      merchant: transaction.merchant,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date.split('T')[0]
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (transactionId) => {
    if (onEditTransaction) {
      onEditTransaction(transactionId, {
        ...editForm,
        amount: parseFloat(editForm.amount),
        date: new Date(editForm.date).toISOString()
      });
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      if (onDeleteTransaction) {
        onDeleteTransaction(transactionId);
      }
    }
  };

  const getTypeIcon = (type) => {
    return type === 'credit' ? TrendingUp : TrendingDown;
  };

  const getTypeColor = (type) => {
    return type === 'credit' ? 'text-green-400' : 'text-red-400';
  };

  const getTypeBg = (type) => {
    return type === 'credit' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Cash';
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'net_banking': 'Net Banking',
      'upi': 'UPI',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'cash': 'Cash'
    };
    return methods[method] || method;
  };

  const formatMonthYear = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Group transactions by month for summary
  const getMonthlySummary = () => {
    const monthlyData = {};
    transactions.forEach(t => {
      const monthKey = formatMonthYear(t.date);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, count: 0 };
      }
      if (t.type === 'credit') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
      monthlyData[monthKey].count += 1;
    });
    return monthlyData;
  };

  const monthlySummary = getMonthlySummary();

  if (transactions.length === 0) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
        <p className="text-gray-400">Add your first transaction to get started</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            {title}
          </h3>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        {/* Monthly Summary */}
        {Object.keys(monthlySummary).length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(monthlySummary).slice(0, 3).map(([month, data]) => (
              <div key={month} className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-sm">{month}</p>
                <p className="text-green-400 font-semibold">₹{data.income.toLocaleString()}</p>
                <p className="text-red-400 font-semibold">₹{data.expenses.toLocaleString()}</p>
                <p className="text-gray-400 text-xs">{data.count} transactions</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="p-6 border-b border-white/10 bg-black/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Income</option>
                  <option value="debit">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Account</label>
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List with Scrollbar */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => {
              const IconComponent = getTypeIcon(transaction.type);
              const isEditing = editingId === transaction._id;
              
              return (
                <motion.div
                  key={transaction._id || index}
                  className={`p-4 rounded-xl border ${getTypeBg(transaction.type)} backdrop-blur-sm`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: isEditing ? 1 : 1.02 }}
                >
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400">Amount (₹)</label>
                          <input
                            type="number"
                            value={editForm.amount || ''}
                            onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Date</label>
                          <input
                            type="date"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Merchant/Source</label>
                          <input
                            type="text"
                            value={editForm.merchant || ''}
                            onChange={(e) => setEditForm({...editForm, merchant: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Category</label>
                          <input
                            type="text"
                            value={editForm.category || ''}
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Description</label>
                        <input
                          type="text"
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => saveEdit(transaction._id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeBg(transaction.type)}`}>
                          <IconComponent className={`h-5 w-5 ${getTypeColor(transaction.type)}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{transaction.merchant}</h4>
                          <p className="text-sm text-gray-400">{transaction.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {transaction.category || 'Uncategorized'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getAccountName(transaction.bankAccountId)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getPaymentMethodLabel(transaction.paymentMethod)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-3">
                          <p className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                            {transaction.type === 'credit' ? '+' : '-'} ₹{transaction.amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {transaction.currency || 'INR'}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <button
                          onClick={() => startEditing(transaction)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit transaction"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer with totals */}
      {filteredTransactions.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <div className="flex space-x-4">
              <span className="text-green-400">
                Income: ₹{filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
              </span>
              <span className="text-red-400">
                Expenses: ₹{filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EditableTransactionList;