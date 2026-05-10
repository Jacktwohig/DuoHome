import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        border: "#E7E5E4",
        primary: {
          DEFAULT: "#E8526A",
          50: "#fdf2f4",
          100: "#fce7ea",
          200: "#f9d2d8",
          300: "#f5adb8",
          400: "#ef7f92",
          500: "#E8526A",
          600: "#d43554",
          700: "#b22645",
          800: "#952239",
          900: "#7e2035",
          950: "#450d1a",
        },
        indigo: {
          DEFAULT: "#6366F1",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366F1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Module colors
        finance: "#10B981",
        calendar: "#6366F1",
        chores: "#F59E0B",
        goals: "#8B5CF6",
        meals: "#EF4444",
        habits: "#06B6D4",
        notes: "#64748B",
        activities: "#F97316",
        // Text
        "text-primary": "#1C1917",
        "text-muted": "#78716C",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)",
        modal:
          "0 20px 60px -10px rgba(0,0,0,0.15), 0 8px 25px -8px rgba(0,0,0,0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        confetti: "confetti 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        confetti: {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "50%": { transform: "scale(1.3) rotate(180deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(360deg)", opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
