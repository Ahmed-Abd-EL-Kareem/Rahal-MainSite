import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--color-surface)",
          dim: "var(--color-surface-dim)",
          bright: "var(--color-surface-bright)",
          "container-lowest": "var(--color-surface-container-lowest)",
          "container-low": "var(--color-surface-container-low)",
          container: "var(--color-surface-container)",
          "container-high": "var(--color-surface-container-high)",
          "container-highest": "var(--color-surface-container-highest)",
        },
        "on-surface": {
          DEFAULT: "var(--color-on-surface)",
          variant: "var(--color-on-surface-variant)",
        },
        "inverse-surface": "var(--color-inverse-surface)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        outline: {
          DEFAULT: "var(--color-outline)",
          variant: "var(--color-outline-variant)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          container: "var(--color-primary-container)",
          fixed: "var(--color-primary-fixed)",
          "fixed-dim": "var(--color-primary-fixed-dim)",
        },
        "on-primary": {
          DEFAULT: "var(--color-on-primary)",
          container: "var(--color-on-primary-container)",
          fixed: "var(--color-on-primary-fixed)",
          "fixed-variant": "var(--color-on-primary-fixed-variant)",
        },
        "inverse-primary": "var(--color-inverse-primary)",
        secondary: {
          DEFAULT: "var(--color-secondary)",
          container: "var(--color-secondary-container)",
          fixed: "var(--color-secondary-fixed)",
          "fixed-dim": "var(--color-secondary-fixed-dim)",
        },
        "on-secondary": {
          DEFAULT: "var(--color-on-secondary)",
          container: "var(--color-on-secondary-container)",
          fixed: "var(--color-on-secondary-fixed)",
          "fixed-variant": "var(--color-on-secondary-fixed-variant)",
        },
        tertiary: {
          DEFAULT: "var(--color-tertiary)",
          container: "var(--color-tertiary-container)",
          fixed: "var(--color-tertiary-fixed)",
          "fixed-dim": "var(--color-tertiary-fixed-dim)",
        },
        "on-tertiary": {
          DEFAULT: "var(--color-on-tertiary)",
          container: "var(--color-on-tertiary-container)",
          fixed: "var(--color-on-tertiary-fixed)",
          "fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          container: "var(--color-error-container)",
        },
        "on-error": {
          DEFAULT: "var(--color-on-error)",
          container: "var(--color-on-error-container)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          container: "var(--color-success-container)",
        },
        "on-success": {
          DEFAULT: "var(--color-on-success)",
          container: "var(--color-on-success-container)",
        },
        background: "var(--color-background)",
        "on-background": "var(--color-on-background)",
        "surface-variant": "var(--color-surface-variant)",
        "pharaoh-gold": "var(--color-pharaoh-gold)",
        "nile-blue": "var(--color-nile-blue)",
        "papyrus-green": "var(--color-papyrus-green)",
        "obsidian": "var(--color-obsidian)",
        "sand-dark": "var(--color-sand-dark)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        "arabic-display": ["var(--font-noto-naskh)", "serif"],
        "arabic-body": ["var(--font-cairo)", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      maxWidth: {
        container: "1600px",
      },
      spacing: {
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
      },
      boxShadow: {
        "card-rest": "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      },
      backdropBlur: {
        nav: "20px",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'ken-burns': 'kenBurns 20s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        kenBurns: { '0%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
      },
      animationDelay: {
        '1': '80ms',
        '2': '160ms',
        '3': '240ms',
        '4': '320ms',
        '5': '400ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
