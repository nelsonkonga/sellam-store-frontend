import api from "./api";

/**
 * Connecte un utilisateur existant.
 * @param {{ phoneNumber: string, password: string }} credentials
 * @returns {Promise<{ token: string, accountId: string, name: string }>}
 */
export async function login(credentials) {
  const response = await api.post("/auth/login", credentials);
  return response.data;
}

/**
 * Inscrit un nouveau compte gérant.
 * @param {{ name: string, phoneNumber: string, password: string }} data
 * @returns {Promise<{ token: string, accountId: string, name: string }>}
 */
export async function register(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}
