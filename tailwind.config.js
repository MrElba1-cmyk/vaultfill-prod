/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#050711",
          card: "rgba(255,255,255,0.08)",
          cardBorder: "rgba(255,255,255,0.18)",
          accent: "#7C3AED"
        }
      },
      boxShadow: {
        glass: "0 20px 50px rgba(0,0,0,0.35)",
      },
      backdropBlur: {
        glass: "14px",
      },
    },
  },
  plugins: [],
};

