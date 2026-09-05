import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, MapPin, Store, Cloud, AlertCircle } from "lucide-react";

// Image par défaut affichée quand la boutique n'a pas de logoUrl
const DEFAULT_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="#d1fae5"/>
      <text x="50%" y="56%" font-size="28" text-anchor="middle" fill="#059669">🏪</text>
    </svg>
  `);

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

/**
 * Carte cliquable représentant une boutique dans la liste.
 * - Le clic sur la carte sélectionne la boutique (géré par le parent via onSelect).
 * - Le menu "..." propose des actions annexes (Modifier / Voir les employés),
 *   avec un stopPropagation pour ne pas déclencher onSelect par erreur.
 */
export default function ShopCard({ shop, onSelect, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isActive = !!shop.isActive;

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
      className={[
        "group relative flex cursor-pointer flex-col gap-4 rounded-2xl border p-4 transition-all duration-200",
        isActive
          ? "border-[#12805c] bg-[#f1fcf5] shadow-[0_0_0_1px_#12805c]"
          : "border-[#dce4de] bg-white hover:-translate-y-0.5 hover:border-[#12805c] hover:shadow-lg"
      ].join(" ")}
    >
      {isActive && (
        <div className="absolute right-4 top-4 rounded-full bg-[#ddf4ea] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#006547]">
          Active
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#dce4de] bg-[#eef6f1] text-[#006547]">
          {shop.logoUrl ? (
            <img
              src={shop.logoUrl || DEFAULT_LOGO}
              alt={shop.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_LOGO;
              }}
            />
          ) : (
            <Store size={24} />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-10">
          <h3 className="truncate text-xl font-semibold text-[#141e1a]">{shop.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-[#3e4943]">
            <MapPin size={14} className="text-[#6e7a72]" />
            <span className="truncate">{shop.address || "Adresse non renseignée"}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-y border-[#dce4de] py-3 text-left">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6e7a72]">Ventes (J)</p>
          <p className="mt-1 text-sm font-semibold text-[#141e1a]">{shop.salesToday ? currencyFormatter.format(shop.salesToday) : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6e7a72]">Marge</p>
          <p className="mt-1 text-sm font-semibold text-[#141e1a]">{shop.margin || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6e7a72]">Équipe</p>
          <p className="mt-1 text-sm font-semibold text-[#141e1a]">{shop.teamCount || "—"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-sm font-medium text-[#12805c]">
          {isActive ? <Cloud size={16} /> : <AlertCircle size={16} className="text-[#7d4d00]" />}
          <span>{isActive ? "Synchronisé" : "En attente"}</span>
        </div>

        <div className="flex items-center gap-2">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              aria-label="Options"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6e7a72] transition hover:bg-[#eef6f1] hover:text-[#006547]"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-11 z-10 w-48 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-[#dce4de]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(shop);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-[#141e1a] hover:bg-[#f3f7f5]"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  disabled
                  title="Bientôt disponible"
                  className="flex w-full cursor-not-allowed items-center justify-between px-4 py-2.5 text-left text-sm text-[#8a938d]"
                >
                  Voir les employés
                  <span className="rounded-full bg-[#f0f3f1] px-2 py-0.5 text-[10px] font-semibold text-[#6e7a72]">
                    Bientôt
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(shop);
            }}
            className={[
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-[#12805c] text-white hover:bg-[#006547]"
                : "border border-[#bdc9c1] bg-transparent text-[#141e1a] hover:border-[#12805c] hover:text-[#006547]"
            ].join(" ")}
          >
            {isActive ? "Ouvrir" : "Gérer"}
          </button>
        </div>
      </div>
    </div>
  );
}
