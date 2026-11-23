/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#447D9B',
        'brand-orange': '#FE7743',
        'brand-orange-dark': '#E8612B',
        'brand-navy': '#273F4F',
        'brand-gray': '#D7D7D7',
        emerald: '#10B981',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        standard: '8px',
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(68, 125, 155, 0.15)',
        button: '0 4px 12px rgba(254, 119, 67, 0.4)',
      },
      transitionDuration: {
        300: '300ms',
        400: '400ms',
      },
    },
  },
  plugins: [],
};
