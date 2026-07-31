import { useTheme, THEMES } from "../context/ThemeContext";

/**
 * Bouton simple (icône seule) pour basculer entre clair et sombre.
 * Utilise le ThemeContext global — si le thème actuel est "system",
 * un clic le fige sur "light" ou "dark" selon ce qui est affiché à l'instant.
 * Pour choisir explicitement "Système", voir le sélecteur à 3 options
 * de la page Paramètres (ThemeSelector).
 */
export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const isCurrentlyDark =
      theme === THEMES.DARK ||
      (theme === THEMES.SYSTEM &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

  function toggle() {
    setTheme(isCurrentlyDark ? THEMES.LIGHT : THEMES.DARK);
  }

  return (
      <button
          type="button"
          onClick={toggle}
          aria-label="Basculer le mode sombre"
          className="flex h-10 w-10 items-center justify-center rounded-full
                 bg-gray-100 text-lg transition hover:bg-gray-200
                 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        {isCurrentlyDark ? "☀️" : "🌙"}
      </button>
  );
}