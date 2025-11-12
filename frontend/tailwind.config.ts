import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E79FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0F172A",
          foreground: "#E2E8F0",
        },
        success: "#22c55e",
        warning: "#fbbf24",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".card": {
          "@apply rounded-2xl bg-secondary/80 backdrop-blur shadow-lg border border-white/5": {},
        },
      });
    }),
  ],
} satisfies Config;

