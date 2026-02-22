import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  Paragraph,
  RadioButton,
  HelperText
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpenseExtractionScreen = ({ route, navigation }) => {
  const { userId, onTransactionAdded } = route.params;
  const [activeTab, setActiveTab] = useState('sms'); // 'sms' or 'email'
  const [smsText, setSmsText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [extractedTransaction, setExtractedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Enhanced parsing functions
  const parseSmsTransaction = (smsText) => {
    if (!smsText) return null;

    // Clean text
    const cleanText = smsText.toLowerCase();

    // Extract amount
    const amountMatch = smsText.match(/(?:rs|inr|rupees|₹|\$|usd)\s*([\d,]+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

    // Extract merchant
    const merchantMatch = smsText.match(/(?:at|on|for)\s+([A-Z0-9\s&]{3,30})/i);
    const merchant = merchantMatch ? merchantMatch[1].trim() : 'Bank Transaction';

    // Determine type
    let type = 'debit';
    if (cleanText.includes('credited') || cleanText.includes('credit')) {
      type = 'credit';
    }

    // Extract account last 4 digits
    const accountMatch = smsText.match(/(?:XXXX-?|\*{2,4}-?)(\d{4})/);
    const lastFourDigits = accountMatch ? accountMatch[1] : null;

    // Auto-categorize
    const category = autoCategorize(merchant);

    if (amount) {
      return {
        type,
        amount,
        merchant,
        category,
        date: new Date().toISOString().split('T')[0],
        description: `SMS: ${smsText.substring(0, 50)}...`,
        source: 'sms',
        originalText: smsText
      };
    }

    return null;
  };

  const parseEmailTransaction = (subject, body) => {
    if (!subject && !body) return null;

    const fullText = (subject || '') + ' ' + (body || '');
    const cleanText = fullText.toLowerCase();

    // Extract amount
    const amountMatch = fullText.match(/(?:rs|inr|rupees|₹|\$|usd)\s*([\d,]+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

    // Extract merchant
    const merchantMatch = fullText.match(/(?:from|via|at)\s+([A-Z0-9\s&]{3,30})/i);
    const merchant = merchantMatch ? merchantMatch[1].trim() : 'Email Receipt';

    // Determine type
    let type = 'debit';
    if (cleanText.includes('credited') || cleanText.includes('refunded') || cleanText.includes('returned')) {
      type = 'credit';
    }

    // Auto-categorize
    const category = autoCategorize(merchant);

    if (amount) {
      return {
        type,
        amount,
        merchant,
        category,
        date: new Date().toISOString().split('T')[0],
        description: `Email: ${(subject || body || '').substring(0, 50)}...`,
        source: 'email',
        originalText: `Subject: ${subject || ''}\nBody: ${body || ''}`
      };
    }

    return null;
  };

  // Auto-categorization function (same as in AddTransactionScreen)
  const autoCategorize = (merchantName) => {
    if (!merchantName) return 'Other';
    
    const lowerMerchant = merchantName.toLowerCase();
    
    // Define category mappings
    const categoryMappings = {
      'Food & Dining': ['food', 'restaurant', 'cafe', 'meal', 'eat', 'pizza', 'burger', 'coffee', 'dine', 'swiggy', 'zomato', 'dominos', 'starbucks', 'subway', 'kfc', 'mcdonald', 'burger king', 'jain', 'veg', 'non-veg', 'bar', 'pub', 'brewery'],
      'Transportation': ['uber', 'ola', 'cab', 'metro', 'bus', 'fuel', 'petrol', 'gas', 'travel', 'taxi', 'auto', 'rapido', 'bike rental', 'car rental', 'parking', 'railway', 'indian railways', 'irctc'],
      'Shopping': ['amazon', 'flipkart', 'myntra', 'shop', 'store', 'purchase', 'buy', 'retail', 'bigbasket', 'grofers', 'reliance', 'tata', 'dmart', 'walmart', 'aldi', 'costco', 'best buy', 'electronics', 'clothing', 'fashion', 'apparel', 'cosmetics', 'makeup'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'disney', 'spotify', 'music', 'game', 'stream', 'hotstar', 'sony', 'zee', 'movies', 'theater', 'concert', 'event', 'ticket', 'bookmyshow', 'inox', 'pvr', 'amc'],
      'Utilities': ['electricity', 'water', 'bill', 'power', 'gas', 'utility', 'broadband', 'internet', 'bsnl', 'jio', 'airtel', 'vi', 'reliance', 'tata', 'postpaid', 'prepaid', 'subscription'],
      'Healthcare': ['hospital', 'medicine', 'pharma', 'health', 'medical', 'doctor', 'clinic', 'apollo', 'fortis', 'max', 'kims', 'prescription', 'consultation', 'health check', 'insurance', 'medlife', '1mg'],
      'Education': ['school', 'college', 'course', 'book', 'education', 'tuition', 'fee', 'university', 'degree', 'certificate', 'udemy', 'coursera', 'edx', 'byjus', 'vedantu', 'class', 'tutor', 'learning'],
      'Travel': ['flight', 'hotel', 'airline', 'booking', 'trip', 'vacation', 'holiday', 'makemytrip', 'ixigo', 'oyo', 'airbnb', 'booking.com', 'expedia', 'goibibo', 'train', 'bus', 'cruise', 'resort', 'tour'],
      'Investment': ['mf', 'mutual', 'stock', 'investment', 'sip', 'equity', 'bond', 'share', 'trading', 'portfolio', 'wealth', 'finance', 'broker', 'zerodha', 'upstox', 'groww', 'coin', 'crypto', 'bitcoin'],
      'Insurance': ['insurance', 'premium', 'policy', 'claim', 'lic', 'hdfc life', 'max life', 'bajaj', 'icici pru', 'sbi life', 'health insurance', 'car insurance', 'bike insurance', 'term'],
      'Tax & Legal': ['tax', 'gst', 'itr', 'income tax', 'service tax', 'legal', 'advocate', 'lawyer', 'court', 'government', 'municipal', 'property tax', 'house tax', 'registration'],
      'Gifts & Charity': ['gift', 'donation', 'charity', 'ngo', 'temple', 'church', 'mosque', 'religious', 'festival', 'celebration', 'wedding', 'birthday', 'anniversary', 'occasion']
    };
    
    for (const [category, keywords] of Object.entries(categoryMappings)) {
      if (keywords.some(keyword => lowerMerchant.includes(keyword))) {
        return category;
      }
    }
    
    // Default to 'Other' if no match found
    return 'Other';
  };

  const handleParseSms = () => {
    if (!smsText.trim()) {
      Alert.alert('Error', 'Please enter SMS text');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const parsed = parseSmsTransaction(smsText);
        if (parsed) {
          setExtractedTransaction(parsed);
          Alert.alert('Success', 'Transaction details extracted successfully!');
        } else {
          Alert.alert('Error', 'Could not extract transaction details from SMS');
        }
      } catch (error) {
        console.log('Error parsing SMS:', error);
        Alert.alert('Error', 'Failed to parse SMS. Please check format.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleParseEmail = () => {
    if (!emailSubject.trim() && !emailBody.trim()) {
      Alert.alert('Error', 'Please enter either email subject or body');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const parsed = parseEmailTransaction(emailSubject, emailBody);
        if (parsed) {
          setExtractedTransaction(parsed);
          Alert.alert('Success', 'Transaction details extracted successfully!');
        } else {
          Alert.alert('Error', 'Could not extract transaction details from email');
        }
      } catch (error) {
        console.log('Error parsing email:', error);
        Alert.alert('Error', 'Failed to parse email. Please check format.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleAddExtractedTransaction = async () => {
    if (!extractedTransaction) return;

    setLoading(true);
    try {
      // Load existing transactions
      const storedTransactions = await AsyncStorage.getItem(`transactions_${userId}`);
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      
      // Create new transaction
      const newTransaction = {
        id: Date.now().toString(),
        ...extractedTransaction,
        createdAt: new Date().toISOString()
      };
      
      // Add to transactions array
      const updatedTransactions = [...transactions, newTransaction];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(`transactions_${userId}`, JSON.stringify(updatedTransactions));
      
      // Notify parent screen
      if (onTransactionAdded) {
        onTransactionAdded();
      }
      
      // Show success message and go back
      Alert.alert(
        'Success', 
        `Transaction added successfully!\n\nCategory: ${newTransaction.category}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
      // Reset state
      setExtractedTransaction(null);
      setSmsText('');
      setEmailSubject('');
      setEmailBody('');
      
    } catch (error) {
      console.log('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Auto Expense Extraction</Title>
          
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'sms' && styles.activeTab
              ]}
              onPress={() => setActiveTab('sms')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'sms' && styles.activeTabText
              ]}>SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'email' && styles.activeTab
              ]}
              onPress={() => setActiveTab('email')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'email' && styles.activeTabText
              ]}>Email</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'sms' ? (
            <>
              {/* SMS Input */}
              <Text style={styles.label}>Bank SMS Text</Text>
              <TextInput
                value={smsText}
                onChangeText={setSmsText}
                style={styles.textArea}
                mode="outlined"
                placeholder="Paste your bank SMS here (e.g., 'INR 1,234.56 debited from A/C XXXX1234...')"
                multiline
                numberOfLines={4}
              />
              
              <Button
                mode="contained"
                onPress={handleParseSms}
                loading={loading}
                disabled={loading || !smsText.trim()}
                style={styles.actionButton}
              >
                Parse SMS
              </Button>
            </>
          ) : (
            <>
              {/* Email Input */}
              <Text style={styles.label}>Email Subject</Text>
              <TextInput
                value={emailSubject}
                onChangeText={setEmailSubject}
                style={styles.input}
                mode="outlined"
                placeholder="Email subject (optional)"
              />
              
              <Text style={styles.label}>Email Body</Text>
              <TextInput
                value={emailBody}
                onChangeText={setEmailBody}
                style={styles.textArea}
                mode="outlined"
                placeholder="Paste email body content here..."
                multiline
                numberOfLines={4}
              />
              
              <Button
                mode="contained"
                onPress={handleParseEmail}
                loading={loading}
                disabled={loading || (!emailSubject.trim() && !emailBody.trim())}
                style={styles.actionButton}
              >
                Parse Email
              </Button>
            </>
          )}

          {/* Display Extracted Transaction */}
          {extractedTransaction && (
            <Card style={styles.extractedCard}>
              <Card.Content>
                <Title style={styles.extractedTitle}>Extracted Details</Title>
                
                <Paragraph style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Merchant:</Text> {extractedTransaction.merchant}
                </Paragraph>
                
                <Paragraph style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text> ₹{extractedTransaction.amount?.toLocaleString()}
                </Paragraph>
                
                <Paragraph style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text> {extractedTransaction.type === 'credit' ? 'Income' : 'Expense'}
                </Paragraph>
                
                <Paragraph style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text> {extractedTransaction.category}
                </Paragraph>
                
                <Paragraph style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text> {extractedTransaction.date}
                </Paragraph>
                
                <Button
                  mode="contained"
                  onPress={handleAddExtractedTransaction}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                >
                  Add to Transactions
                </Button>
              </Card.Content>
            </Card>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#6200ee',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 20,
    backgroundColor: '#6200ee',
  },
  extractedCard: {
    marginTop: 20,
    backgroundColor: '#f0f8ff',
  },
  extractedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    marginBottom: 8,
    fontSize: 14,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#4caf50',
  }
});

export default ExpenseExtractionScreen;