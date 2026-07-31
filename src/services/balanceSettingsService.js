import api from "./api";

/**
 * Récupère les réglages de bilan existants pour la boutique (par jour de semaine).
 * @param {string} shopId
 * @returns {Promise<Array<{ dayOfWeek: string, balanceTime: string, reminderFrequencyHours: number }>>}
 */
export async function getBalanceSettings(shopId) {
  const response = await api.get("/balance-settings", { params: { shopId } });
  return response.data;
}

/**
 * Crée ou met à jour le réglage de bilan d'un jour donné.
 * @param {string} shopId
 * @param {{ dayOfWeek: string, balanceTime: string, reminderFrequencyHours: number }} data
 */
export async function saveBalanceSetting(shopId, data) {
  const response = await api.post("/balance-settings", data, { params: { shopId } });
  return response.data;
}
