import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Kutchmitra Light Editorial Palette
        ivory: {
          DEFAULT: "#F7F5F0",
          warm: "#F7F5F0",
          soft: "#FBFAF7",
        },
        navy: {
          DEFAULT: "#070D1E",
          950: "#070D1E", // Header, Footer, Deep Editorial moments
          900: "#0B132B", // Primary text & supporting navy
          800: "#14213D", // Supporting navy accent
          700: "#1D2F66",
        },
        text: {
          primary: "#0B132B",
          secondary: "#4A4F5C",
        },
        gold: {
          DEFAULT: "#C5A059",
          500: "#C5A059",
          600: "#B38E46",
          400: "#D8B46E",
          300: "#EBD5A4",
          100: "#FAF5E8",
        },
        sand: {
          DEFAULT: "#F7F5F0",
          50: "#FBFAF7",
          100: "#F7F5F0",
          200: "#EFECE4",
          300: "#E2DDD3",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        gold: "0 4px 20px -2px rgba(197, 160, 89, 0.25)",
        "gold-lg": "0 10px 30px -4px rgba(197, 160, 89, 0.35)",
        card: "0 2px 16px 0 rgba(11, 19, 43, 0.05)",
        "card-hover": "0 8px 30px 0 rgba(11, 19, 43, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
