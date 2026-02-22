import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  RadioButton,
  HelperText,
  Menu,
  Provider as PaperProvider
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddTransactionScreen = ({ route, navigation }) => {
  const { userId, onTransactionAdded } = route.params;
  const [transaction, setTransaction] = useState({
    type: 'debit',
    amount: '',
    merchant: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load bank accounts from AsyncStorage
  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      const userAccountsKey = `bank_accounts_${userId}`;
      const savedAccounts = await AsyncStorage.getItem(userAccountsKey);
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts);
        setBankAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : []);
      } else {
        setBankAccounts([]);
      }
    } catch (error) {
      console.log('Error loading bank accounts:', error);
      setBankAccounts([]);
    }
  };

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
    'Healthcare', 'Utilities', 'Rent', 'Salary', 'Investment', 'Other'
  ];

  const validateForm = () => {
    if (!transaction.amount || parseFloat(transaction.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (!transaction.merchant.trim()) {
      Alert.alert('Error', 'Please enter merchant/store name');
      return false;
    }
    
    if (!transaction.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    
    if (!transaction.date) {
      Alert.alert('Error', 'Please select a date');
      return false;
    }
    
    return true;
  };

  // Auto-categorization function
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

  const handleAddTransaction = async () => {
    if (!validateForm()) return;

    // Validate that a bank account is selected
    if (!selectedBankAccount) {
      Alert.alert('Error', 'Please select a bank account');
      return;
    }

    setLoading(true);
    
    try {
      // Load existing transactions
      const storedTransactions = await AsyncStorage.getItem(`transactions_${userId}`);
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      
      // Auto-categorize if no category is selected
      let finalTransaction = { ...transaction };
      if (!finalTransaction.category) {
        finalTransaction.category = autoCategorize(finalTransaction.merchant) || 'Other';
      }
      
      // Create new transaction with bank account info
      const newTransaction = {
        id: Date.now().toString(),
        ...finalTransaction,
        bankAccountId: selectedBankAccount,
        amount: parseFloat(finalTransaction.amount),
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
        `Transaction added successfully!\n\nCategory: ${newTransaction.category}\nAccount: ${bankAccounts.find(acc => acc.id === selectedBankAccount)?.name}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
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
          <Title style={styles.title}>Add New Transaction</Title>
          
          {/* Bank Account Selection */}
          <Text style={styles.label}>Select Bank Account</Text>
          <View style={styles.accountSelectorContainer}>
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.accountSelectorButton}
              labelStyle={styles.accountSelectorLabel}
            >
              {selectedBankAccount 
                ? bankAccounts.find(acc => acc.id === selectedBankAccount)?.name + ' (****' + bankAccounts.find(acc => acc.id === selectedBankAccount)?.lastFourDigits + ')'
                : 'Select Bank Account'}
            </Button>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} />
              }
            >
              {bankAccounts.map((account) => (
                <Menu.Item
                  key={account.id}
                  onPress={() => {
                    setSelectedBankAccount(account.id);
                    setMenuVisible(false);
                  }}
                  title={`${account.name} (****${account.lastFourDigits})`}
                />
              ))}
              {bankAccounts.length === 0 && (
                <Menu.Item
                  onPress={() => {
                    Alert.alert(
                      'No Accounts',
                      'Please add a bank account first. You can do this in the Settings section.',
                      [{text: 'OK'}]
                    );
                    setMenuVisible(false);
                  }}
                  title="No bank accounts found"
                />
              )}
            </Menu>
          </View>
          
          {/* Transaction Type */}
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.radioContainer}>
            <View style={styles.radioItem}>
              <RadioButton
                value="debit"
                status={transaction.type === 'debit' ? 'checked' : 'unchecked'}
                onPress={() => setTransaction({...transaction, type: 'debit'})}
              />
              <Text style={styles.radioLabel}>Expense</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton
                value="credit"
                status={transaction.type === 'credit' ? 'checked' : 'unchecked'}
                onPress={() => setTransaction({...transaction, type: 'credit'})}
              />
              <Text style={styles.radioLabel}>Income</Text>
            </View>
          </View>
          
          {/* Amount */}
          <TextInput
            label="Amount"
            value={transaction.amount}
            onChangeText={(text) => setTransaction({...transaction, amount: text})}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            placeholder="Enter amount"
            left={<TextInput.Affix text="₹" />}
          />
          <HelperText type="info" visible={true}>
            Enter the transaction amount
          </HelperText>
          
          {/* Merchant/Store */}
          <TextInput
            label={transaction.type === 'credit' ? "Source" : "Merchant/Store"}
            value={transaction.merchant}
            onChangeText={(text) => {
              setTransaction({...transaction, merchant: text});
              // Auto-suggest category when merchant name changes
              if (!transaction.category) {
                const suggestedCategory = autoCategorize(text);
                if (suggestedCategory) {
                  setTransaction(prev => ({...prev, category: suggestedCategory}));
                }
              }
            }}
            style={styles.input}
            mode="outlined"
            placeholder={transaction.type === 'credit' ? "Enter income source" : "Enter merchant or store name"}
          />
          
          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <Button
                key={category}
                mode={transaction.category === category ? "contained" : "outlined"}
                onPress={() => setTransaction({...transaction, category})}
                style={[
                  styles.categoryButton,
                  transaction.category === category && styles.selectedCategory
                ]}
                labelStyle={styles.categoryLabel}
              >
                {category}
              </Button>
            ))}
          </View>
          
          {/* Date */}
          <TextInput
            label="Date"
            value={transaction.date}
            onChangeText={(text) => setTransaction({...transaction, date: text})}
            style={styles.input}
            mode="outlined"
            placeholder="YYYY-MM-DD"
          />
          
          {/* Description */}
          <TextInput
            label="Description (Optional)"
            value={transaction.description}
            onChangeText={(text) => setTransaction({...transaction, description: text})}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Add any additional details"
          />
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              textColor="#666"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddTransaction}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Add Transaction
            </Button>
          </View>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    color: '#333',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioLabel: {
    marginLeft: 5,
    fontSize: 16,
  },
  input: {
    marginBottom: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryButton: {
    margin: 4,
    borderRadius: 20,
  },
  selectedCategory: {
    backgroundColor: '#6200ee',
  },
  categoryLabel: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  cancelButton: {
    flex: 0.45,
  },
  submitButton: {
    flex: 0.45,
    backgroundColor: '#6200ee',
  },
  accountSelectorContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  accountSelectorButton: {
    height: 50,
    justifyContent: 'center',
  },
  accountSelectorLabel: {
    textAlign: 'left',
    fontSize: 16,
  },
});

export default AddTransactionScreen;