/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111813',
        court: '#1B2A1E',
        pine: '#25412C',
        moss: '#4B6B4E',
        olive: '#787B4B',
        oliveDark: '#5E613A',
        bone: '#F4F1E9',
        bone2: '#EAE6DA',
        chalk: '#FCFBF7',
        ball: '#DFF24C',
        stone: '#6B7269',
      },
      fontFamily: {
        display: ['"Rubik"', 'system-ui', 'sans-serif'],
        sans: ['"Heebo"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        panel: '28px',
      },
    },
  },
  plugins: [],
}
