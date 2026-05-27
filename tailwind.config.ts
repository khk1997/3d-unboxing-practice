import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101314',
        paper: '#f5f1e8',
        rust: '#b35c34',
        moss: '#51624d',
        brass: '#c7a15b',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 80px rgb(16 19 20 / 0.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
