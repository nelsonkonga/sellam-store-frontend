import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ title = "Impossible de charger ces données", message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/60 dark:bg-red-950/30" role="alert">
      <AlertCircle className="text-red-600 dark:text-red-400" size={28} />
      <div>
        <h2 className="font-semibold text-red-900 dark:text-red-200">{title}</h2>
        {message && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>}
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800">
          <RefreshCw size={15} /> Réessayer
        </button>
      )}
    </div>
  );
}
