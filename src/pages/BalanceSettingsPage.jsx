import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBalanceSettings,
  saveBalanceSetting,
} from "../services/balanceSettingsService";
import { useShop } from "../context/ShopContext";
import BottomNav from "../components/BottomNav";

const DAYS = [
  { key: "MONDAY", label: "Lundi" },
  { key: "TUESDAY", label: "Mardi" },
  { key: "WEDNESDAY", label: "Mercredi" },
  { key: "THURSDAY", label: "Jeudi" },
  { key: "FRIDAY", label: "Vendredi" },
  { key: "SATURDAY", label: "Samedi" },
  { key: "SUNDAY", label: "Dimanche" },
];

const DEFAULT_SETTING = {
  balanceTime: "18:00",
  reminderFrequencyHours: 3,
  enabled: true,
  openingTime: "09:00",
  closingTime: "21:00",
};

export default function BalanceSettingsPage() {
  const [settings, setSettings] = useState(() =>
    Object.fromEntries(DAYS.map((d) => [d.key, { ...DEFAULT_SETTING }]))
  );
  const [savedSettings, setSavedSettings] = useState(settings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingDays, setSavingDays] = useState({});
  const [justSavedDays, setJustSavedDays] = useState({});
  const [saveAllError, setSaveAllError] = useState("");
  const [savingAll, setSavingAll] = useState(false);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getBalanceSettings(shopId);
        const merged = Object.fromEntries(
          DAYS.map((d) => {
            const existing = data.find((s) => s.dayOfWeek === d.key);
            return [
              d.key,
              existing ? { ...DEFAULT_SETTING, ...existing } : { ...DEFAULT_SETTING }
            ];
          })
        );
        setSettings(merged);
        setSavedSettings(merged);
      } catch (err) {
        setError("Impossible de charger les paramètres.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [shopId]);

  const handleDayChange = (dayKey, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value }
    }));
  };

  const handleSaveDay = async (dayKey) => {
    setSavingDays((prev) => ({ ...prev, [dayKey]: true }));
    try {
      await saveBalanceSetting(shopId, dayKey, settings[dayKey]);
      setSavedSettings((prev) => ({ ...prev, [dayKey]: settings[dayKey] }));
      setJustSavedDays((prev) => ({ ...prev, [dayKey]: true }));
      setTimeout(() => setJustSavedDays((prev) => ({ ...prev, [dayKey]: false })), 2000);
    } catch (err) {
      setError(`Erreur pour ${DAYS.find((d) => d.key === dayKey).label}`);
    } finally {
      setSavingDays((prev) => ({ ...prev, [dayKey]: false }));
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    setSaveAllError("");
    try {
      await Promise.all(
        DAYS.map((d) => saveBalanceSetting(shopId, d.key, settings[d.key]))
      );
      setSavedSettings(settings);
      setJustSavedDays(
        Object.fromEntries(DAYS.map((d) => [d.key, true]))
      );
      setTimeout(() => setJustSavedDays({}), 2000);
    } catch (err) {
      setSaveAllError("Erreur lors de la sauvegarde de tous les jours.");
    } finally {
      setSavingAll(false);
    }
  };

  const hasChanges = DAYS.some((d) => JSON.stringify(settings[d.key]) !== JSON.stringify(savedSettings[d.key]));

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <div className="mx-auto max-w-7xl px-5 py-2 md:px-8 lg:px-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]">
            <span className="text-xl">arrow_back</span>
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Trésorerie</p>
            <h1 className="font-display text-3xl font-bold">Réglages du Bilan</h1>
            <p className="text-sm text-[#6e7a72]">Configurez les horaires et rappels de déclaration.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm text-[#6e7a72] py-10">Chargement des paramètres...</p>
        ) : (
          <>
            <div className="mb-6 flex justify-end gap-2">
              <button
                onClick={handleSaveAll}
                disabled={savingAll || !hasChanges}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  savingAll || !hasChanges
                    ? "bg-[#bdc9c1] text-[#6e7a72] cursor-not-allowed"
                    : "bg-[#006547] text-white hover:bg-[#12805c]"
                }`}
              >
                {savingAll ? "Sauvegarde..." : "Tout sauvegarder"}
              </button>
            </div>

            {saveAllError && (
              <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">
                {saveAllError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day) => (
                <div key={day.key} className="bg-white border border-[#bdc9c1] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-[#141e1a]">{day.label}</h3>
                    <button
                      onClick={() => handleSaveDay(day.key)}
                      disabled={savingDays[day.key]}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                        savingDays[day.key]
                          ? "bg-[#bdc9c1] text-[#6e7a72] cursor-not-allowed"
                          : justSavedDays[day.key]
                          ? "bg-[#ddffea] text-[#005138]"
                          : "bg-[#ebf6ef] text-[#3e4943] hover:bg-[#dae5de]"
                      }`}
                    >
                      {justSavedDays[day.key] ? "Sauvegardé" : savingDays[day.key] ? "..." : "Sauvegarder"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#3e4943] mb-1 block">Heure de bilan</label>
                      <input
                        type="time"
                        value={settings[day.key].balanceTime}
                        onChange={(e) => handleDayChange(day.key, "balanceTime", e.target.value)}
                        className="w-full border border-[#bdc9c1] rounded-lg p-2 text-sm text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#3e4943] mb-1 block">Heure d'ouverture</label>
                      <input
                        type="time"
                        value={settings[day.key].openingTime}
                        onChange={(e) => handleDayChange(day.key, "openingTime", e.target.value)}
                        className="w-full border border-[#bdc9c1] rounded-lg p-2 text-sm text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#3e4943] mb-1 block">Heure de fermeture</label>
                      <input
                        type="time"
                        value={settings[day.key].closingTime}
                        onChange={(e) => handleDayChange(day.key, "closingTime", e.target.value)}
                        className="w-full border border-[#bdc9c1] rounded-lg p-2 text-sm text-[#141e1a] focus:border-[#006547] focus:ring-1 focus:ring-[#006547] outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-xs text-[#3e4943]">Activer le bilan</label>
                      <button
                        onClick={() => handleDayChange(day.key, "enabled", !settings[day.key].enabled)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings[day.key].enabled ? "bg-[#006547]" : "bg-[#bdc9c1]"
                        }`}
                      >
                        <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          settings[day.key].enabled ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
