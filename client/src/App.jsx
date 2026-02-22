import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, User, BarChart3, FileText, Settings, Home, LogOut, Sun, Moon, Calculator, AlertTriangle, MessageSquare, PiggyBank, Edit3, Trash2, Users } from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import AddTransaction from './components/AddTransaction';
import AddCreditTransaction from './components/AddCreditTransaction';
import AddCashTransaction from './components/AddCashTransaction';
import Analytics from './components/Analytics';
import BankAccountManager from './components/BankAccountManager';
import BankAccountGraphs from './components/BankAccountGraphs';
import PaymentReminders from './components/PaymentReminders';
import PredictionCard from './components/PredictionCard';
import VoiceAssistant from './components/VoiceAssistant';
import AIChatAssistant from './components/AIChatAssistant';
import TransactionSections from './components/TransactionSections';
import SavingPlanner from './components/SavingPlanner';
import Reports from './components/Reports';
import SettingsComponent from './components/Settings';
import SimpleAuth from './components/SimpleAuth';
import EmailVerification from './components/EmailVerification';
import WhatIfSimulator from './components/WhatIfSimulator';
import SmartOverspendingAlerts from './components/SmartOverspendingAlerts';
import SMSExpenseExtractor from './components/SMSExpenseExtractor';
import EditTransactionModal from './components/EditTransactionModal';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationDisplay from './components/NotificationDisplay';
import WeeklyReportScheduler from './components/WeeklyReportScheduler';
import DailyExpenseReminder from './components/DailyExpenseReminder';
import { getTransactions } from './utils/api';
import FamilyBudgetManager from './components/FamilyBudgetManager';

// Animated Background Component
const AnimatedBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      width: Math.floor(Math.random() * 100) + 20,
      height: Math.floor(Math.random() * 100) + 20,
      left: Math.random() * 100,
      top: Math.random() * 100,
      xMove: Math.random() * 100 - 50,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
  }, []); // Empty dependency array ensures this only runs once

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black"></div>
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-400/20"
          style={{
            width: particle.width,
            height: particle.height,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, particle.xMove, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
      
      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-indigo-500/5 to-transparent"></div>
    </div>
  );
};

// Mobile-Friendly Navbar Component
const Navbar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: Home, key: 'dashboard' },
    { name: 'Analytics', icon: BarChart3, key: 'analytics' },
    { name: 'Family Budget', icon: Users, key: 'family-budget' },
    { name: 'Saving Goals', icon: PiggyBank, key: 'saving-goals' },
    { name: 'What-If', icon: Calculator, key: 'whatif' },
    { name: 'Overspending', icon: AlertTriangle, key: 'overspending' },
    { name: 'SMS Extractor', icon: MessageSquare, key: 'sms-extractor' },
    { name: 'Reports', icon: FileText, key: 'reports' },
    { name: 'Settings', icon: Settings, key: 'settings' },
  ];

  return (
    <motion.header 
      className="w-full py-4 px-4 md:px-6 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-lg border-b border-blue-500/20 classy-element"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and User Info */}
        <div className="flex items-center space-x-6">
          <motion.div 
            className="flex items-center space-x-2 classy-element"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg animate-classy-pulse">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                AI Budget Tracker
              </h1>
              {user && (
                <p className="text-sm text-gray-300">
                  Welcome, {user.name}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.name}
                className={`px-4 py-2 rounded-lg transition-all duration-300 classy-button flex items-center space-x-2 ${
                  activeTab === item.key 
                    ? 'bg-white/20 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(item.key)}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.name}</span>
              </motion.button>
            );
          })}
          
          {user && (
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-300" />
                )}
              </button>
              
              <motion.button
                onClick={onLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 classy-button flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-300 hover:text-white classy-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden mt-4 py-4 border-t border-blue-500/20 classy-element"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <motion.button
                    key={item.name}
                    className={`px-4 py-3 text-left flex items-center space-x-2 rounded-lg transition-all duration-300 classy-button ${
                      activeTab === item.key 
                        ? 'bg-white/20 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setActiveTab(item.key);
                      setIsMenuOpen(false);
                    }}
                    whileHover={{ x: 5 }}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </motion.button>
                );
              })}
              {user && (
                <>
                  <motion.button
                    onClick={() => {
                      toggleTheme();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg classy-button flex items-center space-x-2 w-full text-left"
                    whileHover={{ x: 5 }}
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-gray-300" />
                    )}
                    <span>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="mt-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg classy-button flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// Main App Component with Theme and Notification Providers
function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      <NotificationDisplay />
    </NotificationProvider>
  );
}

