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
    extend: {},
  },
  plugins: [],
};
