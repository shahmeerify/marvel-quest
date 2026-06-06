/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          surface: '#141414',
          elevated: '#1e1e1e',
        },
        accent: {
          red: '#E23636',
          darkred: '#B91C1C',
          gold: '#f5c518',
          darkgold: '#D4A017',
        },
        muted: '#9ca3af',
        success: '#22c55e',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(226,54,54,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(226,54,54,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
        'bounce-in': {
          from: { transform: 'scale(0)' },
          to: { transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
