/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0d10',
        panel: '#14181d',
        border: '#252a31',
        accent: '#e63946',
        muted: '#8a939c',
      },
    },
  },
  plugins: [],
};
