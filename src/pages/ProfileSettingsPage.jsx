import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Users, Clock, ChevronRight, Printer } from "lucide-react";
import { updateThemePreference } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ThemeSelector from "../components/ThemeSelector";
import BottomNav from "../components/BottomNav";
import { useShop } from "../context/ShopContext.jsx";
import { updateShopSettings } from "../services/shopService.js";

export default function ProfileSettingsPage() {
  const [profilePicturePreview, setProfilePicturePreview] = useState(() => localStorage.getItem("profilePicturePreview") || "");
  const [selectedFile, setSelectedFile] = useState(null); // gardé pour un futur upload réel
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState("");

  const navigate = useNavigate();
  const { name, logout, phoneNumber, profilePictureUrl } = useAuth();
  const { theme, setTheme } = useTheme();

  const { selectedShopId, selectedShop, refreshShops } = useShop();
  const [autoPrintInvoices, setAutoPrintInvoices] = useState(selectedShop?.autoPrintInvoices ?? false);

  // Resynchronise le toggle si la boutique sélectionnée change (ou se recharge)
  useEffect(() => {
    setAutoPrintInvoices(selectedShop?.autoPrintInvoices ?? false);
  }, [selectedShop]);

  async function handleToggleAutoPrint(value) {
    setAutoPrintInvoices(value); // optimiste
    try {
      await updateShopSettings(selectedShopId, { autoPrintInvoices: value });
      if (refreshShops) await refreshShops();
    } catch (err) {
      setAutoPrintInvoices(!value); // rollback si échec
    }
  }

  function handlePictureSelect(file) {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicturePreview(reader.result);
      localStorage.setItem("profilePicturePreview", reader.result);
    };
    reader.readAsDataURL(file);
    // NOTE: appeler ici updateProfilePicture(file) une fois l'endpoint prêt
  }

  // Applique le changement immédiatement dans toute l'app (ThemeContext),
  // puis tente de le persister côté backend. Le changement visuel n'attend
  // pas la réponse réseau : la réactivité prime sur la confirmation serveur.
  async function handleThemeChange(newTheme) {
    setTheme(newTheme);
    setThemeError("");
    setThemeSaving(true);

    try {
      await updateThemePreference(newTheme);
    } catch (err) {
      setThemeError("Le thème est appliqué, mais n'a pas pu être enregistré sur le serveur.");
    } finally {
      setThemeSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
      <div className="min-h-screen bg-section-alt pb-24 text-white">
        <header className="px-5 pb-4 pt-6 mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-white">
            Paramètres
          </h1>
        </header>

        <main className="flex flex-col gap-5 px-5 mx-auto max-w-5xl">
          {/* Photo de profil */}
          <div className="flex flex-col items-center rounded-2xl glass p-6 shadow-sm">
            <ProfilePictureUpload
                previewUrl={profilePicturePreview || profilePictureUrl}
                userName={name}
                onFileSelect={handlePictureSelect}
            />
          </div>

          {/* Informations du compte */}
          <div className="flex flex-col gap-4 rounded-2xl glass p-5 shadow-sm">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du compte
              </label>
              <input
                  type="text"
                  value={name || ""}
                  readOnly
                  className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-white/10
                         glass-strong px-4 py-3 text-base text-gray-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Numéro de téléphone
              </label>
              <input
                  type="tel"
                  value={phoneNumber || "Non renseigné"}
                  readOnly
                  className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-white/10
                         glass-strong px-4 py-3 text-base text-gray-400"
              />
            </div>
          </div>

          {/* Sélecteur de thème */}
          <div className="rounded-2xl glass p-5 shadow-sm">
            <p className="mb-3 text-sm font-medium text-gray-300">
              Apparence
            </p>
            <ThemeSelector
                value={theme}
                onChange={handleThemeChange}
                disabled={themeSaving}
            />
            {themeError && (
                <p className="mt-2 text-xs font-medium text-orange-500">{themeError}</p>
            )}
          </div>

          {/* Impression automatique des factures */}
          <div className="rounded-2xl glass p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                  <Printer size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">Impression automatique</p>
                  <p className="text-xs text-gray-400">Imprime chaque facture dès sa validation</p>
                </div>
              </div>
              <button
                  type="button"
                  onClick={() => handleToggleAutoPrint(!autoPrintInvoices)}
                  aria-label="Activer/désactiver l'impression automatique"
                  className={`h-6 w-11 flex-shrink-0 rounded-full transition ${autoPrintInvoices ? "bg-brand-500" : "bg-white/20"}`}
              >
              <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${autoPrintInvoices ? "translate-x-5" : "translate-x-0.5"}`}
              />
              </button>
            </div>
          </div>

          {/* Lien vers les réglages du bilan journalier (heure + rappels) */}
          <Link
              to="/settings/balance"
              className="flex items-center gap-3 rounded-2xl glass p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
              <Clock size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                Réglages du bilan
              </p>
              <p className="text-xs text-gray-400">
                Heure et rappels par jour
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>

          {/* Gestion des employés — pas encore disponible */}
          <div className="rounded-2xl glass p-5 shadow-sm opacity-75">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-500">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-300">
                  Gestion des employés
                </p>
                <p className="text-xs text-gray-500">
                  Bientôt disponible
                </p>
              </div>
            </div>
            <button
                type="button"
                disabled
                title="Bientôt disponible"
                className="mt-3 w-full cursor-not-allowed rounded-xl bg-white/5 py-2.5 text-sm
                       font-medium text-gray-500"
            >
              Gérer les employés
            </button>
          </div>

          {/* Déconnexion */}
          <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200
                     bg-red-50 py-3.5 text-base font-semibold text-red-600 transition
                     hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30
                     dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </main>

        <BottomNav />
      </div>
  );
}