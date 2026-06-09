import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1923",
          50: "#F0F2F4",
          100: "#DDE2E7",
          200: "#B8C2CC",
          300: "#8A97A4",
          400: "#5C6B7A",
          500: "#3D4F5F",
          600: "#2B3A47",
          700: "#1E2C38",
          800: "#141F2A",
          900: "#0F1923",
        },
        energy: {
          DEFAULT: "#1A8FE3",
          light: "#4AAFF7",
          dark: "#0E6AB0",
          faint: "#EBF5FD",
        },
        cap: {
          DEFAULT: "#7B5EA7",
          light: "#A07DC8",
          dark: "#5A3F82",
          faint: "#F2EEF9",
        },
        svc: {
          DEFAULT: "#2DAA70",
          light: "#4DC98A",
          dark: "#1E7D51",
          faint: "#EAF7F1",
        },
        sell: {
          DEFAULT: "#E05A2B",
          faint: "#FDF0EB",
        },
        buy: {
          DEFAULT: "#1A8FE3",
          faint: "#EBF5FD",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        surface: {
          DEFAULT: "#FFFFFF",
          2: "#F8FAFC",
          3: "#F1F5F9",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
