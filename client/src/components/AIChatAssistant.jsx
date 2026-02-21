import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Sparkles } from 'lucide-react';

const AIChatAssistant = ({ onTransactionDetected, isVisible, setIsVisible }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Budget Assistant 🤖 I can understand natural language! Try saying things like 'I bought groceries for ₹300' or 'Spent ₹250 on Zomato' or even 'Got ₹5000 salary this month'",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Enhanced amount extraction with multiple patterns
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
      /invest\s+(\d+(?:\.\d+)?)/i
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
        if (amount >= 10 && amount <= 100000) { // Reasonable expense range
          return amount;
        }
      }
    }
    
    return null;
  };

  // Enhanced merchant extraction
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
      /ordered\s+.*\s+from\s+([A-Za-z\s]+)/i
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

  // Enhanced category extraction
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

  const processAICommand = (text) => {
    // Clean up the input
    const cleanText = text.trim().toLowerCase();
    
    // Extract amount, merchant, and category
    const amount = extractAmount(cleanText);
    
    if (amount) {
      const merchant = extractMerchant(cleanText);
      const category = extractCategory(cleanText);
      
      // Determine transaction type based on context
      let type = 'debit';
      if (cleanText.includes('received') || 
          cleanText.includes('got') || 
          cleanText.includes('income') ||
          cleanText.includes('salary') ||
          cleanText.includes('refund') ||
          cleanText.includes('payment received')) {
        type = 'credit';
      }
      
      const transaction = {
        amount: amount,
        merchant: merchant,
        description: text,
        category: category,
        type: type,
        currency: 'INR'
      };

      return {
        success: true,
        transaction: transaction,
        response: `✅ Added ${type === 'credit' ? 'income' : 'expense'}: ₹${amount} for ${category} at ${merchant}!`
      };
    } else {
      // Check if it's a general query or instruction
      if (cleanText.includes('hello') || cleanText.includes('hi') || cleanText.includes('hey')) {
        return {
          success: false,
          response: 'Hello! I\'m your AI Budget Assistant. I can help you track expenses by understanding natural language. Just tell me about your purchases!'
        };
      } else if (cleanText.includes('help') || cleanText.includes('how') || cleanText.includes('what can')) {
        return {
          success: false,
          response: 'I can understand natural language! Just tell me about your expenses like "I bought groceries for ₹300" or "Spent ₹250 on Zomato". I can also answer questions about your spending.'
        };
      } else if (cleanText.includes('expense') || cleanText.includes('spend') || cleanText.includes('money')) {
        return {
          success: false,
          response: 'To add an expense, just tell me about it! For example: "I spent ₹500 on clothes" or "Paid ₹200 for movie tickets". I\'ll automatically categorize it for you.'
        };
      } else if (cleanText.includes('income') || cleanText.includes('salary') || cleanText.includes('earned')) {
        return {
          success: false,
          response: 'To add income, tell me about it! For example: "Received ₹10,000 salary" or "Got ₹500 as gift". I\'ll record it as credit in your account.'
        };
      } else if (cleanText.includes('thank') || cleanText.includes('thanks')) {
        return {
          success: false,
          response: 'You\'re welcome! Is there anything else I can help you with?'
        };
      } else if (cleanText.includes('bye') || cleanText.includes('goodbye')) {
        return {
          success: false,
          response: 'Goodbye! Feel free to chat with me anytime you want to track expenses or ask about your finances.'
        };
      } else if (cleanText.includes('analyze') || cleanText.includes('report') || cleanText.includes('summary')) {
        return {
          success: false,
          response: 'I can help analyze your spending! I can categorize expenses, identify trends, and provide insights. Just start tracking your expenses and I\'ll give you detailed analysis.'
        };
      } else if (cleanText.includes('budget') || cleanText.includes('save') || cleanText.includes('savings')) {
        return {
          success: false,
          response: 'Budgeting is important! I can help you set savings goals, track your spending against budgets, and suggest ways to save money. Would you like to set up a savings goal?'
        };
      } else {
        // Default response for unrecognized input that doesn't contain an amount
        return {
          success: false,
          response: "I understand you're talking, but I couldn't detect a specific transaction. To add an expense or income, please mention an amount. For example: 'Spent ₹200 on food' or 'Received ₹1000 as gift'."
        };
      }
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const result = processAICommand(inputValue);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: result.response,
        sender: 'ai',
        timestamp: new Date(),
        transaction: result.success ? result.transaction : null
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // If successful, notify parent component
      if (result.success && result.transaction) {
        setTimeout(() => {
          onTransactionDetected(result.transaction);
        }, 500);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickCommands = [
    "I spent ₹300 on groceries",
    "Got ₹5000 salary this month",
    "Paid ₹250 for Ola ride",
    "Bought books for ₹150"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isVisible && (
          <motion.button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-6 left-6 z-40 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-2xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 classy-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed bottom-6 left-6 z-50 w-80 h-96 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col classy-element"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg animate-classy-pulse">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-semibold">AI Budget Assistant</h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={`max-w-xs rounded-xl p-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-white/10 text-white'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {message.sender === 'ai' && (
                        <Bot className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      )}
                      {message.sender === 'user' && (
                        <User className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm">{message.text}</p>
                        {message.transaction && (
                          <div className="mt-2 p-2 bg-black/20 rounded-lg">
                            <p className="text-xs text-green-400">
                              ₹{message.transaction.amount} • {message.transaction.merchant}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Commands */}
            <div className="px-4 py-2 border-t border-white/10">
              <div className="flex flex-wrap gap-1 mb-2">
                {quickCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(command)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-2 py-1 rounded-lg transition-colors classy-button"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 classy-element"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all duration-300 classy-button"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;