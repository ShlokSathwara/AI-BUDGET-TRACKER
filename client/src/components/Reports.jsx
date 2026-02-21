import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Download, Filter, FileText, BarChart3, CreditCard, PiggyBank } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const Reports = ({ transactions = [], accounts = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set();
    transactions.forEach(t => {
      if (t.date) {
        const date = new Date(t.date);
        years.add(date.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // Get available months for the selected year
  const availableMonths = useMemo(() => {
    const months = new Set();
    transactions.forEach(t => {
      if (t.date) {
        const date = new Date(t.date);
        if (date.getFullYear() === selectedYear) {
          months.add(date.getMonth());
        }
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [transactions, selectedYear]);

  // Process transactions by month
  const monthlyData = useMemo(() => {
    const monthly = {};
    
    transactions.forEach(t => {
      if (t.date) {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthly[monthKey]) {
          monthly[monthKey] = { income: 0, expenses: 0, savings: 0, transactions: [] };
        }
        
        if (t.type === 'credit') {
          monthly[monthKey].income += t.amount || 0;
        } else {
          monthly[monthKey].expenses += t.amount || 0;
        }
        monthly[monthKey].transactions.push(t);
      }
    });

    return Object.entries(monthly).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
      net: data.income - data.expenses,
      transactionCount: data.transactions.length
    })).sort((a, b) => new Date(b.month) - new Date(a.month));
  }, [transactions]);

  // Get data for selected month
  const selectedMonthData = useMemo(() => {
    const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    const monthData = monthlyData.find(m => m.month === monthKey) || { income: 0, expenses: 0, savings: 0, net: 0, transactionCount: 0 };
    
    // Calculate daily breakdown for the selected month
    const dailyData = {};
    transactions.forEach(t => {
      if (t.date) {
        const date = new Date(t.date);
        if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
          const dayKey = date.getDate();
          if (!dailyData[dayKey]) {
            dailyData[dayKey] = { income: 0, expenses: 0 };
          }
          if (t.type === 'credit') {
            dailyData[dayKey].income += t.amount || 0;
          } else {
            dailyData[dayKey].expenses += t.amount || 0;
          }
        }
      }
    });

    const dailyChartData = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      return {
        day,
        income: dailyData[day]?.income || 0,
        expenses: dailyData[day]?.expenses || 0,
        total: (dailyData[day]?.income || 0) + (dailyData[day]?.expenses || 0)
      };
    }).filter(d => d.income > 0 || d.expenses > 0);

    // Category breakdown for selected month
    const categoryData = {};
    transactions.forEach(t => {
      if (t.date) {
        const date = new Date(t.date);
        if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
          const category = t.category || 'Other';
          if (!categoryData[category]) {
            categoryData[category] = { amount: 0, count: 0 };
          }
          categoryData[category].amount += t.amount || 0;
          categoryData[category].count += 1;
        }
      }
    });

    const categoryChartData = Object.entries(categoryData).map(([name, data]) => ({
      name,
      amount: data.amount,
      count: data.count,
      percent: ((data.amount / monthData.expenses) * 100).toFixed(1)
    }));

    return {
      ...monthData,
      dailyData: dailyChartData,
      categoryData: categoryChartData
    };
  }, [transactions, selectedYear, selectedMonth, monthlyData]);

  // Prepare account-specific data
  const getAccountSpecificData = (accountId) => {
    const accountTransactions = transactions.filter(tx => tx.bankAccountId === accountId);
    const accountMonthTransactions = accountTransactions.filter(tx => {
      if (tx.date) {
        const date = new Date(tx.date);
        return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
      }
      return false;
    });
    
    const accountIncome = accountMonthTransactions.filter(tx => tx.type === 'credit');
    const accountExpenses = accountMonthTransactions.filter(tx => tx.type === 'debit');
    
    return {
      income: accountIncome.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      expenses: accountExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      net: accountIncome.reduce((sum, tx) => sum + (tx.amount || 0), 0) - 
           accountExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      transactions: accountMonthTransactions
    };
  };

  // Get data for each account for the selected month
  const accountData = accounts.map(account => ({
    ...account,
    ...getAccountSpecificData(account.id)
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 border border-white/10 rounded-lg p-3">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={`${entry.color === '#6366f1' ? 'text-blue-300' : entry.color === '#10b981' ? 'text-green-300' : 'text-red-300'}`}>
              {entry.dataKey}: ₹{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const downloadReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    alert('Report download functionality would be implemented in a production environment');
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {new Date(0, month).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-300 classy-button"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 shadow-xl classy-element"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">Income</p>
              <p className="text-white text-xl font-bold">₹{selectedMonthData.income.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-600/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-300" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-xl border border-red-500/20 rounded-xl p-4 shadow-xl classy-element"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm">Expenses</p>
              <p className="text-white text-xl font-bold">₹{selectedMonthData.expenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-600/30 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-300" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 shadow-xl classy-element"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Savings</p>
              <p className="text-white text-xl font-bold">₹{selectedMonthData.savings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-600/30 rounded-lg">
              <PiggyBank className="h-6 w-6 text-green-300" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 shadow-xl classy-element"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Net</p>
              <p className={`text-white text-xl font-bold ${selectedMonthData.net >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                ₹{selectedMonthData.net.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-600/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-300" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Breakdown */}
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span>Daily Breakdown</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedMonthData.dailyData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="#94a3b8" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#incomeGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#expensesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-400" />
            <span>Category Breakdown</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={selectedMonthData.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {selectedMonthData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Monthly Overview */}
      <motion.div
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          <span>Monthly Overview</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" fill="#8b5cf6" name="Savings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Individual Account Reports */}
      {accountData.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            <span>Individual Account Reports</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accountData.map((account, index) => {
              const hasAccountData = account.income > 0 || account.expenses > 0;
              
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
                      <p className="text-sm font-bold text-green-400">₹{account.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-red-400">Expenses</p>
                      <p className="text-sm font-bold text-red-400">₹{account.expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${account.net >= 0 ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
                      <p className="text-xs text-gray-400">Net</p>
                      <p className={`text-sm font-bold ${account.net >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                        ₹{account.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                  
                  {hasAccountData && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { 
                            name: 'Income', 
                            amount: account.income,
                            fill: '#10b981' 
                          }, 
                          { 
                            name: 'Expenses', 
                            amount: account.expenses,
                            fill: '#ef4444' 
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.6)" />
                          <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                          <Tooltip 
                            content={<CustomTooltip />}
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
        </motion.div>
      )}
    </div>
  );
};

export default Reports;