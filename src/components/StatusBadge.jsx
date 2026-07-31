// Libellés courts et couleurs cohérentes avec BalanceResultCard, pour l'historique
const BADGE_CONFIG = {
  OK: {
    label: "OK",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  POSITIVE_DISCREPANCY: {
    label: "Excédent",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
  },
  NEGATIVE_DISCREPANCY: {
    label: "Manquant",
    className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  },
};

/**
 * Petit badge coloré représentant un statut de bilan (OK / excédent / manquant).
 */
export default function StatusBadge({ status }) {
  const config = BADGE_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
