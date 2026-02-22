import React, { useState } from 'react';
import { User, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SimpleAuth = ({ onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleAuth = async () => {
    // Reset messages
    setError('');
    setSuccess('');

    // Basic validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isLoginMode) {
      // Signup validation
      if (!password) {
        setError('Please enter a password');
        return;
      }
      
      if (!validatePassword(password)) {
        setError('Password must be at least 8 characters with uppercase, lowercase, and number');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      // Login validation
      if (!password) {
        setError('Please enter your password');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      
      const response = await fetch(endpoint, {
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
          setError('Please verify your email address before logging in. Check your inbox for verification email.');
          return;
        }
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Success callback
        onAuthSuccess(data.user);
      } else {
        // Signup successful - show verification message
        setSuccess('Registration successful! Please check your email for verification link.');
        // Switch to login mode
        setIsLoginMode(true);
        setPassword('');
        setConfirmPassword('');
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-300">
            {isLoginMode ? 'Sign in to your account' : 'Join Smart Budget Tracker'}
          </p>
        </div>

        {(error || success) && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center ${
            error 
              ? 'bg-red-500/20 border border-red-500/50 text-red-200' 
              : 'bg-green-500/20 border border-green-500/50 text-green-200'
          }`}>
            {error ? <AlertCircle className="w-4 h-4 mr-2" /> : '✓'}
            {error || success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLoginMode ? "Enter your password" : "Create a strong password"}
                className="w-full pl-4 pr-12 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!isLoginMode && (
              <p className="text-xs text-gray-400 mt-1">
                Must contain 8+ characters, uppercase, lowercase, and number
              </p>
            )}
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm your password"
                  className="w-full pl-4 pr-12 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={isLoading || !name.trim() || !email.trim() || !password || (!isLoginMode && password !== confirmPassword)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-800 disabled:to-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isLoginMode ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLoginMode ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
          >
            {isLoginMode 
              ? "Don't have an account? Create one" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400 text-xs">
          <p>Your data is securely stored and protected</p>
          <p className="mt-1">All communications are encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuth;