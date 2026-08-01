import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const THEMES = { LIGHT: "light", DARK: "dark", SYSTEM: "system" };

// Applique ou retire la classe "dark" sur <html> selon la préférence résolue
function applyTheme(theme) {
  const root = document.documentElement;
  const shouldBeDark =
    theme === THEMES.DARK ||
    (theme === THEMES.SYSTEM &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", shouldBeDark);
}

/**
 * Fournit la préférence de thème ('light' | 'dark' | 'system') à toute l'application.
 * IMPORTANT: état gardé en mémoire pour la session uniquement (pas de localStorage) —
 * un rechargement de page revient donc à 'system' par défaut, volontairement.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || THEMES.DARK);

  // Applique le thème à chaque changement de préférence
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // En mode "system", réagit aux changements de préférence OS en direct
  useEffect(() => {
    if (theme !== THEMES.SYSTEM) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme(THEMES.SYSTEM);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un <ThemeProvider>");
  }
  return ctx;
}
