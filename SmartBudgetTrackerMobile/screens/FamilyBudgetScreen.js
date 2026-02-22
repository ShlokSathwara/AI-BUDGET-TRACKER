import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Card, 
  Title, 
  Text, 
  Button, 
  List,
  Modal,
  Portal,
  IconButton,
  Chip,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FamilyBudgetScreen = ({ route, navigation }) => {
  const { userId, transactions = [], bankAccounts = [] } = route.params;
  const [familyMembers, setFamilyMembers] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showAmounts, setShowAmounts] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [dateFilter, setDateFilter] = useState('month');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [verificationStep, setVerificationStep] = useState('email');
  const [sentCodeTo, setSentCodeTo] = useState('');
  const [errors, setErrors] = useState({});

  // Load family members from AsyncStorage
  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const userFamilyKey = `family_members_${userId}`;
      const savedFamily = await AsyncStorage.getItem(userFamilyKey);
      if (savedFamily) {
        setFamilyMembers(JSON.parse(savedFamily));
      }
    } catch (error) {
      console.log('Error loading family members:', error);
    }
  };

  // Save family members to AsyncStorage
  const saveFamilyMembers = async (members) => {
    try {
      setFamilyMembers(members);
      const userFamilyKey = `family_members_${userId}`;
      await AsyncStorage.setItem(userFamilyKey, JSON.stringify(members));
    } catch (error) {
      console.log('Error saving family members:', error);
      Alert.alert('Error', 'Failed to save family members');
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
    Alert.alert('Code Sent', `Verification code sent to ${emailInput}`);
  };

  // Verify code and add family member
  const verifyAndAddMember = async () => {
    if (!verificationCode.trim()) {
      setErrors({ code: 'Please enter the verification code' });
      return;
    }

    // In a real app, this would verify with backend
    if (verificationCode !== '123456') {
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
    await saveFamilyMembers(updatedMembers);
    setVerificationStep('complete');
    
    // Reset form after delay
    setTimeout(() => {
      setIsAddingMember(false);
      setVerificationStep('email');
      setEmailInput('');
      setVerificationCode('');
      setSentCodeTo('');
    }, 2000);
  };

  // Remove family member
  const removeFamilyMember = async (memberId) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this family member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedMembers = familyMembers.filter(member => member.id !== memberId);
            await saveFamilyMembers(updatedMembers);
          }
        }
      ]
    );
  };

  // Toggle data sharing for a member
  const toggleDataSharing = async (memberId) => {
    const updatedMembers = familyMembers.map(member => 
      member.id === memberId 
        ? { ...member, sharedData: !member.sharedData }
        : member
    );
    await saveFamilyMembers(updatedMembers);
  };

  // Get combined family data
  const getFamilyData = () => {
    const familyTransactions = [...transactions];
    const familyAccounts = [...bankAccounts];
    
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
      memberCount: familyMembers.length + 1
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
        return transactionsToFilter;
    }
    
    return transactionsToFilter.filter(tx => new Date(tx.date) >= filterDate);
  };

  const formatAmount = (amount) => {
    if (!showAmounts) return '••••';
    return `₹${amount?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.headerText}>
                <Title style={styles.title}>Family Budget</Title>
                <Text style={styles.subtitle}>Manage and share budget with family</Text>
              </View>
              <IconButton
                icon={showAmounts ? "eye" : "eye-off"}
                onPress={() => setShowAmounts(!showAmounts)}
                style={styles.eyeButton}
                iconColor="#fff"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Family Overview Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="account-group" size={24} color="#6200ee" />
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Members</Text>
                <Text style={styles.statValue}>{familyData.memberCount}</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#4caf50" />
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValueIncome}>{formatAmount(familyData.totalIncome)}</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="trending-down" size={24} color="#f44336" />
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValueExpense}>{formatAmount(familyData.totalExpenses)}</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons 
                name={familyData.netFlow >= 0 ? "wallet" : "wallet-outline"} 
                size={24} 
                color={familyData.netFlow >= 0 ? "#2196f3" : "#ff9800"} 
              />
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Net Flow</Text>
                <Text style={[
                  styles.statValue, 
                  familyData.netFlow >= 0 ? styles.netPositive : styles.netNegative
                ]}>
                  {formatAmount(familyData.netFlow)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* View Tabs */}
        <Card style={styles.tabsCard}>
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tabsContainer}>
                <Chip
                  mode={activeView === 'overview' ? 'flat' : 'outlined'}
                  onPress={() => setActiveView('overview')}
                  style={[
                    styles.tabChip,
                    activeView === 'overview' && styles.activeTabChip
                  ]}
                  textStyle={[
                    styles.tabText,
                    activeView === 'overview' && styles.activeTabText
                  ]}
                >
                  Overview
                </Chip>
                
                {familyMembers.map(member => (
                  <Chip
                    key={member.id}
                    mode={activeView === `member-${member.id}` ? 'flat' : 'outlined'}
                    onPress={() => setActiveView(`member-${member.id}`)}
                    style={[
                      styles.tabChip,
                      activeView === `member-${member.id}` && styles.activeTabChip
                    ]}
                    textStyle={[
                      styles.tabText,
                      activeView === `member-${member.id}` && styles.activeTabText
                    ]}
                  >
                    {member.name}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Date Filter */}
        <Card style={styles.filterCard}>
          <Card.Content style={styles.filterContent}>
            <MaterialCommunityIcons name="calendar" size={20} color="#999" />
            <Text style={styles.filterLabel}>Time Period:</Text>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.filterButton}
              labelStyle={styles.filterButtonText}
            >
              {dateFilter === 'week' && 'Last Week'}
              {dateFilter === 'month' && 'Last Month'}
              {dateFilter === 'year' && 'Last Year'}
              {dateFilter === 'all' && 'All Time'}
            </Button>
          </Card.Content>
        </Card>

        {/* Content Area */}
        {activeView === 'overview' ? (
          <View style={styles.contentContainer}>
            {/* Family Members List */}
            <Card style={styles.sectionCard}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="account-group" size={20} color="#6200ee" />
                  <Title style={styles.sectionTitle}>Family Members</Title>
                </View>
                
                <View style={styles.membersList}>
                  {/* Current User */}
                  <View style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>Y</Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>You</Text>
                        <Text style={styles.memberRole}>Family Admin</Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#4caf50" />
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  {/* Other Members */}
                  {familyMembers.map((member, index) => (
                    <View key={member.id}>
                      <View style={styles.memberItem}>
                        <View style={styles.memberInfo}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                          </View>
                          <View style={styles.memberDetails}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                          </View>
                        </View>
                        <View style={styles.memberActions}>
                          <IconButton
                            icon={member.sharedData ? "check-circle" : "close-circle"}
                            onPress={() => toggleDataSharing(member.id)}
                            iconColor={member.sharedData ? "#4caf50" : "#999"}
                            size={20}
                          />
                          <IconButton
                            icon="delete"
                            onPress={() => removeFamilyMember(member.id)}
                            iconColor="#f44336"
                            size={20}
                          />
                        </View>
                      </View>
                      {index < familyMembers.length - 1 && <Divider style={styles.divider} />}
                    </View>
                  ))}
                  
                  {familyMembers.length === 0 && (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="account-group" size={48} color="#999" />
                      <Text style={styles.emptyText}>No family members added yet</Text>
                      <Text style={styles.emptySubtext}>Add members to start sharing budgets</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>

            {/* Recent Transactions */}
            <Card style={styles.sectionCard}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="wallet" size={20} color="#4caf50" />
                  <Title style={styles.sectionTitle}>Recent Family Transactions</Title>
                </View>
                
                <View style={styles.transactionsList}>
                  {filterTransactions(familyData.transactions).slice(0, 5).map(transaction => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
                        <Text style={styles.transactionMeta}>
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[
                        styles.transactionAmount,
                        transaction.type === 'credit' ? styles.incomeAmount : styles.expenseAmount
                      ]}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </Text>
                    </View>
                  ))}
                  
                  {filterTransactions(familyData.transactions).length === 0 && (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="wallet" size={48} color="#999" />
                      <Text style={styles.emptyText}>No family transactions found</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          </View>
        ) : (
          <Card style={styles.sectionCard}>
            <Card.Content style={styles.memberDetailView}>
              <MaterialCommunityIcons name="account-group" size={64} color="#999" />
              <Title style={styles.memberDetailTitle}>Member Data</Title>
              <Text style={styles.memberDetailText}>
                Individual member data view would be implemented in a full backend version
              </Text>
              <Text style={styles.memberDetailSubtext}>
                This demo shows the UI structure for family member data sharing
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Add Member FAB */}
      <IconButton
        icon="account-plus"
        size={24}
        onPress={() => setIsAddingMember(true)}
        style={styles.fab}
        iconColor="#fff"
      />

      {/* Add Member Modal */}
      <Portal>
        <Modal
          visible={isAddingMember}
          onDismiss={() => {
            setIsAddingMember(false);
            setVerificationStep('email');
            setEmailInput('');
            setVerificationCode('');
            setErrors({});
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>Add Family Member</Title>
                <IconButton
                  icon="close"
                  onPress={() => {
                    setIsAddingMember(false);
                    setVerificationStep('email');
                    setEmailInput('');
                    setVerificationCode('');
                    setErrors({});
                  }}
                  iconColor="#999"
                />
              </View>

              {verificationStep === 'email' && (
                <View style={styles.modalContent}>
                  <Text style={styles.modalLabel}>Family Member's Email</Text>
                  <TextInput
                    value={emailInput}
                    onChangeText={setEmailInput}
                    placeholder="Enter email address"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  
                  <Button
                    mode="contained"
                    onPress={sendVerificationCode}
                    disabled={!emailInput.trim()}
                    style={styles.modalButton}
                    labelStyle={styles.modalButtonLabel}
                  >
                    Send Verification Code
                  </Button>
                </View>
              )}

              {verificationStep === 'code' && (
                <View style={styles.modalContent}>
                  <View style={styles.verificationSuccess}>
                    <MaterialCommunityIcons name="check-circle" size={48} color="#4caf50" />
                    <Text style={styles.verificationText}>Code sent to:</Text>
                    <Text style={styles.verificationEmail}>{sentCodeTo}</Text>
                  </View>
                  
                  <Text style={styles.modalLabel}>Enter 6-digit Code</Text>
                  <TextInput
                    value={verificationCode}
                    onChangeText={(text) => setVerificationCode(text.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                  />
                  {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
                  
                  <View style={styles.modalButtonRow}>
                    <Button
                      mode="outlined"
                      onPress={() => setVerificationStep('email')}
                      style={styles.modalSecondaryButton}
                    >
                      Back
                    </Button>
                    <Button
                      mode="contained"
                      onPress={verifyAndAddMember}
                      disabled={verificationCode.length !== 6}
                      style={styles.modalButton}
                    >
                      Verify & Add
                    </Button>
                  </View>
                </View>
              )}

              {verificationStep === 'complete' && (
                <View style={styles.modalContent}>
                  <View style={styles.successContainer}>
                    <MaterialCommunityIcons name="check-circle" size={64} color="#4caf50" />
                    <Title style={styles.successTitle}>Member Added Successfully!</Title>
                    <Text style={styles.successText}>You can now share budget data with this family member.</Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
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
    backgroundColor: '#6200ee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
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
  eyeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statValueIncome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statValueExpense: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
  },
  netPositive: {
    color: '#2196f3',
  },
  netNegative: {
    color: '#ff9800',
  },
  tabsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeTabChip: {
    backgroundColor: '#6200ee',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  filterCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginLeft: 8,
    marginRight: 12,
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    flex: 1,
  },
  filterButtonText: {
    fontSize: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  membersList: {
    // Styles for members list
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  memberActions: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  transactionsList: {
    // Styles for transactions list
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4caf50',
  },
  expenseAmount: {
    color: '#f44336',
  },
  memberDetailView: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  memberDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  memberDetailText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  memberDetailSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
  },
  modalCard: {
    margin: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    // Styles for modal content
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 8,
    backgroundColor: '#6200ee',
  },
  modalButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSecondaryButton: {
    marginTop: 8,
    marginRight: 8,
    borderColor: '#6200ee',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  verificationSuccess: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verificationText: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
  },
  verificationEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 4,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 16,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FamilyBudgetScreen;