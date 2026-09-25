import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // These five are CSS variables (see app/globals.css) so they flip with the
        // `.dark` class on <html>. Everything else stays a fixed hex value.
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        // Fixed near-black used for chrome that should stay dark in both themes
        // (sidebar, modal backdrop) — this is the old constant "ink" value.
        midnight: '#14181F',
        cobalt: {
          50: '#EEF2FC',
          100: '#DCE4F9',
          400: '#3F63D6',
          500: '#2952CC',
          600: '#20409E',
          900: '#101F45'
        },
        amber: { 100: '#FCEBD8', 500: '#C2691D', 700: '#8F4C13' },
        moss: { 100: '#DFEEE1', 500: '#2F7A44', 700: '#215A32' },
        clay: { 100: '#F6DEDC', 500: '#B8433C', 700: '#8A2F2A' }
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        panel: '0 1px 2px rgba(20,24,31,0.04)'
      }
    }
  },
  plugins: []
};
export default config;
