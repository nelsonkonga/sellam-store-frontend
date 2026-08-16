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
  enabled,
  openingTime,
  closingTime,
  onChangeTime,
  onChangeFrequency,
  onToggleEnabled,
  onChangeOpeningTime,
  onChangeClosingTime,
  isDirty,
  isSaving,
  justSaved,
}) {
  return (
    <div className={`rounded-2xl glass p-4 shadow-sm transition ${enabled ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{label}</h3>

        {/* Petit indicateur d'état, discret mais clair */}
        {isSaving ? (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            Enregistrement...
          </span>
        ) : justSaved ? (
          <span className="flex items-center gap-1 text-xs font-medium text-brand-400">
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
        {/* Activation/Désactivation du bilan ce jour */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">
            Bilan actif ce jour
          </label>
          <button
            type="button"
            onClick={() => onToggleEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled
                ? "bg-brand-500"
                : "bg-gray-600 dark:bg-gray-700"
            }`}
            role="switch"
            aria-checked={enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {enabled && (
          <>
            {/* Heure d'ouverture */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300">
                Heure d'ouverture
              </label>
              <input
                type="time"
                value={openingTime || "09:00"}
                onChange={(e) => onChangeOpeningTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 glass px-4 py-2.5 text-base
                           text-white shadow-sm outline-none transition
                           focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30
                           appearance-none"
              />
            </div>

            {/* Heure de fermeture */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300">
                Heure de fermeture
              </label>
              <input
                type="time"
                value={closingTime || "21:00"}
                onChange={(e) => onChangeClosingTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 glass px-4 py-2.5 text-base
                           text-white shadow-sm outline-none transition
                           focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30
                           appearance-none"
              />
            </div>

            {/* Heure du bilan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300">
                Heure du bilan
              </label>
              <input
                type="time"
                value={balanceTime}
                onChange={(e) => onChangeTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 glass px-4 py-2.5 text-base
                           text-white shadow-sm outline-none transition
                           focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30
                           appearance-none"
              />
            </div>

            {/* Fréquence de rappel */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300">
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
                className="w-full rounded-xl border border-white/10 glass px-4 py-2.5 text-base
                           text-white shadow-sm outline-none transition
                           focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30
                           appearance-none"
              />
              <p className="text-xs text-gray-400">
                Tu recevras un rappel pour enregistrer tes ventes toutes les{" "}
                {reminderFrequencyHours || "X"} heures
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
