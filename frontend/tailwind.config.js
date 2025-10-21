/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // University of Nairobi Theme Colors
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#2A68AF', // Cerulean Blue - Primary
          600: '#225a9c',
          700: '#1a4c89',
          800: '#123e76',
          900: '#0a3063',
        },
        navy: {
          50: '#e6e8ea',
          100: '#b3b8bd',
          200: '#808890',
          300: '#4d5863',
          400: '#1a2836',
          500: '#122B40', // Elephant - Deep navy
          600: '#0f2336',
          700: '#0c1b2c',
          800: '#091322',
          900: '#060b18',
        },
        accent: {
          50: '#ffe6e6',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff1a1a',
          500: '#FF492C', // Red Orange - Accent
          600: '#e63a1f',
          700: '#cc2b12',
          800: '#b31c05',
          900: '#990d00',
        }
      }
    },
  },
  plugins: [],
}