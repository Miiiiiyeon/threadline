/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        cream: "#f7f4ef",
        accent: "#b3542b"
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
