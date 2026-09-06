/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // CourtCheck brand: black · white · lime-green
        ink: '#0D0D0D',
        court: '#141414',
        pine: '#1E1E1E',
        moss: '#6B7280',
        olive: '#0D0D0D',
        oliveDark: '#1A1A1A',
        bone: '#F6F7F5',
        bone2: '#ECEEEA',
        chalk: '#FFFFFF',
        ball: '#A6D720',
        stone: '#6B7280',
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
