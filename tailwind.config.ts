import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brenn brand palette
        ink: {
          DEFAULT: '#0a0908',
          900: '#0a0908',
          800: '#0d0b0a',
          700: '#0f0d0c',
          600: '#14110f',
          500: '#1f1a16',
        },
        ember: {
          DEFAULT: '#E8551C',
          50: '#fef2ed',
          100: '#fdd9c8',
          200: '#fbb088',
          400: '#f08043',
          500: '#E8551C',
          600: '#c93e0d',
          700: '#a3300c',
          800: '#7a2509',
          900: '#511907',
        },
        bone: {
          DEFAULT: '#ebe6dd',
          50: '#fafaf6',
          100: '#f5f0e6',
          200: '#ebe6dd',
          300: '#d8d0c0',
          400: '#a8a193',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
