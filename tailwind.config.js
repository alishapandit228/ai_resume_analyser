/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10151B",
        paper: "#F7F8FA",
        panel: "#FFFFFF",
        line: "#E4E7EC",
        muted: "#6B7280",
        brand: {
          DEFAULT: "#2451B8",
          dark: "#173B8F",
          light: "#EAF0FE",
        },
        signal: {
          good: "#1C7C54",
          warn: "#B5720A",
          bad: "#B3261E",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16,21,27,0.04), 0 1px 0 rgba(16,21,27,0.03)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
