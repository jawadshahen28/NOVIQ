import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noviq: {
          black: 'var(--noviq-black)',
          pure: 'var(--noviq-pure)',
          secondary: 'var(--noviq-secondary)',
          card: 'var(--noviq-card)',
          cardHover: 'var(--noviq-card-hover)',
          border: 'var(--noviq-border)',
          luxuryBorder: 'var(--noviq-gold-border)',
          productBorder: 'var(--noviq-gold-border)',
          gold: 'rgb(var(--noviq-gold-rgb) / <alpha-value>)',
          goldHover: 'rgb(var(--noviq-gold-hover-rgb) / <alpha-value>)',
          darkGold: 'rgb(var(--noviq-gold-dark-rgb) / <alpha-value>)',
          goldBorder: 'var(--noviq-gold-border)',
          text: 'var(--noviq-text)',
          secondaryText: 'var(--noviq-secondary-text)',
          productText: 'var(--noviq-product-text)',
          muted: 'var(--noviq-muted)',
          whatsapp: 'var(--noviq-whatsapp)',
        },
      },
      fontFamily: {
        brand: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        heading: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'],
        body: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
