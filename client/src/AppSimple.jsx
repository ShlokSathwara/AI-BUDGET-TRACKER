import React, { useState, useEffect } from 'react';
import MinimalAuth from './components/MinimalAuth';
import BankAccountManager from './components/BankAccountManager';
import AddTransaction from './components/AddTransaction';
import AddCreditTransaction from './components/AddCreditTransaction';

function AppSimple() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('expense');

  // Check authentication status on app load
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedAuth === 'true' && storedUser) {
      const userData = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUser(userData);
      loadUserTransactions(userData.id);
      loadUserBankAccounts(userData.id);
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    loadUserTransactions(userData.id);
    loadUserBankAccounts(userData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setUser(null);
    setTransactions([]);
    setBankAccounts([]);
  };

  // Load user-specific transactions
  const loadUserTransactions = (userId) => {
    try {
      const userTransactionsKey = `transactions_${userId}`;
      const storedTransactions = localStorage.getItem(userTransactionsKey);
      
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions([]);
        localStorage.setItem(userTransactionsKey, JSON.stringify([]));
      }
    } catch (err) {
      console.error('Error loading user transactions:', err);
      setTransactions([]);
    }
  };

  // Load user-specific bank accounts
  const loadUserBankAccounts = (userId) => {
    try {
      if (!userId) {
        setBankAccounts([]);
        return;
      }
      
      const userAccountsKey = `bank_accounts_${userId}`;
      const storedAccounts = localStorage.getItem(userAccountsKey);
      
      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        setBankAccounts(Array.isArray(accounts) ? accounts : []);
      } else {
        setBankAccounts([]);
        localStorage.setItem(userAccountsKey, JSON.stringify([]));
      }
    } catch (err) {
      console.error('Error loading user bank accounts:', err);
      setBankAccounts([]);
    }
  };

  const handleAddTransaction = async (newTx) => {
    console.log('Adding transaction:', newTx);
    console.log('Current user:', user);
    
    try {
      // Validate required inputs
      if (!newTx) {
        alert('Error: No transaction data provided.');
        return;
      }
      
      if (!user) {
        alert('Error: Please log in first.');
        return;
      }

      // Add user ID and timestamp
      const transactionWithUser = {
        ...newTx,
        user: user.id,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Update transactions state
      setTransactions(prev => {
        const currentTransactions = Array.isArray(prev) ? prev : [];
        return [transactionWithUser, ...currentTransactions];
      });
      
      // Save to localStorage
      try {
        const userTransactionsKey = `transactions_${user.id}`;
        const currentTransactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
        const updatedTransactions = [transactionWithUser, ...currentTransactions];
        localStorage.setItem(userTransactionsKey, JSON.stringify(updatedTransactions));
        console.log('Transaction saved successfully');
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        alert('Warning: Transaction saved temporarily but failed to save permanently.');
      }
      
      // Update bank account balance if account selected
      if (transactionWithUser.bankAccountId && Array.isArray(bankAccounts) && bankAccounts.length > 0) {
        try {
          const amount = transactionWithUser.type === 'credit' 
            ? (transactionWithUser.amount || 0)
            : -(transactionWithUser.amount || 0);
          
          const updatedAccounts = bankAccounts.map(acc => {
            if (acc && acc.id === transactionWithUser.bankAccountId) {
              const currentBalance = typeof acc.balance === 'number' ? acc.balance : 0;
              return { 
                ...acc, 
                balance: currentBalance + amount 
              };
            }
            return acc;
          }).filter(acc => acc && acc.id);
          
          if (updatedAccounts.length > 0) {
            setBankAccounts(updatedAccounts);
            
            // Save updated accounts
            try {
              const userAccountsKey = `bank_accounts_${user.id}`;
              localStorage.setItem(userAccountsKey, JSON.stringify(updatedAccounts));
              console.log('Bank accounts updated successfully');
            } catch (storageError) {
              console.error('Error saving bank accounts:', storageError);
            }
          }
        } catch (accountError) {
          console.error('Error updating bank account balance:', accountError);
        }
      }
      
      alert('Transaction added successfully!');
      
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert('Failed to add transaction: ' + (err.message || 'Unknown error'));
    }
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <MinimalAuth onAuthSuccess={handleAuthSuccess} />;
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Budget Tracker</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Type Tabs */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex border-b border-white/10 mb-4">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'expense' 
                      ? 'text-white border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('expense')}
                >
                  Expense
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'credit' 
                      ? 'text-white border-b-2 border-green-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('credit')}
                >
                  Income
                </button>
              </div>

              {/* Transaction Forms */}
              {activeTab === 'expense' ? (
                <AddTransaction 
                  onAdd={handleAddTransaction}
                  accounts={bankAccounts}
                />
              ) : (
                <AddCreditTransaction 
                  onAdd={handleAddTransaction}
                  accounts={bankAccounts}
                />
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">Add your first transaction above</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 10).map((t) => (
                    <div key={t._id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{t.merchant}</div>
                          <div className="text-sm text-gray-400">{t.description}</div>
                          <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className={`text-right font-bold ${
                          t.type === 'credit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {t.type === 'credit' ? '+' : '-'}₹{t.amount?.toFixed(2)}
                        </div>
                      </div>
                      {t.category && (
                        <div className="text-xs text-gray-500 mt-1">Category: {t.category}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Bank Accounts */}
          <div className="space-y-6">
            <BankAccountManager 
              user={user} 
              onUpdateAccounts={setBankAccounts}
            />
            
            {/* Account Summary */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Account Summary</h2>
              <div className="space-y-4">
                {bankAccounts.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No bank accounts added</p>
                ) : (
                  bankAccounts.map((account) => (
                    <div key={account.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          {account.lastFourDigits && (
                            <div className="text-sm text-gray-400">****{account.lastFourDigits}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{account.balance?.toFixed(2) || '0.00'}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Overall Balance */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Balance</span>
                  <span className="text-xl font-bold text-blue-400">
                    ₹{bankAccounts.reduce((total, acc) => total + (acc.balance || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppSimple;