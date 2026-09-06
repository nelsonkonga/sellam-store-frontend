import api from "./api";

/**
 * Récupère les données consolidées du cockpit (KPIs agrégés en base, timeline des factures, stock critique).
 * @param {string} shopId
 * @returns {Promise<{
 *   kpis: {
 *     totalSalesToday: number,
 *     totalMarginToday: number,
 *     averageBasket: number,
 *     invoiceCountToday: number,
 *     lowStockCount: number
 *   },
 *   recentInvoices: Array,
 *   criticalProducts: Array
 * }>}
 */
export async function getDashboardData(shopId) {
  const response = await api.get("/dashboard", {
    params: { shopId },
  });
  return response.data;
}
