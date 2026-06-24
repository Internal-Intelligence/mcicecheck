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
        /* McDonald's brand palette */
        mcred: {
          DEFAULT: "#DA291C",
          dark: "#A6192E",
          darker: "#7A1110",
        },
        mcyellow: {
          DEFAULT: "#FFC72C",
          dark: "#E6A800",
          light: "#FFE082",
        },
        mcwhite: {
          DEFAULT: "#FFFFFF",
          cream: "#FFF8E1",
        },
        mcgray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          600: "#6B6B6B",
          800: "#27251F",
          900: "#1C1C1C",
        },
        /* Status indicators */
        scoop: {
          mint: "#2E9E5B",
          strawberry: "#C41230",
        },
        /* Legacy aliases — mapped to brand colors */
        cream: {
          50: "#FFFFFF",
          100: "#FFF8E1",
          200: "#FFE082",
        },
        cone: {
          DEFAULT: "#FFC72C",
          dark: "#E6A800",
        },
        mcdark: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E5E5E5",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(218, 41, 28, 0.12)",
        float: "0 8px 32px rgba(0, 0, 0, 0.2)",
        mcglow: "0 4px 20px rgba(255, 199, 44, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;