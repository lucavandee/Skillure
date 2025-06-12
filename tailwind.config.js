/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
      },
      colors: {
        midnight: {
          DEFAULT: '#0D1B2A',
          50: '#223d5e',
          100: '#1c3352',
          200: '#162a46',
          300: '#11223a',
          400: '#0d1b2a',
          500: '#09141f',
          600: '#050c14',
          700: '#020509',
          800: '#000000',
          900: '#000000',
        },
        turquoise: {
          DEFAULT: '#89CFF0',
          50: '#e6f5fc',
          100: '#ccebf9',
          200: '#b3e1f7',
          300: '#9ad7f4',
          400: '#89cff0',
          500: '#6ec4ed',
          600: '#54b9e9',
          700: '#3aaee6',
          800: '#2aa3e2',
          900: '#1998df',
        },
        lightgray: {
          DEFAULT: '#F6F6F6',
          50: '#ffffff',
          100: '#fefefe',
          200: '#fdfdfd',
          300: '#fbfbfb',
          400: '#f8f8f8',
          500: '#f6f6f6',
          600: '#f3f3f3',
          700: '#f1f1f1',
          800: '#eeeeee',
          900: '#ececec',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        'button': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      gridTemplateColumns: {
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-300': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    },
  },
  plugins: [],
};