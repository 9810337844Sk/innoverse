import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:          "#FF2D78",
        "primary-mid":    "#FF6B9D",
        "primary-light":  "#FFB3D1",
        "primary-pale":   "#FFF0F5",
        "primary-ultra":  "#FFF5F8",
        secondary:        "#A855F7",
        "secondary-light":"#E9D5FF",
        teal:             "#0D9488",
        "teal-light":     "#14B8A6",
        deep:             "#1A0A12",
        "deep-mid":       "#3D1A28",
        /** Legacy name — use light surfaces (app is light-first) */
        dark:             "#F1F5F9",
        "dark-card":      "#EEF2F6",
        ink:              "#1e293b",
        muted:            "#64748b",
        surface:          "#FFFFFF",
        canvas:           "#FAFBFC",
        slate:            "#6B7280",
        rose:             "#FB7185",
      },
      fontFamily: {
        sans:    ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      backgroundImage: {
        "gradient-primary":  "linear-gradient(135deg, #FF2D78 0%, #FF6B9D 100%)",
        "gradient-pink":     "linear-gradient(135deg, #FF2D78 0%, #FF6B9D 60%, #A855F7 100%)",
        "gradient-hero":     "linear-gradient(135deg, #FFF5F8 0%, #FFFFFF 50%, #FFF0F5 100%)",
      },
      boxShadow: {
        "glow":    "0 0 40px rgba(255,45,120,0.35)",
        "glow-sm": "0 0 20px rgba(255,45,120,0.25)",
        "pink":    "0 4px 24px rgba(255,45,120,0.2)",
        "card":    "0 4px 24px rgba(255,45,120,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      },
      animation: {
        "float":          "float 6s ease-in-out infinite",
        "float-slow":     "floatSlow 8s ease-in-out infinite",
        "blob":           "blob 10s ease-in-out infinite",
        "spin-slow":      "spin-slow 25s linear infinite",
        "heartbeat":      "heartbeat 2s ease-in-out infinite",
        "glow-pulse":     "glow-pulse 2.5s ease-in-out infinite",
        "shimmer":        "shimmer 2s linear infinite",
        "marquee-left":   "marquee-left 32s linear infinite",
        "marquee-right":  "marquee-right 36s linear infinite",
        "aurora-drift":   "aurora-drift 12s ease-in-out infinite",
        "soft-pop":       "soft-pop 4s ease-in-out infinite",
        "slide-up":       "slide-up 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
