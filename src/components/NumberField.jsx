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
        className="text-sm font-medium text-[#3e4943]"
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
        className="w-full rounded-lg border border-[#bdc9c1] bg-white px-4 py-3 text-base
             text-[#141e1a] placeholder-[#6e7a72] shadow-sm outline-none
             transition focus:border-[#12805c] focus:ring-2 focus:ring-[#12805c]/30"
      />
      {helpText && (
        <p className="text-xs text-[#6e7a72]">{helpText}</p>
      )}
    </div>
  );
}
