import api from "./api";

/**
 * Récupère les ventes du jour pour une boutique.
 * @param {string} shopId
 * @returns {Promise<Array<{ id, totalPrice, margin, ... }>>}
 */
export async function getTodaySales(shopId) {
  const response = await api.get("/sales/today", { params: { shopId } });
  return response.data;
}

/**
 * Enregistre une nouvelle vente.
 * @param {string} shopId
 * @param {{ productId: string, quantity: number }} data
 */
export async function createSale(shopId, data) {
  const response = await api.post("/sales", data, { params: { shopId } });
  return response.data;
}
