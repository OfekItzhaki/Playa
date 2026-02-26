/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        whatsapp: '#25D366',
        sms: '#2196F3',
        instagram: '#E4405F',
      },
    },
  },
  plugins: [],
};
