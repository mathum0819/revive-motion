/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mode: {
          normal: {
            bg: '#f0fdf4',
            border: '#bbf7d0',
            badge: '#15803d',
            pill: '#dcfce7',
            accent: '#16a34a',
            text: '#166534'
          },
          light: {
            bg: '#f0f9ff',
            border: '#bae6fd',
            badge: '#0369a1',
            pill: '#e0f2fe',
            accent: '#0284c7',
            text: '#075985'
          },
          recovery: {
            bg: '#faf5ff',
            border: '#e9d5ff',
            badge: '#7e22ce',
            pill: '#f3e8ff',
            accent: '#9333ea',
            text: '#6b21a8'
          },
          rescue: {
            bg: '#fffbeb',
            border: '#fde68a',
            badge: '#b45309',
            pill: '#fef3c7',
            accent: '#d97706',
            text: '#92400e'
          },
          safety: {
            bg: '#fff1f2',
            border: '#fecdd3',
            badge: '#be123c',
            pill: '#ffe4e6',
            accent: '#e11d48',
            text: '#9f1239'
          }
        }
      }
    },
  },
  plugins: [],
}
