/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'custom-bottom-gradient' : "#7E6363",
        'custom-top-gradient' : "#A87C7C",
      }
    },
  },
  plugins: [],
}

