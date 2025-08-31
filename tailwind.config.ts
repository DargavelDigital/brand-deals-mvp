/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/(*)/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  safelist: [
    'container-page',
    'bg-[var(--card)]',
    'border-[var(--border)]',
    'text-[var(--muted-fg)]',
    // Card layout classes to prevent purging
    'rounded-2xl',
    'border',
    'border-[var(--border)]',
    'bg-[var(--card)]',
    'shadow-sm',
    'p-4',
    'p-5',
    'px-4',
    'py-3'
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem"
      }
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        success: "var(--success)",
        warn: "var(--warn)",
        error: "var(--error)",
        info: "var(--info)",
        pending: "var(--pending)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)"
      },
      fontFamily: {
        sans: ["Inter var", "ui-sans-serif", "system-ui"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      screens: {
        sm: "375px",
        md: "768px",
        lg: "1024px",
        xl: "1440px"
      }
    }
  },
  plugins: []
}
