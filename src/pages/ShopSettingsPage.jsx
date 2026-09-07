import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, AlertCircle, CheckCircle2, Printer } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { updateShopSettings, uploadShopLogo } from "../services/shopService";
import PhoneNumberInput from "../components/PhoneNumberInput";


export default function ShopSettingsPage() {
  const navigate = useNavigate();
  const { selectedShopId, selectedShop, refreshShops } = useShop();

  // Formulaire state
  const [formData, setFormData] = useState({
    phoneNumber: "",
    taxpayerNumber: "",
    autoPrintInvoices: false,
  });

  // Logo
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successTimer, setSuccessTimer] = useState(null);

  const [isDirty, setIsDirty] = useState(false);

  // Initialiser le formulaire depuis selectedShop
  useEffect(() => {
    if (selectedShop) {
      setFormData({
        phoneNumber: selectedShop.phoneNumber || "",
        taxpayerNumber: selectedShop.taxpayerNumber || "",
        autoPrintInvoices: selectedShop.autoPrintInvoices ?? false,
      });
      setLogoPreview(selectedShop.logoUrl || "");
      setIsDirty(false);
      setSaveError("");
      setSuccessMessage("");
    }
  }, [selectedShop]);

  if (!selectedShop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-section pb-24">
        <p className="text-gray-400">Aucune boutique sélectionnée</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setIsDirty(true);
    setSaveError("");
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type et la taille
    if (!file.type.startsWith("image/")) {
      setSaveError("Le fichier doit être une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("L'image ne doit pas dépasser 5 MB");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result);
      setIsDirty(true);
      setSaveError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSuccessMessage("");

    if (successTimer) {
      clearTimeout(successTimer);
      setSuccessTimer(null);
    }

    try {
      // Uploader le logo s'il y a un nouveau fichier
      let newLogoUrl = selectedShop.logoUrl;
      if (logoFile) {
        setUploadingLogo(true);
        try {
          newLogoUrl = await uploadShopLogo(selectedShopId, logoFile);
        } finally {
          setUploadingLogo(false);
        }
      }

      // Préparer la requête des settings
      const settingsPayload = {
        phoneNumber: formData.phoneNumber || null,
        taxpayerNumber: formData.taxpayerNumber || null,
        autoPrintInvoices: formData.autoPrintInvoices,
        // logoUrl est mis à jour par uploadShopLogo, pas ici
        ...(logoFile && { logoUrl: newLogoUrl }),
      };

      // Envoyer les settings
      await updateShopSettings(selectedShopId, settingsPayload);

      // Rafraîchir les données de boutique
      if (refreshShops) {
        await refreshShops();
      }

      // Succès
      setLogoFile(null);
      setIsDirty(false);
      setSuccessMessage("Paramètres sauvegardés avec succès ✓");

      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      setSuccessTimer(timer);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-24 text-[var(--text-primary)]">
      <header className="px-5 pb-4 pt-6 mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-white">
          Paramètres de la boutique
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {selectedShop.name}
        </p>
      </header>

      <main className="flex flex-col gap-5 px-5 mx-auto max-w-5xl">
        {/* Messages d'erreur et succès */}
        {saveError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-950/20 p-4">
            <AlertCircle size={20} className="flex-shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">{saveError}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-950/20 p-4">
            <CheckCircle2 size={20} className="flex-shrink-0 text-green-400 mt-0.5" />
            <p className="text-sm font-medium text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Info boutique (lecture seule) */}
        <div className="flex flex-col gap-4 rounded-2xl glass p-5 shadow-sm">
          <div>
            <label className="text-sm font-medium text-gray-300">
              Nom de la boutique
            </label>
            <input
              type="text"
              value={selectedShop.name || ""}
              readOnly
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-white/10
                     glass-strong px-4 py-3 text-base text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">
              Adresse
            </label>
            <input
              type="text"
              value={selectedShop.address || ""}
              readOnly
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-white/10
                     glass-strong px-4 py-3 text-base text-gray-400"
            />
          </div>
        </div>

        {/* Paramètres éditables */}
        <div className="flex flex-col gap-4 rounded-2xl glass p-5 shadow-sm">
          <div>
            <PhoneNumberInput
              label="Numéro de téléphone"
              value={formData.phoneNumber}
              onChange={(e164) => {
                setFormData(prev => ({ ...prev, phoneNumber: e164 }));
                setIsDirty(true);
              }}
              placeholder="690000000"
            />
            <p className="mt-1 text-xs text-gray-400">
              Affiché sur les factures
            </p>
          </div>

          <div>
            <label htmlFor="taxpayerNumber" className="text-sm font-medium text-gray-300">
              Numéro de contribuable / Identifiant Fiscal
            </label>
            <input
              id="taxpayerNumber"
              type="text"
              name="taxpayerNumber"
              value={formData.taxpayerNumber}
              onChange={handleInputChange}
              placeholder="Ex: ICE / NIF / SIRET"
              className="mt-1.5 w-full rounded-xl border border-white/10 glass-strong px-4 py-3
                     text-base text-white placeholder:text-gray-500 focus:border-brand-400
                     focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
            <p className="mt-1 text-xs text-gray-400">
              Affiché sur les factures
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="rounded-2xl glass p-5 shadow-sm">
          <p className="mb-4 text-sm font-medium text-gray-300">
            Logo de la boutique
          </p>

          {logoPreview && (
            <div className="mb-4 flex justify-center">
              <img
                src={logoPreview}
                alt="Aperçu du logo"
                className="h-24 w-auto max-w-xs rounded-lg border border-white/10 object-contain"
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl
                     border-2 border-dashed border-white/20 px-4 py-6 transition
                     hover:border-brand-400/50 hover:bg-brand-400/5">
            <Upload size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-300">
              {logoFile || selectedShop.logoUrl ? "Changer le logo" : "Ajouter un logo"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              disabled={uploadingLogo || saving}
              className="hidden"
            />
          </label>

          <p className="mt-2 text-xs text-gray-400">
            PNG, JPG, WebP. Max 5 MB.
          </p>
        </div>

        {/* Impression automatique */}
        <div className="rounded-2xl glass p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                <Printer size={18} />
              </div>
              <div>
                <p className="font-medium text-white">Impression automatique</p>
                <p className="text-xs text-gray-400">
                  Imprime chaque facture dès sa validation
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleInputChange({
                  target: {
                    name: "autoPrintInvoices",
                    type: "checkbox",
                    checked: !formData.autoPrintInvoices,
                  },
                })
              }
              disabled={saving || uploadingLogo}
              aria-label="Activer/désactiver l'impression automatique"
              className={`h-6 w-11 flex-shrink-0 rounded-full transition ${
                formData.autoPrintInvoices
                  ? "bg-brand-500"
                  : "bg-white/20"
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                  formData.autoPrintInvoices
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving || uploadingLogo}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5
                   text-base font-semibold text-white transition
                   hover:bg-white/10 disabled:cursor-not-allowed
                   disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving || uploadingLogo}
            className="flex-1 rounded-xl bg-brand-500 py-3.5 text-base font-semibold
                   text-white transition hover:bg-brand-600 disabled:cursor-not-allowed
                   disabled:opacity-50"
          >
            {saving || uploadingLogo ? "Sauvegarde en cours..." : "Sauvegarder"}
          </button>
        </div>
      </main>

      
    </div>
  );
}
