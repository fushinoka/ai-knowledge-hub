import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e6edff",
          500: "#3b5bfd",
          600: "#2d47d6",
          700: "#2338a8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
