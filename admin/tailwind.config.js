/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: '#0F1216',
          surface: '#171B21',
          elevated: '#202630',
          hover: '#262D38',
          border: '#2A323D',
          borderStrong: '#3D4857',
        },
        safety: {
          orange: '#F97316',
          orangeDark: '#EA580C',
          yellow: '#EAB308',
          red: '#EF4444',
          green: '#10B981',
          blue: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
