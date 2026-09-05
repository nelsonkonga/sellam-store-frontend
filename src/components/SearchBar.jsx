import { Search } from "lucide-react";

/**
 * Barre de recherche générique réutilisable (filtre côté client, contrôlé par le parent).
 */
export default function SearchBar({ value, onChange, onKeyDown, placeholder = "Rechercher..." }) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e7a72]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#bdc9c1] bg-white py-3 pl-10 pr-4
             text-base text-[#141e1a] placeholder-[#6e7a72] shadow-sm outline-none
             transition focus:border-[#12805c] focus:ring-2 focus:ring-[#12805c]/30"
      />
    </div>
  );
}
