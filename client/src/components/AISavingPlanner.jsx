import React, { useState, useEffect } from 'react';
import { PiggyBank, Target, Calendar, TrendingUp, Clock, CheckCircle, Sparkles, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AISavingPlanner = ({ transactions = [] }) => {
  const [goals, setGoals] = useState([]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    priority: 'medium',
    category: 'savings',
    description: ''
  });

  // Calculate total income and expenses for AI recommendations
  const calculateFinancialStats = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
    const netBalance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, netBalance };
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthlySavings = (current, target, deadline) => {
    const monthsLeft = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
    );
    const amountNeeded = target - current;
    return monthsLeft > 0 ? Math.ceil(amountNeeded / monthsLeft) : 0;
  };

  // Calculate weekly savings suggestion
  const calculateWeeklySavings = (current, target, deadline) => {
    const weeksLeft = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 7)
    );
    const amountNeeded = target - current;
    return weeksLeft > 0 ? Math.ceil(amountNeeded / weeksLeft) : 0;
  };

  // AI-powered recommendation based on user's spending patterns
  const getAISuggestion = (targetAmount, deadline) => {
    const { totalIncome, totalExpenses, netBalance } = calculateFinancialStats();
    
    if (totalIncome === 0) {
      return {
        monthly: Math.ceil(targetAmount / 12),
        weekly: Math.ceil(targetAmount / 52),
        feasibility: "Unable to calculate without income data"
      };
    }

    const monthlySavings = calculateMonthlySavings(0, targetAmount, deadline);
    const weeklySavings = calculateWeeklySavings(0, targetAmount, deadline);
    
    // Calculate what percentage of income this represents
    const incomePercentage = (monthlySavings / totalIncome) * 100;
    
    let feasibility = "Feasible";
    if (incomePercentage > 30) {
      feasibility = "Challenging - consider extending deadline";
    } else if (incomePercentage > 20) {
      feasibility = "Moderate challenge";
    } else if (incomePercentage > 10) {
      feasibility = "Reasonable";
    } else {
      feasibility = "Easily achievable";
    }
    
    return {
      monthly: monthlySavings,
      weekly: weeklySavings,
      feasibility,
      incomePercentage: incomePercentage.toFixed(1)
    };
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    const aiSuggestions = getAISuggestion(parseFloat(newGoal.targetAmount), newGoal.deadline);
    
    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      suggestedMonthly: aiSuggestions.monthly,
      suggestedWeekly: aiSuggestions.weekly,
      aiFeasibility: aiSuggestions.feasibility,
      incomePercentage: aiSuggestions.incomePercentage
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: '',
      deadline: '',
      priority: 'medium',
      category: 'savings',
      description: ''
    });
    setShowAddGoal(false);
  };

  const updateGoalProgress = (goalId, amount) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
        const status = newAmount >= goal.targetAmount ? 'completed' : 'in-progress';
        const progress = calculateProgress(newAmount, goal.targetAmount);
        return { ...goal, currentAmount: newAmount, status, progress };
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const getClassyGradient = (priority) => {
    switch (priority) {
      case 'high':
        return 'from-red-500/20 to-pink-500/20';
      case 'medium':
        return 'from-blue-500/20 to-cyan-500/20';
      case 'low':
        return 'from-green-500/20 to-emerald-500/20';
      default:
        return 'from-purple-500/20 to-violet-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/30 text-red-300';
      case 'medium':
        return 'bg-blue-500/30 text-blue-300';
      case 'low':
        return 'bg-green-500/30 text-green-300';
      default:
        return 'bg-gray-500/30 text-gray-300';
    }
  };

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI-Powered Saving Goals</h2>
            <p className="text-gray-400 text-sm">Plan & track your financial goals with AI insights</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Add Goal</span>
        </motion.button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {goals.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Saving Goals Yet</h3>
              <p className="text-gray-400 mb-6">Create your first saving goal to start planning your financial future with AI-powered insights</p>
              <motion.button
                onClick={() => setShowAddGoal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center space-x-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                <span>Create Your First Goal</span>
              </motion.button>
            </motion.div>
          ) : (
            goals.map((goal) => {
              const aiSuggestions = getAISuggestion(goal.targetAmount, goal.deadline);
              const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysLeft < 0;
              
              return (
                <motion.div
                  key={goal.id}
                  className={`p-4 bg-gradient-to-r ${getClassyGradient(goal.priority)} rounded-xl border border-white/20 relative`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        goal.priority === 'high' ? 'bg-red-500/30' :
                        goal.priority === 'medium' ? 'bg-blue-500/30' :
                        'bg-green-500/30'
                      }`}>
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{goal.name}</h3>
                        <p className="text-sm text-gray-300 capitalize">{goal.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-300">
                        <DollarSign className="w-4 h-4" />
                        <span>₹{calculateMonthlySavings(goal.currentAmount, goal.targetAmount, goal.deadline).toLocaleString()}/mo</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      goal.status === 'completed' 
                        ? 'bg-green-500/30 text-green-300' 
                        : 'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                    </div>
                  </div>

                  {/* AI Suggestions Section */}
                  <div className="bg-black/20 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-medium text-blue-300">AI Recommendation</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-300">
                        <span className="text-gray-400">Monthly:</span> ₹{aiSuggestions.monthly.toLocaleString()}
                      </div>
                      <div className="text-gray-300">
                        <span className="text-gray-400">Weekly:</span> ₹{aiSuggestions.weekly.toLocaleString()}
                      </div>
                      <div className="text-gray-300 col-span-2">
                        <span className="text-gray-400">Feasibility:</span> {aiSuggestions.feasibility}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(goal.priority)}`}>
                        {goal.priority} priority
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-500/30 text-red-300">
                          {Math.abs(daysLeft)} days overdue
                        </span>
                      )}
                    </div>
                    
                    {goal.status !== 'completed' && (
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Add contribution"
                          className="w-24 px-2 py-1 text-xs bg-black/30 border border-white/20 rounded text-white placeholder-gray-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const amount = parseFloat(e.target.value);
                              if (amount && amount > 0) {
                                updateGoalProgress(goal.id, amount);
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = prompt('Enter contribution amount:');
                            if (input) {
                              const amount = parseFloat(input);
                              if (amount && amount > 0) {
                                updateGoalProgress(goal.id, amount);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded hover:from-green-500 hover:to-emerald-500 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddGoal && (
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
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span>Create New AI-Powered Goal</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Emergency Fund"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                    <option value="education">Education</option>
                    <option value="travel">Travel</option>
                    <option value="home">Home</option>
                    <option value="leisure">Leisure</option>
                    <option value="emergency">Emergency Fund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add details about your goal..."
                    rows="2"
                  />
                </div>

                {/* AI Preview Section */}
                {(newGoal.targetAmount && newGoal.deadline) && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">AI Preview</span>
                    </div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Monthly Savings Needed:</span>
                        <span className="text-white">₹{calculateMonthlySavings(0, parseFloat(newGoal.targetAmount), newGoal.deadline).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Savings Needed:</span>
                        <span className="text-white">₹{calculateWeeklySavings(0, parseFloat(newGoal.targetAmount), newGoal.deadline).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Feasibility:</span>
                        <span className="text-white">{getAISuggestion(parseFloat(newGoal.targetAmount), newGoal.deadline).feasibility}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all"
                >
                  Create Goal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AISavingPlanner;