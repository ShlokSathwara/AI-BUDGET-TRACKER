import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';

const VoiceAssistant = ({ onTransactionDetected, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  // Indian Rupee categories and merchants
  const indianCategories = {
    food: ['food', 'lunch', 'dinner', 'breakfast', 'snacks', 'restaurant', 'cafe', 'swiggy', 'zomato', 'dominos', 'mcdonalds', 'starbucks'],
    transport: ['ola', 'uber', 'auto', 'taxi', 'bus', 'train', 'metro', 'petrol', 'diesel', 'fuel'],
    shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'big bazaar', 'd mart', 'reliance', 'clothes', 'shopping'],
    entertainment: ['movie', 'netflix', 'hotstar', 'disney', 'spotify', 'concert', 'theatre'],
    utilities: ['electricity', 'water', 'internet', 'phone', 'jio', 'airtel', 'vodafone'],
    healthcare: ['doctor', 'medicine', 'hospital', 'pharmacy', 'apollo', 'fortis'],
    education: ['school', 'college', 'books', 'course', 'tuition', 'byju'],
    groceries: ['bigbasket', 'grofers', 'milk', 'vegetables', 'fruits', 'grocery']
  };

  const indianMerchants = [
    'Swiggy', 'Zomato', 'Ola', 'Uber', 'Amazon India', 'Flipkart', 'BigBasket',
    'DMart', 'Reliance Fresh', 'McDonalds India', 'Starbucks India', 'Dominos Pizza',
    'Airtel', 'Jio', 'Vodafone', 'Apollo Hospitals', 'Fortis Hospitals'
  ];

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Indian English

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setTranscript(transcript);
        
        if (event.results[0].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const processVoiceCommand = (text) => {
    setIsProcessing(true);
    
    // Extract amount (looking for rupee amounts)
    const amountRegex = /(?:rs|rupees|₹)\s*(\d+(?:\.\d+)?)/i;
    const amountMatch = text.match(amountRegex);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    // Extract merchant/business name
    let merchant = '';
    const words = text.toLowerCase().split(' ');
    
    // Check for known Indian merchants
    for (const indianMerchant of indianMerchants) {
      if (text.toLowerCase().includes(indianMerchant.toLowerCase().split(' ')[0])) {
        merchant = indianMerchant;
        break;
      }
    }

    // If no specific merchant found, use the first few words as description
    if (!merchant) {
      merchant = words.slice(0, 3).join(' ').replace(/[^a-zA-Z\s]/g, '');
    }

    // Determine category based on keywords
    let category = 'Other';
    const textLower = text.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(indianCategories)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }

    // Create transaction object
    if (amount) {
      const transaction = {
        amount: amount,
        merchant: merchant,
        description: text,
        category: category,
        type: 'debit',
        currency: 'INR'
      };

      setTimeout(() => {
        onTransactionDetected(transaction);
        setIsProcessing(false);
        setTranscript('');
      }, 1000);
    } else {
      setIsProcessing(false);
      setError('Could not detect amount in your voice command');
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError('');
      setTranscript('');
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl max-w-sm classy-element"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>AI Voice Assistant</span>
              </h3>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Listening</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-300 mb-1">Try saying:</p>
                <p className="text-white text-sm">"Spent ₹250 on Swiggy for dinner"</p>
                <p className="text-white text-sm">"Paid ₹50 for Ola ride to office"</p>
              </div>
              
              {transcript && (
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-sm">Heard:</p>
                  <p className="text-white">{transcript}</p>
                </div>
              )}
              
              {isProcessing && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              )}
              
              {error && (
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center classy-button ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse-glow' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;