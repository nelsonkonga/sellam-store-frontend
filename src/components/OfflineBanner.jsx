import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

/**
 * Bandeau discret affiché en haut de l'écran si l'appareil perd la connexion.
 * La vraie synchro offline n'est pas encore implémentée : ceci est juste l'indicateur visuel.
 */
export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2
                 text-sm font-medium text-white dark:bg-amber-600"
    >
      <WifiOff size={16} />
      Hors ligne — certaines données peuvent ne pas être à jour
    </div>
  );
}
