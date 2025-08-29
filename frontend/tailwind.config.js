/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        boxShadow: {
          'inner-subtle': 'inset 0 1px 2px rgba(0,0,0,0.04)',
        },
        backgroundImage: {
          'grid': 'linear-gradient(to right, rgba(0,0,0,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.04) 1px, transparent 1px)',
        }
      }
    },
    plugins: []
  }
  