import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Store, RefreshCw, HelpCircle, Plus } from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import { useShop } from "../context/ShopContext";
import SyncStatus from "./SyncStatus";

/**
 * Header du dashboard.
 * - Avatar : affiche le logo de la boutique si disponible, sinon l'initiale du nom sur fond coloré.
 * - hasNotifications pilote le petit badge rouge sur la cloche.
 */
export default function DashboardHeader({ userName, shopLogoUrl, hasNotifications, onMarkAsRead }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { shops, selectedShopId, selectShop } = useShop();

  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "?";

  // Find current shop to display its name
  const currentShop = shops.find(s => s.id === selectedShopId);
  const shopNameDisplay = currentShop ? currentShop.name : "Sélectionner une boutique";

  return (
    <>
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[#bdc9c1] bg-[#f1fcf5] px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold leading-tight text-[#141e1a]">Bonjour, {userName || initial}</h1>
            <div className="relative mt-1 flex items-center gap-2">
              {shopLogoUrl ? (
            <img
              src={shopLogoUrl}
              alt={shopNameDisplay}
              className="h-11 w-11 flex-shrink-0 rounded-full object-cover
                         ring-2 ring-white dark:ring-gray-800"
            />
            ) : (
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center
                         rounded-full bg-emerald-500 text-lg font-bold text-white"
            >
              {initial}
            </div>
          )}
              <select
                className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                value={selectedShopId || ""}
                onChange={(e) => {
                  const shop = shops.find(s => s.id === e.target.value);
                  if (shop) {
                    selectShop(shop.id, shop.name);
                  }
                }}
              >
                <option value="" disabled>Sélectionner une boutique</option>
                {shops.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p className="truncate text-sm text-[#3e4943]">
                {shopNameDisplay}
              </p>
              <SyncStatus />
              <ChevronDown size={15} className="text-[#6e7a72]" />
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
          <nav className="mr-2 hidden items-center gap-5 md:flex">
            <button type="button" className="border-b-2 border-[#006547] py-5 text-xs font-bold uppercase tracking-[0.05em] text-[#006547]">Dashboard</button>
            <button type="button" onClick={() => navigate('/reports')} className="py-5 text-xs font-bold uppercase tracking-[0.05em] text-[#3e4943] hover:text-[#006547]">Rapports</button>
          </nav>
          <button type="button" aria-label="Actualiser" title="Actualiser" onClick={() => window.location.reload()} className="flex h-10 w-10 items-center justify-center rounded-lg text-[#3e4943] hover:bg-[#dfe5de]">
            <RefreshCw size={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/support')}
            title="Aide"
            aria-label="Aide"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#3e4943] transition hover:bg-[#dfe5de]"
          >
            <HelpCircle size={18} />
          </button>

          {/* Bouton Mes Boutiques */}
          <button
            type="button"
            onClick={() => navigate('/shops')}
            title="Mes boutiques"
            aria-label="Mes boutiques"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#3e4943] transition hover:bg-[#dfe5de]"
          >
            <Store size={18} />
          </button>

          {/* Icône notifications avec badge rouge conditionnel */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowNotifications(true); }}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full
                       text-[#3e4943] transition hover:bg-[#dfe5de]"
          >
            <Bell size={18} />
            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#f1fcf5]" />
            )}
          </button>

          <button type="button" onClick={() => navigate('/sales/new')} className="hidden h-10 items-center gap-2 rounded-lg bg-[#006547] px-4 text-xs font-bold uppercase tracking-[0.05em] text-white transition hover:bg-[#12805c] md:flex"><Plus size={17} /> Nouvelle vente</button>
        </div>
      </header>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} onMarkAsRead={onMarkAsRead} />
      )}
    </>
  );
}
