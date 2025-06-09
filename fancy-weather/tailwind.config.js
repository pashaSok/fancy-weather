/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './style.css',
    '.src/main.js',    
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      animation: {
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundBlendMode: {
        'color-burn': 'color-burn',
      },
    },
  },
  plugins: [],
}

