import React, { useState, useEffect } from 'react';
import { PiggyBank, Target, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SavingPlanner = ({ transactions = [] }) => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: 'Emergency Fund',
      targetAmount: 50000,
      currentAmount: 15000,
      deadline: '2024-12-31',
      priority: 'high',
      category: 'savings',
      status: 'in-progress'
    },
    {
      id: 2,
      name: 'Vacation Trip',
      targetAmount: 30000,
      currentAmount: 8000,
      deadline: '2024-08-15',
      priority: 'medium',
      category: 'leisure',
      status: 'in-progress'
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    priority: 'medium',
    category: 'savings'
  });

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

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      status: 'active'
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: '',
      deadline: '',
      priority: 'medium',
      category: 'savings'
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

  // Auto-update progress based on recent transactions
  useEffect(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'credit' && t.category === 'Income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    goals.forEach(goal => {
      if (goal.status !== 'completed') {
        const monthlySavings = calculateMonthlySavings(goal.currentAmount, goal.targetAmount, goal.deadline);
        if (totalIncome > 0 && monthlySavings > 0) {
          const progressAmount = Math.min(monthlySavings * 0.1, goal.targetAmount - goal.currentAmount); // 10% of monthly savings
          if (progressAmount > 0) {
            updateGoalProgress(goal.id, progressAmount);
          }
        }
      }
    });
  }, [transactions]);

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
            <PiggyBank className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Saving Goals</h2>
            <p className="text-gray-400 text-sm">Plan & track your financial goals</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Goal
        </motion.button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              className={`p-4 bg-gradient-to-r ${getClassyGradient(goal.priority)} rounded-xl border border-white/20`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
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
            </motion.div>
          ))}
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
                  </select>
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