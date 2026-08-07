/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "**/*.ejs",
    "public/js/**/*.js",
    "!node_modules/**"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#e4e8f0',
          200: '#c8d1e0',
          300: '#9fb0cb',
          400: '#6f8ab0',
          500: '#4c6b94',
          600: '#3b5376',
          700: '#30435f',
          800: '#2a3a51',
          900: '#273347',
          950: '#1a2230',
        },
        brand: {
          orange: '#FF5A1F', // Eye-catching, premium lead conversion CTA orange
          dark: '#0F172A',   // Clean premium slate/dark mode base
          accent: '#1E293B'  // Muted card elements
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
