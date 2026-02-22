import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, Upload, CheckCircle, XCircle, AlertTriangle, Wallet, FileText, FileInput } from 'lucide-react';
import { parseSpecificBankSMS, parseEmailReceipt } from '../utils/smsParser';

const SMSExpenseExtractor = ({ bankAccounts = [], onAddTransaction }) => {
  const [smsInput, setSmsInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [extractedTransactions, setExtractedTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('sms'); // 'sms' or 'email'

  // Function to find matching bank account by last 4 digits
  const findMatchingAccount = (lastFourDigits) => {
    if (!lastFourDigits) return null;
    
    return bankAccounts.find(account => {
      const accountLastFour = account.lastFourDigits || 
                             (account.accountNumber && account.accountNumber.slice(-4));
      return accountLastFour === lastFourDigits;
    });
  };

  // Parse SMS when user submits
  const handleParseSMS = () => {
    if (!smsInput.trim()) {
      setErrorMessage('Please enter an SMS message');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const parsedData = parseSpecificBankSMS(smsInput);
        
        if (parsedData) {
          // Find matching account
          const matchingAccount = findMatchingAccount(parsedData.lastFourDigits);
          
          if (matchingAccount) {
            const transaction = {
              ...parsedData,
              bankAccountId: matchingAccount.id,
              paymentMethod: 'bank_transfer',
              _id: Date.now().toString() + '_sms',
              user: matchingAccount.userId || 'unknown',
              source: 'sms'
            };
            
            setParsedTransactions(prev => [...prev, transaction]);
            setSmsInput('');
            setErrorMessage('');
          } else {
            setErrorMessage(`No matching account found for last 4 digits: ${parsedData.lastFourDigits}`);
          }
        } else {
          setErrorMessage('Could not parse transaction details from the SMS');
        }
      } catch (error) {
        console.error('Error parsing SMS:', error);
        setErrorMessage('Error parsing SMS. Please check the format.');
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  };

  // Parse Email Receipt
  const handleParseEmail = () => {
    if (!emailSubject.trim() && !emailBody.trim()) {
      setErrorMessage('Please enter either email subject or email body');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const parsedData = parseEmailReceipt(emailSubject, emailBody);
        
        if (parsedData) {
          const transaction = {
            ...parsedData,
            bankAccountId: null, // Email receipts don't have account info
            paymentMethod: 'email_receipt',
            _id: Date.now().toString() + '_email',
            user: 'unknown',
            source: 'email'
          };
          
          setParsedTransactions(prev => [...prev, transaction]);
          setEmailSubject('');
          setEmailBody('');
          setErrorMessage('');
        } else {
          setErrorMessage('Could not parse transaction details from the email');
        }
      } catch (error) {
        console.error('Error parsing email:', error);
        setErrorMessage('Error parsing email. Please check the format.');
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  };

// Add notification function
  const showTransactionNotification = (transaction) => {
    const source = transaction.source || 'SMS';
    const notificationTitle = `New ${transaction.type === 'credit' ? 'Credit' : 'Debit'} Entry (${source.toUpperCase()})`;
    const accountInfo = transaction.lastFourDigits 
      ? (findMatchingAccount(transaction.lastFourDigits)?.name || `XXXX-${transaction.lastFourDigits}`)
      : 'Email Receipt';
    
    const notificationMessage = `Transaction: ${transaction.merchant || 'Bank Transaction'}\nAmount: ₹${transaction.amount?.toLocaleString() || '0'}\nCategory: ${transaction.category || 'Uncategorized'}\nSource: ${accountInfo}`;
    
    // Create notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationTitle, {
        body: notificationMessage,
        icon: '/favicon.ico',
        tag: transaction._id
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notificationTitle, {
            body: notificationMessage,
            icon: '/favicon.ico',
            tag: transaction._id
          });
        }
      });
    }
    
    // Show in-app notification as well
    alert(`✅ ${source.toUpperCase()} Transaction added successfully!\n\n${notificationTitle}\n${notificationMessage}`);
  };

  // Add parsed transaction to the main transaction list
  const handleAddTransaction = (transaction) => {
    if (onAddTransaction && typeof onAddTransaction === 'function') {
      onAddTransaction(transaction);
      setExtractedTransactions(prev => [...prev, transaction]);
      setParsedTransactions(prev => prev.filter(t => t._id !== transaction._id));
      setSuccessMessage('Transaction added successfully!');
      
      // Show notification for the added transaction
      showTransactionNotification(transaction);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Remove a parsed transaction
  const removeParsedTransaction = (id) => {
    setParsedTransactions(prev => prev.filter(t => t._id !== id));
  };

  // Handle SMS parsing from a list of SMS messages
  const handleBulkParse = (smsList) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const newTransactions = [];
        
        smsList.forEach(sms => {
          const parsedData = parseSpecificBankSMS(sms);
          if (parsedData) {
            const matchingAccount = findMatchingAccount(parsedData.lastFourDigits);
            if (matchingAccount) {
              newTransactions.push({
                ...parsedData,
                bankAccountId: matchingAccount.id,
                paymentMethod: 'bank_transfer',
                _id: Date.now().toString() + Math.random(),
                user: matchingAccount.userId || 'unknown'
              });
            }
          }
        });
        
        if (newTransactions.length > 0) {
          setParsedTransactions(prev => [...prev, ...newTransactions]);
          setSuccessMessage(`${newTransactions.length} transactions parsed successfully!`);
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setErrorMessage('No valid transactions found in the SMS messages');
        }
      } catch (error) {
        console.error('Error parsing bulk SMS:', error);
        setErrorMessage('Error parsing SMS messages');
      } finally {
        setIsProcessing(false);
      }
    }, 1000);
  };

  // Demo function to show how the feature works
  const loadDemoSMS = () => {
    const demoSMS = "INR 1,234.56 debited from A/C XXXX1234 on 15/02/2024 at AMAZON.IN for online shopping. Available bal: INR 45,678.90";
    setSmsInput(demoSMS);
  };

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
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Auto Expense Extraction</h2>
            <p className="text-sm text-gray-400">Extract transactions from SMS or email receipts</p>
          </div>
        </div>
        
        {/* Tab Selector */}
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sms' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            SMS
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'email' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Email
          </button>
        </div>
      </div>

      {/* Input Section - Conditional based on active tab */}
      <div className="mb-6">
        {activeTab === 'sms' ? (
          <>
            <div className="flex items-center space-x-2 mb-3">
              <label className="text-sm font-medium text-gray-300">Bank SMS Message</label>
              <button
                type="button"
                onClick={loadDemoSMS}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Load Demo
              </button>
            </div>
            
            <div className="flex space-x-2">
              <textarea
                value={smsInput}
                onChange={(e) => setSmsInput(e.target.value)}
                placeholder="Paste your bank SMS here (e.g., 'INR 1,234.56 debited from A/C XXXX1234 on 15/02/2024 at AMAZON.IN...')"
                rows="3"
                className="flex-1 px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <motion.button
                onClick={handleParseSMS}
                disabled={isProcessing || !smsInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Parse SMS</span>
                  </>
                )}
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Email Receipt</label>
            
            <div className="space-y-3">
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email Subject (optional)"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Paste email body content here..."
                rows="4"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <motion.button
                onClick={handleParseEmail}
                disabled={isProcessing || (!emailSubject.trim() && !emailBody.trim())}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Parse Email</span>
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2 text-green-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div
            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <XCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed Transactions */}
      {parsedTransactions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <span>Parsed Transactions ({parsedTransactions.length})</span>
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence>
              {parsedTransactions.map((transaction, index) => {
                const matchingAccount = findMatchingAccount(transaction.lastFourDigits);
                                  
                return (
                  <motion.div
                    key={transaction._id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Wallet className="h-4 w-4 text-blue-400" />
                          <h4 className="font-semibold text-white">{transaction.merchant}</h4>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            {transaction.type.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {transaction.source?.toUpperCase() || 'SMS'}
                          </span>
                        </div>
                                          
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-white font-semibold ml-1">₹{transaction.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Category:</span>
                            <span className="text-white ml-1">{transaction.category}</span>
                          </div>
                          {transaction.lastFourDigits && (
                            <div>
                              <span className="text-gray-400">Account:</span>
                              <span className="text-white ml-1">
                                {matchingAccount ? matchingAccount.name : `XXXX-${transaction.lastFourDigits}`}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">Date:</span>
                            <span className="text-white ml-1">{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                                          
                        <div className="mt-2">
                          <span className="text-gray-400 text-xs">{transaction.source?.toUpperCase() || 'SMS'}:</span>
                          <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                            {transaction.source === 'email' 
                              ? transaction.originalEmail?.substring(0, 100) + '...'
                              : transaction.originalSMS?.substring(0, 100) + '...'}
                          </p>
                        </div>
                      </div>
                                        
                      <div className="flex space-x-2 ml-4">
                        <motion.button
                          onClick={() => handleAddTransaction(transaction)}
                          className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Add to Transactions"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </motion.button>
                                          
                        <motion.button
                          onClick={() => removeParsedTransaction(transaction._id)}
                          className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Remove"
                        >
                          <XCircle className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h4 className="text-md font-semibold text-white mb-2 flex items-center space-x-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <span>How to Use</span>
        </h4>
        {activeTab === 'sms' ? (
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Copy and paste your bank SMS notification into the text box</li>
            <li>• The system will extract transaction details automatically</li>
            <li>• Matched with your bank account based on last 4 digits</li>
            <li>• Review and confirm the extracted details before adding</li>
            <li>• Supports major Indian banks (SBI, HDFC, ICICI, etc.)</li>
          </ul>
        ) : (
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Paste email subject and/or body content from receipt emails</li>
            <li>• The system will extract transaction details automatically</li>
            <li>• Works with common e-commerce platforms (Amazon, Flipkart, etc.)</li>
            <li>• Review and confirm the extracted details before adding</li>
            <li>• Automatically categorizes expenses based on merchant</li>
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default SMSExpenseExtractor;