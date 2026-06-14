/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  "#fff8f0",
          100: "#ffecd6",
          200: "#ffd5a8",
          300: "#ffb870",
          400: "#ff9233",
          500: "#ff6f00",
          600: "#e65c00",
          700: "#bf4a00",
          800: "#9a3c00",
          900: "#7d3200",
        },
        indigo: {
          50:  "#eef2ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
