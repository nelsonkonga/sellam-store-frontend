import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

// Configuration visuelle par statut, centralisée ici pour rester cohérente
// entre l'icône, la couleur et le message — un seul endroit à modifier.
const STATUS_CONFIG = {
  OK: {
    icon: CheckCircle2,
    title: "Tout correspond !",
    description: "L'argent en caisse correspond exactement aux ventes enregistrées.",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    ringClass: "ring-emerald-200 dark:ring-emerald-800",
    iconClass: "text-emerald-500",
    textClass: "text-emerald-700 dark:text-emerald-300",
  },
  POSITIVE_DISCREPANCY: {
    icon: AlertTriangle,
    title: "Tu as peut-être oublié d'enregistrer des ventes",
    description: "Il y a plus d'argent en caisse que ce qui a été enregistré.",
    bgClass: "bg-orange-50 dark:bg-orange-950/40",
    ringClass: "ring-orange-200 dark:ring-orange-800",
    iconClass: "text-orange-500",
    textClass: "text-orange-700 dark:text-orange-300",
  },
  NEGATIVE_DISCREPANCY: {
    icon: XCircle,
    title: "Attention, il manque de l'argent",
    description: "La caisse contient moins d'argent que les ventes enregistrées.",
    bgClass: "bg-red-50 dark:bg-red-950/40",
    ringClass: "ring-red-200 dark:ring-red-800",
    iconClass: "text-red-500",
    textClass: "text-red-700 dark:text-red-300",
  },
};

/**
 * Affiche le résultat du bilan de caisse de façon très visuelle :
 * grosse icône + couleur forte, pour être compris en un coup d'œil.
 */
export default function BalanceResultCard({ result }) {
  const config = STATUS_CONFIG[result.status];
  if (!config) return null;

  const Icon = config.icon;
  const hasDiscrepancy = result.status !== "OK";

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl p-6 text-center
                  ring-2 ${config.bgClass} ${config.ringClass}`}
    >
      <Icon className={config.iconClass} size={56} strokeWidth={1.8} />

      <div>
        <p className={`text-lg font-bold ${config.textClass}`}>{config.title}</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {config.description}
        </p>
      </div>

      {hasDiscrepancy && (
        <div className="mt-2 rounded-xl bg-white/70 px-5 py-3 dark:bg-black/20">
          <p className="text-xs text-gray-500 dark:text-gray-400">Écart constaté</p>
          <p className={`text-2xl font-bold ${config.textClass}`}>
            {currencyFormatter.format(Math.abs(result.discrepancy))}
          </p>
        </div>
      )}
    </div>
  );
}
