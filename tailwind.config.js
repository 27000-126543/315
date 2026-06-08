/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#2D6A4F",
          600: "#1B4332",
          700: "#163A2B",
          800: "#0D1B16",
          900: "#091210",
        },
        amber: {
          400: "#FBBF24",
          500: "#D4A017",
          600: "#8B6914",
        },
        danger: {
          400: "#F87171",
          500: "#C1292E",
          600: "#991B1B",
        },
        safe: {
          400: "#60A5FA",
          500: "#1E6091",
          600: "#1E3A5F",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ['"Noto Sans SC"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
