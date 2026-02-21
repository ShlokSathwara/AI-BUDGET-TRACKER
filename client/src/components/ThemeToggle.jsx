import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 to-black border border-gray-700' 
          : 'bg-gradient-to-r from-gray-300 to-gray-400 border border-gray-200'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`absolute flex items-center justify-center h-8 w-8 rounded-full shadow-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-900 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}
        animate={{
          x: isDarkMode ? 44 : 4,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isDarkMode ? (
          <Moon className="h-4 w-4 text-gray-300" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500" />
        )}
      </motion.div>
      
      {/* Labels */}
      <div className="absolute inset-0 flex items-center justify-between px-3">
        <Sun className={`h-3 w-3 ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} />
        <Moon className={`h-3 w-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
      </div>
    </motion.button>
  );
};

export default ThemeToggle;