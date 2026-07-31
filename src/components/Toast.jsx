import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Toast de confirmation, affiché en haut de l'écran, disparaît automatiquement.
 * Réutilisable partout où une confirmation rapide est utile.
 */
export default function Toast({ message, subMessage, onDismiss, duration = 2500 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      role="status"
      className="fixed left-1/2 top-6 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2
                 items-start gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100
                 dark:bg-gray-800 dark:ring-gray-700"
    >
      <CheckCircle2 className="mt-0.5 flex-shrink-0 text-emerald-500" size={22} />
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white">{message}</p>
        {subMessage && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
}
