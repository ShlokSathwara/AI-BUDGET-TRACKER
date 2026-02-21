import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, User } from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import AddTransaction from './components/AddTransaction';
import Analytics from './components/Analytics';
import PredictionCard from './components/PredictionCard';
import VoiceAssistant from './components/VoiceAssistant';
import AIChatAssistant from './components/AIChatAssistant';
import PhoneAuth from './components/PhoneAuth';
import SavingPlanner from './components/SavingPlanner';
import { getTransactions } from './utils/api';

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black"></div>
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400/20"
          style={{
            width: Math.random() * 100 + 20,
            height: Math.random() * 100 + 20,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
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
const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '#' },
    { name: 'Analytics', href: '#' },
    { name: 'Reports', href: '#' },
    { name: 'Settings', href: '#' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <motion.header 
      className="w-full py-4 px-4 md:px-6 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-lg border-b border-blue-500/20 classy-element"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="flex items-center space-x-2 classy-element"
          whileHover={{ scale: 1.05 }}
        >
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg animate-classy-pulse">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
            AI Budget Tracker
          </h1>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <motion.button
              key={item.name}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 classy-button"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.name}
            </motion.button>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="w-5 h-5" />
                <span>{user?.name || user?.phoneNumber || 'User'}</span>
              </div>
              <motion.button 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 classy-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <motion.button 
              className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 classy-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
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
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  className="px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 classy-button"
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ x: 5 }}
                >
                  {item.name}
                </motion.button>
              ))}
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 text-white">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{user?.name || user?.phoneNumber || 'User'}</span>
                    </div>
                  </div>
                  <motion.button 
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg classy-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <motion.button 
                  className="mt-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg classy-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Load transactions from API
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadTransactions = async () => {
      setLoading(true);
      try {
        const data = await getTransactions();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading transactions:', err);
        // Use mock data as fallback
        setTransactions([
          { _id: 1, amount: 250, merchant: 'Swiggy', category: 'Food', type: 'debit', currency: 'INR' },
          { _id: 2, amount: 50, merchant: 'Ola', category: 'Transport', type: 'debit', currency: 'INR' },
          { _id: 3, amount: 1000, merchant: 'Salary', category: 'Income', type: 'credit', currency: 'INR' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [isAuthenticated]);

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowPhoneAuth(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleAddTransaction = async (newTx) => {
    try {
      // In a real app, you would send this to the backend
      setTransactions(prev => [newTx, ...prev]);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  if (!isAuthenticated && !showPhoneAuth) {
    return (
      <div className="min-h-screen relative classy-container">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-4">
          <motion.div 
            className="text-center mb-8 animate-elegant-entrance"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent mb-4">
              AI Budget Tracker
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Smart expense tracking with AI voice assistant and intelligent categorization
            </p>
          </motion.div>
          
          <motion.button
            onClick={() => setShowPhoneAuth(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-lg font-semibold classy-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In with Phone
          </motion.button>
        </div>
      </div>
    );
  }

  if (showPhoneAuth) {
    return <PhoneAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen relative classy-container">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto p-6">
          {/* Welcome Section */}
          <div className="text-center py-8 animate-elegant-entrance">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent mb-4">
              Welcome, {user?.name || user?.phoneNumber || 'User'}!
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Smart expense tracking with AI voice assistant and intelligent categorization
            </p>
          </div>

          {/* Summary Cards */}
          <SummaryCards transactions={transactions} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Add Transaction and Analytics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Transaction Form */}
              <AddTransaction 
                onAdd={handleAddTransaction} 
              />

              {/* Analytics Charts */}
              <Analytics transactions={transactions} />
            </div>

            {/* Right Column - Saving Planner, Prediction Card and Recent Transactions */}
            <div className="space-y-6">
              {/* Saving Planner */}
              <SavingPlanner transactions={transactions} />
              
              <PredictionCard transactions={transactions} />
              
              {/* Recent Transactions */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 classy-element">
                <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading transactions...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((t) => (
                      <div key={t._id} className="p-4 bg-white/5 rounded-xl border border-white/10 classy-element">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{t.merchant}</div>
                            <div className="text-sm text-gray-400">{t.category}</div>
                          </div>
                          <div className={`font-semibold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                            {t.type === 'credit' ? '+' : '-'}₹{t.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voice Assistant */}
          <VoiceAssistant 
            onTransactionDetected={handleAddTransaction}
            isListening={false}
            setIsListening={() => {}}
          />

          {/* AI Chat Assistant */}
          <AIChatAssistant 
            onTransactionDetected={handleAddTransaction}
            isVisible={false}
            setIsVisible={() => {}}
          />
        </main>
      </div>
    </div>
  );
}

export default App;