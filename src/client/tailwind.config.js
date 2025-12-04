/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode so we can toggle it via document.documentElement.classList
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

