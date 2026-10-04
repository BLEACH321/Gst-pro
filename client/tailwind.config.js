/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gst: {
          primary: '#07111F',
          secondary: '#F7F8F6',
          white: '#FFFFFF',
          emerald: '#00A878',
          mint: '#DDF5EC',
          risk: '#E67E22',
          error: '#D64545',
          card: '#0C182B',
          cardHover: '#12233D',
          surface: '#102038',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHighlight: 'rgba(255, 255, 255, 0.18)',
        },
        cred: {
          bg: '#07111F',
          card: '#0C182B',
          cardHover: '#12233D',
          surface: '#102038',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHighlight: 'rgba(255, 255, 255, 0.18)',
          neonGreen: '#00A878',
          neonCyan: '#00d2ff',
          neonPurple: '#a855f7',
          neonPink: '#D64545',
          gold: '#E67E22',
        },
        dark: {
          bg: '#07111F',
          card: '#0C182B',
          cardHover: '#12233D',
          surface: '#102038',
          border: 'rgba(255, 255, 255, 0.08)',
          borderGlow: '#00A878'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'subtle': '0 2px 8px 0 rgba(0, 0, 0, 0.6)',
        'cred-card': 'inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 20px 50px -15px rgba(0, 0, 0, 0.9)',
        'cred-card-hover': 'inset 0 1px 2px rgba(255, 255, 255, 0.25), 0 28px 60px -15px rgba(0, 0, 0, 1), 0 0 25px rgba(255, 255, 255, 0.04)',
        'cred-btn': '0 0 40px rgba(255, 255, 255, 0.28), 0 6px 20px rgba(0, 0, 0, 0.8)',
        'cred-emerald': '0 0 35px -5px rgba(0, 168, 120, 0.45)',
        'cred-risk': '0 0 35px -5px rgba(230, 126, 34, 0.45)',
        'cred-error': '0 0 35px -5px rgba(214, 69, 69, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
