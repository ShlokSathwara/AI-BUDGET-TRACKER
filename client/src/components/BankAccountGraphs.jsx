import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const BankAccountGraphs = ({ accounts = [], transactions = [] }) => {
  // Calculate account balances based on transactions
  const calculateAccountBalances = () => {
    if (!Array.isArray(accounts) || accounts.length === 0) return [];
    
    return accounts.map(account => {
      // Validate account structure before processing
      if (!account || !account.id) return account;
      
      // Find transactions associated with this account
      const accountTransactions = transactions.filter(tx => 
        tx && tx.bankAccountId === account.id
      );
      
      // Calculate balance for this account
      const income = accountTransactions
        .filter(tx => tx.type === 'credit')
        .reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : 0), 0);
      
      const expenses = accountTransactions
        .filter(tx => tx.type === 'debit')
        .reduce((sum, tx) => sum + (typeof tx.amount === 'number' ? tx.amount : 0), 0);
      
      const balance = income - expenses;
      
      return {
        ...account,
        income,
        expenses,
        balance,
        transactions: accountTransactions
      };
    });
  };

  const accountBalances = calculateAccountBalances();

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bank Account Balances</h2>
            <p className="text-sm text-gray-400">Track balances across all accounts</p>
          </div>
        </div>
      </div>

      {accountBalances.length === 0 ? (
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Bank Accounts</h3>
          <p className="text-gray-400">Add bank accounts to see balance graphs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accountBalances.map((account, index) => (
            <motion.div
              key={account.id}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
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
                  <p className="text-lg font-bold text-white">₹{account.balance?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-gray-400">Current Balance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Income</span>
                  </div>
                  <p className="text-green-400 font-semibold">₹{account.income?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">Expenses</span>
                  </div>
                  <p className="text-red-400 font-semibold">₹{account.expenses?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(Math.abs(account.balance) / Math.max(account.income + account.expenses, 1) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BankAccountGraphs;