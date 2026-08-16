import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, MessageCircleMore, Store } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import NotificationPanel from "./NotificationPanel";
import { useShop } from "../context/ShopContext";

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
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <div className="flex min-w-0 items-center gap-3">
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
          <div className="min-w-0 flex-1">
            <div className="relative flex items-center gap-1 group">
              <select
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
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
              <p className="truncate text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                {shopNameDisplay}
              </p>
              <ChevronDown size={16} className="text-gray-400 group-hover:text-brand-600 transition-colors" />
            </div>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              Bonjour, {userName}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Bouton Service client */}
          <button
            type="button"
            onClick={() => navigate('/chat')}
            title="Service client"
            className="relative flex h-10 w-10 items-center justify-center rounded-full
                       bg-blue-100 text-blue-600 transition hover:bg-blue-200
                       dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            <MessageCircleMore size={18} />
          </button>

          {/* Bouton Mes Boutiques */}
          <button
            type="button"
            onClick={() => navigate('/shops')}
            title="Mes boutiques"
            className="relative flex h-10 w-10 items-center justify-center rounded-full
                       bg-gray-100 text-gray-600 transition hover:bg-gray-200
                       dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Store size={18} />
          </button>

          {/* Icône notifications avec badge rouge conditionnel */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowNotifications(true); }}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full
                       bg-gray-100 text-gray-600 transition hover:bg-gray-200
                       dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Bell size={18} />
            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
            )}
          </button>

          <DarkModeToggle />
        </div>
      </header>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} onMarkAsRead={onMarkAsRead} />
      )}
    </>
  );
}
