import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  ProgressBar,
  HelperText,
  Chip
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavingsGoalScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: 0,
    deadline: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'list'

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const storedGoals = await AsyncStorage.getItem(`savings_goals_${userId}`);
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.log('Error loading goals:', error);
    }
  };

  const validateForm = () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return false;
    }
    
    if (!newGoal.targetAmount || parseFloat(newGoal.targetAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return false;
    }
    
    if (!newGoal.deadline) {
      Alert.alert('Error', 'Please select a deadline');
      return false;
    }
    
    return true;
  };

  const handleCreateGoal = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Calculate suggested monthly/weekly savings based on deadline
      const targetAmount = parseFloat(newGoal.targetAmount);
      const currentDate = new Date();
      const deadlineDate = new Date(newGoal.deadline);
      const timeDiff = deadlineDate.getTime() - currentDate.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Calculate suggested savings per month
      const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
      const suggestedMonthly = (targetAmount / monthsLeft).toFixed(2);
      
      // Calculate suggested savings per week
      const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
      const suggestedWeekly = (targetAmount / weeksLeft).toFixed(2);
      
      const goal = {
        id: Date.now().toString(),
        ...newGoal,
        targetAmount: targetAmount,
        currentAmount: 0,
        createdAt: new Date().toISOString(),
        suggestedMonthly: parseFloat(suggestedMonthly),
        suggestedWeekly: parseFloat(suggestedWeekly),
        daysLeft: daysLeft,
        progress: 0
      };

      const updatedGoals = [...goals, goal];
      await AsyncStorage.setItem(`savings_goals_${userId}`, JSON.stringify(updatedGoals));
      
      setGoals(updatedGoals);
      setNewGoal({
        title: '',
        targetAmount: '',
        currentAmount: 0,
        deadline: '',
        description: '',
        priority: 'medium'
      });
      
      Alert.alert('Success', `Your goal "${goal.title}" has been created! AI suggests saving ₹${suggestedMonthly} per month or ₹${suggestedWeekly} per week.`);
      
    } catch (error) {
      console.log('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (goalId, amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid contribution amount');
      return;
    }

    try {
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          const newCurrentAmount = goal.currentAmount + parseFloat(amount);
          const newProgress = Math.min(100, (newCurrentAmount / goal.targetAmount) * 100);
          
          return {
            ...goal,
            currentAmount: newCurrentAmount,
            progress: newProgress
          };
        }
        return goal;
      });

      await AsyncStorage.setItem(`savings_goals_${userId}`, JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
      
      Alert.alert('Success', 'Contribution added successfully!');
      
    } catch (error) {
      console.log('Error adding contribution:', error);
      Alert.alert('Error', 'Failed to add contribution. Please try again.');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const updatedGoals = goals.filter(goal => goal.id !== goalId);
              await AsyncStorage.setItem(`savings_goals_${userId}`, JSON.stringify(updatedGoals));
              setGoals(updatedGoals);
            } catch (error) {
              console.log('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          }
        }
      ]
    );
  };

  const calculateDaysLeft = (deadline) => {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    const timeDiff = deadlineDate.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysLeft;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Normal Priority';
    }
  };

  const activeGoals = goals.filter(goal => goal.progress < 100);
  const completedGoals = goals.filter(goal => goal.progress >= 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabs}>
        <Button
          mode={activeTab === 'create' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('create')}
          style={styles.tabButton}
        >
          Create Goal
        </Button>
        <Button
          mode={activeTab === 'list' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('list')}
          style={styles.tabButton}
        >
          My Goals
        </Button>
      </View>

      {activeTab === 'create' ? (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Create Savings Goal</Title>
            
            <TextInput
              label="Goal Title"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({...newGoal, title: text})}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Vacation Fund, Emergency Fund"
            />
            
            <TextInput
              label="Target Amount"
              value={newGoal.targetAmount}
              onChangeText={(text) => setNewGoal({...newGoal, targetAmount: text})}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Enter target amount"
              left={<TextInput.Affix text="₹" />}
            />
            
            <TextInput
              label="Deadline"
              value={newGoal.deadline}
              onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
              style={styles.input}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />
            
            <TextInput
              label="Description (Optional)"
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({...newGoal, description: text})}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Describe your goal"
            />
            
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              <Chip
                selected={newGoal.priority === 'high'}
                onPress={() => setNewGoal({...newGoal, priority: 'high'})}
                style={[styles.chip, { borderColor: '#f44336' }]}
                textStyle={newGoal.priority === 'high' ? { color: '#f44336' } : { color: '#f44336' }}
              >
                High
              </Chip>
              <Chip
                selected={newGoal.priority === 'medium'}
                onPress={() => setNewGoal({...newGoal, priority: 'medium'})}
                style={[styles.chip, { borderColor: '#ff9800' }]}
                textStyle={newGoal.priority === 'medium' ? { color: '#ff9800' } : { color: '#ff9800' }}
              >
                Medium
              </Chip>
              <Chip
                selected={newGoal.priority === 'low'}
                onPress={() => setNewGoal({...newGoal, priority: 'low'})}
                style={[styles.chip, { borderColor: '#4caf50' }]}
                textStyle={newGoal.priority === 'low' ? { color: '#4caf50' } : { color: '#4caf50' }}
              >
                Low
              </Chip>
            </View>
            
            <Button
              mode="contained"
              onPress={handleCreateGoal}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Create Smart Goal
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <View>
          {activeGoals.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.title}>Active Goals</Title>
                
                {activeGoals.map((goal) => {
                  const daysLeft = calculateDaysLeft(goal.deadline);
                  const isOverdue = daysLeft < 0;
                  
                  return (
                    <Card key={goal.id} style={styles.goalCard}>
                      <Card.Content>
                        <View style={styles.goalHeader}>
                          <View>
                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text style={styles.goalSubtitle}>
                              ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                            </Text>
                          </View>
                          <Chip
                            style={{ backgroundColor: getPriorityColor(goal.priority) }}
                            textStyle={{ color: 'white', fontSize: 12 }}
                          >
                            {getPriorityLabel(goal.priority)}
                          </Chip>
                        </View>
                        
                        <ProgressBar 
                          progress={goal.progress / 100} 
                          color={getPriorityColor(goal.priority)}
                          style={styles.progressBar}
                        />
                        
                        <Text style={styles.progressText}>
                          {goal.progress.toFixed(1)}% Complete
                        </Text>
                        
                        <View style={styles.goalDetails}>
                          <Text style={styles.detailText}>
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </Text>
                          <Text style={[styles.detailText, isOverdue ? { color: '#f44336' } : {}]}>
                            Days Left: {isOverdue ? `Overdue by ${Math.abs(daysLeft)}` : daysLeft}
                          </Text>
                        </View>
                        
                        <Text style={styles.aiSuggestion}>
                          AI Suggestion: Save ₹{goal.suggestedWeekly}/week or ₹{goal.suggestedMonthly}/month
                        </Text>
                        
                        <View style={styles.contributionSection}>
                          <TextInput
                            label="Add Contribution"
                            style={styles.contributionInput}
                            mode="outlined"
                            keyboardType="numeric"
                            placeholder="Enter amount"
                            left={<TextInput.Affix text="₹" />}
                          />
                          <Button
                            mode="contained"
                            onPress={() => {
                              const amount = prompt("Enter contribution amount");
                              if (amount) handleAddContribution(goal.id, amount);
                            }}
                            style={styles.contributionButton}
                          >
                            Add
                          </Button>
                        </View>
                        
                        <View style={styles.goalActions}>
                          <Button
                            mode="outlined"
                            onPress={() => handleDeleteGoal(goal.id)}
                            style={styles.deleteButton}
                            textColor="#f44336"
                          >
                            Delete
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  );
                })}
              </Card.Content>
            </Card>
          )}
          
          {completedGoals.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.title}>Completed Goals</Title>
                
                {completedGoals.map((goal) => (
                  <Card key={goal.id} style={[styles.goalCard, styles.completedGoal]}>
                    <Card.Content>
                      <View style={styles.goalHeader}>
                        <View>
                          <Text style={styles.goalTitle}>{goal.title}</Text>
                          <Text style={styles.goalSubtitle}>
                            ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                          </Text>
                        </View>
                        <Chip style={{ backgroundColor: '#4caf50' }} textStyle={{ color: 'white' }}>
                          Completed
                        </Chip>
                      </View>
                      
                      <ProgressBar 
                        progress={1} 
                        color="#4caf50"
                        style={styles.progressBar}
                      />
                      
                      <Text style={styles.progressText}>
                        100% Complete ✓
                      </Text>
                      
                      <Text style={styles.completionDate}>
                        Completed on: {new Date(goal.createdAt).toLocaleDateString()}
                      </Text>
                      
                      <View style={styles.goalActions}>
                        <Button
                          mode="outlined"
                          onPress={() => handleDeleteGoal(goal.id)}
                          style={styles.deleteButton}
                          textColor="#f44336"
                        >
                          Delete
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>
          )}
          
          {goals.length === 0 && (
            <Card style={styles.card}>
              <Card.Content style={styles.emptyState}>
                <Text style={styles.emptyText}>No savings goals yet</Text>
                <Text style={styles.emptySubtext}>Create your first savings goal to start tracking!</Text>
                <Button
                  mode="contained"
                  onPress={() => setActiveTab('create')}
                  style={styles.createButton}
                >
                  Create Goal
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabs: {
    flexDirection: 'row',
    margin: 16,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
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
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
  goalCard: {
    marginVertical: 8,
    elevation: 2,
  },
  completedGoal: {
    backgroundColor: '#e8f5e8',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  aiSuggestion: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6200ee',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#e8eaf6',
    borderRadius: 4,
  },
  contributionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contributionInput: {
    flex: 1,
    marginRight: 8,
  },
  contributionButton: {
    height: 56,
    justifyContent: 'center',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  completionDate: {
    fontSize: 12,
    color: '#4caf50',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#6200ee',
  },
});

export default SavingsGoalScreen;