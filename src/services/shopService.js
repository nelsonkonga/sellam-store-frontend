import api from "./api";

/**
 * Récupère la liste des boutiques du compte connecté.
 * @returns {Promise<Array<{ id: string, name: string, address: string, logoUrl: string }>>}
 */
export async function getShops() {
  const response = await api.get("/shops");
  return response.data;
}

/**
 * Crée une nouvelle boutique pour le compte connecté.
 * @param {{ name: string, address: string, logoUrl?: string }} data
 * @returns {Promise<{ id: string, name: string, address: string, logoUrl: string }>}
 */
export async function createShop(data) {
  const response = await api.post("/shops", data);
  return response.data;
}
