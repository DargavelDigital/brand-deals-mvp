/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}"
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
