/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#5849AC',
          'purple-secondary': '#796DBD',
          'purple-light': '#9B92CD',
          'purple-pale': '#DEDBEE',
        },
      },
    },
  },
  plugins: [],
};
