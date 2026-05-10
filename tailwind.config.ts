import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        brand: {
          card: '#F9F9F9',
          text: '#1A1A1A',
          secondary: '#999999',
          divider: '#EEEEEE',
          danger: '#EF4444',
        },
      },
      fontSize: {
        'page-title': ['18px', { fontWeight: '700' }],
        'card-title': ['16px', { fontWeight: '700' }],
        'body': ['14px', { fontWeight: '400' }],
        'secondary': ['12px', { fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};

export default config;
