import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Sparkles, ArrowRight } from 'lucide-react';

const WelcomeScreen = ({ onComplete, isAuthenticated }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Slides for the welcome carousel
  const slides = [
    {
      title: "Welcome to AI Budget Tracker",
      subtitle: "Your Personal Finance Assistant",
      description: "Track expenses, set goals, and optimize your spending with AI-powered insights.",
      gradient: "from-blue-600 via-purple-600 to-indigo-700",
      icon: Wallet
    },
    {
      title: "Smart Analytics",
      subtitle: "Visualize Your Finances",
      description: "Understand your spending patterns with beautiful charts and AI-generated insights.",
      gradient: "from-emerald-600 via-teal-600 to-cyan-700",
      icon: Sparkles
    },
    {
      title: "Achieve Financial Goals",
      subtitle: "Plan & Save Smarter",
      description: "Set saving goals and get personalized recommendations to reach them faster.",
      gradient: "from-amber-600 via-orange-600 to-red-700",
      icon: ArrowRight
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(() => {
        if (!isAnimating) {
          setIsAnimating(true);
          setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
            setIsAnimating(false);
          }, 300);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentSlide, isAnimating, slides.length, isAuthenticated]);

  const handleSkip = () => {
    onComplete();
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 20,
              height: Math.random() * 100 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Welcome Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100, rotateY: 90 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -100, rotateY: -90 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="text-center"
          >
            {/* Animated Icon */}
            <motion.div
              className={`inline-flex p-6 mb-8 rounded-2xl bg-gradient-to-br ${slides[currentSlide].gradient} shadow-2xl`}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <CurrentIcon className="h-16 w-16 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className={`bg-gradient-to-r ${slides[currentSlide].gradient} bg-clip-text text-transparent`}>
                {slides[currentSlide].title}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-2xl text-gray-300 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-lg text-gray-400 mb-12 max-w-lg mx-auto leading-relaxed"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {slides[currentSlide].description}
            </motion.p>

            {/* Slide Indicators */}
            <div className="flex justify-center mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`w-3 h-3 rounded-full mx-2 transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.button
                onClick={handleNext}
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                onClick={handleSkip}
                className="px-8 py-4 text-white rounded-full font-semibold text-lg hover:underline transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Skip
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with creator info */}
      <motion.footer 
        className="absolute bottom-6 left-0 right-0 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.p 
          className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          animate={{ 
            scale: [1, 1.05, 1],
            textShadow: [
              "0 0 5px rgba(96, 165, 250, 0.5)",
              "0 0 20px rgba(96, 165, 250, 0.8)",
              "0 0 5px rgba(96, 165, 250, 0.5)"
            ]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Made by Shlok Sathwara
        </motion.p>
      </motion.footer>
    </div>
  );
};

export default WelcomeScreen;