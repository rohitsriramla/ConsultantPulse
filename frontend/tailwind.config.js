/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        devDark: '#0b1120',
        devCard: '#1e293b'
      }
    },
  },
  plugins: [],
}
