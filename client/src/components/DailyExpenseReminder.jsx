import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const DailyExpenseReminder = ({ user, transactions = [], settings }) => {
  const { addNotification } = useNotifications();
  const { isDarkMode } = useTheme();
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Function to calculate today's expenses
  const calculateDailyExpenses = () => {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return {
        totalExpenses: 0,
        totalIncome: 0,
        netBalance: 0,
        transactionCount: 0,
        categories: {},
        hasTransactions: false
      };
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter transactions for today
    const todaysTransactions = transactions.filter(tx => {
      if (!tx) return false;
      const txDate = new Date(tx.date || tx.createdAt || Date.now());
      return txDate >= today && txDate < tomorrow && !isNaN(txDate.getTime());
    });

    const dailyIncome = todaysTransactions
      .filter(t => t && t.type === 'credit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
    const dailyExpenses = todaysTransactions
      .filter(t => t && t.type === 'debit')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
    const dailyNet = dailyIncome - dailyExpenses;

    // Group expenses by category
    const categoryExpenses = {};
    todaysTransactions
      .filter(t => t && t.type === 'debit')
      .forEach(t => {
        const category = t.category || 'Uncategorized';
        if (!categoryExpenses[category]) {
          categoryExpenses[category] = 0;
        }
        categoryExpenses[category] += parseFloat(t.amount) || 0;
      });

    return {
      totalExpenses: dailyExpenses,
      totalIncome: dailyIncome,
      netBalance: dailyNet,
      transactionCount: todaysTransactions.length,
      categories: categoryExpenses,
      hasTransactions: todaysTransactions.length > 0
    };
  };

  // Function to send daily reminder notification
  const sendDailyReminder = () => {
    try {
      if (!user || !settings || !settings.dailyExpenseReminder) {
        return; // Don't send if user hasn't enabled daily reminders
      }

      const dailyData = calculateDailyExpenses();
      
      let message;
      if (!dailyData.hasTransactions) {
        message = `You haven't added any expenses today. Don't forget to track your spending! 💰`;
      } else {
        const expenseSummary = dailyData.totalExpenses > 0 
          ? `₹${dailyData.totalExpenses.toLocaleString()} in expenses`
          : 'no expenses';
          
        const incomeSummary = dailyData.totalIncome > 0 
          ? `₹${dailyData.totalIncome.toLocaleString()} income`
          : 'no income';
          
        message = `Today's summary: ${expenseSummary}, ${incomeSummary}. Net: ₹${dailyData.netBalance.toLocaleString()}. Keep up the good work! 📊`;
      }

      // Create notification for daily reminder
      addNotification({
        type: 'reminder',
        title: 'Daily Expense Reminder',
        message: message,
        timestamp: new Date()
      });

      // Also try browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Daily Expense Reminder', {
          body: message,
          icon: '/favicon.ico',
          tag: 'daily-reminder'
        });
      }

      console.log('Daily reminder sent to:', user.email, dailyData);
    } catch (error) {
      console.error('Error sending daily reminder:', error);
    }
  };

  // Function to schedule next 9 PM reminder
  const scheduleNextReminder = () => {
    try {
      const now = new Date();
      const next9PM = new Date();
      next9PM.setHours(21, 0, 0, 0); // 9:00 PM today
      
      // If it's already past 9 PM today, schedule for tomorrow
      if (now > next9PM) {
        next9PM.setDate(next9PM.getDate() + 1);
      }
      
      const timeUntil9PM = next9PM.getTime() - now.getTime();
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set timeout for next 9 PM
      timeoutRef.current = setTimeout(() => {
        sendDailyReminder();
        // Schedule the next day's reminder
        scheduleNextReminder();
      }, timeUntil9PM);
      
      console.log(`Next daily reminder scheduled for: ${next9PM.toLocaleString()}`);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  };

  // Initialize daily reminder scheduling
  useEffect(() => {
    // Check if user has enabled daily expense reminders
    if (settings && settings.dailyExpenseReminder) {
      // Schedule the next reminder
      scheduleNextReminder();
      
      // For demo purposes, also send a reminder immediately when component mounts
      // Remove this in production
      setTimeout(() => {
        sendDailyReminder();
      }, 2000); // Wait 2 seconds after mount
    }

    return () => {
      // Cleanup timeouts on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [settings, user]);

  // Also send reminder when transactions change (if daily reminders are enabled)
  useEffect(() => {
    if (settings && settings.dailyExpenseReminder) {
      // Debounce to avoid spamming when adding multiple transactions
      const timeoutId = setTimeout(() => {
        // Update the reminder with latest transaction data
        // This will be shown when the 9 PM reminder fires
      }, 5000); // Wait 5 seconds after last transaction

      return () => clearTimeout(timeoutId);
    }
  }, [transactions, settings, user]);

  return null; // This component doesn't render anything visible
};

export default DailyExpenseReminder;