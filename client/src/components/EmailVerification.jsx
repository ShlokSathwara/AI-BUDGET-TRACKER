import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';

const EmailVerification = ({ onVerificationSuccess }) => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (!token || !email) {
          throw new Error('Invalid verification link');
        }

        const response = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Redirect after delay
        setTimeout(() => {
          onVerificationSuccess(data.user);
        }, 2000);

      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setError(err.message);
        setMessage('Email verification failed');
      }
    };

    verifyEmail();
  }, [onVerificationSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            {status === 'verifying' && (
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Verification Successful!'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          
          <p className="text-gray-300">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-left">
                <p className="text-red-200 font-medium">Error Details:</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {status === 'error' && (
            <>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
              >
                <Loader2 className="w-5 h-5 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Back to Login
              </button>
            </>
          )}

          {status === 'success' && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-200 text-sm">
                You'll be automatically redirected to your dashboard...
              </p>
            </div>
          )}

          {status === 'verifying' && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                Please wait while we verify your email address
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-400 text-xs">
          <div className="flex items-center justify-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Secure Email Verification</span>
          </div>
          <p className="mt-1">Your data is protected with end-to-end encryption</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;