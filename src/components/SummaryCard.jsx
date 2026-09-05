/**
 * Petite carte réutilisable pour afficher une statistique (icône + label + valeur).
 * `accentClassName` permet de personnaliser la couleur de l'icône selon le contexte
 * (ex: rouge pour une alerte stock).
 */
export default function SummaryCard({ icon: Icon, label, value, unit = "FCFA", accentClassName }) {
  return (
    <div
      className="flex min-h-[126px] flex-1 flex-col justify-between rounded-xl border border-[#bdc9c1] bg-white p-4"
    >
      <div
        className={`flex items-center gap-2 text-sm text-[#3e4943] ${
          accentClassName || ""
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </div>
      <div>
        <p className="font-mono text-2xl font-medium text-[#141e1a]">{value}</p>
        <p className="mt-1 text-xs text-[#3e4943]">{unit}</p>
      </div>
    </div>
  );
}
