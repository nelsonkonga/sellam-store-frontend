import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Liste des pays avec drapeaux et indicatifs (focus Afrique + Amérique du Nord)
const COUNTRIES = [
  { code: "CM", name: "Cameroun", flag: "🇨🇲", dialCode: "+237" },
  { code: "MA", name: "Maroc", flag: "🇲🇦", dialCode: "+212" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", dialCode: "+221" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", dialCode: "+229" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241" },
  { code: "CG", name: "Congo", flag: "🇨🇬", dialCode: "+242" },
  { code: "CD", name: "RDC", flag: "🇨🇩", dialCode: "+243" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", dialCode: "+250" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿", dialCode: "+255" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬", dialCode: "+256" },
  { code: "ET", name: "Éthiopie", flag: "🇪🇹", dialCode: "+251" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dialCode: "+223" },
  { code: "NE", name: "Niger", flag: "🇳🇪", dialCode: "+227" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦", dialCode: "+27" },
  { code: "EG", name: "Égypte", flag: "🇪🇬", dialCode: "+20" },
  { code: "US", name: "États-Unis", flag: "🇺🇸", dialCode: "+1" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧", dialCode: "+44" },
];

/**
 * Composant réutilisable pour saisir un numéro de téléphone international.
 * Retourne le numéro complet au format E.164 (ex: +237690000000)
 *
 * @param {Object} props
 * @param {string} props.value - Numéro complet E.164 (ex: "+237690000000") ou vide
 * @param {function} props.onChange - Callback(e164Number) appelé à chaque modification
 * @param {string} props.placeholder - Placeholder du champ nombre local
 * @param {string} props.label - Label du champ
 * @param {boolean} props.disabled - Désactiver les inputs
 * @param {boolean} props.error - Afficher un border rouge d'erreur
 */
export default function PhoneNumberInput({
  value = "",
  onChange,
  placeholder = "690000000",
  label = "Numéro de téléphone",
  disabled = false,
  error = false,
}) {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.code === "CM") || COUNTRIES[0]
  );
  const [localNumber, setLocalNumber] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Initialiser depuis la valeur E.164 si fournie
  useEffect(() => {
    if (value) {
      // Extraire le code pays de la valeur E.164
      const country = COUNTRIES.find(
        (c) => value.startsWith(c.dialCode)
      );
      if (country) {
        setSelectedCountry(country);
        // Extraire le numéro local en enlevant le dialCode
        const local = value.substring(country.dialCode.length);
        setLocalNumber(local);
      }
    }
  }, [value]);

  // Construire le numéro E.164 et appeler onChange
  const handleNumberChange = (newLocal, newCountry = selectedCountry) => {
    setLocalNumber(newLocal);
    const e164 = newLocal
      ? `${newCountry.dialCode}${newLocal}`
      : "";
    onChange && onChange(e164);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    // Recalculer si un numéro local existe
    if (localNumber) {
      handleNumberChange(localNumber, country);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Sélecteur pays */}
        <div className="relative w-32">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
            className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-medium
                       transition flex items-center justify-between
                       ${
                         error
                           ? "border-red-500/50 bg-red-950/10"
                           : "border-white/10 bg-white/5"
                       }
                       ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}
                       text-white`}
          >
            <span>
              {selectedCountry.flag} {selectedCountry.dialCode}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute top-12 left-0 z-50 w-48 max-h-60 overflow-y-auto
                          rounded-xl border border-white/10 bg-gray-800 shadow-lg">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition
                            hover:bg-white/10
                            ${
                              selectedCountry.code === country.code
                                ? "bg-brand-500/20 text-brand-300"
                                : "text-gray-300"
                            }`}
                >
                  <span className="mr-2">{country.flag}</span>
                  {country.name} {country.dialCode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Champ numéro local */}
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 rounded-xl border px-4 py-3 text-base text-white
                     placeholder:text-gray-500 transition
                     focus:outline-none focus:ring-2 focus:ring-brand-400/20
                     ${
                       error
                         ? "border-red-500/50 bg-red-950/10 focus:border-red-500"
                         : "border-white/10 bg-white/5 focus:border-brand-400"
                     }
                     ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </div>

      {/* Affichage du numéro E.164 (pour debug/confirmation) */}
      {localNumber && (
        <p className="text-xs text-gray-400">
          Format international : {selectedCountry.dialCode}{localNumber}
        </p>
      )}
    </div>
  );
}
