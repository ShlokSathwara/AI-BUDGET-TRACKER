import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Bell, Wallet, Target, Clock } from 'lucide-react';

const SmartOverspendingAlerts = ({ transactions = [], user }) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Calculate spending baselines and detect anomalies
  const analyzeSpendingPatterns = useMemo(() => {
    if (!transactions || transactions.length === 0) return {};

    // Group transactions by category
    const categoryGroups = {};
    const now = new Date();
    
    // Calculate weekly and monthly spending
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    transactions.forEach(tx => {
      if (!tx.category || tx.type !== 'debit') return; // Only consider expenses
      
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return; // Skip invalid dates
      
      const category = tx.category;
      
      if (!categoryGroups[category]) {
        categoryGroups[category] = {
          all: [],
          weekly: [],
          monthly: []
        };
      }
      
      categoryGroups[category].all.push(tx);
      
      if (txDate >= oneWeekAgo) {
        categoryGroups[category].weekly.push(tx);
      }
      
      if (txDate >= oneMonthAgo) {
        categoryGroups[category].monthly.push(tx);
      }
    });

    // Calculate baselines
    const baselines = {};
    Object.keys(categoryGroups).forEach(category => {
      const allTransactions = categoryGroups[category].all;
      const weeklyTransactions = categoryGroups[category].weekly;
      const monthlyTransactions = categoryGroups[category].monthly;
      
      // Calculate average weekly spending for this category
      const weeklySpendingHistory = [];
      for (let i = 0; i < 4; i++) { // Look at last 4 weeks
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (7 * (i + 1)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const weekTransactions = allTransactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= weekStart && txDate <= weekEnd;
        });
        
        const weekTotal = weekTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        weeklySpendingHistory.push(weekTotal);
      }
      
      const avgWeeklySpending = weeklySpendingHistory.length > 0 
        ? weeklySpendingHistory.reduce((sum, val) => sum + val, 0) / weeklySpendingHistory.length
        : 0;
      
      const currentWeeklySpending = weeklyTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
      // Calculate average monthly spending for this category
      const monthlySpendingHistory = [];
      for (let i = 0; i < 3; i++) { // Look at last 3 months
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (i + 1), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0);
        
        const monthTransactions = allTransactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= monthStart && txDate <= monthEnd;
        });
        
        const monthTotal = monthTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        monthlySpendingHistory.push(monthTotal);
      }
      
      const avgMonthlySpending = monthlySpendingHistory.length > 0 
        ? monthlySpendingHistory.reduce((sum, val) => sum + val, 0) / monthlySpendingHistory.length
        : 0;
      
      const currentMonthlySpending = monthlyTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
      baselines[category] = {
        avgWeeklySpending,
        currentWeeklySpending,
        avgMonthlySpending,
        currentMonthlySpending,
        weeklyAnomaly: currentWeeklySpending > avgWeeklySpending * 1.5, // 150% of baseline
        monthlyAnomaly: currentMonthlySpending > avgMonthlySpending * 1.3 // 130% of baseline
      };
    });

    return baselines;
  }, [transactions]);

  // Generate alerts based on detected anomalies
  useEffect(() => {
    if (!user || !transactions || transactions.length === 0) return;

    const newAlerts = [];

    // Check for category-wise weekly anomalies
    Object.entries(analyzeSpendingPatterns).forEach(([category, data]) => {
      if (data.weeklyAnomaly && data.currentWeeklySpending > 0) {
        const multiplier = (data.currentWeeklySpending / data.avgWeeklySpending).toFixed(1);
        newAlerts.push({
          id: `weekly-${category}-${Date.now()}`,
          type: 'warning',
          title: `High spending detected`,
          message: `You spent ${multiplier}× more on ${category} this week compared to your average.`,
          timestamp: new Date().toISOString(),
          severity: 'high'
        });
      }

      if (data.monthlyAnomaly && data.currentMonthlySpending > 0) {
        const multiplier = (data.currentMonthlySpending / data.avgMonthlySpending).toFixed(1);
        newAlerts.push({
          id: `monthly-${category}-${Date.now()}`,
          type: 'warning',
          title: `Monthly budget concern`,
          message: `Your ${category} spending this month is ${multiplier}× higher than usual.`,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        });
      }
    });

    // Check for recent large purchases
    const recentTransactions = transactions
      .filter(tx => tx.type === 'debit' && new Date(tx.date) >= new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    recentTransactions.forEach(tx => {
      const categoryData = analyzeSpendingPatterns[tx.category];
      if (categoryData && tx.amount > categoryData.avgWeeklySpending * 0.5) { // Purchase > 50% of weekly average for category
        const avgPerTransaction = categoryData.avgWeeklySpending / Math.max(categoryData.all.length, 1);
        const multiplier = (tx.amount / avgPerTransaction).toFixed(1);
        
        newAlerts.push({
          id: `purchase-${tx._id || Date.now()}`,
          type: 'info',
          title: `Large purchase detected`,
          message: `This ${tx.category} purchase is ${multiplier}× larger than your typical transaction in this category.`,
          timestamp: tx.date,
          severity: 'low'
        });
      }
    });

    // Limit to last 10 alerts
    setAlerts(prev => {
      const combined = [...prev, ...newAlerts].slice(-10);
      return combined;
    });
  }, [analyzeSpendingPatterns, transactions, user]);

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const clearDismissedAlerts = () => {
    setAlerts(prev => prev.filter(alert => !dismissedAlerts.has(alert.id)));
    setDismissedAlerts(new Set());
  };

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Smart Overspending Alerts</h2>
            <p className="text-sm text-gray-400">Real-time behavioral AI monitoring</p>
          </div>
        </div>
        
        {activeAlerts.length > 0 && (
          <button
            onClick={clearDismissedAlerts}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            Clear Alerts
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {activeAlerts.length === 0 ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Spending Alerts</h3>
              <p className="text-gray-400">Your spending patterns look normal. Keep up the good work!</p>
            </motion.div>
          ) : (
            activeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-300 ${
                  alert.severity === 'high' 
                    ? 'bg-red-500/20 border-red-500/40' 
                    : alert.severity === 'medium'
                      ? 'bg-yellow-500/20 border-yellow-500/40'
                      : 'bg-blue-500/20 border-blue-500/40'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'high' 
                        ? 'bg-red-500/30' 
                        : alert.severity === 'medium'
                          ? 'bg-yellow-500/30'
                          : 'bg-blue-500/30'
                    }`}>
                      {alert.severity === 'high' ? (
                        <TrendingUp className="h-4 w-4 text-red-400" />
                      ) : alert.severity === 'medium' ? (
                        <Target className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <Wallet className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                    <h4 className="font-semibold text-white">{alert.title}</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  ×
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Insights Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <span>Spending Insights</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Top Categories This Month</h4>
            <div className="space-y-2">
              {Object.entries(analyzeSpendingPatterns)
                .sort((a, b) => b[1].currentMonthlySpending - a[1].currentMonthlySpending)
                .slice(0, 3)
                .map(([category, data]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-white text-sm">{category}</span>
                    <span className="text-gray-300 text-sm">₹{data.currentMonthlySpending.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Anomaly Detection Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Weekly Patterns</span>
                <span className={`text-sm ${
                  Object.values(analyzeSpendingPatterns).some(data => data.weeklyAnomaly) 
                    ? 'text-red-400' 
                    : 'text-green-400'
                }`}>
                  {Object.values(analyzeSpendingPatterns).some(data => data.weeklyAnomaly) ? 'Anomalies Found' : 'Normal'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Monthly Patterns</span>
                <span className={`text-sm ${
                  Object.values(analyzeSpendingPatterns).some(data => data.monthlyAnomaly) 
                    ? 'text-red-400' 
                    : 'text-green-400'
                }`}>
                  {Object.values(analyzeSpendingPatterns).some(data => data.monthlyAnomaly) ? 'Anomalies Found' : 'Normal'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Overall Risk</span>
                <span className={`text-sm ${
                  activeAlerts.length > 2 ? 'text-red-400' : 
                  activeAlerts.length > 0 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {activeAlerts.length > 2 ? 'High' : 
                   activeAlerts.length > 0 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmartOverspendingAlerts;