import React, { useState } from 'react';
import { Phone, Lock, User, Loader2, AlertCircle } from 'lucide-react';

const PhoneAuth = ({ onAuthSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requestOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10 || isNaN(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'https://ai-budget-tracker-pqax.onrender.com'}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          name: name || `User_${phoneNumber.substring(6)}`
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setStep('otp');
        setSuccess('OTP sent successfully! Please check your messages.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Request OTP error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An error occurred while sending OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6 || isNaN(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'https://ai-budget-tracker-pqax.onrender.com'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          otp 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setStep('success');
        setSuccess('Authentication successful!');
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1500);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An error occurred while verifying OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await requestOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'phone' ? 'Sign In with Phone' : step === 'otp' ? 'Enter OTP' : 'Success!'}
          </h1>
          <p className="text-gray-300">
            {step === 'phone' 
              ? 'Enter your phone number to receive an OTP' 
              : step === 'otp' 
                ? `OTP sent to +91 ${phoneNumber}`
                : 'Welcome to AI Budget Tracker!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        {step === 'phone' && (
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
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                  }}
                  placeholder="Enter 10-digit phone number"
                  className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={requestOTP}
              disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter 6-digit OTP
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  placeholder="Enter OTP"
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                OTP expires in 5 minutes
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep('phone')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
              
              <button
                onClick={verifyOTP}
                disabled={isLoading || !otp || otp.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>

            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium py-2"
            >
              Resend OTP
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-green-400 font-semibold">Authentication Successful!</p>
            <p className="text-gray-300 text-sm mt-2">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneAuth;