import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: "#00FF66",
        bg: "#050505",
        surface: "#111111",
      },
    },
  },
  plugins: [],
};

export default config;
