import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

const AIChatAssistant = ({ onTransactionDetected, isVisible, setIsVisible }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Budget Assistant 🤖 I can help you track expenses. Try saying things like 'I spent ₹300 on groceries' or 'Add ₹500 for fuel'",
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

  const indianCategories = {
    food: ['food', 'lunch', 'dinner', 'breakfast', 'snacks', 'restaurant', 'cafe', 'swiggy', 'zomato', 'dominos', 'mcdonalds', 'starbucks'],
    transport: ['ola', 'uber', 'auto', 'taxi', 'bus', 'train', 'metro', 'petrol', 'diesel', 'fuel'],
    shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'big bazaar', 'd mart', 'reliance', 'clothes', 'shopping'],
    entertainment: ['movie', 'netflix', 'hotstar', 'disney', 'spotify', 'concert', 'theatre'],
    utilities: ['electricity', 'water', 'internet', 'phone', 'jio', 'airtel', 'vodafone'],
    healthcare: ['doctor', 'medicine', 'hospital', 'pharmacy', 'apollo', 'fortis'],
    education: ['school', 'college', 'books', 'course', 'tuition', 'byju'],
    groceries: ['bigbasket', 'grofers', 'milk', 'vegetables', 'fruits', 'grocery']
  };

  const indianMerchants = [
    'Swiggy', 'Zomato', 'Ola', 'Uber', 'Amazon India', 'Flipkart', 'BigBasket',
    'DMart', 'Reliance Fresh', 'McDonalds India', 'Starbucks India', 'Dominos Pizza',
    'Airtel', 'Jio', 'Vodafone', 'Apollo Hospitals', 'Fortis Hospitals'
  ];

  const processAICommand = (text) => {
    // Extract amount
    const amountRegex = /(?:rs|rupees|₹)\s*(\d+(?:\.\d+)?)/i;
    const amountMatch = text.match(amountRegex);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    // Extract merchant
    let merchant = '';
    const words = text.toLowerCase().split(' ');
    
    for (const indianMerchant of indianMerchants) {
      if (text.toLowerCase().includes(indianMerchant.toLowerCase().split(' ')[0])) {
        merchant = indianMerchant;
        break;
      }
    }

    if (!merchant) {
      merchant = words.slice(0, 3).join(' ').replace(/[^a-zA-Z\s]/g, '');
    }

    // Determine category
    let category = 'Other';
    const textLower = text.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(indianCategories)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }

    if (amount) {
      const transaction = {
        amount: amount,
        merchant: merchant,
        description: text,
        category: category,
        type: 'debit',
        currency: 'INR'
      };

      return {
        success: true,
        transaction: transaction,
        response: `✅ Added ₹${amount} for ${merchant} under ${category} category!`
      };
    } else {
      return {
        success: false,
        response: "❌ Sorry, I couldn't detect the amount. Please mention the rupee amount (e.g., '₹500' or 'Rs 300')"
      };
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
    "Add ₹200 for groceries",
    "Spent ₹50 on Ola ride",
    "₹1000 for electricity bill",
    "Paid ₹300 for Netflix"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isVisible && (
          <motion.button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-6 left-6 z-40 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 classy-button"
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
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg animate-classy-pulse">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
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
                  placeholder="Type your expense..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 classy-element"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all duration-300 classy-button"
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