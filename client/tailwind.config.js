export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Lightened dark mode colors
        dark: {
          900: '#1a202c', // Lighter dark blue-gray
          800: '#2d3748', // Lighter gray-blue
          700: '#4a5568', // Medium gray-blue
          600: '#718096', // Medium-light gray-blue
          500: '#a0aec0', // Light gray-blue
        }
      },
      backgroundColor: {
        // Lighter dark mode background gradients
        'dark-gradient': 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
        'dark-card': 'rgba(45, 55, 72, 0.8)',
        'dark-glass': 'rgba(74, 85, 104, 0.4)',
      }
    }
  },
  plugins: [],
};
