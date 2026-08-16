import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Users, Clock, ChevronRight, Store } from "lucide-react";
import { updateThemePreference, updateProfilePicture } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ThemeSelector from "../components/ThemeSelector";
import BottomNav from "../components/BottomNav";
import { useShop } from "../context/ShopContext.jsx";

export default function ProfileSettingsPage() {
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState("");

  const navigate = useNavigate();
  const { name, logout, phoneNumber, profilePictureUrl, isManager } = useAuth();
  const { theme, setTheme } = useTheme();

  const { selectedShop } = useShop();

  function handlePictureSelect(file) {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicturePreview(reader.result);
      // Télécharger immédiatement
      uploadProfilePictureFile(file);
    };
    reader.readAsDataURL(file);
  }

  async function uploadProfilePictureFile(file) {
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await updateProfilePicture(file);
      if (result.profilePictureUrl) {
        // La photo a été uploadée ; la page se rechargera quand l'auth context se met à jour
        // ou le composant affichera l'URL retournée
      }
    } catch (err) {
      console.error("Erreur lors de l'upload de la photo de profil", err);
    } finally {
      setUploading(false);
    }
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

          {isManager && (
            <Link
                to="/employees"
                className="flex items-center gap-3 rounded-2xl glass p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  Gestion des employés
                </p>
                <p className="text-xs text-gray-400">
                  Ajouter, modifier et gérer l’équipe
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </Link>
          )}

          {/* Lien vers les réglages de la boutique */}
          <Link
              to="/settings/shop"
              className="flex items-center gap-3 rounded-2xl glass p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
              <Store size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                Paramètres de la boutique
              </p>
              <p className="text-xs text-gray-400">
                Logo, téléphone, numéro fiscal
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>

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