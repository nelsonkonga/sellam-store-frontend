import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Users, Clock, ChevronRight } from "lucide-react";
import { updateThemePreference } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ThemeSelector from "../components/ThemeSelector";
import BottomNav from "../components/BottomNav";

export default function ProfileSettingsPage() {
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // gardé pour un futur upload réel
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState("");

  const navigate = useNavigate();
  const { name, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Preview locale uniquement pour l'instant — voir updateProfilePicture(file)
  // dans profileService.js pour le branchement futur sur PUT /api/profile/picture
  function handlePictureSelect(file) {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePicturePreview(reader.result);
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
      // Le thème reste appliqué visuellement même si la sauvegarde serveur échoue ;
      // on informe juste que la préférence ne sera peut-être pas retenue au prochain login.
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
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950">
      <header className="px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
      </header>

      <main className="flex flex-col gap-5 px-5">
        {/* Photo de profil */}
        <div className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <ProfilePictureUpload
            previewUrl={profilePicturePreview}
            userName={name}
            onFileSelect={handlePictureSelect}
          />
        </div>

        {/* Informations du compte */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom du compte
            </label>
            {/* TODO: rendre éditable + brancher un PUT /api/profile dédié quand disponible.
                Pour l'instant lecture seule, pas d'endpoint backend confirmé. */}
            <input
              type="text"
              value={name || ""}
              readOnly
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-gray-200
                         bg-gray-50 px-4 py-3 text-base text-gray-500
                         dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={"Non renseigné"}
              readOnly
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-gray-200
                         bg-gray-50 px-4 py-3 text-base text-gray-500
                         dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
            />
          </div>
        </div>

        {/* Sélecteur de thème */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
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
          className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1
                     ring-gray-100 transition hover:shadow-md dark:bg-gray-900 dark:ring-gray-800"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Clock size={18} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              Réglages du bilan
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Heure et rappels par jour
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
        </Link>

        {/* Gestion des employés — pas encore disponible */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 opacity-75 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              <Users size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Gestion des employés
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Bientôt disponible
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            title="Bientôt disponible"
            className="mt-3 w-full cursor-not-allowed rounded-xl bg-gray-100 py-2.5 text-sm
                       font-medium text-gray-400 dark:bg-gray-800 dark:text-gray-500"
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
