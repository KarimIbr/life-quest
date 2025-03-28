/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4ade80',
          dark: '#22c55e',
        },
        secondary: {
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
        },
        background: {
          DEFAULT: '#1a1b1e',
          light: '#2c2e33',
          dark: '#141517',
        },
        surface: {
          DEFAULT: '#2c2e33',
          light: '#3f4249',
          dark: '#232529',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} 