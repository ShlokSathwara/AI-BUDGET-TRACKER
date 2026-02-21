import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import SummaryCards from '../components/SummaryCards';
import AddTransaction from '../components/AddTransaction';
import Analytics from '../components/Analytics';
import PredictionCard from '../components/PredictionCard';
import VoiceAssistant from '../components/VoiceAssistant';
import AIChatAssistant from '../components/AIChatAssistant';
import { getTransactions } from '../utils/api';
import { Clock, Receipt, IndianRupee } from 'lucide-react';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getTransactions();
      // Convert any USD transactions to INR (assuming 1 USD = 83 INR)
      const convertedData = data.map(tx => ({
        ...tx,
        amount: tx.currency === 'USD' ? tx.amount * 83 : tx.amount,
        currency: 'INR'
      }));
      setTransactions(Array.isArray(convertedData) ? convertedData : []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function handleAdd(tx) {
    const item = tx && tx.transaction ? tx.transaction : tx;
    // Ensure all transactions are in INR
    const transactionWithINR = {
      ...item,
      amount: item.currency === 'USD' ? item.amount * 83 : item.amount,
      currency: 'INR'
    };
    setTransactions(prev => [transactionWithINR, ...prev]);
  }

  function handleVoiceTransaction(transaction) {
    handleAdd(transaction);
  }

  function handleAIChatTransaction(transaction) {
    handleAdd(transaction);
  }

  // Calculate total in Rupees
  const totalINR = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const spendingINR = transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + (t.amount || 0), 0);
  const incomeINR = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navbar />
        
        <motion.main 
          className="max-w-7xl mx-auto p-4 md:p-6 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <IndianRupee className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                AI Budget Tracker India
              </h1>
              <IndianRupee className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Smart expense tracking with AI voice assistant, Indian Rupees, and intelligent categorization
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI Powered</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>₹ Rupees</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Voice Control</span>
              </span>
            </div>
          </motion.div>

          {/* Summary Cards with Rupee conversion */}
          <SummaryCards 
            transactions={transactions} 
            currency="INR"
            currencySymbol="₹"
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Add Transaction and Analytics */}
            <div className="lg:col-span-2 space-y-6">
              <AddTransaction onAdd={handleAdd} currency="INR" currencySymbol="₹" />
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Receipt className="h-6 w-6 text-blue-400" />
                  <span>Analytics & Insights</span>
                </h2>
                {loading ? (
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading analytics...</p>
                  </div>
                ) : (
                  <Analytics transactions={transactions} currency="INR" />
                )}
              </motion.div>
            </div>

            {/* Right Column - Prediction and Recent Transactions */}
            <div className="space-y-6">
              <PredictionCard transactions={transactions} currency="INR" currencySymbol="₹" />
              
              {/* Recent Transactions */}
              <motion.div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    <span>Recent Transactions</span>
                  </h3>
                  <IndianRupee className="h-4 w-4 text-green-400" />
                </div>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No transactions yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first transaction above or use voice commands</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.slice(0, 8).map((t, i) => (
                      <motion.div
                        key={t._id || i}
                        className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {t.merchant || t.description || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {t.category || 'Uncategorized'} {t.subcategory ? `• ${t.subcategory}` : ''}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className={`font-semibold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                              {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(t.date || Date.now()).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.main>

        {/* AI Assistants */}
        <VoiceAssistant 
          onTransactionDetected={handleVoiceTransaction}
          isListening={isListening}
          setIsListening={setIsListening}
        />
        
        <AIChatAssistant 
          onTransactionDetected={handleAIChatTransaction}
          isVisible={isChatVisible}
          setIsVisible={setIsChatVisible}
        />
      </div>
    </div>
  );
}
