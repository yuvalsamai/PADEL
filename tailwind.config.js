/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10231C',
        court: '#14352B',
        pine: '#1C4A3A',
        moss: '#2E6A54',
        bone: '#F4F0E6',
        bone2: '#EAE4D5',
        chalk: '#FBF9F3',
        ball: '#DDEB3D',
        stone: '#6B7269',
      },
      fontFamily: {
        serif: ['"Frank Ruhl Libre"', 'Georgia', 'serif'],
        sans: ['"Heebo"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.22em',
      },
    },
  },
  plugins: [],
}