// App Content Component (the actual app logic)
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTransactionTab, setActiveTransactionTab] = useState('expense'); // 'expense', 'credit', 'cash', 'overspending'
  const [bankAccounts, setBankAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { isDarkMode } = useTheme();

  // Load user-specific settings
  const loadUserSettings = () => {
    if (user) {
      const userSettingsKey = `settings_${user.id}`;
      const savedSettings = localStorage.getItem(userSettingsKey);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return {};
  };

  // Check authentication status on app load - persistent session
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('currentUser');
    
    // Check if we're on email verification page
    const isEmailVerification = window.location.pathname === '/verify-email';
    
    if (isEmailVerification) {
      // Don't auto-login on verification page
      return;
    }
    
    // Keep user signed in if authentication data exists
    if (storedAuth === 'true' && storedUser) {
      const userData = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUser(userData);
      // Load user-specific transactions
      loadUserTransactions(userData.id);
      // Load user-specific bank accounts
      loadUserBankAccounts(userData.id);
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setActiveTab('dashboard');
    // Load user-specific transactions
    loadUserTransactions(userData.id);
  };

  const handleVerificationSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setActiveTab('dashboard');
    // Load user-specific transactions
    loadUserTransactions(userData.id);
    // Redirect to dashboard
    window.history.replaceState(null, '', '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setUser(null);
    setTransactions([]);
    setActiveTab('dashboard');
  };

  // Load user-specific transactions
  const loadUserTransactions = async (userId) => {
    setLoading(true);
    try {
      // Try to get user-specific transactions from localStorage first
      const userTransactionsKey = `transactions_${userId}`;
      const storedTransactions = localStorage.getItem(userTransactionsKey);
      
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        // If no stored transactions, initialize with empty array for new users
        setTransactions([]);
        localStorage.setItem(userTransactionsKey, JSON.stringify([]));
      }
    } catch (err) {
      console.error('Error loading user transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user-specific bank accounts
  const loadUserBankAccounts = (userId) => {
    try {
      if (!userId) {
        console.warn('No user ID provided for loading bank accounts');
        setBankAccounts([]);
        return;
      }
      
      const userAccountsKey = `bank_accounts_${userId}`;
      const storedAccounts = localStorage.getItem(userAccountsKey);
      
      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        if (Array.isArray(accounts)) {
          setBankAccounts(accounts);
        } else {
          console.warn('Saved bank accounts data is not an array, initializing as empty array');
          setBankAccounts([]);
          localStorage.setItem(userAccountsKey, JSON.stringify([]));
        }
      } else {
        // Initialize with empty array for new users
        setBankAccounts([]);
        localStorage.setItem(userAccountsKey, JSON.stringify([]));
      }
    } catch (err) {
      console.error('Error loading user bank accounts:', err);
      setBankAccounts([]);
    }
  };

  // Load transactions from API (fallback)
  useEffect(() => {
    if (!user) return; // Only load if user is authenticated
    
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const data = await getTransactions();
        // Filter transactions by user if user data is available
        const userTransactions = user && data.filter(tx => tx.user === user.id);
        setTransactions(Array.isArray(userTransactions) ? userTransactions : []);
      } catch (err) {
        console.error('Error loading transactions:', err);
        // Load user-specific transactions from localStorage
        loadUserTransactions(user.id);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user]);

  const handleAddTransaction = async (newTx) => {
    console.log('handleAddTransaction called with:', newTx);
    console.log('Current user state:', user);
    console.log('Current transactions state:', transactions);
    console.log('Current bankAccounts state:', bankAccounts);
    
    try {
      // Validate required inputs
      if (!newTx) {
        console.error('No transaction data provided');
        alert('Error: No transaction data provided. Please try again.');
        return;
      }
      
      if (!user) {
        console.error('No user authenticated');
        alert('Error: Please log in first before adding transactions.');
        return;
      }
      
      if (!user.id) {
        console.error('User ID missing');
        alert('Error: User ID missing. Please refresh the page and log in again.');
        return;
      }

      // Add user ID and timestamp
      const transactionWithUser = {
        ...newTx,
        user: user.id,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      console.log('Transaction with user data:', transactionWithUser);
      
      // Update transactions state
      setTransactions(prev => {
        const currentTransactions = Array.isArray(prev) ? prev : [];
        console.log('Previous transactions:', prev);
        console.log('New transaction array length:', currentTransactions.length + 1);
        return [transactionWithUser, ...currentTransactions];
      });
      
      // Save to localStorage
      try {
        const userTransactionsKey = `transactions_${user.id}`;
        const currentTransactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
        const updatedTransactions = [transactionWithUser, ...currentTransactions];
        localStorage.setItem(userTransactionsKey, JSON.stringify(updatedTransactions));
        console.log('Saved to localStorage successfully');
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
      
      console.log('Transaction added successfully:', transactionWithUser);
      
      // Send notification for cross-verification
      const notificationTitle = `New ${transactionWithUser.type === 'credit' ? 'Credit' : 'Debit'} Entry`;
      const notificationMessage = `Transaction: ${transactionWithUser.merchant || transactionWithUser.description || 'N/A'}\nAmount: ₹${transactionWithUser.amount?.toLocaleString() || '0'}\nCategory: ${transactionWithUser.category || 'Uncategorized'}\nAccount: ${(bankAccounts.find(acc => acc.id === transactionWithUser.bankAccountId)?.name) || 'N/A'}`;
      
      // Create notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificationTitle, {
          body: notificationMessage,
          icon: '/favicon.ico',
          tag: transactionWithUser._id
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notificationTitle, {
              body: notificationMessage,
              icon: '/favicon.ico',
              tag: transactionWithUser._id
            });
          }
        });
      }
      
      // Show in-app notification as well
      alert(`✅ Transaction added successfully!\n\n${notificationTitle}\n${notificationMessage}`);
      
    } catch (err) {
      console.error('Error in handleAddTransaction:', err);
      console.error('Error stack:', err.stack);
      alert('Failed to add transaction: ' + (err.message || 'Unknown error occurred. Please try again.'));
    }
  };

  // Handle transaction update
  const handleUpdateTransaction = async (updatedTx) => {
    try {
      if (!user || !user.id) {
        alert('Error: Please log in first before updating transactions.');
        return;
      }

      // Update transaction state
      setTransactions(prev => {
        return prev.map(tx => tx._id === updatedTx._id ? updatedTx : tx);
      });

      // Update localStorage
      try {
        const userTransactionsKey = `transactions_${user.id}`;
        const currentTransactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
        const updatedTransactions = currentTransactions.map(tx => 
          tx._id === updatedTx._id ? updatedTx : tx
        );
        localStorage.setItem(userTransactionsKey, JSON.stringify(updatedTransactions));
        
        // Also update the main transactions array
        setTransactions(updatedTransactions);
      } catch (storageError) {
        console.error('Error updating transaction in localStorage:', storageError);
        alert('Warning: Transaction updated temporarily but failed to save permanently.');
      }

      // Update bank account balances
      if (Array.isArray(bankAccounts) && bankAccounts.length > 0) {
        // First, reverse the effect of the old transaction
        const oldTransaction = transactions.find(tx => tx._id === updatedTx._id);
        if (oldTransaction && oldTransaction.bankAccountId) {
          const oldAmount = oldTransaction.type === 'credit' 
            ? (oldTransaction.amount || 0)
            : -(oldTransaction.amount || 0);
          
          // Then apply the effect of the new transaction
          const newAmount = updatedTx.type === 'credit' 
            ? (updatedTx.amount || 0)
            : -(updatedTx.amount || 0);
          
          const amountDifference = newAmount - oldAmount;
          
          const updatedAccounts = bankAccounts.map(acc => {
            if (acc && acc.id === updatedTx.bankAccountId) {
              const currentBalance = typeof acc.balance === 'number' ? acc.balance : 0;
              return { 
                ...acc, 
                balance: currentBalance + amountDifference 
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
            } catch (storageError) {
              console.error('Error saving bank accounts:', storageError);
            }
          }
        }
      }

      alert('✅ Transaction updated successfully!');
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Failed to update transaction: ' + err.message);
    }
  };

  // Handle transaction deletion
  const handleDeleteTransaction = async (transactionId) => {
    try {
      if (!user || !user.id) {
        alert('Error: Please log in first before deleting transactions.');
        return;
      }

      // Remove transaction from state
      setTransactions(prev => {
        return prev.filter(tx => tx._id !== transactionId);
      });

      // Update localStorage
      try {
        const userTransactionsKey = `transactions_${user.id}`;
        const currentTransactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
        const updatedTransactions = currentTransactions.filter(tx => tx._id !== transactionId);
        localStorage.setItem(userTransactionsKey, JSON.stringify(updatedTransactions));
        
        // Update the main transactions array
        setTransactions(updatedTransactions);
      } catch (storageError) {
        console.error('Error deleting transaction from localStorage:', storageError);
        alert('Warning: Transaction deleted temporarily but failed to remove permanently.');
      }

      // Update bank account balance to reverse the transaction
      if (Array.isArray(bankAccounts) && bankAccounts.length > 0) {
        const deletedTransaction = transactions.find(tx => tx._id === transactionId);
        if (deletedTransaction && deletedTransaction.bankAccountId) {
          const amount = deletedTransaction.type === 'credit' 
            ? -(deletedTransaction.amount || 0)  // Reverse the credit
            : (deletedTransaction.amount || 0);  // Reverse the debit
          
          const updatedAccounts = bankAccounts.map(acc => {
            if (acc && acc.id === deletedTransaction.bankAccountId) {
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
            } catch (storageError) {
              console.error('Error saving bank accounts:', storageError);
            }
          }
        }
      }

      alert('✅ Transaction deleted successfully!');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction: ' + err.message);
    }
  };

  const renderActiveTab = () => {
    const userSettings = loadUserSettings();
    
    switch(activeTab) {
      case 'family-budget':
        return <FamilyBudgetManager 
          currentUser={user} 
          transactions={transactions} 
          bankAccounts={bankAccounts}
          onFamilyDataUpdate={(familyMembers) => {
            console.log('Family data updated:', familyMembers);
            // Handle family data updates here
          }}
        />;
      case 'analytics':
        return <Analytics transactions={transactions} bankAccounts={bankAccounts} />;
      case 'reports':
        return <Reports transactions={transactions} accounts={bankAccounts} />;
      case 'whatif':
        return <WhatIfSimulator transactions={transactions} bankAccounts={bankAccounts} />;
      case 'overspending':
        return <SmartOverspendingAlerts transactions={transactions} user={user} />;
      case 'sms-extractor':
        return <SMSExpenseExtractor 
          bankAccounts={bankAccounts} 
          onAddTransaction={handleAddTransaction}
        />;
      case 'saving-goals':
        return <SavingPlanner transactions={transactions} />;
      case 'settings':
        return <SettingsComponent 
          currentUser={user} 
          transactions={transactions}
          setTransactions={setTransactions}
          setGoals={setGoals}
          setBankAccounts={setBankAccounts}
        />;
      case 'dashboard':
      default:
        return (
          <>
            <WeeklyReportScheduler user={user} transactions={transactions} settings={userSettings.notifications} />
            <DailyExpenseReminder user={user} transactions={transactions} settings={userSettings.notifications} />
            {/* Welcome Section */}
            <div className="text-center py-8 animate-elegant-entrance">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent mb-4">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Continue tracking your expenses with your personalized AI Budget Tracker
              </p>
              {transactions.length === 0 && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-md mx-auto">
                  <p className="text-blue-300 text-sm">
                    <span className="font-semibold">New user:</span> Your balance is initialized to zero. Add your first transaction to get started!
                  </p>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <SummaryCards transactions={transactions} />

            {/* Main Content Grid - Restructured Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column - Bank Accounts and Transaction Forms */}
              <div className="lg:col-span-2 space-y-8">
                {/* Bank Account Manager */}
                <BankAccountManager 
                  user={user} 
                  onUpdateAccounts={setBankAccounts}
                />
                
                {/* Transaction Type Tabs (without transaction tab) */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element">
                  <div className="flex border-b border-white/10 mb-4">
                    <button
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTransactionTab === 'expense' 
                          ? 'text-white border-b-2 border-blue-500' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveTransactionTab('expense')}
                    >
                      Expense
                    </button>
                    <button
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTransactionTab === 'credit' 
                          ? 'text-white border-b-2 border-green-500' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveTransactionTab('credit')}
                    >
                      Income
                    </button>
                    <button
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTransactionTab === 'cash' 
                          ? 'text-white border-b-2 border-yellow-500' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveTransactionTab('cash')}
                    >
                      Cash
                    </button>
                    <button
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTransactionTab === 'overspending' 
                          ? 'text-white border-b-2 border-red-500' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveTransactionTab('overspending')}
                    >
                      Overspending
                    </button>
                  </div>

                  {/* Transaction Forms */}
                  {activeTransactionTab === 'expense' ? (
                    <AddTransaction 
                      onAdd={handleAddTransaction}
                      accounts={bankAccounts}
                    />
                  ) : activeTransactionTab === 'credit' ? (
                    <AddCreditTransaction 
                      onAdd={handleAddTransaction}
                      accounts={bankAccounts}
                    />
                  ) : activeTransactionTab === 'cash' ? (
                    <AddCashTransaction 
                      onAdd={handleAddTransaction}
                      accounts={bankAccounts}
                    />
                  ) : (
                    <SmartOverspendingAlerts 
                      transactions={transactions}
                      user={user}
                    />
                  )}
                </div>
              </div>

              {/* Middle Column - Payment Reminders (moved from right) */}
              <div className="space-y-8">
                <PaymentReminders user={user} bankAccounts={bankAccounts} />
                
                <SavingPlanner transactions={transactions} />
                
                <PredictionCard transactions={transactions} />
              </div>

              {/* Right Column - All Transactions Section */}
              <div className="space-y-8">
                <TransactionSections 
                  transactions={transactions}
                  bankAccounts={bankAccounts}
                  onEditTransaction={(transaction) => {
                    setSelectedTransaction(transaction);
                    setShowEditModal(true);
                  }}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </div>
          </>
        );
    }
  };

  const isEmailVerification = window.location.pathname === '/verify-email';

  if (isEmailVerification) {
    return <EmailVerification onVerificationSuccess={handleVerificationSuccess} />;
  }

  if (!isAuthenticated) {
    return <SimpleAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen relative classy-container">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto p-6">
          {renderActiveTab()}

          {/* Voice Assistant */}
          <VoiceAssistant 
            onTransactionDetected={handleAddTransaction}
            isListening={isVoiceListening}
            setIsListening={setIsVoiceListening}
            bankAccounts={bankAccounts}
          />

          {/* AI Chat Assistant */}
          <AIChatAssistant 
            transactions={transactions}
            bankAccounts={bankAccounts}
            isVisible={isChatVisible}
            setIsVisible={setIsChatVisible}
          />
          
          {/* Edit Transaction Modal */}
          <EditTransactionModal
            transaction={selectedTransaction}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
            accounts={bankAccounts}
          />
        </main>
      </div>
    </div>
  );
}

export default App;