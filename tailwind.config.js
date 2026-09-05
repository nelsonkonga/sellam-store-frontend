/** @type {import('tailwindcss').Config} */
export default {
  // "class" permet de piloter le dark mode manuellement en ajoutant/retirant
  // la classe "dark" sur <html> (plutôt que de suivre uniquement les préférences système)
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "sans-serif"],
        display: ["Plus Jakarta Sans", "Manrope", "sans-serif"],
        mono: ["DM Mono", "ui-monospace", "monospace"],
      },
      colors: {
        primary: "#006547",
        "primary-hover": "#12805c",
        body: "#f1fcf5",
        section: "#ffffff",
        divider: "#bdc9c1",
        "text-primary": "#141e1a",
        "text-muted": "#6e7a72",
        brand: {
          50: "#effcf4",
          100: "#d8f8e5",
          200: "#b2efd0",
          300: "#7fddb4",
          400: "#4fc494",
          500: "#12805c",
          600: "#006547",
          700: "#005138",
          800: "#003f2d",
          900: "#002d21",
          950: "#001c15",
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.7s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
