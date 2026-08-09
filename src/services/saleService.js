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
 * Récupère les ventes d'une boutique filtrées par période.
 * @param {string} shopId
 * @param {string} period ("today", "this_week", "this_month", "recent")
 */
export async function getSalesByPeriod(shopId, period = "recent") {
  const response = await api.get(`/sales/shop/${shopId}`, { params: { period } });
  return response.data;
}

// NOTE : La création de ventes passe désormais exclusivement par les factures
// (invoiceService.addInvoiceLine). L'ancienne fonction createSale a été retirée.
