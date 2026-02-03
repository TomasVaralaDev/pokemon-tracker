/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- LISÄÄ TÄMÄ RIVI
  theme: {
    extend: {},
  },
  plugins: [],
}