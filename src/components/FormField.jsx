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
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[#3e4943]"
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
        className="w-full min-w-0 rounded-lg border border-[#bdc9c1] bg-white px-4 py-3 text-base
             text-[#141e1a] placeholder-[#6e7a72] shadow-sm outline-none
             transition focus:border-[#12805c] focus:ring-2 focus:ring-[#12805c]/30"
      />
    </div>
  );
}
