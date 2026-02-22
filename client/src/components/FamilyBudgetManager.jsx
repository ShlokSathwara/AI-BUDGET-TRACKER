import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  UserPlus,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Filter
} from 'lucide-react';

const FamilyBudgetManager = ({ currentUser, transactions = [], bankAccounts = [], onFamilyDataUpdate }) => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showAmounts, setShowAmounts] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'member-<id>'
  const [dateFilter, setDateFilter] = useState('month');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [verificationStep, setVerificationStep] = useState('email'); // 'email', 'code', 'complete'
  const [sentCodeTo, setSentCodeTo] = useState('');
  const [errors, setErrors] = useState({});

  // Load family members from localStorage
  useEffect(() => {
    const savedFamily = localStorage.getItem(`family_members_${currentUser?.id}`);
    if (savedFamily) {
      setFamilyMembers(JSON.parse(savedFamily));
    }
  }, [currentUser?.id]);

  // Save family members to localStorage
  const saveFamilyMembers = (members) => {
    setFamilyMembers(members);
    localStorage.setItem(`family_members_${currentUser?.id}`, JSON.stringify(members));
    if (onFamilyDataUpdate) {
      onFamilyDataUpdate(members);
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (!validateEmail(emailInput)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setErrors({});
    setVerificationStep('code');
    setSentCodeTo(emailInput);
    
    // Simulate sending verification code
    console.log(`Sending verification code to ${emailInput}`);
    // In a real app, this would call your backend API
  };

  // Verify code and add family member
  const verifyAndAddMember = async () => {
    if (!verificationCode.trim()) {
      setErrors({ code: 'Please enter the verification code' });
      return;
    }

    // In a real app, this would verify with backend
    if (verificationCode !== '123456') { // Demo code
      setErrors({ code: 'Invalid verification code' });
      return;
    }

    setErrors({});
    const newMember = {
      id: Date.now().toString(),
      email: sentCodeTo,
      name: sentCodeTo.split('@')[0],
      status: 'verified',
      joinedDate: new Date().toISOString(),
      sharedData: true
    };

    const updatedMembers = [...familyMembers, newMember];
    saveFamilyMembers(updatedMembers);
    setVerificationStep('complete');
    
    // Reset form
    setTimeout(() => {
      setIsAddingMember(false);
      setVerificationStep('email');
      setEmailInput('');
      setVerificationCode('');
      setSentCodeTo('');
    }, 2000);
  };

  // Remove family member
  const removeFamilyMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      const updatedMembers = familyMembers.filter(member => member.id !== memberId);
      saveFamilyMembers(updatedMembers);
    }
  };

  // Toggle data sharing for a member
  const toggleDataSharing = (memberId) => {
    const updatedMembers = familyMembers.map(member => 
      member.id === memberId 
        ? { ...member, sharedData: !member.sharedData }
        : member
    );
    saveFamilyMembers(updatedMembers);
  };

  // Get combined family data
  const getFamilyData = () => {
    // This would fetch data from other family members in a real implementation
    // For demo, we'll just show current user's data
    const familyTransactions = [...transactions];
    const familyAccounts = [...bankAccounts];
    
    // Calculate family totals
    const totalIncome = familyTransactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const totalExpenses = familyTransactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const netFlow = totalIncome - totalExpenses;
    
    return {
      transactions: familyTransactions,
      accounts: familyAccounts,
      totalIncome,
      totalExpenses,
      netFlow,
      memberCount: familyMembers.length + 1 // +1 for current user
    };
  };

  const familyData = getFamilyData();

  // Filter transactions by date
  const filterTransactions = (transactionsToFilter) => {
    if (dateFilter === 'all') return transactionsToFilter;
    
    const now = new Date();
    let filterDate;
    
    switch (dateFilter) {
      case 'week':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        filterDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        filterDate = new Date(0);
    }
    
    return transactionsToFilter.filter(tx => new Date(tx.date) >= filterDate);
  };

  const formatAmount = (amount) => {
    if (!showAmounts) return '••••';
    return `₹${amount?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}`;
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl classy-element"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Family Budget</h2>
            <p className="text-sm text-gray-400">Manage and share budget with family members</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title={showAmounts ? "Hide amounts" : "Show amounts"}
          >
            {showAmounts ? <Eye className="h-4 w-4 text-white" /> : <EyeOff className="h-4 w-4 text-white" />}
          </button>
          
          <button
            onClick={() => setIsAddingMember(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Family Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Family Members</p>
              <p className="text-xl font-bold text-white">{familyData.memberCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Income</p>
              <p className="text-xl font-bold text-green-400">{formatAmount(familyData.totalIncome)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-xl font-bold text-red-400">{formatAmount(familyData.totalExpenses)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${familyData.netFlow >= 0 ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Net Flow</p>
              <p className={`text-xl font-bold ${familyData.netFlow >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                {formatAmount(familyData.netFlow)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === 'overview'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Family Overview
        </button>
        
        {familyMembers.map(member => (
          <button
            key={member.id}
            onClick={() => setActiveView(`member-${member.id}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeView === `member-${member.id}`
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <span>{member.name}</span>
            <span className="text-xs opacity-75">({member.email})</span>
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">Time Period:</span>
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="week" className="bg-gray-800">Last Week</option>
          <option value="month" className="bg-gray-800">Last Month</option>
          <option value="year" className="bg-gray-800">Last Year</option>
          <option value="all" className="bg-gray-800">All Time</option>
        </select>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeView === 'overview' ? (
          // Family Overview
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Family Members List */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span>Family Members</span>
              </h3>
              
              <div className="space-y-3">
                {/* Current User */}
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {currentUser?.name?.charAt(0) || 'Y'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{currentUser?.name || 'You'}</p>
                        <p className="text-sm text-gray-400">Family Admin</p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
                
                {/* Other Members */}
                {familyMembers.map(member => (
                  <div key={member.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleDataSharing(member.id)}
                          className={`p-1 rounded ${
                            member.sharedData 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                          title={member.sharedData ? "Data sharing enabled" : "Data sharing disabled"}
                        >
                          {member.sharedData ? 
                            <CheckCircle className="h-4 w-4" /> : 
                            <XCircle className="h-4 w-4" />
                          }
                        </button>
                        <button
                          onClick={() => removeFamilyMember(member.id)}
                          className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          title="Remove member"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {familyMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No family members added yet</p>
                    <p className="text-sm mt-1">Add members to start sharing budgets</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Family Transactions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-green-400" />
                <span>Recent Family Transactions</span>
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filterTransactions(familyData.transactions).slice(0, 10).map(transaction => (
                  <div key={transaction._id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-white">{transaction.merchant}</div>
                        <div className="text-sm text-gray-400">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filterTransactions(familyData.transactions).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No family transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Individual Member View
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">Member Data</h3>
            <p className="text-gray-400">
              Individual member data view would be implemented in a full backend version
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This demo shows the UI structure for family member data sharing
            </p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Family Member</h3>
              <button
                onClick={() => {
                  setIsAddingMember(false);
                  setVerificationStep('email');
                  setEmailInput('');
                  setVerificationCode('');
                  setErrors({});
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {verificationStep === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Family Member's Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <button
                  onClick={sendVerificationCode}
                  disabled={!emailInput.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Verification Code</span>
                </button>
              </div>
            )}

            {verificationStep === 'code' && (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white">Verification code sent to:</p>
                  <p className="text-purple-400 font-medium">{sentCodeTo}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter 6-digit Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  {errors.code && <p className="text-red-400 text-sm mt-1">{errors.code}</p>}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setVerificationStep('email')}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={verifyAndAddMember}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify & Add</span>
                  </button>
                </div>
              </div>
            )}

            {verificationStep === 'complete' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Member Added Successfully!</h4>
                <p className="text-gray-400">You can now share budget data with this family member.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default FamilyBudgetManager;