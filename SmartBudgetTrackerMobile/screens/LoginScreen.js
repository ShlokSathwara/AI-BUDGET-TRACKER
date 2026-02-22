import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Title, HelperText } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const theme = useTheme();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
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
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isLoginMode && !validatePassword(password)) {
      newErrors.password = 'Password must contain 8+ characters, uppercase, lowercase, and number';
    }
    
    if (!isLoginMode && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLoginMode) {
        // Login successful
        if (data.requiresEmailVerification) {
          Alert.alert(
            'Email Verification Required',
            'Please verify your email address before logging in. Check your inbox for the verification email.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Store user data
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          token: data.token,
          emailVerified: data.user.emailVerified
        };
        
        onLogin(userData);
      } else {
        // Signup successful
        Alert.alert(
          'Registration Successful',
          'Please check your email for the verification link to complete your registration.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                setIsLoginMode(true);
                setPassword('');
                setConfirmPassword('');
              }
            }
          ]
        );
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setPassword('');
    setConfirmPassword('');
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
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </Title>
            <Text style={styles.subtitle}>
              {isLoginMode ? 'Sign in to your account' : 'Join Smart Budget Tracker'}
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
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              style={styles.input}
              mode="outlined"
              placeholder={isLoginMode ? "Enter your password" : "Create a strong password"}
              secureTextEntry={!showPassword}
              error={!!errors.password}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}
            {!isLoginMode && (
              <HelperText type="info">
                Must contain 8+ characters, uppercase, lowercase, and number
              </HelperText>
            )}
            
            {!isLoginMode && (
              <>
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  error={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
              </>
            )}
            
            <Button
              mode="contained"
              onPress={handleAuth}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              labelStyle={styles.buttonText}
            >
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </Button>
            
            <Button
              mode="text"
              onPress={toggleMode}
              disabled={isLoading}
              style={styles.toggleButton}
              labelStyle={styles.toggleButtonText}
            >
              {isLoginMode 
                ? "Don't have an account? Create one" 
                : "Already have an account? Sign in"
              }
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
  toggleButton: {
    marginTop: 10,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#6200ee',
  },
  securityNote: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
  },
});

export default LoginScreen;