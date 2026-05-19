/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0F3D2E',
          dark:    '#08281F',
          light:   '#1a5c44',
        },
        ivory: '#F7F3EA',
        gold: {
          DEFAULT: '#C9A24D',
          light:   '#D4B46A',
          dark:    '#A67E30',
        },
        charcoal: '#1E1E1E',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up':      'fadeUp 0.7s ease-out forwards',
        'fade-up-slow': 'fadeUp 0.9s ease-out 0.2s forwards',
        'fade-in':      'fadeIn 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
