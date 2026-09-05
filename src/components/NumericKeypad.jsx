import { Delete } from "lucide-react";

// Disposition classique du pavé, avec "." pour les décimales et une touche effacement
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

/**
 * Pavé numérique générique (aucune logique métier), réutilisé par tout écran
 * qui doit faire saisir un nombre rapidement sans ouvrir le clavier système.
 */
export default function NumericKeypad({ value, onChange, allowDecimal = true }) {
  function handleKeyPress(key) {
    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "." && (!allowDecimal || value.includes("."))) {
      return; // point désactivé ou déjà présent
    }
    // Évite les zéros de tête inutiles (ex: "01" -> "1"), sauf "0."
    if (value === "0" && key !== ".") {
      onChange(key);
      return;
    }
    onChange(value + key);
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKeyPress(key)}
          className="flex h-16 items-center justify-center rounded-lg border border-[#bdc9c1] bg-[#ebf6ef]
                     text-2xl font-semibold text-[#141e1a] transition
                     hover:bg-[#dfebe4] active:scale-95"
        >
          {key === "⌫" ? <Delete size={24} /> : key}
        </button>
      ))}
    </div>
  );
}
