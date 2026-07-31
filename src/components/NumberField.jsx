/**
 * Champ numérique réutilisable, avec possibilité de texte d'aide sous le champ.
 * `step="any"` permet d'accepter les décimales (utile pour un stock au poids/kg).
 */
export default function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  required = true,
  min = 0,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        step="any"
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base
                   text-gray-900 placeholder-gray-400 shadow-sm outline-none
                   transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                   dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
                   dark:placeholder-gray-500"
      />
      {helpText && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
