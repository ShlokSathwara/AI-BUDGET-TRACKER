import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Switch, 
  Button,
  Divider
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    dailyExpenseReminder: true,
    transactionAlerts: true,
    budgetReminders: true,
    weeklyReports: false
  });

  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.log('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to reset all your data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been reset');
              navigation.navigate('Login');
            } catch (error) {
              console.log('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Notification Settings</Title>
          
          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Daily Expense Reminder</Text>
              <Text style={styles.settingDescription}>Get reminded at 9 PM to track daily expenses</Text>
            </View>
            <Switch
              value={settings.dailyExpenseReminder}
              onValueChange={() => toggleSetting('dailyExpenseReminder')}
              color="#6200ee"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Transaction Alerts</Text>
              <Text style={styles.settingDescription}>Get notified when a transaction is added</Text>
            </View>
            <Switch
              value={settings.transactionAlerts}
              onValueChange={() => toggleSetting('transactionAlerts')}
              color="#6200ee"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Budget Reminders</Text>
              <Text style={styles.settingDescription}>Get reminders when approaching budget limits</Text>
            </View>
            <Switch
              value={settings.budgetReminders}
              onValueChange={() => toggleSetting('budgetReminders')}
              color="#6200ee"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>Receive weekly spending summary</Text>
            </View>
            <Switch
              value={settings.weeklyReports}
              onValueChange={() => toggleSetting('weeklyReports')}
              color="#6200ee"
            />
          </View>
          
          <Button
            mode="contained"
            onPress={handleSaveSettings}
            style={styles.saveButton}
            labelStyle={styles.saveButtonText}
          >
            Save Settings
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Data Management</Title>
          
          <Button
            mode="outlined"
            onPress={handleResetData}
            style={styles.resetButton}
            textColor="#c62828"
            labelStyle={styles.resetButtonText}
          >
            Reset All Data
          </Button>
          
          <Text style={styles.resetDescription}>
            This will permanently delete all your financial data from this device
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>About</Title>
          <Text style={styles.aboutText}>
            Smart Budget Tracker Mobile v1.0
          </Text>
          <Text style={styles.aboutText}>
            Track your expenses on the go with this mobile app.
          </Text>
          <Text style={styles.aboutText}>
            All data is stored locally on your device for privacy.
          </Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: '#6200ee',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    marginBottom: 16,
    borderColor: '#c62828',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default SettingsScreen;