/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a0f', // Canvas near black
          900: '#0b0f17', // Main background
          850: '#111622', // Card background
          800: '#182030', // Container hover
          700: '#222d42', // Border dark
          600: '#334155', // Border muted
        },
        brand: {
          purple: '#8b5cf6',
          purpleLight: '#a78bfa',
          purpleGlow: 'rgba(139, 92, 246, 0.15)',
          teal: '#14b8a6',
          tealLight: '#2dd4bf',
          tealGlow: 'rgba(20, 184, 166, 0.15)',
          cyan: '#06b6d4',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
