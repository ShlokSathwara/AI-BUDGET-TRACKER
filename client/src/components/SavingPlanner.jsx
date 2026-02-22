import React, { useState, useEffect } from 'react';
import { PiggyBank, Target, Calendar, TrendingUp, Clock, CheckCircle, BarChart3, Sparkles, DollarSign, TrendingDown, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SavingPlanner = ({ transactions = [] }) => {
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

  // AI-powered insights based on transaction data
  const getAIInsights = () => {
    if (!transactions || transactions.length === 0) return null;
    
    // Calculate average monthly income and expenses
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date || tx.createdAt);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
    const monthlyExpenses = monthlyTransactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
    const monthlySavingsPotential = monthlyIncome - monthlyExpenses;
    
    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySavingsPotential,
      suggestedGoals: monthlySavingsPotential > 0 ? [
        { name: 'Emergency Fund', amount: monthlySavingsPotential * 3, period: '3 months' },
        { name: 'Vacation Fund', amount: monthlySavingsPotential * 6, period: '6 months' },
        { name: 'Big Purchase', amount: monthlySavingsPotential * 12, period: '1 year' }
      ] : []
    };
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
  
  // AI recommendation for optimal goal amount
  const getOptimalGoalAmount = (deadline) => {
    const insights = getAIInsights();
    if (!insights || insights.monthlySavingsPotential <= 0) return 0;
    
    const monthsLeft = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    // Recommend a realistic goal based on monthly savings potential
    return Math.min(insights.monthlySavingsPotential * monthsLeft, insights.monthlySavingsPotential * 24); // Max 2 years worth
  };
  
  // AI recommendation for deadline based on target amount
  const getOptimalDeadline = (targetAmount) => {
    const insights = getAIInsights();
    if (!insights || insights.monthlySavingsPotential <= 0) return '';
    
    const monthsNeeded = Math.ceil(targetAmount / insights.monthlySavingsPotential);
    const optimalDate = new Date();
    optimalDate.setMonth(optimalDate.getMonth() + monthsNeeded);
    return optimalDate.toISOString().split('T')[0];
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      aiRecommendation: getOptimalGoalAmount(newGoal.deadline) > 0
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
        return { ...goal, currentAmount: newAmount, status };
      }
      return goal;
    }));
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

  const aiInsights = getAIInsights();
  
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
      
      {/* AI Insights Section */}
      {aiInsights && (
        <motion.div 
          className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">AI Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <Wallet className="w-4 h-4 text-green-400" />
              <span>Monthly Income: ₹{aiInsights.monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span>Monthly Expenses: ₹{aiInsights.monthlyExpenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Potential Savings: ₹{aiInsights.monthlySavingsPotential.toLocaleString()}</span>
            </div>
          </div>
          
          {aiInsights.suggestedGoals.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Suggested Goals:</h4>
              <div className="flex flex-wrap gap-2">
                {aiInsights.suggestedGoals.map((suggestion, index) => (
                  <motion.span
                    key={index}
                    className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded-md text-xs cursor-pointer hover:bg-blue-500/40 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setNewGoal({
                        ...newGoal,
                        name: suggestion.name,
                        targetAmount: suggestion.amount.toString()
                      });
                    }}
                  >
                    {suggestion.name}: ₹{suggestion.amount.toLocaleString()} ({suggestion.period})
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {goals.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PiggyBank className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Saving Goals Yet</h3>
              <p className="text-gray-400 mb-6">Create your first saving goal to start planning your financial future</p>
              <motion.button
                onClick={() => setShowAddGoal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Goal
              </motion.button>
            </motion.div>
          ) : (
            goals.map((goal) => (
              <motion.div
                key={goal.id}
                className={`p-4 bg-gradient-to-r ${getClassyGradient(goal.priority)} rounded-xl border border-white/20 relative`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {/* AI Badge */}
                {goal.aiRecommendation && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI</span>
                  </div>
                )}
                
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
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <span className="capitalize">{goal.category}</span>
                        {goal.description && <span>•</span>}
                        {goal.description && <span className="truncate max-w-[100px]">{goal.description}</span>}
                      </div>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-300">
                        <TrendingUp className="w-4 h-4" />
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
                  
                  {/* AI Progress Insight */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>
                        Days left: {Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
                      </span>
                      <span>
                        Needed daily: ₹{Math.ceil(calculateMonthlySavings(goal.currentAmount, goal.targetAmount, goal.deadline) / 30).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
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
              <h3 className="text-xl font-bold text-white mb-4">Create New Goal</h3>
              
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
                    <option value="retirement">Retirement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Describe your goal..."
                    rows="2"
                  />
                </div>

                {/* AI Recommendations */}
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">AI Recommendation</span>
                  </div>
                  {newGoal.targetAmount && newGoal.deadline && (
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>Optimal monthly savings: ₹{calculateMonthlySavings(0, parseFloat(newGoal.targetAmount), newGoal.deadline).toLocaleString()}</div>
                      <div>Based on your current spending: ₹{(aiInsights?.monthlySavingsPotential || 0).toLocaleString()}/month</div>
                    </div>
                  )}
                </div>
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

export default SavingPlanner;