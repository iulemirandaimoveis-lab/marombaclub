import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D58A1F",
        "primary-light": "#F5C842",
        background: "#ECEAE4",
        surface: "#E2E0D9",
        "surface-secondary": "#D8D6CE",
        foreground: "#1A1A1A",
        muted: "#6B6B6B",
        danger: "#EF4444",
        warning: "#F59E0B",
        success: "#22C55E",
        border: "rgba(213,138,31,0.20)",
      },
      fontFamily: {
        display: ["var(--font-anton)", "Anton", "Impact", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-gold":
          "linear-gradient(135deg, #D58A1F 0%, #F5C842 50%, #D58A1F 100%)",
        "gradient-gold-dark":
          "linear-gradient(135deg, #D58A1F 0%, #B8750F 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)",
        "gradient-surface":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "gradient-neon":
          "linear-gradient(135deg, #D58A1F 0%, #F5C842 50%, #D58A1F 100%)",
      },
      boxShadow: {
        gold: "0 0 30px rgba(213,138,31,0.35), 0 0 60px rgba(213,138,31,0.1)",
        "gold-sm": "0 0 15px rgba(213,138,31,0.25)",
        neon: "0 0 30px rgba(213,138,31,0.35), 0 0 60px rgba(213,138,31,0.1)",
        "neon-sm": "0 0 15px rgba(213,138,31,0.25)",
        glass: "0 8px 32px rgba(0,0,0,0.5)",
        card: "0 4px 24px rgba(0,0,0,0.6)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(213,138,31,0.1)",
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        xl: "28px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(213,138,31,0.35)" },
          "50%": { boxShadow: "0 0 50px rgba(213,138,31,0.7)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
