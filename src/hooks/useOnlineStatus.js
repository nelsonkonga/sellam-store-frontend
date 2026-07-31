import { useState, useEffect } from "react";

/**
 * Retourne true/false selon que le navigateur est en ligne.
 * S'appuie sur navigator.onLine + les events "online"/"offline".
 * Réutilisable partout dans l'app (pas seulement le Dashboard).
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
