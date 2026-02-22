import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Sparkles, Volume2, Send, Wallet, CreditCard, Coins } from 'lucide-react';

const VoiceAssistant = ({ onTransactionDetected, isListening, setIsListening, bankAccounts = [], setActiveTab }) => {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const recognitionRef = useRef(null);

  // Enhanced Indian Rupee categories and merchants with more comprehensive lists
  const indianCategories = {
    food: ['food', 'lunch', 'dinner', 'breakfast', 'snacks', 'restaurant', 'cafe', 'swiggy', 'zomato', 'dominos', 'mcdonalds', 'starbucks', 'pizza', 'burger', 'chinese', 'indian', 'biryani', 'sweets', 'ice cream', 'tea', 'coffee', 'junk food'],
    transport: ['ola', 'uber', 'auto', 'taxi', 'bus', 'train', 'metro', 'petrol', 'diesel', 'fuel', 'gas', 'cab', 'rickshaw', 'flight', 'ticket', 'travel', 'commute'],
    shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'big bazaar', 'd mart', 'reliance', 'clothes', 'shopping', 'clothing', 'fashion', 'retail', 'store', 'market', 'grocery', 'department', 'electronics', 'mobile', 'laptop', 'furniture'],
    entertainment: ['movie', 'netflix', 'hotstar', 'disney', 'spotify', 'concert', 'theatre', 'games', 'gaming', 'music', 'bookmyshow', 'cinema', 'streaming', 'subscription', 'party', 'event', 'drama'],
    utilities: ['electricity', 'water', 'internet', 'phone', 'jio', 'airtel', 'vodafone', 'bill', 'recharge', 'subscription', 'rent', 'emi', 'loan', 'insurance', 'maintenance'],
    healthcare: ['doctor', 'medicine', 'hospital', 'pharmacy', 'apollo', 'fortis', 'clinic', 'consultation', 'medical', 'health', 'checkup', 'diagnostic', 'dental', 'eye care'],
    education: ['school', 'college', 'books', 'course', 'tuition', 'byju', 'unacademy', 'education', 'learning', 'training', 'certificate', 'exam', 'fees', 'stationery'],
    groceries: ['bigbasket', 'grofers', 'milk', 'vegetables', 'fruits', 'grocery', 'supermarket', 'local', 'produce', 'organic', 'vegetable', 'fruit', 'dairy'],
    investment: ['stocks', 'mutual fund', 'sip', 'mf', 'equity', 'gold', 'silver', 'crypto', 'bitcoin', 'investment', 'portfolio', 'trading', 'brokerage'],
    personal: ['salon', 'barber', 'spa', 'beauty', 'cosmetics', 'perfume', 'gift', 'flowers', 'personal', 'care', 'hygiene']
  };

  const indianMerchants = [
    'Swiggy', 'Zomato', 'Ola', 'Uber', 'Amazon India', 'Flipkart', 'BigBasket',
    'DMart', 'Reliance Fresh', 'McDonalds India', 'Starbucks India', 'Dominos Pizza',
    'Airtel', 'Jio', 'Vodafone', 'Apollo Hospitals', 'Fortis Hospitals', 'BookMyShow',
    'Netflix India', 'Hotstar', 'Spotify India', 'Byju\'s', 'Unacademy', 'Myntra',
    'Ajio', 'Big Bazaar', 'Reliance Digital', 'Croma', 'Vijay Sales', 'Medlife',
    'Pharmeasy', '1mg', 'Nykaa', 'Lenskart', 'BlueStone', 'CaratLane'
  ];

  // Payment modes
  const paymentModes = {
    cash: ['cash', 'hand', 'pocket', 'physical', 'coins', 'notes', 'currency'],
    credit_card: ['credit', 'card', 'credit card', 'visa', 'mastercard', 'amex', 'plastic money'],
    debit_card: ['debit', 'debit card', 'debitcard', 'card'],
    digital: ['paytm', 'phonepe', 'google pay', 'gpay', 'upi', 'digital', 'online', 'transfer', 'net banking'],
    bank: ['bank', 'account', 'checking', 'savings', 'account transfer']
  };

  // Account types
  const accountTypes = {
    savings: ['savings', 'saving', 'sb'],
    current: ['current', 'business'],
    credit: ['credit', 'credit card'],
    debit: ['debit', 'debit card']
  };

  useEffect(() => {
    // Initialize speech recognition only once
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Indian English

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setTranscript(transcript);
        
        if (event.results[0].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Restart recognition if we're still supposed to be listening
        if (isListening && recognitionRef.current) {
          recognitionRef.current.start();
        }
      };
    } else if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
    }

    // Set up event listeners based on isListening state
    if (recognitionRef.current) {
      if (isListening) {
        // Make sure recognition is running
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore error if already started
        }
      } else {
        // Stop recognition when not listening
        recognitionRef.current.stop();
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]); // Only listen to isListening changes

  // Update recognition when bankAccounts change (needed for account extraction)
  useEffect(() => {
    // This effect runs when bankAccounts change to update the reference
    // No need for additional logic here since bankAccounts is passed to extraction functions
  }, [bankAccounts]);

  const extractAmount = (text) => {
    // Look for various rupee amount patterns
    const patterns = [
      /(?:rs|rupees|₹)\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:rs|rupees|₹)/i,
      /paid\s+(\d+(?:\.\d+)?)/i,
      /spent\s+(\d+(?:\.\d+)?)/i,
      /cost\s+(\d+(?:\.\d+)?)/i,
      /buy\s+(?:for\s+)?(\d+(?:\.\d+)?)/i,
      /purchase\s+(?:for\s+)?(\d+(?:\.\d+)?)/i,
      /invest\s+(\d+(?:\.\d+)?)/i,
      /got\s+(\d+(?:\.\d+)?)/i,
      /received\s+(\d+(?:\.\d+)?)/i,
      /salary\s+(\d+(?:\.\d+)?)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    
    // Try to find standalone numbers that could be amounts
    const numbers = text.match(/\b\d{2,}\b/g);
    if (numbers) {
      for (const num of numbers) {
        const amount = parseFloat(num);
        if (amount >= 10 && amount <= 1000000) { // Reasonable expense/income range
          return amount;
        }
      }
    }
    
    return null;
  };

  const extractMerchant = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check for known Indian merchants
    for (const indianMerchant of indianMerchants) {
      if (lowerText.includes(indianMerchant.toLowerCase().split(' ')[0])) {
        return indianMerchant;
      }
    }
    
    // Extract potential merchant from context
    const merchantPatterns = [
      /(?:at|from)\s+([A-Za-z\s]+)/i,
      /paid\s+([A-Za-z\s]+)\s+for/i,
      /bought\s+.*\s+from\s+([A-Za-z\s]+)/i,
      /ordered\s+.*\s+from\s+([A-Za-z\s]+)/i,
      /purchased\s+from\s+([A-Za-z\s]+)/i
    ];
    
    for (const pattern of merchantPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        if (extracted.length >= 2 && extracted.length <= 30) {
          return extracted.charAt(0).toUpperCase() + extracted.slice(1).toLowerCase();
        }
      }
    }
    
    // Extract capitalized words that could be merchants
    const capitalizedWords = text.match(/[A-Z][a-z]{2,}/g);
    if (capitalizedWords) {
      for (const word of capitalizedWords) {
        if (word.length >= 3 && word.length <= 20) {
          return word;
        }
      }
    }
    
    // Return first few words as fallback
    const words = text.split(' ');
    return words.slice(0, 3).join(' ').replace(/[^a-zA-Z\s]/g, '');
  };

  const extractCategory = (text) => {
    const textLower = text.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(indianCategories)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return cat.charAt(0).toUpperCase() + cat.slice(1);
      }
    }
    
    // Context-based category detection
    if (textLower.includes('salary') || textLower.includes('income') || textLower.includes('refund')) {
      return 'Income';
    }
    
    if (textLower.includes('investment') || textLower.includes('stocks') || textLower.includes('mutual') || textLower.includes('fund')) {
      return 'Investment';
    }
    
    // Default to Other if no category found
    return 'Other';
  };

  const extractPaymentMode = (text) => {
    const textLower = text.toLowerCase();
    
    for (const [mode, keywords] of Object.entries(paymentModes)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return mode;
      }
    }
    
    // Default to digital if not specified
    return 'digital';
  };

  const extractAccount = (text) => {
    const textLower = text.toLowerCase();
    
    // Look for account-related keywords
    for (const account of bankAccounts) {
      const accountName = account.name.toLowerCase();
      const lastFour = account.lastFourDigits;
      
      // Check if account name or last four digits are mentioned
      if (textLower.includes(accountName) || textLower.includes(lastFour) || 
          textLower.includes(account.name.split(' ')[0].toLowerCase())) {
        return account.id;
      }
    }
    
    // Look for account type keywords
    for (const [type, keywords] of Object.entries(accountTypes)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        // Return first account of matching type if available
        const matchingAccount = bankAccounts.find(acc => 
          acc.name.toLowerCase().includes(type) || acc.name.toLowerCase().includes(type + ' account')
        );
        if (matchingAccount) return matchingAccount.id;
      }
    }
    
    // If no specific account is mentioned, return the first available account
    return bankAccounts.length > 0 ? bankAccounts[0].id : null;
  };

  const extractTransactionType = (text) => {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('received') || 
        textLower.includes('got') || 
        textLower.includes('income') ||
        textLower.includes('salary') ||
        textLower.includes('refund') ||
        textLower.includes('payment received') ||
        textLower.includes('money in') ||
        textLower.includes('credit') ||
        textLower.includes('added')) {
      return 'credit';
    }
    
    return 'debit';
  };

  // Function to handle general commands and navigation
  const handleGeneralCommand = (text) => {
    const lowerText = text.toLowerCase();
    
    // Navigation commands
    if (lowerText.includes('dashboard') || lowerText.includes('home')) {
      return { type: 'navigate', destination: 'dashboard' };
    } else if (lowerText.includes('analytics') || lowerText.includes('charts') || lowerText.includes('reports') || lowerText.includes('statistics')) {
      return { type: 'navigate', destination: 'analytics' };
    } else if (lowerText.includes('transactions') || lowerText.includes('history') || lowerText.includes('all transactions')) {
      return { type: 'navigate', destination: 'transactions' };
    } else if (lowerText.includes('reports')) {
      return { type: 'navigate', destination: 'reports' };
    } else if (lowerText.includes('goals') || lowerText.includes('savings') || lowerText.includes('save money')) {
      return { type: 'navigate', destination: 'saving-goals' };
    } else if (lowerText.includes('settings') || lowerText.includes('preferences')) {
      return { type: 'navigate', destination: 'settings' };
    } else if (lowerText.includes('family') || lowerText.includes('budget') || lowerText.includes('shared')) {
      return { type: 'navigate', destination: 'family-budget' };
    } else if (lowerText.includes('what if') || lowerText.includes('calculator') || lowerText.includes('simulation')) {
      return { type: 'navigate', destination: 'whatif' };
    } else if (lowerText.includes('sms') || lowerText.includes('extract') || lowerText.includes('parse')) {
      return { type: 'navigate', destination: 'sms-extractor' };
    }
    
    // Help command
    if (lowerText.includes('help') || lowerText.includes('what can you do') || lowerText.includes('how to use')) {
      return { type: 'help' };
    }
    
    // General response
    return { type: 'general' };
  };

  const processVoiceCommand = (text) => {
    setIsProcessing(true);
    
    // Clean up the text
    const cleanText = text.trim();
    if (!cleanText) {
      setIsProcessing(false);
      return;
    }

    // Check if it's a general command first
    const generalCmd = handleGeneralCommand(cleanText);
    
    if (generalCmd.type === 'navigate') {
      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'user',
        content: cleanText,
        timestamp: new Date()
      }]);

      setTimeout(() => {
        // Navigate to the requested tab if setActiveTab is provided
        if (setActiveTab && typeof setActiveTab === 'function') {
          setActiveTab(generalCmd.destination);
        }
        setIsProcessing(false);
        setTranscript('');
        
        // Add confirmation to conversation history
        setConversationHistory(prev => [...prev, {
          type: 'assistant',
          content: `Navigating to ${generalCmd.destination.replace('-', ' ')}.`,
          timestamp: new Date()
        }]);
      }, 1000);
      return;
    } else if (generalCmd.type === 'help') {
      setIsProcessing(false);
      setError('I am your AI assistant! I can help you track expenses and income by voice. Say things like "Spent ₹250 on Swiggy from my savings account" or "Got ₹5000 salary via digital payment". I can also navigate to different sections like dashboard, analytics, transactions, accounts, goals, settings, etc.');
      setTimeout(() => setError(''), 10000);
      return;
    }

    // Extract all components for transaction
    const amount = extractAmount(cleanText);
    const merchant = extractMerchant(cleanText);
    const category = extractCategory(cleanText);
    const type = extractTransactionType(cleanText);
    const paymentMode = extractPaymentMode(cleanText);
    const accountId = extractAccount(cleanText);
    
    // Create transaction object
    if (amount) {
      const transaction = {
        amount: amount,
        merchant: merchant,
        description: cleanText,
        category: category,
        type: type,
        currency: 'INR',
        paymentMethod: paymentMode,
        bankAccountId: accountId,
        _id: Date.now().toString(),
        mode: paymentMode === 'cash' ? 'cash' : 'non-cash'  // Add mode property
      };

      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'user',
        content: cleanText,
        timestamp: new Date()
      }]);

      setTimeout(() => {
        onTransactionDetected(transaction);
        setIsProcessing(false);
        setTranscript('');
        
        // Add confirmation to conversation history
        const accountName = accountId ? (bankAccounts.find(acc => acc.id === accountId)?.name || 'Selected Account') : 'N/A';
        setConversationHistory(prev => [...prev, {
          type: 'assistant',
          content: `Added ${type === 'credit' ? 'income' : 'expense'}: ₹${amount} for ${category} via ${paymentMode} from ${accountName}`,
          timestamp: new Date()
        }]);
      }, 1000);
    } else {
      // Check if it's a general query or instruction
      if (cleanText.toLowerCase().includes('help') || 
          cleanText.toLowerCase().includes('what can you do') ||
          cleanText.toLowerCase().includes('how to use')) {
        setError('I can help you track expenses and income by voice! Just say things like "Spent ₹250 on Swiggy from my savings account" or "Got ₹5000 salary via digital payment"');
      } else if (cleanText.toLowerCase().includes('add payment reminder') || 
                 cleanText.toLowerCase().includes('set reminder')) {
        setError('To add payment reminders, please use the app interface. Say "help" for more info.');
      } else if (cleanText.toLowerCase().includes('analytics') || 
                 cleanText.toLowerCase().includes('report') || 
                 cleanText.toLowerCase().includes('summary')) {
        setError('For analytics and reports, please use the app interface. Say "help" for more info.');
      } else {
        // Try to detect if user is trying to add a transaction but missing amount
        if (cleanText.toLowerCase().includes('spent') || 
            cleanText.toLowerCase().includes('bought') || 
            cleanText.toLowerCase().includes('paid') ||
            cleanText.toLowerCase().includes('got') ||
            cleanText.toLowerCase().includes('received') ||
            cleanText.toLowerCase().includes('earned')) {
          setError('I heard you wanted to add a transaction but couldn\'t detect an amount. Try saying "Spent ₹250 on groceries" or "Received ₹1000 from salary"');
        } else {
          setError('Could not detect amount in your voice command. Try saying "Spent ₹250 on groceries from my savings account"');
        }
      }
      
      setIsProcessing(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Start listening
      setError('');
      setTranscript('');
      setIsListening(true);
      
      // Ensure the recognition is properly started
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Recognition might already be running, ignore error
        }
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl max-w-sm classy-element"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>AI Voice Assistant</span>
              </h3>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Listening</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-300 mb-1">Try saying:</p>
                <p className="text-white text-sm">"Spent ₹250 on Swiggy from savings account"</p>
                <p className="text-white text-sm">"Paid ₹50 for Ola via digital payment"</p>
                <p className="text-white text-sm">"Got ₹5000 salary via bank transfer"</p>
                <p className="text-white text-sm">"Bought groceries ₹300 cash"</p>
              </div>
              
              {transcript && (
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-sm">Heard:</p>
                  <p className="text-white">{transcript}</p>
                </div>
              )}
              
              {isProcessing && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              )}
              
              {error && (
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center classy-button ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse-glow' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;