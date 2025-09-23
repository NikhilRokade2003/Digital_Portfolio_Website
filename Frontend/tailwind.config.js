/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'float-up': {
          '0%': { transform: 'translateY(0px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'gradient-wave': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '200% 50%' },
          '75%': { backgroundPosition: '100% 100%' }
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.2)' 
          }
        },
        'morph': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      animation: {
        'float-up': 'float-up 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-wave': 'gradient-wave 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'slide-in-bottom': 'slide-in-bottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      },
      colors: {
        // Modern Purple-Blue Theme
        primary: {
          50: '#f0f4ff',
          100: '#e5edff',
          200: '#d0deff',
          300: '#b4c6ff',
          400: '#9ca3ff',
          500: '#8b5cf6', // Main brand purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065'
        },
        secondary: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a'
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald accent
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },
        // Gradient colors
        gradient: {
          from: '#667eea',
          via: '#764ba2', 
          to: '#f093fb'
        },
        // Modern glass effect colors
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          light: 'rgba(255, 255, 255, 0.05)',
          dark: 'rgba(0, 0, 0, 0.1)'
        }
      },
      backgroundImage: {
        'gradient-mesh': `
          radial-gradient(at 40% 20%, rgba(139, 92, 246, 0.4) 0, transparent 50%),
          radial-gradient(at 80% 0%, rgba(16, 185, 129, 0.4) 0, transparent 50%),
          radial-gradient(at 0% 50%, rgba(244, 114, 182, 0.4) 0, transparent 50%),
          radial-gradient(at 80% 50%, rgba(59, 130, 246, 0.4) 0, transparent 50%),
          radial-gradient(at 0% 100%, rgba(236, 72, 153, 0.4) 0, transparent 50%),
          radial-gradient(at 80% 100%, rgba(168, 85, 247, 0.4) 0, transparent 50%),
          radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.4) 0, transparent 50%)
        `,
        'aurora': `
          linear-gradient(45deg, 
            rgba(139, 92, 246, 0.1) 0%, 
            rgba(16, 185, 129, 0.1) 25%, 
            rgba(59, 130, 246, 0.1) 50%, 
            rgba(244, 114, 182, 0.1) 75%, 
            rgba(139, 92, 246, 0.1) 100%
          )
        `,
        'shimmer-gradient': `
          linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          )
        `
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon': '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
        'glow': '0 0 30px rgba(139, 92, 246, 0.4)',
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(139, 92, 246, 0.1)'
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['2rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }],
        '5xl': ['3.5rem', { lineHeight: '3.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    },
  },
  plugins: [],
}