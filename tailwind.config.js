/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#0A120D',
        charcoal2: '#0D1711',
        volt: '#00FF66',
        lime: '#BFFF00',
        slateGray: '#A1A1AA',
      },
      fontFamily: {
        sans: ['"Heebo"', '"Rubik"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        volt: '0 0 40px -8px rgba(0,255,102,0.55)',
      },
    },
  },
  plugins: [],
}
