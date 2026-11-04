/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#09090B",
        surface: "#121216",
        elevated: "#1A1A20",
        card: "#16161C",
        flame: "#F06B3C",
        "flame-hover": "#FF8256",
      },
    },
  },
  plugins: [],
};

