import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Users, Clock, ChevronRight, Store, Save, PencilLine, PencilOff,Gift } from "lucide-react";
import { updateThemePreference, updateProfilePicture, getCanChangeEmail, getCanChangePhone, changeEmail, changePhone } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ThemeSelector from "../components/ThemeSelector";
import { useShop } from "../context/ShopContext.jsx";

export default function ProfileSettingsPage() {
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState("");

  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [canChangePhoneObj, setCanChangePhoneObj] = useState({ canChange: false, reason: "" });
  const [canChangeEmailObj, setCanChangeEmailObj] = useState({ canChange: false, reason: "" });
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [identityMessage, setIdentityMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();
  const { name, logout, phoneNumber, email, profilePictureUrl, isManager, systemRole, login } = useAuth();
  const { theme, setTheme } = useTheme();

  const { selectedShop } = useShop();

  const isAdmin = systemRole === "PLATFORM_ADMIN";
  const canEditPhone = canChangePhoneObj.canChange || isAdmin;
  const canEditEmail = canChangeEmailObj.canChange || isAdmin;

  useEffect(() => {
    setEditPhone(phoneNumber || "");
    setEditEmail(email || "");

    const fetchIdentityStatus = async () => {
      try {
        const phoneRes = await getCanChangePhone();
        setCanChangePhoneObj(phoneRes);
        const emailRes = await getCanChangeEmail();
        setCanChangeEmailObj(emailRes);
      } catch (e) {
        console.error(e);
      }
    };
    fetchIdentityStatus();
  }, [phoneNumber, email]);

  // 🔥 Écoute les rafraîchissements asynchrones de la photo de profil du contexte global
  useEffect(() => {
    if (profilePictureUrl) {
      setProfilePicturePreview(profilePictureUrl);
    }
  }, [profilePictureUrl]);

  function handlePictureSelect(file) {
    if (!file) return;

    // 🔥 1. Génère instantanément un aperçu synchrone en mémoire vive
    const localPreview = URL.createObjectURL(file);
    setProfilePicturePreview(localPreview);

    // 2. Téléverse le fichier sur le serveur en tâche de fond
    uploadProfilePictureFile(file);
  }

  async function uploadProfilePictureFile(file) {
    setUploading(true);
    try {
      const result = await updateProfilePicture(file);
      if (result && result.profilePictureUrl) {
        // 🔥 3. Met à jour le contexte global pour figer définitivement la nouvelle image
        login({
          token: localStorage.getItem("token"),
          accountId: localStorage.getItem("accountId"),
          userType: localStorage.getItem("userType"),
          shopId: localStorage.getItem("shopId"),
          name: name,
          phoneNumber: editPhone,
          email: editEmail,
          emailVerified: true,
          profilePictureUrl: result.profilePictureUrl
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'upload de la photo de profil", err);
    } finally {
      setUploading(false);
    }
  }


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

  async function handleSaveIdentity() {
    setIdentityMessage({ type: "", text: "" });
    setIsSavingIdentity(true);
    
    try {
      if (editPhone !== phoneNumber && editPhone) {
         await changePhone(editPhone, isAdmin);
      }
      if (editEmail !== email && editEmail) {
         await changeEmail(editEmail, isAdmin);
      }
      setIdentityMessage({ type: "success", text: "Identifiants mis à jour." });
      
      // Update local storage via login override hack
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      authData.phoneNumber = editPhone;
      authData.email = editEmail;
      login(authData);
      
    } catch (err) {
       setIdentityMessage({ type: "error", text: err.response?.data?.message || "Erreur lors de la modification" });
    } finally {
       setIsSavingIdentity(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const activatePhoneEdit = () => {
    if (!canEditPhone) return;
    setEditingPhone(true);
  };

  const activateEmailEdit = () => {
    if (!canEditEmail) return;
    setEditingEmail(true);
  };

  return (
      <div className="min-h-screen bg-[var(--bg-page)] pb-24 text-[var(--text-primary)]">
        <header className="mx-auto max-w-7xl border-b border-[#bdc9c1] px-5 pb-6 pt-8 md:px-8 lg:px-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Compte</p>
          <h1 className="font-display text-3xl font-bold text-[#141e1a]">Mon profil</h1>
        </header>

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-6 md:grid-cols-[260px_minmax(0,1fr)] md:px-8 lg:px-10">
          <div className="flex h-fit flex-col items-center rounded-xl border border-[#bdc9c1] bg-white p-6 shadow-sm">
            <ProfilePictureUpload
                previewUrl={profilePicturePreview || profilePictureUrl}
                userName={name}
                onFileSelect={handlePictureSelect}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-[#bdc9c1] bg-white p-5 shadow-sm">
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Numéro de téléphone
              </label>
              {!canEditPhone && canChangePhoneObj.reason && (
                <p className="mb-2 text-xs text-orange-400">{canChangePhoneObj.reason}</p>
              )}
              <div className="relative">
                <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    disabled={!editingPhone || !canEditPhone}
                    className="w-full rounded-xl border border-white/10 pr-12
                           glass-strong px-4 py-3 text-base text-white disabled:text-gray-500 disabled:cursor-not-allowed disabled:bg-slate-900/40"
                />
                <button
                  type="button"
                  aria-label="Modifier le numéro de téléphone"
                  disabled={!canEditPhone}
                  onClick={activatePhoneEdit}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-gray-200 transition hover:border-emerald-400/50 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {canEditPhone ? <PencilLine size={16} className="text-emerald-400" /> : <PencilOff size={16} className="text-gray-500" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              {!canEditEmail && canChangeEmailObj.reason && (
                <p className="mb-2 text-xs text-orange-400">{canChangeEmailObj.reason}</p>
              )}
              <div className="relative">
                <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    disabled={!editingEmail || !canEditEmail}
                    className="w-full rounded-xl border border-white/10 pr-12
                           glass-strong px-4 py-3 text-base text-white disabled:text-gray-500 disabled:cursor-not-allowed disabled:bg-slate-900/40"
                />
                <button
                  type="button"
                  aria-label="Modifier l'email"
                  disabled={!canEditEmail}
                  onClick={activateEmailEdit}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-gray-200 transition hover:border-emerald-400/50 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {canEditEmail ? <PencilLine size={16} className="text-emerald-400" /> : <PencilOff size={16} className="text-gray-500" />}
                </button>
              </div>
            </div>
            
            {isAdmin && (!canChangePhoneObj.canChange || !canChangeEmailObj.canChange) && (
                <div className="text-xs text-brand-400">Mode Admin : Limite de 3 mois ignorée.</div>
            )}
            
            {identityMessage.text && (
                <div className={`text-sm ${identityMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                    {identityMessage.text}
                </div>
            )}
            
            {(editPhone !== phoneNumber || editEmail !== email) && (
                <button
                    onClick={handleSaveIdentity}
                    disabled={isSavingIdentity}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                    <Save size={16} />
                    {isSavingIdentity ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
            )}
          </div>

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

          <Link
              to="/referrals"
              className="flex items-center gap-3 rounded-2xl glass p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
              <Gift size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                Parrainage
              </p>
              <p className="text-xs text-gray-400">
                Invitez et gagnez des jours d'abonnement offerts
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>

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

        
      </div>
  );
}