import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTodaySales } from "../services/saleService";
import {
  submitDailyBalance,
  getDailyBalanceHistory,
} from "../services/dailyBalanceService";
import { useShop } from "../context/ShopContext";
import NumericKeypad from "../components/NumericKeypad";
import BalanceResultCard from "../components/BalanceResultCard";
import StatusBadge from "../components/StatusBadge";
import BottomNav from "../components/BottomNav";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function DailyBalancePage() {
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const [declaredCash, setDeclaredCash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null); // réponse de l'API après soumission

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();

  // Charge le résumé du jour (ventes) + l'historique en parallèle
  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function fetchSummary() {
      try {
        const data = await getTodaySales(shopId);
        setSales(Array.isArray(data) ? data : []);
      } catch (err) {
        setSummaryError("Impossible de charger le résumé des ventes du jour.");
      } finally {
        setLoadingSales(false);
      }
    }

    async function fetchHistory() {
      try {
        const data = await getDailyBalanceHistory(shopId);
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        // Historique non bloquant : pas d'erreur affichée, section vide si échec.
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchSummary();
    fetchHistory();
  }, [shopId, navigate]);

  // Résumé du jour calculé côté frontend à partir des ventes
  const safeSales = Array.isArray(sales) ? sales : [];
  const totalSalesToday = safeSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalMarginToday = safeSales.reduce((sum, sale) => sum + (sale.margin || 0), 0);

  async function handleSubmit() {
    const numericCash = parseFloat(declaredCash);

    if (isNaN(numericCash) || numericCash < 0) {
      setSubmitError("Entrez un montant valide.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const data = await submitDailyBalance(shopId, numericCash);
      setResult(data);
      // Ajoute immédiatement ce bilan en tête de l'historique affiché,
      // sans attendre un refetch complet de la liste
      setHistory((prev) => [
        {
          id: data.id || `local-${Date.now()}`,
          date: data.date || new Date().toISOString(),
          status: data.status,
          declaredCash: numericCash,
          discrepancy: data.discrepancy,
        },
        ...prev,
      ]);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      setSubmitError(
        backendMessage || "Impossible de vérifier le bilan pour le moment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Repart de zéro pour permettre une nouvelle saisie (ex: après correction)
  function handleReset() {
    setResult(null);
    setDeclaredCash("");
    setSubmitError("");
  }

  return (
    <div className="min-h-screen bg-section-alt pb-24 text-white">
      <header className="px-5 pb-4 pt-6 mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-white">
          Bilan du jour
        </h1>
      </header>

      <main className="flex flex-col gap-5 px-5 mx-auto max-w-5xl">
        {/* Résumé du jour, calculé depuis les ventes déjà enregistrées */}
        {loadingSales ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement du résumé...
          </p>
        ) : summaryError ? (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                       dark:bg-red-950/50 dark:text-red-400"
          >
            {summaryError}
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl glass p-4 shadow-sm">
              <p className="text-xs text-gray-300">Ventes du jour</p>
              <p className="mt-1 text-lg font-bold text-white">
                {currencyFormatter.format(totalSalesToday)}
              </p>
            </div>
            <div className="flex-1 rounded-2xl glass p-4 shadow-sm">
              <p className="text-xs text-gray-300">Marge du jour</p>
              <p className="mt-1 text-lg font-bold text-white">
                {currencyFormatter.format(totalMarginToday)}
              </p>
            </div>
          </div>
        )}

        {/* Soit le résultat du bilan (après soumission), soit le formulaire de saisie */}
        {result ? (
          <div className="flex flex-col gap-4">
            <BalanceResultCard result={result} />
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-xl border border-white/20 py-3 text-sm font-medium
                         text-white transition hover:bg-white/10"
            >
              Refaire une vérification
            </button>
          </div>
        ) : (
          <div className="rounded-2xl glass p-5 shadow-sm">
            <p className="mb-3 text-center text-sm font-medium text-gray-300">
              Argent que tu as en main actuellement
            </p>
            <p className="mb-4 text-center text-3xl font-bold text-white">
              {declaredCash
                ? currencyFormatter.format(parseFloat(declaredCash) || 0)
                : "0 FCFA"}
            </p>

            <NumericKeypad
              value={declaredCash}
              onChange={setDeclaredCash}
              allowDecimal={false}
            />

            {submitError && (
              <div
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                           dark:bg-red-950/50 dark:text-red-400"
              >
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 w-full rounded-xl btn-gradient py-4 text-base font-bold
                         text-white shadow-md transition
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Vérification..." : "Vérifier mon bilan"}
            </button>
          </div>
        )}

        {/* Historique des bilans précédents */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-300">
            Historique
          </h2>

          {loadingHistory ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">
              Chargement de l'historique...
            </p>
          ) : !Array.isArray(history) || history.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">
              Aucun bilan enregistré pour l'instant.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((entry) => {
                const dateObj = entry.date ? new Date(entry.date) : null;
                const isValidDate = dateObj && !isNaN(dateObj.getTime());
                return (
                  <div
                    key={entry.id || Math.random()}
                    className="flex items-center justify-between rounded-xl glass p-3
                               shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isValidDate ? dateFormatter.format(dateObj) : "Date inconnue"}
                      </p>
                      <p className="text-xs text-gray-300">
                        Déclaré : {currencyFormatter.format(entry.declaredCash)}
                      </p>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
