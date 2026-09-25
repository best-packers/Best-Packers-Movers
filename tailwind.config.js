/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      colors: {
        brand: {
          dark: "#0a1128",
          primary: "#1e3a8a",
          secondary: "#2563eb",
          accent: "#f59e0b",
          orange: "#ea580c",
          gold: "#d97706",
          emerald: "#10b981",
          slate: "#0f172a",
        }
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 20px 25px -5px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 20px 35px -5px rgba(15, 23, 42, 0.12), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
        'glow': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
      }
    },
  },
  plugins: [],
};
