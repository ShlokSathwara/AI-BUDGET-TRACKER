import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, TrendingDown, Wallet, BarChart3, Target } from 'lucide-react';

const WhatIfSimulator = ({ transactions = [], bankAccounts = [] }) => {
  const [simulation, setSimulation] = useState({
    scenario: '',
    changeType: 'reduction', // 'reduction', 'increase', 'new-expense', 'new-income'
    amount: '',
    frequency: 'monthly', // 'one-time', 'weekly', 'monthly', 'yearly'
    duration: '12', // months
    startDate: new Date().toISOString().split('T')[0],
    targetAccount: ''
  });
  
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate current financial metrics
  const calculateCurrentMetrics = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const lastMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= oneMonthAgo && txDate <= now;
    });
    
    const income = lastMonthTransactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
    const expenses = lastMonthTransactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const netFlow = income - expenses;
    const savingsRate = income > 0 ? ((netFlow / income) * 100).toFixed(1) : 0;
    
    return { income, expenses, netFlow, savingsRate };
  };

  const handleInputChange = (field, value) => {
    setSimulation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateSimulation = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const currentMetrics = calculateCurrentMetrics();
        const amount = parseFloat(simulation.amount) || 0;
        
        let monthlyImpact = 0;
        
        switch (simulation.changeType) {
          case 'reduction': // Reducing expenses
            monthlyImpact = amount; // Positive impact on savings
            break;
          case 'increase': // Increasing income
            monthlyImpact = amount; // Positive impact on savings
            break;
          case 'new-expense': // Adding new expense
            monthlyImpact = -amount; // Negative impact on savings
            break;
          case 'new-income': // Adding new income
            monthlyImpact = amount; // Positive impact on savings
            break;
          default:
            monthlyImpact = 0;
        }
        
        // Adjust for frequency
        switch (simulation.frequency) {
          case 'weekly':
            monthlyImpact *= 4; // Approximate weeks in a month
            break;
          case 'yearly':
            monthlyImpact /= 12; // Convert annual to monthly
            break;
          case 'one-time':
            monthlyImpact = monthlyImpact / parseInt(simulation.duration); // Spread one-time over duration
            break;
          case 'monthly':
          default:
            // Keep as is
            break;
        }
        
        const durationMonths = parseInt(simulation.duration);
        const projectedIncome = currentMetrics.income + (simulation.changeType.includes('income') ? monthlyImpact : 0);
        const projectedExpenses = currentMetrics.expenses + (simulation.changeType.includes('expense') ? monthlyImpact : 0) - (simulation.changeType === 'reduction' ? monthlyImpact : 0);
        const projectedNetFlow = projectedIncome - projectedExpenses;
        const projectedSavingsRate = projectedIncome > 0 ? ((projectedNetFlow / projectedIncome) * 100).toFixed(1) : 0;
        
        // Calculate cumulative impact over time
        const monthlyProjections = [];
        let currentBalance = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        
        for (let i = 1; i <= durationMonths; i++) {
          currentBalance += projectedNetFlow;
          monthlyProjections.push({
            month: i,
            balance: currentBalance,
            netFlow: projectedNetFlow,
            cumulativeImpact: currentBalance - (bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) + currentMetrics.netFlow * i)
          });
        }
        
        const finalBalance = monthlyProjections[monthlyProjections.length - 1]?.balance || currentBalance;
        const totalSavingsImpact = monthlyProjections[monthlyProjections.length - 1]?.cumulativeImpact || (projectedNetFlow - currentMetrics.netFlow) * durationMonths;
        
        setResults({
          current: currentMetrics,
          projected: {
            income: projectedIncome,
            expenses: projectedExpenses,
            netFlow: projectedNetFlow,
            savingsRate: projectedSavingsRate
          },
          impact: {
            totalSavingsImpact,
            finalBalance,
            monthlyProjections
          },
          scenario: simulation.scenario
        });
      } catch (error) {
        console.error('Error calculating simulation:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 500); // Simulate calculation time
  };

  const currentMetrics = calculateCurrentMetrics();

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">What-If Financial Simulator</h2>
            <p className="text-sm text-gray-400">Simulate future financial decisions and their impact</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Scenario Description</label>
              <input
                type="text"
                value={simulation.scenario}
                onChange={(e) => handleInputChange('scenario', e.target.value)}
                placeholder="e.g., Order food 3x less, Salary increase by 20%"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Change Type</label>
              <select
                value={simulation.changeType}
                onChange={(e) => handleInputChange('changeType', e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="reduction">Reduce Expenses</option>
                <option value="increase">Increase Income</option>
                <option value="new-expense">New Expense</option>
                <option value="new-income">New Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={simulation.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
              <select
                value={simulation.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="one-time">One Time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (months)</label>
              <input
                type="number"
                value={simulation.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                min="1"
                max="60"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <motion.button
              onClick={calculateSimulation}
              disabled={isCalculating || !simulation.scenario || !simulation.amount}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5" />
                  <span>Run Simulation</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!results ? (
            <div className="flex items-center justify-center h-full min-h-96">
              <div className="text-center">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Run a Simulation</h3>
                <p className="text-gray-400">Enter your scenario and click "Run Simulation" to see the financial impact</p>
              </div>
            </div>
          ) : (
            <>
              {/* Current vs Projected Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-blue-400" />
                    <span>Current</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Income:</span>
                      <span className="text-green-400 font-semibold">₹{currentMetrics.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expenses:</span>
                      <span className="text-red-400 font-semibold">₹{currentMetrics.expenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Flow:</span>
                      <span className={`font-semibold ${currentMetrics.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{currentMetrics.netFlow.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Savings Rate:</span>
                      <span className={`font-semibold ${currentMetrics.savingsRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currentMetrics.savingsRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-400" />
                    <span>Projected</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Income:</span>
                      <span className="text-green-400 font-semibold">₹{results.projected.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expenses:</span>
                      <span className="text-red-400 font-semibold">₹{results.projected.expenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Flow:</span>
                      <span className={`font-semibold ${results.projected.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{results.projected.netFlow.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Savings Rate:</span>
                      <span className={`font-semibold ${results.projected.savingsRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {results.projected.savingsRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span>Impact Summary</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Savings Impact</p>
                    <p className={`text-2xl font-bold ${results.impact.totalSavingsImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {results.impact.totalSavingsImpact >= 0 ? '+' : ''}₹{results.impact.totalSavingsImpact.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Final Balance After {simulation.duration} Months</p>
                    <p className="text-2xl font-bold text-white">
                      ₹{results.impact.finalBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scenario Summary */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  <span>Scenario: "{results.scenario}"</span>
                </h4>
                <p className="text-gray-300">
                  This simulation projects that by {simulation.changeType === 'reduction' ? 'reducing expenses' : 
                  simulation.changeType === 'increase' ? 'increasing income' : 
                  simulation.changeType === 'new-expense' ? 'adding a new expense' : 
                  'adding new income'} of ₹{simulation.amount} on a {simulation.frequency} basis for {simulation.duration} months, 
                  your financial position will change by ₹{results.impact.totalSavingsImpact.toLocaleString()} over the period.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WhatIfSimulator;