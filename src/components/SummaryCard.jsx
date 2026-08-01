/**
 * Petite carte réutilisable pour afficher une statistique (icône + label + valeur).
 * `accentClassName` permet de personnaliser la couleur de l'icône selon le contexte
 * (ex: rouge pour une alerte stock).
 */
export default function SummaryCard({ icon: Icon, label, value, accentClassName }) {
  return (
    <div
      className="flex flex-1 flex-col gap-2 rounded-2xl glass p-4 shadow-sm"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          accentClassName || "bg-brand-500/10 text-brand-400"
        }`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
