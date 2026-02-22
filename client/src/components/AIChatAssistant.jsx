import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  Bot, 
  TrendingUp, 
  Wallet, 
  BarChart3,
  Lightbulb,
  Calculator,
  HelpCircle
} from 'lucide-react';

const AIChatAssistant = ({ transactions = [], bankAccounts = [], isVisible, setIsVisible }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Financial Advisor. I can help you with budgeting advice, spending analysis, savings recommendations, and financial planning. What would you like to discuss today?",
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

  // Financial analysis functions
  const analyzeSpending = () => {
    if (!transactions || transactions.length === 0) {
      return "I don't have enough transaction data to provide insights yet. Please add some transactions first!";
    }

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentTransactions = transactions.filter(tx => 
      new Date(tx.date) >= oneMonthAgo && tx.type === 'debit'
    );
    
    const totalSpent = recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const avgDailySpending = totalSpent / 30;
    
    const categorySpending = {};
    recentTransactions.forEach(tx => {
      const category = tx.category || 'Other';
      categorySpending[category] = (categorySpending[category] || 0) + (tx.amount || 0);
    });
    
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    return `Based on your recent spending (last 30 days):
    • Total spent: ₹${totalSpent.toLocaleString()}
    • Average daily spending: ₹${avgDailySpending.toFixed(2)}
    • Your biggest spending category: ${topCategory ? `${topCategory[0]} (₹${topCategory[1].toLocaleString()})` : 'No clear pattern'}`;
  };

  const provideSavingsAdvice = () => {
    if (!transactions || transactions.length === 0) {
      return "Please add some transactions so I can analyze your spending patterns and provide personalized savings advice.";
    }

    const incomeTransactions = transactions.filter(tx => tx.type === 'credit');
    const expenseTransactions = transactions.filter(tx => tx.type === 'debit');
    
    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    let advice = `Your current savings rate is ${savingsRate.toFixed(1)}%. `;
    
    if (savingsRate < 10) {
      advice += "This is below the recommended 20%. Consider reducing discretionary spending in categories like dining, entertainment, or shopping.";
    } else if (savingsRate < 20) {
      advice += "You're doing well, but could aim for the 20% savings benchmark. Look for small optimizations in your monthly expenses.";
    } else {
      advice += "Excellent! You're maintaining a healthy savings rate. Consider investing some of these savings for better returns.";
    }
    
    return advice;
  };

  const accountAnalysis = (accountName) => {
    if (!bankAccounts || bankAccounts.length === 0) {
      return "You haven't added any bank accounts yet. Please add your accounts to get detailed analysis.";
    }
    
    const account = bankAccounts.find(acc => 
      acc.name.toLowerCase().includes(accountName.toLowerCase()) || 
      acc.lastFourDigits === accountName
    );
    
    if (!account) {
      return `I couldn't find an account matching "${accountName}". Your accounts are: ${bankAccounts.map(acc => acc.name).join(', ')}`;
    }
    
    const accountTransactions = transactions.filter(tx => tx.bankAccountId === account.id);
    const income = accountTransactions.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const expenses = accountTransactions.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const balance = income - expenses;
    
    return `Analysis for ${account.name}:
    • Current balance: ₹${balance.toLocaleString()}
    • Total income: ₹${income.toLocaleString()}
    • Total expenses: ₹${expenses.toLocaleString()}
    • Net flow: ${balance >= 0 ? '+' : ''}₹${balance.toLocaleString()}`;
  };

  const generateResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Financial advice patterns
    if (message.includes('spend') || message.includes('spending') || message.includes('expense')) {
      return analyzeSpending();
    }
    
    if (message.includes('save') || message.includes('savings') || message.includes('saving')) {
      return provideSavingsAdvice();
    }
    
    if (message.includes('account') || message.includes('balance')) {
      const accountName = message.split('account')[1] || message.split('balance')[1] || '';
      return accountAnalysis(accountName.trim());
    }
    
    if (message.includes('budget') || message.includes('plan')) {
      return "I'd be happy to help with budgeting! Consider following the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Based on your income, I can help you calculate specific amounts for each category.";
    }
    
    if (message.includes('invest') || message.includes('investment')) {
      return "For investments, consider starting with emergency funds (3-6 months expenses), then low-risk options like mutual funds or index funds. Your risk tolerance and time horizon should guide your investment strategy.";
    }
    
    // Default responses
    const responses = [
      "I'd be happy to help with that! Could you be more specific about what financial advice you need?",
      "That's a great question! Let me know more details so I can provide personalized guidance.",
      "I can help you with budgeting, saving, spending analysis, and financial planning. What area would you like to focus on?",
      "For the best advice, I'll need to understand your specific situation. Can you tell me more about your financial goals?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse = await generateResponse(inputValue);
      
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Financial Advisor</h2>
              <p className="text-sm text-gray-400">Always here to help with your finances</p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    {message.sender === 'user' ? 
                      <User className="h-4 w-4 text-white" /> : 
                      <Bot className="h-4 w-4 text-white" />
                    }
                  </div>
                  <div className={`p-3 rounded-2xl ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2">
                <div className="p-2 bg-purple-600 rounded-full">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="p-3 rounded-2xl bg-white/10">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-white/10">
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setInputValue('Analyze my spending patterns')}
              className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Analyze Spending
            </button>
            <button
              onClick={() => setInputValue('How can I save more money?')}
              className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Savings Advice
            </button>
            <button
              onClick={() => setInputValue('Tell me about my accounts')}
              className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Account Analysis
            </button>
            <button
              onClick={() => setInputValue('Help with budget planning')}
              className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Budget Planning
            </button>
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
              placeholder="Ask me anything about your finances..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIChatAssistant;