import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        bank: {
          50: "#f3f8f7",
          100: "#dcece8",
          300: "#8db9ad",
          500: "#2f7669",
          700: "#1d5149",
          900: "#0f312d"
        },
        gold: {
          50: "#fff8e8",
          100: "#f7e3ad",
          400: "#d7a83b",
          600: "#a37118"
        }
      },
      boxShadow: {
        asset: "0 8px 24px rgba(23, 32, 51, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
