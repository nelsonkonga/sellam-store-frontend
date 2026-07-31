import { BellOff } from "lucide-react";

/**
 * Panneau glissant depuis le haut, affichant les notifications.
 * Pour l'instant toujours vide (pas encore branché à un vrai backend de notifs).
 */
export default function NotificationPanel({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 flex h-full w-full max-w-xs flex-col
                   bg-white shadow-xl dark:bg-gray-900 dark:ring-1 dark:ring-gray-800
                   sm:top-4 sm:right-4 sm:h-auto sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full
                       text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
          <BellOff className="text-gray-300 dark:text-gray-600" size={32} />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Aucune notification
          </p>
        </div>
      </div>
    </div>
  );
}
