import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function SyncStatus() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`flex items-center gap-2 text-xs font-medium ${isOnline ? "text-[#006547]" : "text-[#9f6300]"}`} role="status" aria-live="polite">
      {isOnline ? <Cloud size={15} /> : <CloudOff size={15} />}
      <span>{isOnline ? "En ligne" : "Hors ligne"}</span>
      {!isOnline && <span className="text-current/70">Les ventes restent disponibles</span>}
    </div>
  );
}
