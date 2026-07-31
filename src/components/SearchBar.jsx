import { Search } from "lucide-react";

/**
 * Barre de recherche générique réutilisable (filtre côté client, contrôlé par le parent).
 */
export default function SearchBar({ value, onChange, placeholder = "Rechercher..." }) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4
                   text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none
                   transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                   dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
                   dark:placeholder-gray-500"
      />
    </div>
  );
}
