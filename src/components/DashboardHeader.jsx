import { useState } from "react";
import { Bell } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import NotificationPanel from "./NotificationPanel";

/**
 * Header du dashboard.
 * - Avatar : affiche la photo de profil si disponible, sinon l'initiale du nom sur fond coloré.
 * - hasNotifications pilote le petit badge rouge sur la cloche.
 */
export default function DashboardHeader({ shopName, userName, avatarUrl, hasNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "?";

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <div className="flex min-w-0 items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
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
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
              {shopName}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              Bonjour, {userName}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Icône notifications avec badge rouge conditionnel */}
          <button
            type="button"
            onClick={() => setShowNotifications(true)}
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
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
