import { useState, useRef, useEffect } from "react";

// Image par défaut affichée quand la boutique n'a pas de logoUrl
const DEFAULT_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="#d1fae5"/>
      <text x="50%" y="56%" font-size="28" text-anchor="middle" fill="#059669">🏪</text>
    </svg>
  `);

/**
 * Carte cliquable représentant une boutique dans la liste.
 * - Le clic sur la carte sélectionne la boutique (géré par le parent via onSelect).
 * - Le menu "..." propose des actions annexes (Modifier / Voir les employés),
 *   avec un stopPropagation pour ne pas déclencher onSelect par erreur.
 */
export default function ShopCard({ shop, onSelect, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      onClick={() => onSelect(shop)}
      className="relative flex cursor-pointer items-center gap-4 rounded-2xl
                 glass p-4 transition
                 hover:shadow-md active:scale-[0.99]"
    >
      <img
        src={shop.logoUrl || DEFAULT_LOGO}
        alt={shop.name}
        className="h-14 w-14 flex-shrink-0 rounded-xl object-cover
                   ring-1 ring-gray-100 dark:ring-gray-800"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_LOGO;
        }}
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-white">
          {shop.name}
        </h3>
        <p className="truncate text-sm text-gray-300">
          {shop.address || "Adresse non renseignée"}
        </p>
      </div>

      {/* Menu contextuel "..." */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // évite de sélectionner la boutique
            setMenuOpen((prev) => !prev);
          }}
          aria-label="Options"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center
                     rounded-full text-xl text-gray-400 transition
                     hover:bg-white/10"
        >
          ⋮
        </button>

        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-11 z-10 w-48 overflow-hidden rounded-xl
                       bg-white py-1 shadow-lg ring-1 ring-gray-200
                       dark:bg-gray-800 dark:ring-gray-700"
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit(shop);
              }}
              className="block w-full px-4 py-2.5 text-left text-sm text-gray-700
                         hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Modifier
            </button>
            <button
              type="button"
              disabled
              title="Bientôt disponible"
              className="flex w-full cursor-not-allowed items-center justify-between
                         px-4 py-2.5 text-left text-sm text-gray-400
                         dark:text-gray-500"
            >
              Voir les employés
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                Bientôt
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
