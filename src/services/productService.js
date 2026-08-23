import api from "./api";

export async function getSaleTypes(shopId) {
  const response = await api.get("/sale-types", { params: { shopId } });
  return response.data;
}

export async function createSaleType(shopId, data) {
  const response = await api.post("/sale-types", data, { params: { shopId } });
  return response.data;
}

/**
 * Récupère la liste des produits d'une boutique.
 * @param {string} shopId
 * @returns {Promise<Array<{ id, name, pictureUrl, stockQuantity, alertThreshold }>>}
 */
export async function getProducts(shopId) {
  const response = await api.get("/products", { params: { shopId } });
  return response.data;
}

/**
 * Récupère un produit par son id (utilisé quand la page /products/:id est
 * ouverte directement, sans passer par la liste déjà chargée en mémoire).
 * TODO: endpoint pas encore confirmé côté backend, à valider avec l'équipe Spring Boot.
 * @param {string} id
 */
export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function listTopSellingProducts(shopId) {
  const response = await api.get("/products/top-selling", { params: { shopId } });
  return response.data;
}

export async function getProductByBarcode(shopId, barcode) {
  const response = await api.get(`/products/barcode/${barcode}`, { params: { shopId } });
  return response.data;
}

/**
 * Crée un nouveau produit.
 * @param {object} data - { shopId, name, barcode, saleTypeEnum, purchasePrice, sellingPrice, stockQuantity, alertThreshold, category, pictureUrl }
 */
export async function createProduct(data) {
  const response = await api.post("/products", data);
  return response.data;
}

/**
 * Met à jour un produit existant.
 * @param {string} id
 * @param {object} data
 */
export async function updateProduct(id, data) {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
}

/**
 * Upload de la photo d'un produit.
 * Retourne l'URL publique de la photo stockée sur Supabase.
 * @param {string} productId
 * @param {File} file
 */
export async function uploadProductPicture(productId, file) {
  const formData = new FormData();
  formData.append("picture", file);
  const response = await api.post(`/products/${productId}/picture`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
