import type { Config } from 'tailwindcss';

const config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-2': 'rgb(var(--accent-2) / <alpha-value>)',
        bg: 'rgb(var(--bg) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        key: 'rgb(var(--key) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        keys: ['var(--key-font)'],
      },
      boxShadow: {
        glow: '0 0 14px rgb(var(--accent) / 0.55)',
        'glow-sm': '0 0 8px rgb(var(--accent) / 0.45)',
        keycap: 'inset 0 1px 0 rgb(255 255 255 / 0.07), 0 2px 0 rgb(0 0 0 / 0.65)',
        card: 'inset 0 1px 0 rgb(255 255 255 / 0.04), 0 8px 24px rgb(0 0 0 / 0.35)',
      },
      keyframes: {
        'screen-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-16px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        caret: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
        'ember-rise': {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0' },
          '15%': { opacity: '0.9' },
          '100%': { transform: 'translate3d(var(--drift), -110vh, 0) scale(0.3)', opacity: '0' },
        },
        'node-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(var(--accent) / 0.0)' },
          '50%': { boxShadow: '0 0 0 6px rgb(var(--accent) / 0.25)' },
        },
      },
      animation: {
        'screen-in': 'screen-in 280ms ease-out both',
        'slide-down': 'slide-down 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both',
        'sheet-up': 'sheet-up 280ms cubic-bezier(0.2, 0.9, 0.3, 1) both',
        'fade-in': 'fade-in 200ms ease-out both',
        caret: 'caret 1s steps(1) infinite',
        pop: 'pop 260ms ease-out',
        'node-pulse': 'node-pulse 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
