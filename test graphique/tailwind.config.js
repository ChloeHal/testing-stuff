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
        "popover-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.95)" },
        },
        "chip-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "chip-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.9)" },
        },
      },
      animation: {
        "popover-in": "popover-in 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "popover-out": "popover-out 150ms cubic-bezier(0.55, 0, 1, 0.45) forwards",
        "chip-in": "chip-in 150ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "chip-out": "chip-out 120ms cubic-bezier(0.55, 0, 1, 0.45) forwards",
      },
    },
  },
  plugins: [],
};
