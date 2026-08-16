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

/**
 * Initie le processus de réinitialisation de mot de passe.
 * @param {{ phoneNumber: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPassword(data) {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
}

/**
 * Réinitialise le mot de passe avec le token reçu par email.
 * @param {{ resetToken: string, newPassword: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(data) {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
}
