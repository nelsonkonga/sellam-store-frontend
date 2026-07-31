/**
 * Champ de formulaire réutilisable (label + input) stylé pour mobile.
 * Utilisé par les pages Login/Register et pourra servir ailleurs.
 */
export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
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
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base
                   text-gray-900 placeholder-gray-400 shadow-sm outline-none
                   transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                   dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
                   dark:placeholder-gray-500 dark:focus:border-emerald-400"
      />
    </div>
  );
}
