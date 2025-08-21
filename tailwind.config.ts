import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        'ds-bg': '#0B0E14',
        'ds-panel': '#0F141B',
        'ds-card': '#111826',
        'ds-muted': '#8A97A6',
        'ds-text': '#E6EDF3',
        'ds-border': '#1E2633',
        'ds-brand': '#7C5CFF',
        'ds-brand2': '#22D3EE',
        'ds-positive': '#34D399',
        'ds-warning': '#F59E0B',
        'ds-danger': '#F87171',
      },
      borderRadius: {
        'ds-md': '12px',
        'ds-lg': '16px',
        'ds-xl': '20px',
      },
      boxShadow: {
        'ds-tile': '0 8px 24px rgba(0,0,0,.20)',
      },
      spacing: {
        'ds-xxs': '2px',
        'ds-xs': '4px',
        'ds-s': '6px',
        'ds-sm': '8px',
        'ds-md': '12px',
        'ds-lg': '16px',
        'ds-xl': '24px',
        'ds-xxl': '32px',
        'ds-xxxl': '48px',
      },
      fontFamily: {
        'ds-body': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}

export default config
