import api from "./api";

/**
 * Déclare le montant d'argent réellement en caisse pour aujourd'hui.
 * Le backend compare ce montant aux ventes enregistrées et renvoie un statut.
 * @param {string} shopId
 * @param {number} declaredCash
 * @returns {Promise<{ status: "OK"|"POSITIVE_DISCREPANCY"|"NEGATIVE_DISCREPANCY", discrepancy: number, declaredCash: number, expectedCash: number, date: string }>}
 */
export async function submitDailyBalance(shopId, declaredCash) {
  const response = await api.post(
    "/daily-balance",
    { declaredCash },
    { params: { shopId } }
  );
  return response.data;
}

/**
 * Récupère l'historique des bilans journaliers précédents.
 * @param {string} shopId
 * @returns {Promise<Array<{ id, date, status, declaredCash, discrepancy }>>}
 */
export async function getDailyBalanceHistory(shopId) {
  const response = await api.get("/daily-balance/history", { params: { shopId } });
  return response.data;
}
