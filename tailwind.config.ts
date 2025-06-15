
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./layouts/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      inter: ["Inter", "Roboto", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B0000",
          faint: "#B22222",
          light: "#FCECED",
        },
        background: "#FFFFFF",
        sidebar: "#F8F8F8",
        "sidebar-active": "#FFF8F8",
        muted: "#F3F4F6",
        border: "#E5E7EB",
        "text-main": "#1a1a1a",
        "text-muted": "#555",
        label: "#8B0000",
        success: "#2EBC7A",
        warning: "#FFC107",
        destructive: "#E53E3E",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontSize: {
        "2xl": ["2rem", "2.5rem"],
      },
      boxShadow: {
        smooth: "0 4px 16px rgba(139,0,0,0.07)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
