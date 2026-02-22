import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  IconButton, 
  Text, 
  Card, 
  Button,
  Portal,
  Modal,
  Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const flatListRef = useRef(null);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
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

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <Card style={[
        styles.messageCard,
        item.sender === 'user' ? styles.userCard : styles.aiCard
      ]}>
        <Card.Content>
          <Text style={[
            styles.messageText,
            item.sender === 'user' ? styles.userText : styles.aiText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            item.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Card.Content>
      </Card>
      <IconButton
        icon={item.sender === 'user' ? 'account' : 'robot'}
        size={20}
        style={[
          styles.avatar,
          item.sender === 'user' ? styles.userAvatar : styles.aiAvatar
        ]}
        iconColor={item.sender === 'user' ? '#fff' : '#fff'}
      />
    </View>
  );

  const quickActions = [
    { text: 'Analyze Spending', action: 'Analyze my spending patterns' },
    { text: 'Savings Advice', action: 'How can I save more money?' },
    { text: 'Account Analysis', action: 'Tell me about my accounts' },
    { text: 'Budget Planning', action: 'Help with budget planning' }
  ];

  if (!isVisible) {
    return (
      <IconButton
        icon="message"
        size={24}
        onPress={() => setIsVisible(true)}
        style={styles.floatingButton}
        iconColor="#fff"
      />
    );
  }

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={() => setIsVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <IconButton
                icon="robot"
                size={24}
                style={styles.headerIcon}
                iconColor="#fff"
              />
              <View>
                <Text style={styles.headerTitle}>AI Financial Advisor</Text>
                <Text style={styles.headerSubtitle}>Always here to help with your finances</Text>
              </View>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setIsVisible(false)}
              iconColor="#999"
            />
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
          />

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <Card style={styles.aiCard}>
                <Card.Content>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, { animationDelay: 100 }]} />
                    <View style={[styles.typingDot, { animationDelay: 200 }]} />
                  </View>
                </Card.Content>
              </Card>
              <IconButton
                icon="robot"
                size={20}
                style={styles.aiAvatar}
                iconColor="#fff"
              />
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.chipContainer}>
              {quickActions.map((action, index) => (
                <Chip
                  key={index}
                  onPress={() => setInputValue(action.action)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {action.text}
                </Chip>
              ))}
            </View>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Ask me anything about your finances..."
              style={styles.input}
              multiline
              numberOfLines={2}
              maxLength={500}
            />
            <IconButton
              icon="send"
              size={24}
              onPress={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              style={[
                styles.sendButton,
                (!inputValue.trim() || isTyping) && styles.sendButtonDisabled
              ]}
              iconColor="#fff"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    margin: 10,
    borderRadius: 16,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    backgroundColor: '#6200ee',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    borderRadius: 16,
  },
  userCard: {
    backgroundColor: '#6200ee',
    marginLeft: 8,
  },
  aiCard: {
    backgroundColor: '#333',
    marginRight: 8,
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#e0e0e0',
  },
  aiTimestamp: {
    color: '#999',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userAvatar: {
    backgroundColor: '#6200ee',
  },
  aiAvatar: {
    backgroundColor: '#bb86fc',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bb86fc',
    marginHorizontal: 2,
  },
  quickActionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#333',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6200ee',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6200ee',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});

export default AIChatAssistant;