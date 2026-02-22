import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

const Analytics = ({ transactions = [], bankAccounts = [] }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('both'); // 'both', 'income', 'expenses'

  // Filter transactions by time range
  const filteredTransactions = transactions.filter(tx => {
    if (!tx.date) return false; // Skip transactions without dates
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) return false; // Skip invalid dates
    
    const now = new Date();
    const diffTime = Math.abs(now - txDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (timeRange) {
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case 'year':
        return diffDays <= 365;
      default:
        return true;
    }
  });

  // Separate income, expenses, and cash transactions
  const incomeTransactions = filteredTransactions.filter(tx => tx.type === 'credit');
  const expenseTransactions = filteredTransactions.filter(tx => tx.type === 'debit');
  const cashTransactions = filteredTransactions.filter(tx => tx.paymentMethod === 'cash');

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

  // Prepare account-specific data
  const getAccountSpecificData = (accountId) => {
    const accountIncome = incomeTransactions.filter(tx => tx.bankAccountId === accountId);
    const accountExpenses = expenseTransactions.filter(tx => tx.bankAccountId === accountId);
    
    return {
      income: accountIncome,
      expenses: accountExpenses,
      totalIncome: accountIncome.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      totalExpenses: accountExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      netFlow: accountIncome.reduce((sum, tx) => sum + (tx.amount || 0), 0) - 
               accountExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0)
    };
  };

  // Get data for each account
  const accountData = bankAccounts.map(account => ({
    ...account,
    ...getAccountSpecificData(account.id)
  }));

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
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Financial Analytics</h2>
            <p className="text-sm text-gray-400">Track your spending and earning patterns</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
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
            <p className="text-gray-400">No income data available</p>
          </div>
        )}
        {chartType === 'expenses' && expensesByCategory.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-center">
            <p className="text-gray-400">No expense data available</p>
          </div>
        )}
        {chartType === 'both' && incomeByCategory.length === 0 && expensesByCategory.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-center col-span-2">
            <p className="text-gray-400">No data available for charts</p>
          </div>
        )}
      </div>

      {/* Cash Transactions Section */}
      {cashTransactions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-6">Cash Transaction Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Income by Category */}
            {getCategoryData(cashTransactions.filter(tx => tx.type === 'credit')).length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Cash Income by Category</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryData(cashTransactions.filter(tx => tx.type === 'credit'))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCategoryData(cashTransactions.filter(tx => tx.type === 'credit')).map((entry, index) => (
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

            {/* Cash Expenses by Category */}
            {getCategoryData(cashTransactions.filter(tx => tx.type === 'debit')).length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Cash Expenses by Category</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryData(cashTransactions.filter(tx => tx.type === 'debit'))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCategoryData(cashTransactions.filter(tx => tx.type === 'debit')).map((entry, index) => (
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
          </div>
        </div>
      )}

      {/* Combined Expense vs Income Chart */}
      {(incomeTransactions.length > 0 || expenseTransactions.length > 0) && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-6">All Accounts: Income vs Expenses Overview</h3>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Combined Income vs Expenses Over Time</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.6)" />
                <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }} 
                />
                <Legend />
                {chartType !== 'expenses' && <Bar dataKey="income" name="Income" fill="#10b981" />}
                {chartType !== 'income' && <Bar dataKey="expense" name="Expenses" fill="#ef4444" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Individual Account Analysis */}
      {accountData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-6">Individual Account Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accountData.map((account, index) => {
              const hasAccountData = account.totalIncome > 0 || account.totalExpenses > 0;
              
              return (
                <div 
                  key={account.id} 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{account.name}</h4>
                      <p className="text-sm text-gray-400">{account.accountNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Balance</p>
                      <p className="text-lg font-bold text-white">₹{account.balance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-green-500/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-green-400">Income</p>
                      <p className="text-sm font-bold text-green-400">₹{account.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-red-400">Expenses</p>
                      <p className="text-sm font-bold text-red-400">₹{account.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${account.netFlow >= 0 ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
                      <p className="text-xs text-gray-400">Net</p>
                      <p className={`text-sm font-bold ${account.netFlow >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                        ₹{account.netFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                  
                  {hasAccountData && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { 
                            name: 'Income', 
                            amount: account.totalIncome,
                            fill: '#10b981' 
                          }, 
                          { 
                            name: 'Expenses', 
                            amount: account.totalExpenses,
                            fill: '#ef4444' 
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.6)" />
                          <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                          <Tooltip 
                            formatter={(value) => [`₹${value}`, 'Amount']}
                            contentStyle={{ 
                              backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              color: 'white'
                            }} 
                          />
                          <Bar dataKey="amount" name="Amount" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bank Account Balances Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Bank Account Balances</h3>
              <p className="text-sm text-gray-400">Track balances across all accounts</p>
            </div>
          </div>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Bank Accounts</h3>
            <p className="text-gray-400">Add bank accounts to see balance graphs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account, index) => {
              // Calculate account metrics
              const accountTransactions = transactions.filter(tx => 
                tx && tx.bankAccountId === account.id
              );
              
              const income = accountTransactions
                .filter(tx => tx.type === 'credit')
                .reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : 0), 0);
              
              const expenses = accountTransactions
                .filter(tx => tx.type === 'debit')
                .reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : 0), 0);
              
              const balance = income - expenses;
              
              return (
                <motion.div
                  key={account.id}
                  className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{account.name}</h3>
                      <p className="text-sm text-gray-400">**** **** **** {account.lastFourDigits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">₹{balance?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-400">Current Balance</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-300">Income</span>
                      </div>
                      <p className="text-green-400 font-semibold">₹{income?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-gray-300">Expenses</span>
                      </div>
                      <p className="text-red-400 font-semibold">₹{expenses?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(Math.abs(balance) / Math.max(income + expenses, 1) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Analytics;