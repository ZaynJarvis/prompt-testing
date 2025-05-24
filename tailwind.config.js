/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        editor: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          header: '#333333',
          border: '#252525',
          hover: '#2d2d2d',
          active: '#3c3c3c',
        },
        accent: {
          blue: '#007acc',
          hoverBlue: '#0066aa',
        }
      }
    },
  },
  plugins: [],
};