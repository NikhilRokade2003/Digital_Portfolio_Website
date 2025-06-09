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
          50: '#e6f1fe',
          100: '#cce3fd',
          200: '#99c8fb',
          300: '#66acf9',
          400: '#3390f7',
          500: '#0074f5',
          600: '#005dc4',
          700: '#004693',
          800: '#002e62',
          900: '#001731',
        },
        secondary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        accent: {
          50: '#e3f8ff',
          100: '#b3ecff',
          200: '#81defd',
          300: '#5ed0fa',
          400: '#40c3f7',
          500: '#2bb0ed',
          600: '#1992d4',
          700: '#127fbf',
          800: '#0b69a3',
          900: '#035388',
        },
        success: {
          50: '#e3f9e5',
          100: '#c1f2c7',
          200: '#91e697',
          300: '#51ca58',
          400: '#31b237',
          500: '#18981d',
          600: '#0f8613',
          700: '#0e7817',
          800: '#07600e',
          900: '#014807',
        },
        warning: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#fce588',
          300: '#fadb5f',
          400: '#f7c948',
          500: '#f0b429',
          600: '#de911d',
          700: '#cb6e17',
          800: '#b44d12',
          900: '#8d2b0b',
        }
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'hard': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
          },
        },
      },
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'ui-serif', 'Georgia', 'serif'],
      mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
  },
  plugins: [],
}

