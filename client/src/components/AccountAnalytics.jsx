import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart as PieChartIcon } from 'lucide-react';

const AccountAnalytics = ({ accounts = [], transactions = [] }) => {
  const [selectedAccount, setSelectedAccount] = useState('all'); // 'all' for overall analytics
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('both'); // 'both', 'income', 'expenses'

  // Safely get valid accounts
  const getValidAccounts = () => {
    if (!Array.isArray(accounts)) return [];
    return accounts.filter(acc => acc && acc.id && acc.name && acc.lastFourDigits);
  };

  // Filter transactions by selected account and time range
  const filteredTransactions = transactions.filter(tx => {
    if (!tx.date) return false;
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) return false;
    
    // Filter by account if not 'all'
    const accountMatches = selectedAccount === 'all' || tx.bankAccountId === selectedAccount;
    
    // Filter by time range
    const now = new Date();
    const diffTime = Math.abs(now - txDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeMatches = true;
    switch (timeRange) {
      case 'week':
        timeMatches = diffDays <= 7;
        break;
      case 'month':
        timeMatches = diffDays <= 30;
        break;
      case 'year':
        timeMatches = diffDays <= 365;
        break;
      default:
        timeMatches = true;
    }

    return accountMatches && timeMatches;
  });

  // Separate income and expenses for the selected account/time range
  const incomeTransactions = filteredTransactions.filter(tx => tx.type === 'credit');
  const expenseTransactions = filteredTransactions.filter(tx => tx.type === 'debit');

  // Prepare data for charts
  const prepareChartData = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const chartDataMap = {};

    transactions.forEach(tx => {
      if (!tx.date) return;
      const date = new Date(tx.date);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${day}/${month}/${year}`;

      if (!chartDataMap[key]) {
        chartDataMap[key] = { date: key, amount: 0 };
      }
      chartDataMap[key].amount += tx.amount || 0;
    });

    return Object.values(chartDataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const incomeData = prepareChartData(incomeTransactions);
  const expenseData = prepareChartData(expenseTransactions);
  
  // Prepare combined data based on selected chart type
  let chartData = [];
  if (chartType === 'both' && incomeData.length > 0 && expenseData.length > 0) {
    // Combine both income and expenses
    const allDates = [...new Set([...incomeData.map(d => d.date), ...expenseData.map(d => d.date)])];
    chartData = allDates.map(date => {
      const income = incomeData.find(d => d.date === date)?.amount || 0;
      const expense = expenseData.find(d => d.date === date)?.amount || 0;
      return { date, income, expense };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (chartType === 'income') {
    chartData = incomeData;
  } else if (chartType === 'expenses') {
    chartData = expenseData;
  } else {
    // Default to showing both if one is empty
    const allDates = [...new Set([...incomeData.map(d => d.date), ...expenseData.map(d => d.date)])];
    chartData = allDates.map(date => {
      const income = incomeData.find(d => d.date === date)?.amount || 0;
      const expense = expenseData.find(d => d.date === date)?.amount || 0;
      return { date, income, expense };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Prepare category-wise data for pie charts
  const getCategoryData = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const categoryMap = {};
    
    transactions.forEach(tx => {
      if (!tx.amount) return; // Skip if no amount
      const category = tx.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += tx.amount || 0;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const incomeByCategory = getCategoryData(incomeTransactions);
  const expensesByCategory = getCategoryData(expenseTransactions);

  // Calculate totals
  const totalIncome = incomeTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const netFlow = totalIncome - totalExpenses;

  // Define colors for charts
  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Get account name for display
  const getAccountName = () => {
    if (selectedAccount === 'all') return 'All Accounts';
    const validAccounts = getValidAccounts();
    const account = validAccounts.find(acc => acc.id === selectedAccount);
    return account ? `${account.name} (****${account.lastFourDigits})` : 'Unknown Account';
  };

  const validAccounts = getValidAccounts();

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <PieChartIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Account Analytics</h2>
            <p className="text-sm text-gray-400">Detailed financial insights by account</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Accounts</option>
            {validAccounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} (****{account.lastFourDigits})
              </option>
            ))}
          </select>
          
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="both">Both</option>
            <option value="income">Income Only</option>
            <option value="expenses">Expenses Only</option>
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-sm text-gray-300">
          Showing analytics for: <span className="font-semibold text-white">{getAccountName()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Total Income</p>
              <p className="text-xl font-bold text-green-400">₹{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Total Expenses</p>
              <p className="text-xl font-bold text-red-400">₹{totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
        
        <div className={`bg-gradient-to-br ${netFlow >= 0 ? 'from-blue-500/10 to-indigo-600/10 border-blue-500/20' : 'from-amber-500/10 to-orange-600/10 border-amber-500/20'} border rounded-xl p-4`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-br ${netFlow >= 0 ? 'from-blue-500 to-indigo-600' : 'from-amber-500 to-orange-600'} rounded-lg`}>
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Net Flow</p>
              <p className={`text-xl font-bold ${netFlow >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                ₹{netFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            {chartType === 'income' ? 'Income Over Time' : 
             chartType === 'expenses' ? 'Expenses Over Time' : 'Income vs Expenses'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.length > 0 ? chartData : [{date: 'No Data', income: 0, expense: 0}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }} 
              />
              <Legend />
              {(chartType !== 'expenses' && incomeData.length > 0) && (
                <Bar dataKey={chartType === 'income' ? 'amount' : 'income'} name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              )}
              {(chartType !== 'income' && expenseData.length > 0) && (
                <Bar dataKey={chartType === 'expenses' ? 'amount' : 'expense'} name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income by Category Pie Chart */}
        {chartType !== 'expenses' && incomeByCategory.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Income by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expenses by Category Pie Chart */}
        {chartType !== 'income' && expensesByCategory.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Show "No Data" message when appropriate */}
        {chartType === 'income' && incomeByCategory.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-center">
            <p className="text-gray-400">No income data available for selected filters</p>
          </div>
        )}
        {chartType === 'expenses' && expensesByCategory.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-center">
            <p className="text-gray-400">No expense data available for selected filters</p>
          </div>
        )}
        {chartType === 'both' && incomeByCategory.length === 0 && expensesByCategory.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-center col-span-2">
            <p className="text-gray-400">No data available for selected filters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccountAnalytics;