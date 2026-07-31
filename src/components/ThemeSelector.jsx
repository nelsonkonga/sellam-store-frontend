import { Sun, Moon, Monitor } from "lucide-react";
import { THEMES } from "../context/ThemeContext";

const OPTIONS = [
  { value: THEMES.LIGHT, label: "Clair", icon: Sun },
  { value: THEMES.DARK, label: "Sombre", icon: Moon },
  { value: THEMES.SYSTEM, label: "Système", icon: Monitor },
];

/**
 * Sélecteur de thème en 3 options (segmented control).
 * `onChange` est appelé avec la nouvelle valeur ; le composant parent décide
 * d'appliquer le changement au contexte ET d'appeler l'API.
 */
export default function ThemeSelector({ value, onChange, disabled }) {
  return (
    <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-medium transition ${
              isActive
                ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-700 dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <Icon size={18} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
