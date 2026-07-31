import { Check, Loader2 } from "lucide-react";

/**
 * Ligne de réglage pour un jour de la semaine.
 * Affiche un petit indicateur "Modifié" tant que la ligne n'a pas été sauvegardée,
 * et une coche verte juste après une sauvegarde réussie.
 */
export default function DaySettingRow({
  label,
  balanceTime,
  reminderFrequencyHours,
  onChangeTime,
  onChangeFrequency,
  isDirty,
  isSaving,
  justSaved,
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>

        {/* Petit indicateur d'état, discret mais clair */}
        {isSaving ? (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            Enregistrement...
          </span>
        ) : justSaved ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Check size={14} />
            Enregistré
          </span>
        ) : isDirty ? (
          <span className="text-xs font-medium text-orange-500 dark:text-orange-400">
            Modifié
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {/* Heure du bilan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Heure du bilan
          </label>
          <input
            type="time"
            value={balanceTime}
            onChange={(e) => onChangeTime(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base
                       text-gray-900 shadow-sm outline-none transition
                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                       dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Fréquence de rappel */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Rappel toutes les (heures)
          </label>
          <input
            type="number"
            min="1"
            max="12"
            step="1"
            inputMode="numeric"
            value={reminderFrequencyHours}
            onChange={(e) => onChangeFrequency(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base
                       text-gray-900 shadow-sm outline-none transition
                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                       dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Tu recevras un rappel pour enregistrer tes ventes toutes les{" "}
            {reminderFrequencyHours || "X"} heures
          </p>
        </div>
      </div>
    </div>
  );
}
