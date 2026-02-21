import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const WeeklyReportScheduler = ({ user, transactions = [], settings }) => {
  const { addNotification } = useNotifications();
  const { isDarkMode } = useTheme();
  const intervalRef = useRef(null);

  // Function to calculate weekly report data
  const calculateWeeklyReport = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        transactionCount: 0,
        weeklySummary: 'No transactions this week.'
      };
    }

    // Get transactions from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date || tx.createdAt || Date.now());
      return txDate >= oneWeekAgo;
    });

    const weeklyIncome = weeklyTransactions.filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const weeklyExpenses = weeklyTransactions.filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const weeklyNet = weeklyIncome - weeklyExpenses;

    const weeklySummary = `
      This week: ₹${weeklyIncome.toLocaleString()} income, 
      ₹${weeklyExpenses.toLocaleString()} expenses, 
      ₹${weeklyNet.toLocaleString()} net.
    `;

    return {
      totalIncome: weeklyIncome,
      totalExpenses: weeklyExpenses,
      netBalance: weeklyNet,
      transactionCount: weeklyTransactions.length,
      weeklySummary
    };
  };

  // Function to send weekly report notification
  const sendWeeklyReport = () => {
    if (!user || !settings || !settings.weeklyReports) {
      return; // Don't send if user hasn't enabled weekly reports
    }

    const reportData = calculateWeeklyReport();

    // Create notification for weekly report
    addNotification({
      type: 'report',
      title: 'Weekly Financial Report',
      message: `Your weekly summary: ${reportData.weeklySummary} Check your dashboard for details.`,
      timestamp: new Date()
    });

    // In a real app, here you would generate and email the full report
    console.log('Weekly report sent to:', user.email, reportData);
  };

  // Schedule weekly report notifications
  useEffect(() => {
    // Check if user has enabled weekly reports
    if (settings && settings.weeklyReports) {
      // Send report immediately when component mounts (for demo purposes)
      sendWeeklyReport();

      // Set up interval to send report every 7 days (for demo, using 5 minutes)
      // In production, you would use 7 days * 24 hours * 60 minutes * 60 seconds * 1000 ms
      // For demo purposes, using 5 minutes so we can see it work
      intervalRef.current = setInterval(() => {
        sendWeeklyReport();
      }, 5 * 60 * 1000); // 5 minutes for demo
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings, user, transactions]);

  // Also send report when transactions change (if weekly reports are enabled)
  useEffect(() => {
    if (settings && settings.weeklyReports && transactions.length > 0) {
      // Debounce to avoid spamming notifications when adding multiple transactions
      const timeoutId = setTimeout(() => {
        sendWeeklyReport();
      }, 10000); // Wait 10 seconds after last transaction before sending report

      return () => clearTimeout(timeoutId);
    }
  }, [transactions, settings, user]);

  return null; // This component doesn't render anything visible
};

export default WeeklyReportScheduler;