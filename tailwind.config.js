/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDFAF4',
        dark: '#212121',
        orange: '#FF6A00',
        gold: '#FFA52E',
        red: '#F21A1A',
        'dark-red': '#C81010',
        'mid-orange': '#FF8A1C',
      },
      fontFamily: {
        display: ['MuseoModerno', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
