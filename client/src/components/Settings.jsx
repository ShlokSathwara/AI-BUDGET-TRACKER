import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Globe, Moon, Sun, CreditCard, Download, Upload, Trash2, Save, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    transactionAlerts: true,
    budgetReminders: true,
    weeklyReports: false,
    securityAlerts: true
  });
  const [privacy, setPrivacy] = useState({
    shareData: false,
    locationTracking: false,
    marketingEmails: true
  });

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

  const handleSaveSettings = () => {
    // In a real app, this would save settings to localStorage or backend
    alert('Settings saved successfully!');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all your data? This action cannot be undone.')) {
      // Reset all data in a real app
      alert('Data reset successfully!');
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
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-400" />
          <span>Profile Settings</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">U</span>
            </div>
            <div>
              <h4 className="text-white font-medium">Demo User</h4>
              <p className="text-gray-400 text-sm">demo@example.com</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Demo User"
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue="demo@example.com"
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-300 classy-button">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg transition-all duration-300 classy-button">
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
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
            <h4 className="text-white font-medium">Dark Mode</h4>
            <p className="text-gray-400 text-sm">Switch between light and dark themes</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

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
          <span>Save Settings</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;