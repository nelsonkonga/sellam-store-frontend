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
    <div className={`grid grid-cols-1 items-center gap-3 rounded-lg border border-transparent p-3 transition hover:border-[#bdc9c1] hover:bg-[#ebf6ef] md:grid-cols-12 ${enabled ? "" : "bg-[#ebf6ef] opacity-60"}`}>
      <div className="flex items-center justify-between md:col-span-3 md:justify-start md:gap-3">
        <h3 className="font-semibold text-[#141e1a]">{label}</h3>
        {isSaving ? (
          <span className="flex items-center gap-1 text-xs font-medium text-[#6e7a72]"><Loader2 size={14} className="animate-spin" />Enregistrement...</span>
        ) : justSaved ? (
          <span className="flex items-center gap-1 text-xs font-medium text-[#006547]"><Check size={14} />Enregistré</span>
        ) : isDirty ? (
          <span className="text-xs font-medium text-[#9f6300]">Modifié</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 md:col-span-7 md:mt-0 md:flex-row md:items-center">
        <div className="flex items-center justify-between">
          <label className="text-sm text-[#3e4943] md:hidden">Bilan actif ce jour</label>
          <button type="button" onClick={() => onToggleEnabled(!enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-[#12805c]" : "bg-[#6e7a72]"}`} role="switch" aria-checked={enabled}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {enabled && (
          <>
            <div className="flex items-center gap-2"><label className="w-14 text-right text-xs text-[#6e7a72]">Ouverture</label><input type="time" value={openingTime || "09:00"} onChange={(e) => onChangeOpeningTime(e.target.value)} className="rounded-md border border-[#bdc9c1] bg-white px-2 py-1.5 font-mono text-sm text-[#141e1a]" /></div>
            <span className="hidden text-[#6e7a72] md:block">-</span>
            <div className="flex items-center gap-2"><label className="w-14 text-right text-xs text-[#6e7a72]">Fermeture</label><input type="time" value={closingTime || "21:00"} onChange={(e) => onChangeClosingTime(e.target.value)} className="rounded-md border border-[#bdc9c1] bg-white px-2 py-1.5 font-mono text-sm text-[#141e1a]" /></div>
            <div className="flex items-center gap-2"><label className="w-14 text-right text-xs text-[#6e7a72]">Bilan</label><input type="time" value={balanceTime} onChange={(e) => onChangeTime(e.target.value)} className="rounded-md border border-[#bdc9c1] bg-white px-2 py-1.5 font-mono text-sm text-[#141e1a]" /></div>
            <div className="flex items-center gap-2"><label className="w-14 text-right text-xs text-[#6e7a72]">Rappel</label><input type="number" min="1" max="12" step="1" value={reminderFrequencyHours} onChange={(e) => onChangeFrequency(e.target.value)} className="w-16 rounded-md border border-[#bdc9c1] bg-white px-2 py-1.5 font-mono text-sm text-[#141e1a]" /></div>
          </>
        )}
      </div>
      <div className="hidden justify-end md:col-span-2 md:flex"><button type="button" className="rounded p-1 text-[#6e7a72] hover:bg-[#dae5de]" title="Paramètres avancés">...</button></div>
    </div>
  );
}
