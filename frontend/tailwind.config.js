/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CTA / accent — brand orange (#D77E2E), `accent` is the brand tan/gold (#E3B771)
        // used for ratings, stars & highlights. Token name kept as `gold` for low-blast-radius.
        gold: {
          50:  '#F8F5F1',
          100: '#E9D9CB',
          200: '#DEBFA3',
          300: '#D7A67A',
          400: '#D59051',
          500: '#D77E2E',
          600: '#B0631D',
          700: '#8C4F18',
          800: '#6C3D12',
          900: '#4F2C0D',
          accent: '#E3B771', // ratings, stars & highlights — brand tan/gold
        },
        // Primary / chrome — brand purple, pinned to #611CD0 (vivid, tier 500) and
        // #42307B (dark, tier 700) from the official Clever Cat brand guideline.
        forest: {
          50:  '#F7F4FA',
          100: '#D5C8EA',
          200: '#B498E0',
          300: '#9468DA',
          400: '#7638DA',
          500: '#611CD0',   // brand vivid purple
          600: '#4F29A3',
          700: '#42307B',   // brand dark purple
          800: '#2C1F55',
          900: '#1D1538',
        },
        cream: {
          50:  '#FFFFFF',
          100: '#FCFCFD',   // main background
          200: '#F5F3F9',   // card background
          300: '#EAE7F3',
          400: '#DBD5EB',
        },
        // Secondary warm accent — brand coral (#DC8660)
        orange: {
          50:  '#F8F4F2', 100: '#EAD6CD', 200: '#E0B9A7', 300: '#DB9D81', 400: '#DC8660',
          500: '#D5602C', 600: '#B24F23', 700: '#91401D', 800: '#723317', 900: '#552611',
        },
        // Tertiary warm accent — brand tan/gold (#E3B771)
        teal: {
          50:  '#F8F6F1', 100: '#ECE2D2', 200: '#E5D1B0', 300: '#E2C28F', 400: '#E3B771',
          500: '#DD9D39', 600: '#C48622', 700: '#A16D1C', 800: '#7F5716', 900: '#604111',
        },
        yellow: {
          50:  '#FFFAE6', 100: '#FFF0B8', 200: '#FFE180', 300: '#FFD24D', 400: '#FBC61F',
          500: '#F6C000', 600: '#D6A600', 700: '#B08600', 800: '#8A6800', 900: '#5C4600',
        },
      },
      fontFamily: {
        // Brand primary — headings
        serif:   ['PP Pangram Sans Rounded', 'system-ui', 'sans-serif'],
        display: ['PP Pangram Sans Rounded', 'system-ui', 'sans-serif'],
        // Brand secondary — body text
        sans:    ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #D59051 0%, #D77E2E 50%, #8C4F18 100%)',
        'green-gradient':  'linear-gradient(135deg, #611CD0 0%, #42307B 100%)',
        'hero-gradient':   'linear-gradient(135deg, #FCFCFD 0%, #F7F4FA 50%, #D5C8EA 100%)',
      },
      boxShadow: {
        'gold':   '0 4px 20px rgba(215, 126, 46, 0.25)',
        'gold-lg':'0 8px 40px rgba(215, 126, 46, 0.35)',
        'card':   '0 2px 16px rgba(29, 21, 56, 0.08)',
      },
    },
  },
  plugins: [],
}
