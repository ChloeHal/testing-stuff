/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./*.jsx", "./*.tsx"],
  theme: {
    extend: {
      keyframes: {
        "popover-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "chip-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "popover-in": "popover-in 200ms cubic-bezier(0.23, 1, 0.32, 1)",
        "chip-in": "chip-in 150ms cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
};
