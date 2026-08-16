import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBalanceSettings,
  saveBalanceSetting,
} from "../services/balanceSettingsService";
import { useShop } from "../context/ShopContext";
import DaySettingRow from "../components/DaySettingRow";
import BottomNav from "../components/BottomNav";

// Jours de la semaine dans l'ordre d'affichage, avec la clé attendue par l'API
const DAYS = [
  { key: "MONDAY", label: "Lundi" },
  { key: "TUESDAY", label: "Mardi" },
  { key: "WEDNESDAY", label: "Mercredi" },
  { key: "THURSDAY", label: "Jeudi" },
  { key: "FRIDAY", label: "Vendredi" },
  { key: "SATURDAY", label: "Samedi" },
  { key: "SUNDAY", label: "Dimanche" },
];

// Valeurs par défaut raisonnables tant qu'un jour n'a pas encore de réglage
const DEFAULT_SETTING = {
  balanceTime: "18:00",
  reminderFrequencyHours: 3,
  enabled: true,
  openingTime: "09:00",
  closingTime: "21:00",
};

export default function BalanceSettingsPage() {
  // État indexé par jour : { MONDAY: { balanceTime, reminderFrequencyHours }, ... }
  const [settings, setSettings] = useState(() =>
    Object.fromEntries(DAYS.map((d) => [d.key, { ...DEFAULT_SETTING }]))
  );
  // Copie de référence pour détecter les lignes modifiées (comparaison isDirty)
  const [savedSettings, setSavedSettings] = useState(settings);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // État de sauvegarde par jour, pour un retour visuel précis ligne par ligne
  const [savingDays, setSavingDays] = useState({}); // { MONDAY: true, ... }
  const [justSavedDays, setJustSavedDays] = useState({});
  const [saveAllError, setSaveAllError] = useState("");
  const [savingAll, setSavingAll] = useState(false);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();

  // Charge les réglages existants, complète avec les valeurs par défaut pour
  // les jours qui n'ont pas encore été configurés côté backend
  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getBalanceSettings(shopId);
        const merged = Object.fromEntries(
          DAYS.map((d) => {
            const existing = data.find((s) => s.dayOfWeek === d.key);
            return [
              d.key,
              existing
                ? {
                    balanceTime: existing.balanceTime,
                    reminderFrequencyHours: existing.reminderFrequencyHours,
                    enabled: existing.enabled !== false,
                    openingTime: existing.openingTime || DEFAULT_SETTING.openingTime,
                    closingTime: existing.closingTime || DEFAULT_SETTING.closingTime,
                  }
                : { ...DEFAULT_SETTING },
            ];
          })
        );
        setSettings(merged);
        setSavedSettings(merged);
      } catch (err) {
        setError("Impossible de charger les réglages. Les valeurs par défaut sont affichées.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [shopId, navigate]);

  function updateDay(dayKey, patch) {
    setSettings((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], ...patch },
    }));
    // Une modification invalide l'indicateur "Enregistré" précédent pour ce jour
    setJustSavedDays((prev) => ({ ...prev, [dayKey]: false }));
  }

  // Un jour est "modifié" si ses valeurs actuelles diffèrent de la dernière version sauvegardée
  function isDayDirty(dayKey) {
    const current = settings[dayKey];
    const saved = savedSettings[dayKey];
    return (
      current.balanceTime !== saved.balanceTime ||
      current.openingTime !== saved.openingTime ||
      current.closingTime !== saved.closingTime ||
      Number(current.reminderFrequencyHours) !== Number(saved.reminderFrequencyHours) ||
      current.enabled !== saved.enabled
    );
  }

  // Sauvegarde un seul jour auprès de l'API, avec son propre indicateur de chargement
  async function saveDay(dayKey) {
    setSavingDays((prev) => ({ ...prev, [dayKey]: true }));
    try {
      await saveBalanceSetting(shopId, {
        dayOfWeek: dayKey,
        balanceTime: settings[dayKey].balanceTime,
        reminderFrequencyHours: Number(settings[dayKey].reminderFrequencyHours),
        enabled: settings[dayKey].enabled,
        openingTime: settings[dayKey].openingTime,
        closingTime: settings[dayKey].closingTime,
      });
      setSavedSettings((prev) => ({ ...prev, [dayKey]: settings[dayKey] }));
      setJustSavedDays((prev) => ({ ...prev, [dayKey]: true }));
      // Fait disparaître la coche "Enregistré" après quelques secondes
      setTimeout(() => {
        setJustSavedDays((prev) => ({ ...prev, [dayKey]: false }));
      }, 2500);
    } finally {
      setSavingDays((prev) => ({ ...prev, [dayKey]: false }));
    }
  }

  // Enregistre uniquement les jours modifiés, une requête par jour (comme demandé)
  async function handleSaveAll() {
    const dirtyDays = DAYS.map((d) => d.key).filter(isDayDirty);

    if (dirtyDays.length === 0) return;

    setSavingAll(true);
    setSaveAllError("");

    try {
      // Envoyées en parallèle : chaque jour est indépendant côté backend
      await Promise.all(dirtyDays.map((dayKey) => saveDay(dayKey)));
    } catch (err) {
      setSaveAllError(
        "Certains jours n'ont pas pu être enregistrés. Vérifiez votre connexion et réessayez."
      );
    } finally {
      setSavingAll(false);
    }
  }

  const hasUnsavedChanges = DAYS.some((d) => isDayDirty(d.key));

  return (
    <div className="min-h-screen bg-section-alt pb-32 text-white">
      <header className="px-5 pb-4 pt-6 mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-white">
          Réglages du bilan
        </h1>
        <p className="mt-1 text-sm text-gray-300">
          Choisis l'heure du bilan et la fréquence des rappels pour chaque jour
        </p>
      </header>

      <main className="flex flex-col gap-3 px-5 mx-auto max-w-5xl">
        {loading && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement des réglages...
          </p>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-medium text-orange-600
                       dark:bg-orange-950/50 dark:text-orange-400"
          >
            {error}
          </div>
        )}

        {!loading &&
          DAYS.map((day) => (
            <DaySettingRow
              key={day.key}
              label={day.label}
              balanceTime={settings[day.key].balanceTime}
              reminderFrequencyHours={settings[day.key].reminderFrequencyHours}
              enabled={settings[day.key].enabled}
              openingTime={settings[day.key].openingTime}
              closingTime={settings[day.key].closingTime}
              onChangeTime={(value) => updateDay(day.key, { balanceTime: value })}
              onChangeFrequency={(value) =>
                updateDay(day.key, { reminderFrequencyHours: value })
              }
              onToggleEnabled={(value) => updateDay(day.key, { enabled: value })}
              onChangeOpeningTime={(value) => updateDay(day.key, { openingTime: value })}
              onChangeClosingTime={(value) => updateDay(day.key, { closingTime: value })}
              isDirty={isDayDirty(day.key)}
              isSaving={!!savingDays[day.key]}
              justSaved={!!justSavedDays[day.key]}
            />
          ))}
      </main>

      {/* Bouton global fixé en bas, au-dessus de la BottomNav */}
      {!loading && (
        <div className="fixed bottom-16 left-0 right-0 border-t border-white/10 glass-strong p-4">
          {saveAllError && (
            <p className="mb-2 text-center text-sm font-medium text-red-500">
              {saveAllError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={savingAll || !hasUnsavedChanges}
            className="w-full max-w-5xl mx-auto block rounded-xl btn-gradient py-3.5 text-base font-semibold
                       text-white shadow-md transition
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAll
              ? "Enregistrement en cours..."
              : hasUnsavedChanges
              ? "Enregistrer tout"
              : "Tout est à jour"}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
