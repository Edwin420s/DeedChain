module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'deedchain': {
          navy: '#0A192F',
          teal: '#64FFDA',
          white: '#F8FAFC',
          gray: '#A8B2D1',
          dark: '#101828'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}