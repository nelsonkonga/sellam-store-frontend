import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Liste des pays avec leur code ISO en minuscules pour l'API des drapeaux
const COUNTRIES = [
  { code: "CM", name: "Cameroun", dialCode: "+237" },
  { code: "MA", name: "Maroc", dialCode: "+212" },
  { code: "SN", name: "Sénégal", dialCode: "+221" },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225" },
  { code: "BJ", name: "Bénin", dialCode: "+229" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226" },
  { code: "GA", name: "Gabon", dialCode: "+241" },
  { code: "CG", name: "Congo", dialCode: "+242" },
  { code: "CD", name: "RDC", dialCode: "+243" },
  { code: "KE", name: "Kenya", dialCode: "+254" },
  { code: "RW", name: "Rwanda", dialCode: "+250" },
  { code: "TZ", name: "Tanzanie", dialCode: "+255" },
  { code: "UG", name: "Ouganda", dialCode: "+256" },
  { code: "ET", name: "Éthiopie", dialCode: "+251" },
  { code: "GH", name: "Ghana", dialCode: "+233" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "TG", name: "Togo", dialCode: "+228" },
  { code: "ML", name: "Mali", dialCode: "+223" },
  { code: "NE", name: "Niger", dialCode: "+227" },
  { code: "ZA", name: "Afrique du Sud", dialCode: "+27" },
  { code: "EG", name: "Égypte", dialCode: "+20" },
  { code: "US", name: "États-Unis", dialCode: "+1" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "GB", name: "Royaume-Uni", dialCode: "+44" },
];

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

  useEffect(() => {
    if (value) {
      const country = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        const local = value.substring(country.dialCode.length);
        setLocalNumber(local);
      }
    }
  }, [value]);

  const handleNumberChange = (newLocal, newCountry = selectedCountry) => {
    const sanitized = newLocal.replace(/\D/g, "");
    setLocalNumber(sanitized);
    const e164 = sanitized ? `${newCountry.dialCode}${sanitized}` : "";
    onChange && onChange(e164);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    if (localNumber) {
      handleNumberChange(localNumber, country);
    }
  };

  return (
    <div className="space-y-1.5 text-left w-full">
      {label && (
        <label className="block text-sm font-medium text-[#3e4943]">
          {label}
        </label>
      )}

      <div className="flex w-full gap-2">
        {/* Sélecteur de pays - Largeur réduite et optimisée pour mobile */}
        <div className="relative w-[105px] shrink-0">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
            className={`w-full rounded-xl border pl-2.5 pr-1.5 py-3 text-left text-sm font-medium
                       transition flex items-center justify-between bg-white text-[#141e1a]
                       ${error ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#bdc9c1] focus:border-[#12805c]"}
                       ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "hover:bg-[#ebf6ef]"}`}
          >
            <span className="flex items-center gap-1.5 min-w-0">
              {/* Correction de l'URL du drapeau (ajout du $) */}
              <img 
                src={`https://flagcdn.com/${selectedCountry.code.toLowerCase()}.png`} 
                alt="" 
                className="w-5 h-3.5 object-cover rounded-sm border border-gray-100 shrink-0" 
              /> 
              <span className="truncate text-xs sm:text-sm">{selectedCountry.dialCode}</span>
            </span>
            <ChevronDown size={14} className="text-[#6e7a72] shrink-0 ml-0.5" />
          </button>

          {showDropdown && (
            <div className="absolute top-13 left-0 z-50 w-56 max-h-60 overflow-y-auto
                          rounded-xl border border-[#bdc9c1] bg-white p-1 shadow-lg divide-y divide-gray-50">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition rounded-lg
                            hover:bg-[#ebf6ef]
                            ${
                              selectedCountry.code === country.code
                                ? "bg-[#DDF4EA] text-[#005138] font-semibold"
                                : "text-[#141e1a]"
                            }`}
                >
                  {/* Correction de l'URL du drapeau (ajout du $) */}
                  <img 
                    src={`https://flagcdn.com/${country.code.toLowerCase()}.png`} 
                    alt="" 
                    className="w-5 h-3.5 object-cover rounded-sm border border-gray-100 shrink-0" 
                  />
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-[#6e7a72] font-mono">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Champ numéro local - Ajusté avec min-w-0 pour fléchir correctement */}
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 min-w-0 rounded-xl border px-3 py-3 text-base bg-white text-[#141e1a]
                     placeholder:text-[#6e7a72] transition focus:outline-none
                     ${
                       error
                         ? "border-red-500 focus:border-red-500"
                         : "border-[#bdc9c1] focus:border-[#12805c] focus:ring-1 focus:ring-[#12805c]"
                     }
                     ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
        />
      </div>

      {/* Libellé de confirmation */}
      {localNumber && (
        <p className="text-xs text-[#6e7a72] pl-1 animate-fadeIn">
          Format international : <span className="font-semibold font-mono text-[#006547]">{selectedCountry.dialCode} {localNumber}</span>
        </p>
      )}
    </div>
  );
}
