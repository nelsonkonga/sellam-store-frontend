import { useEffect, useState } from "react";
import { BellOff, Loader2, BellRing, CheckCircle2 } from "lucide-react";
import { getNotifications } from "../services/notificationService";
import { useShop } from "../context/ShopContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import api from "../services/api";

export default function NotificationPanel({ onClose, onMarkAsRead }) {
  const { selectedShopId } = useShop();
  const { permission, isSupported, requestPermissionAndSubscribe, isSubscribing } = usePushNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pushMessage, setPushMessage] = useState("");

  useEffect(() => {
    if (!selectedShopId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");
        const data = await getNotifications(selectedShopId);
        if (isMounted) setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) setError("Impossible de charger les notifications.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [selectedShopId]);

  const handleMarkAllAsRead = () => {
    if (selectedShopId) {
      localStorage.setItem(`sellam_read_notifications_${selectedShopId}`, new Date().toISOString());
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  };

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
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 dark:text-white">Notifications</h2>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                title="Tout marquer comme lu"
                className="text-gray-400 hover:text-brand-600 transition-colors"
              >
                <CheckCircle2 size={16} />
              </button>
            )}
          </div>
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

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <>
            {!isSupported ? (
              <div className="p-4 text-sm text-amber-600 dark:text-amber-400">
                Les notifications push ne sont pas supportées par ce navigateur.
              </div>
            ) : permission !== "granted" ? (
              <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={async () => {
                    const result = await requestPermissionAndSubscribe();
                    setPushMessage(
                      result.ok
                        ? "Notifications activées."
                        : result.reason === "denied"
                          ? "Permission refusée."
                          : result.reason === "missing-vapid"
                            ? "Clé VAPID manquante."
                            : "Activation échouée."
                    );
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-70"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                  {isSubscribing ? "Activation..." : "Activer les notifications"}
                </button>
                {pushMessage && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{pushMessage}</p>
                )}
              </div>
            ) : (
              <div className="border-b border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="font-medium">✅ Notifications activées pour cette boutique.</span>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
                <BellOff className="text-gray-300 dark:text-gray-600" size={32} />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Aucune notification
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 max-h-[60vh]">
                <div className="space-y-3">
                  {notifications.map((notification) => {
                    const isBalance = notification.notificationType === 'BALANCE_REMINDER';
                    return (
                      <div
                        key={notification.id}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {notification.title || "Notification"}
                          </p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isBalance ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                            {isBalance ? 'Bilan' : 'Information'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {notification.message || "Aucun message."}
                        </p>
                        <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString("fr-FR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
