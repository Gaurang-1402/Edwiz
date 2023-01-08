/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      '128': '32rem',
    },
  },
  plugins: [
    require("daisyui"),
    require('tailwind-scrollbar')({ nocompatible: true })
  ],
  daisyui: {
    themes: ["night"],
  },
}
