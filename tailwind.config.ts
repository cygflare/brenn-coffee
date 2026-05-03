import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brenn brand palette — values defined as CSS variables in globals.css
        // and swapped between dark/light themes via [data-theme="..."].
        // Token names retain their original semantic role across both themes:
        //   ink-* = surface family (darkest in dark mode, lightest in light mode)
        //   bone-* = text family (lightest in dark mode, darkest in light mode)
        //   ember-* = brand accent (unchanged across themes)
        ink: {
          DEFAULT: 'rgb(var(--c-ink-900) / <alpha-value>)',
          900: 'rgb(var(--c-ink-900) / <alpha-value>)',
          800: 'rgb(var(--c-ink-800) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          600: 'rgb(var(--c-ink-600) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
        },
        bone: {
          DEFAULT: 'rgb(var(--c-bone-200) / <alpha-value>)',
          50: 'rgb(var(--c-bone-50) / <alpha-value>)',
          100: 'rgb(var(--c-bone-100) / <alpha-value>)',
          200: 'rgb(var(--c-bone-200) / <alpha-value>)',
          300: 'rgb(var(--c-bone-300) / <alpha-value>)',
          400: 'rgb(var(--c-bone-400) / <alpha-value>)',
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
