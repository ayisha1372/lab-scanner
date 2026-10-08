/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        paper: '#F5F7FA',
        panel: '#FFFFFF',

        ink: {
          DEFAULT: '#172033',
          soft: '#4B5567',
          faint: '#8B95A5',
        },

        line: '#D9DEE7',

        signal: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          tint: '#E8F0FF',
        },

        st: {
          available: '#1F8A5B',
          occupied: '#C13B3B',
          maintenance: '#C48A1C',
          disabled: '#5C6670',
        },
      },
    },
  },

  plugins: [],
};