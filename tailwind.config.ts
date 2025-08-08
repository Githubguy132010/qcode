import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Arial", "sans-serif"],
        mono: ["Consolas", "Monaco", "Courier New", "monospace"],
      },
      lineClamp: {
        2: '2',
        3: '3',
        4: '4',
      },
    },
  },
  plugins: [],
};

export default config;