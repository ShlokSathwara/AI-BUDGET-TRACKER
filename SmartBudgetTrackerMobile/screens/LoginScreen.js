import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Title, HelperText } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const theme = useTheme();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase()
        })
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Authentication failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Login successful
      // Store user data
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
        emailVerified: data.user.emailVerified
      };
      
      onLogin(userData);
      
    } catch (err) {
      console.error('Auth error:', err);
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              Welcome to Smart Budget Tracker
            </Title>
            <Text style={styles.subtitle}>
              Enter your details to access your account
            </Text>
            
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              style={styles.input}
              mode="outlined"
              placeholder="Enter your full name"
              error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              style={styles.input}
              mode="outlined"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}
            
            <Button
              mode="contained"
              onPress={handleAuth}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              labelStyle={styles.buttonText}
            >
              Continue
            </Button>
            
            <Text style={styles.securityNote}>
              Your data is securely stored and all communications are encrypted
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    elevation: 4,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#6200ee',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 10,
  },
  loginButton: {
    marginTop: 20,
    padding: 5,
    backgroundColor: '#6200ee',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
  },
});

export default LoginScreen;