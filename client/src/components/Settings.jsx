import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Globe, Moon, Sun, CreditCard, Download, Upload, Trash2, Save, Eye, EyeOff, Check } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const Settings = ({ currentUser, transactions = [], setTransactions, setGoals, setBankAccounts }) => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    transactionAlerts: true,
    budgetReminders: true,
    weeklyReports: false,
    dailyExpenseReminder: true, // Default to true for new feature
    securityAlerts: true
  });
  const [privacy, setPrivacy] = useState({
    shareData: false,
    locationTracking: false,
    marketingEmails: true
  });

  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const { isDarkMode } = useTheme();

  // Function to export data as PDF and send via email
  const handleExportData = async () => {
    try {
      // Get user data
      const userData = user;
      
      // Get user-specific transactions
      const userTransactionsKey = `transactions_${user.id}`;
      const transactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
      
      // Get user-specific settings
      const userSettingsKey = `settings_${user.id}`;
      const settings = JSON.parse(localStorage.getItem(userSettingsKey) || '{}');
      
      // Create a summary report
      const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0);
      const netBalance = totalIncome - totalExpenses;
      
      // Generate PDF content
      const { jsPDF } = window.jspdf || await import('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(22);
      doc.text('Smart Budget Tracker - Financial Report', 20, 20);
      
      // Add user info
      doc.setFontSize(16);
      doc.text('User Information', 20, 40);
      doc.setFontSize(12);
      doc.text(`Name: ${userData.name}`, 20, 50);
      doc.text(`Email: ${userData.email}`, 20, 60);
      doc.text(`Account Created: ${userData.createdAt || 'N/A'}`, 20, 70);
      doc.text(`Last Login: ${userData.lastLogin || 'N/A'}`, 20, 80);
      
      // Add financial summary
      doc.setFontSize(16);
      doc.text('Financial Summary', 20, 100);
      doc.setFontSize(12);
      doc.text(`Total Income: ₹${totalIncome.toLocaleString()}`, 20, 110);
      doc.text(`Total Expenses: ₹${totalExpenses.toLocaleString()}`, 20, 120);
      doc.text(`Net Balance: ₹${netBalance.toLocaleString()}`, 20, 130);
      
      // Add transaction count
      doc.text(`Total Transactions: ${transactions.length}`, 20, 140);
      
      // Add transactions (up to 20 to fit on page)
      if (transactions.length > 0) {
        doc.setFontSize(16);
        doc.text('Recent Transactions', 20, 160);
        doc.setFontSize(10);
        
        let yPos = 170;
        for (let i = 0; i < Math.min(transactions.length, 20); i++) {
          const tx = transactions[i];
          const typeColor = tx.type === 'credit' ? [0, 128, 0] : [255, 0, 0]; // Green for credit, red for debit
          
          doc.setTextColor(typeColor);
          doc.text(`${tx.merchant || tx.description || 'N/A'} - ₹${tx.amount?.toLocaleString() || '0'} (${tx.type})`, 20, yPos);
          
          yPos += 10;
          if (yPos > 270) { // Near bottom of page, add new page
            doc.addPage();
            yPos = 20;
          }
        }
        doc.setTextColor(0, 0, 0); // Reset to black
      }
      
      // Save the PDF
      const fileName = `Smart_Budget_Tracker_Data_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      // Show success message
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 3000);
      
      // In a real app, here you would send the PDF via email
      // For now, just show a message about email functionality
      alert(`PDF exported successfully! In a real application, this would be emailed to ${user.email}`);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Load user data on component mount
  useEffect(() => {
    // Use the passed currentUser prop or fallback to localStorage
    const activeUser = currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (activeUser && activeUser.email) {
      setUser(activeUser);
      setEditedName(activeUser.name || '');
      setEditedEmail(activeUser.email || '');
      
      // Load user-specific settings
      const userSettingsKey = `settings_${activeUser.id}`;
      const savedSettings = localStorage.getItem(userSettingsKey);
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications || notifications);
        setPrivacy(settings.privacy || privacy);
        // Dark mode is now handled by theme context
      }
    }
  }, [currentUser]);

  const handleNotificationChange = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting) => {
    setPrivacy(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleSaveProfile = () => {
    // Basic validation
    if (!editedName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editedEmail.trim() || !emailRegex.test(editedEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // Update user data
    const updatedUser = {
      ...user,
      name: editedName.trim(),
      email: editedEmail.trim()
    };

    // Save to user-specific storage
    if (user && user.id) {
      // Update in the main users array
      const existingUsers = JSON.parse(localStorage.getItem('budgetUsers') || '[]');
      const updatedUsers = existingUsers.map(u => 
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem('budgetUsers', JSON.stringify(updatedUsers));
      
      // Update current user session
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user.name || '');
    setEditedEmail(user.email || '');
    setIsEditing(false);
    setSaveSuccess(false);
  };

  const handleSaveSettings = () => {
    // Save user-specific settings (excluding theme which is handled globally)
    if (user && user.id) {
      const userSettingsKey = `settings_${user.id}`;
      const settingsToSave = {
        notifications,
        privacy
        // Dark mode is handled by theme context and saved globally
      };
      
      localStorage.setItem(userSettingsKey, JSON.stringify(settingsToSave));
      
      // Show success message
      setSaveSettingsSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSettingsSuccess(false), 3000);
      
      console.log(`Settings saved for user ${user.email}:`, settingsToSave);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all your data? This action cannot be undone and will erase all transactions, settings, and bank accounts to zero.')) {
      // Reset all user data
      if (user && user.id) {
        // Clear transactions
        const userTransactionsKey = `transactions_${user.id}`;
        localStorage.setItem(userTransactionsKey, JSON.stringify([]));
        
        // Clear settings
        const userSettingsKey = `settings_${user.id}`;
        localStorage.setItem(userSettingsKey, JSON.stringify({}));
        
        // Clear bank accounts
        const userAccountsKey = `bank_accounts_${user.id}`;
        localStorage.setItem(userAccountsKey, JSON.stringify([]));
        
        // Update state to reflect cleared data
        setTransactions([]);
        setGoals([]);
        setBankAccounts([]);
        
        alert('All your data has been reset successfully!');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
              {user.email && (
                <p className="text-sm text-gray-400">Signed in as: {user.email}</p>
              )}
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all duration-300 classy-button"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all duration-300 classy-button flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 classy-button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-center">
            <Check className="w-4 h-4 mr-2" />
            Profile updated successfully!
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <h4 className="text-white font-medium">{user.name || 'User'}</h4>
              <p className="text-gray-400 text-sm">{user.email || 'No email'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white">
                  {user.name || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white">
                  {user.email || 'Not set'}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Bell className="h-5 w-5 text-yellow-400" />
          <span>Notification Settings</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Transaction Alerts</h4>
              <p className="text-gray-400 text-sm">Get notified when a transaction is added</p>
            </div>
            <button
              onClick={() => handleNotificationChange('transactionAlerts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.transactionAlerts ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.transactionAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Budget Reminders</h4>
              <p className="text-gray-400 text-sm">Get reminders when approaching budget limits</p>
            </div>
            <button
              onClick={() => handleNotificationChange('budgetReminders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.budgetReminders ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.budgetReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Weekly Reports</h4>
              <p className="text-gray-400 text-sm">Receive weekly spending summary</p>
            </div>
            <button
              onClick={() => handleNotificationChange('weeklyReports')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Daily Expense Reminder</h4>
              <p className="text-gray-400 text-sm">Get reminded at 9 PM to track daily expenses</p>
            </div>
            <button
              onClick={() => handleNotificationChange('dailyExpenseReminder')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.dailyExpenseReminder ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.dailyExpenseReminder ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Security Alerts</h4>
              <p className="text-gray-400 text-sm">Get alerts for suspicious activity</p>
            </div>
            <button
              onClick={() => handleNotificationChange('securityAlerts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.securityAlerts ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-red-400" />
          <span>Privacy Settings</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Share Usage Data</h4>
              <p className="text-gray-400 text-sm">Help us improve by sharing anonymous usage data</p>
            </div>
            <button
              onClick={() => handlePrivacyChange('shareData')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.shareData ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.shareData ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Location Tracking</h4>
              <p className="text-gray-400 text-sm">Track location for merchant suggestions</p>
            </div>
            <button
              onClick={() => handlePrivacyChange('locationTracking')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.locationTracking ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.locationTracking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Marketing Emails</h4>
              <p className="text-gray-400 text-sm">Receive promotional emails and offers</p>
            </div>
            <button
              onClick={() => handlePrivacyChange('marketingEmails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.marketingEmails ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Globe className="h-5 w-5 text-green-400" />
          <span>Data Management</span>
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4"> {/* Changed to single column to remove import button */}
            <button 
              onClick={handleExportData}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-300 classy-button"
            >
              <Download className="h-4 w-4" />
              <span>Export Data as PDF</span>
            </button>
          </div>
          <div className="pt-4 border-t border-white/10">
            <button 
              onClick={handleResetData}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 classy-button"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset All Data</span>
            </button>
            <p className="text-gray-400 text-sm mt-2">This will permanently delete all your financial data</p>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div 
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Sun className="h-5 w-5 text-yellow-400" />
          <span>Appearance</span>
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Theme Mode</h4>
            <p className="text-gray-400 text-sm">Switch between light and dark themes</p>
          </div>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Save Settings Success Message */}
      <AnimatePresence>
        {saveSettingsSuccess && (
          <motion.div 
            className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <Check className="h-4 w-4" />
            <span>Settings saved for {user.name || 'your account'}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <button
          onClick={handleSaveSettings}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-lg transition-all duration-300 classy-button"
        >
          <Save className="h-4 w-4" />
          <span>Save My Settings</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;