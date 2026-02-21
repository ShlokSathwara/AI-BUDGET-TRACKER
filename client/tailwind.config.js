export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced dark mode colors - much darker
        dark: {
          900: '#000000', // Pure black
          800: '#0a0a0a', // Very dark gray
          700: '#121212', // Dark gray
          600: '#1a1a1a', // Medium dark gray
          500: '#2d2d2d', // Gray
        }
      },
      backgroundColor: {
        // Dark mode background gradients
        'dark-gradient': 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #121212 100%)',
        'dark-card': 'rgba(10, 10, 10, 0.8)',
        'dark-glass': 'rgba(0, 0, 0, 0.25)',
      }
    }
  },
  plugins: [],
};
