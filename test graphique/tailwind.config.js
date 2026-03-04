/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./*.jsx", "./*.tsx"],
  theme: {
    extend: {
      keyframes: {
        "popover-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "popover-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.97)" },
        },
        "chip-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "chip-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(6px)" },
        },
      },
      animation: {
        "popover-in": "popover-in 200ms cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "popover-out": "popover-out 150ms cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "chip-in": "chip-in 150ms cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "chip-out": "chip-out 120ms cubic-bezier(0.19, 1, 0.22, 1) forwards",
      },
    },
  },
  plugins: [],
};
