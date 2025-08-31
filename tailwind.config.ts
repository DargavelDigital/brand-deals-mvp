/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/(*)/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  safelist: [
    // CSS var backgrounds/borders/text
    { pattern: /bg-\[var\(--(bg|surface|card|tint-[a-z-]+|brand-500|brand-600|accent)\)\]/ },
    { pattern: /text-\[var\(--(fg|muted|muted-fg|accent|warn|error|info)\)\]/ },
    { pattern: /border-\[var\(--border|accent\)\]/ },

    // layout/shape/shadow/ring variants we use in conditionals
    { pattern: /rounded-(sm|md|lg|xl|2xl)/ },
    { pattern: /shadow-(sm|md|lg)/ },
    { pattern: /ring-(0|1|2)/ },
    { pattern: /ring-\[var\(--ring\)\]/ },

    // badges & chip states
    { pattern: /(bg|text|border)-(gray|neutral|zinc)-(100|200|300|500|600|700)/ },

    // token utilities we use across the app
    'bg-[var(--bg)]',
    'bg-[var(--surface)]',
    'bg-[var(--card)]',
    'bg-[var(--tint-accent)]',
    'text-[var(--fg)]',
    'text-[var(--muted-fg)]',
    'border-[var(--border)]',
    'ring-[var(--ring)]',

    // brand colors we use conditionally
    'bg-[var(--brand-500)]',
    'bg-[var(--brand-600)]',

    // common state chips used conditionally
    'bg-neutral-100','bg-neutral-200','bg-neutral-300',
    'text-neutral-600','text-neutral-700',
    'border-neutral-200','border-neutral-300',
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
