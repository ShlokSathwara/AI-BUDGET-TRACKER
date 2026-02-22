import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  List,
  Divider,
  FAB
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BankAccountScreen = ({ route, navigation }) => {
  const { userId, onAccountsUpdated } = route.params;
  const [accounts, setAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    lastFourDigits: ''
  });
  const [errors, setErrors] = useState({});

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
        setAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : []);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.log('Error loading bank accounts:', error);
      setAccounts([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newAccount.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!newAccount.lastFourDigits.trim()) {
      newErrors.lastFourDigits = 'Last 4 digits are required';
    } else if (!/^\d{4}$/.test(newAccount.lastFourDigits)) {
      newErrors.lastFourDigits = 'Must be exactly 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAccount = async () => {
    if (!validateForm()) return;
    
    try {
      // Check for duplicates
      const accountExists = accounts.some(
        acc => acc.name.toLowerCase() === newAccount.name.toLowerCase() ||
               acc.lastFourDigits === newAccount.lastFourDigits
      );
      
      if (accountExists) {
        Alert.alert('Error', 'An account with this name or last 4 digits already exists');
        return;
      }
      
      const newAccountObj = {
        id: Date.now().toString(),
        name: newAccount.name.trim(),
        lastFourDigits: newAccount.lastFourDigits,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      
      const updatedAccounts = [...accounts, newAccountObj];
      setAccounts(updatedAccounts);
      setNewAccount({ name: '', lastFourDigits: '' });
      setErrors({});
      setShowAddForm(false);
      
      // Save to AsyncStorage
      const userAccountsKey = `bank_accounts_${userId}`;
      await AsyncStorage.setItem(userAccountsKey, JSON.stringify(updatedAccounts));
      
      // Notify parent if callback exists
      if (onAccountsUpdated) {
        onAccountsUpdated(updatedAccounts);
      }
      
      Alert.alert('Success', 'Bank account added successfully!');
      
    } catch (error) {
      console.log('Error adding bank account:', error);
      Alert.alert('Error', 'Failed to add bank account. Please try again.');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
        setAccounts(updatedAccounts);
        
        // Save to AsyncStorage
        const userAccountsKey = `bank_accounts_${userId}`;
        await AsyncStorage.setItem(userAccountsKey, JSON.stringify(updatedAccounts));
        
        // Notify parent if callback exists
        if (onAccountsUpdated) {
          onAccountsUpdated(updatedAccounts);
        }
        
        Alert.alert('Success', 'Bank account deleted successfully!');
      } catch (error) {
        console.log('Error deleting bank account:', error);
        Alert.alert('Error', 'Failed to delete bank account. Please try again.');
      }
    }
  };

  const resetAllAccounts = async () => {
    if (window.confirm('Are you sure you want to reset all bank account data?')) {
      try {
        setAccounts([]);
        const userAccountsKey = `bank_accounts_${userId}`;
        await AsyncStorage.setItem(userAccountsKey, JSON.stringify([]));
        
        // Notify parent if callback exists
        if (onAccountsUpdated) {
          onAccountsUpdated([]);
        }
        
        Alert.alert('Success', 'All bank accounts have been reset!');
      } catch (error) {
        console.log('Error resetting bank accounts:', error);
        Alert.alert('Error', 'Failed to reset bank accounts. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.title}>Bank Accounts</Title>
            <Text style={styles.subtitle}>Manage your bank accounts and track balances</Text>
          </Card.Content>
        </Card>

        {/* Bank Accounts List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Your Accounts</Title>
            
            {accounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No bank accounts added yet</Text>
                <Text style={styles.emptySubtext}>Tap the + button to add your first account</Text>
              </View>
            ) : (
              <View style={styles.accountList}>
                {accounts.map((account) => (
                  <List.Item
                    key={account.id}
                    title={account.name}
                    description={`**** **** **** ${account.lastFourDigits} • Balance: ₹${account.balance?.toLocaleString() || '0'}`}
                    left={props => <List.Icon {...props} icon="bank" />}
                    right={props => (
                      <Button
                        icon="delete"
                        mode="text"
                        onPress={() => handleDeleteAccount(account.id)}
                        textColor="#ff4444"
                      >
                        Delete
                      </Button>
                    )}
                    style={styles.accountItem}
                  />
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Reset Button */}
        {accounts.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={resetAllAccounts}
                buttonColor="#ff4444"
                textColor="white"
                icon="delete"
                style={styles.resetButton}
              >
                Reset All Accounts
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Add Account Modal */}
      {showAddForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Add New Bank Account</Title>
            
            <TextInput
              label="Account Name"
              value={newAccount.name}
              onChangeText={(text) => setNewAccount({...newAccount, name: text})}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Savings Account, Credit Card"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            
            <TextInput
              label="Last 4 Digits"
              value={newAccount.lastFourDigits}
              onChangeText={(text) => setNewAccount({
                ...newAccount, 
                lastFourDigits: text.replace(/\D/g, '').slice(0, 4)
              })}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., 1234"
              maxLength={4}
              keyboardType="numeric"
            />
            {errors.lastFourDigits && <Text style={styles.errorText}>{errors.lastFourDigits}</Text>}
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowAddForm(false);
                  setNewAccount({ name: '', lastFourDigits: '' });
                  setErrors({});
                }}
                style={styles.modalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddAccount}
                style={styles.modalAddButton}
              >
                Add Account
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddForm(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  accountList: {
    marginBottom: 16,
  },
  accountItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resetButton: {
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 0.45,
  },
  modalAddButton: {
    flex: 0.45,
    backgroundColor: '#6200ee',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default BankAccountScreen;