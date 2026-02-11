/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#e8f4fa",
          100: "#d1e9f5",
          200: "#a3d3eb",
          300: "#75bde1",
          400: "#4aa7d7",
          500: "#2872A1",
          600: "#205b81",
          700: "#184461",
          800: "#102d40",
          900: "#081620",
        },
        sky: {
          50: "#f5f9fc",
          100: "#ebf3f8",
          200: "#CBDDE9",
          300: "#b0ccd9",
          400: "#95bbc9",
          500: "#7aaab9",
          600: "#628894",
          700: "#49666f",
          800: "#31444a",
          900: "#182225",
        },
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
