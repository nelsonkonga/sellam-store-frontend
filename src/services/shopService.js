import api from "./api";
import { compressImageFile } from "../utils/compressImage";

/**
 * Récupère la liste des boutiques du compte connecté.
 * @returns {Promise<Array<{ id: string, name: string, address: string, logoUrl: string }>>}
 */
export async function getShops() {
  const response = await api.get("/shops");
  return response.data;
}

/**
 * Récupère la liste des boutiques du compte connecté avec les résumés agrégés (ventes du jour, marge, effectif).
 * @returns {Promise<Array<{ id: string, name: string, address: string, logoUrl: string, salesToday: number, margin: string, teamCount: number }>>}
 */
export async function getShopsSummaries() {
  const response = await api.get("/shops/summaries");
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


export async function updateShopSettings(shopId, settings) {
  const response = await api.patch(`/shops/${shopId}/settings`, settings);
  return response.data;
}


export async function uploadShopLogo(shopId, file) {
  const prepared = await compressImageFile(file, "logo");
  const formData = new FormData();
  formData.append("file", prepared);

  const response = await api.post(`/shops/${shopId}/logo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.logoUrl;
}
