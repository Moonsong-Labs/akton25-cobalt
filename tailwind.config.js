/** @type {import('tailwindcss').Config} */
export default {
  content: ["./web/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        "dnd-gold": "#d4af37",
        "dnd-copper": "#b87333",
        "dnd-brown": "#8b4513",
        "dnd-dark": "#1a1a1a",
        "dnd-darker": "#2c1810",
        "dnd-cream": "#f0e6d2",
      },
      fontFamily: {
        medieval: ["MedievalSharp", "cursive"],
        cinzel: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [],
};
