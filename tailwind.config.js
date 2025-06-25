const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--basa-primary))",
          foreground: "hsl(var(--basa-navy))",
          50: "#f0f4f8",
          100: "#d9e2ec",
          500: "#1B365D",
          600: "#15294d",
          700: "#0f1d3a",
          900: "#102a43",
        },
        secondary: {
          DEFAULT: "hsl(var(--basa-secondary))",
          foreground: "hsl(var(--basa-navy))",
          50: "#FFF9E3",
          100: "#FFF3B0",
          500: "#FFD700",
          600: "#FFC300",
          700: "#FFB300",
        },
        accent: {
          DEFAULT: "hsl(var(--basa-accent))",
          foreground: "hsl(var(--basa-white))",
          50: "#f0fdfa",
          500: "#17A2B8",
          600: "#1391a5",
          700: "#0f7d8f",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        // Enhanced BASA color system
        basa: {
          // Primary brand colors
          navy: {
            DEFAULT: "#1B365D",
            light: "#243b53",
            dark: "#15294d",
            50: "#f0f4f8",
            100: "#d9e2ec",
            200: "#bcccdc",
            300: "#9fb3c8",
            400: "#829ab1",
            500: "#1B365D",
            600: "#15294d",
            700: "#0f1d3a",
            800: "#243b53",
            900: "#102a43",
          },
          gold: {
            DEFAULT: "#FFD700",
            light: "#FFECB3",
            dark: "#FFC300",
            50: "#FFF9E3",
            100: "#FFF3B0",
            200: "#FFE066",
            300: "#FFD700",
            400: "#FFC300",
            500: "#FFD700",
            600: "#FFC300",
            700: "#FFB300",
            800: "#FFAA00",
            900: "#FF9900",
          },
          teal: {
            DEFAULT: "#17A2B8",
            light: "#2dd4bf",
            dark: "#0f7d8f",
            50: "#f0fdfa",
            100: "#ccfbf1",
            200: "#99f6e4",
            300: "#5eead4",
            400: "#2dd4bf",
            500: "#17A2B8",
            600: "#1391a5",
            700: "#0f7d8f",
            800: "#115e59",
            900: "#134e4a",
          },
          // Semantic colors
          warm: "#fefbf7",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          
          // Neutrals
          white: { DEFAULT: "#ffffff", foreground: "hsl(var(--basa-navy))" },
          gray: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
          },
          
          // Legacy support
          primary: "hsl(var(--basa-primary))",
          secondary: "hsl(var(--basa-secondary))",
          accent: "hsl(var(--basa-accent))",
          warm: "hsl(var(--basa-warm))",
          success: "hsl(var(--basa-success))",
          warning: "hsl(var(--basa-warning))",
          error: "hsl(var(--basa-error))",
          charcoal: "hsl(var(--basa-charcoal))",
          "light-gray": "hsl(var(--basa-light-gray))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
        body: ["Inter", "Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Additional user-friendly sizes
        'hero-sm': ['2rem', { lineHeight: '1.3' }],
        'hero-md': ['2.5rem', { lineHeight: '1.2' }],
        'hero-lg': ['3rem', { lineHeight: '1.2' }],
        'section-sm': ['1.75rem', { lineHeight: '1.4' }],
        'section-md': ['2rem', { lineHeight: '1.3' }],
        'section-lg': ['2.5rem', { lineHeight: '1.3' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "scale-in": "scale-in 0.6s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-accent': 'var(--gradient-accent)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'navy': '0 2px 20px rgba(27, 54, 93, 0.15)',
        'gold': '0 4px 15px rgba(212, 165, 116, 0.3)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};