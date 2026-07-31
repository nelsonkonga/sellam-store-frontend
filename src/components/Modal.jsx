/**
 * Modal générique réutilisable (fond assombri + carte centrée).
 * Ferme au clic sur le fond ou sur le bouton "X".
 */
export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0
                 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        // Empêche la fermeture quand on clique à l'intérieur de la carte
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl
                   dark:bg-gray-900 dark:ring-1 dark:ring-gray-800
                   sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full
                       text-gray-400 transition hover:bg-gray-100 hover:text-gray-600
                       dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
