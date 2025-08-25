import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      width: {
        '68': '17rem', // 272px for sidebar
      },
      colors: {
        // Design System Colors - Preserved for compatibility
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
        
        // Light UI Refresh Pack Colors - New additions
        'bg': 'var(--bg)',
        'fg': 'var(--fg)',
        'muted': 'var(--muted)',
        'muted-fg': 'var(--muted-fg)',
        'card': 'var(--card)',
        'card-fg': 'var(--card-fg)',
        'border': 'var(--border)',
        'ring': 'var(--ring)',
        'brand': {
          '400': 'var(--brand-400)',
          '500': 'var(--brand-500)',
          '600': 'var(--brand-600)'
        },
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        'ds-md': '12px',
        'ds-lg': '16px',
        'ds-xl': '20px',
        '2xl': 'var(--radius-md)', // Light UI Refresh Pack radius
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'ds-tile': '0 8px 24px rgba(0,0,0,.20)',
        'card': 'var(--shadow-card)' // Light UI Refresh Pack shadow
      },
      maxWidth: {
        'content': 'var(--content-max)' // Light UI Refresh Pack max width
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
