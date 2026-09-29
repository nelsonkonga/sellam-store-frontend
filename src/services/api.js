import axios from "axios";
import { getCacheKey, getCachedResponse, setCachedResponse, clearOfflineCache } from "./offlineCache";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

let currentToken = null;
let onUnauthorized = () => {};
let isTokenExpiredFn = () => false;

export function registerAuthAccessors({ token, logout, isTokenExpired }) {
  currentToken = token;
  onUnauthorized = logout;
  isTokenExpiredFn = isTokenExpired;
}

api.interceptors.request.use((config) => {
  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

  if (!isAuthRoute && isTokenExpiredFn()) {
    onUnauthorized();
    window.location.href = '/login?reason=expired';
    return Promise.reject(new Error('Token expiré'));
  }

  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

api.interceptors.response.use(
    (response) => {
      if (response.config.method?.toLowerCase() === 'get' && !response.config.responseType) {
        const key = getCacheKey(response.config.url, response.config.params);
        setCachedResponse(key, response.data);
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        const url = error.config?.url || "";
        if (url.includes("/auth/me") || url.includes("/auth/login") || url.includes("/auth/register")) {
          return Promise.reject(error);
        }
        onUnauthorized();
        clearOfflineCache();

        const reason = error.response?.data?.message || "Votre session a expiré. Reconnectez-vous.";
        if (window.location.pathname !== "/login") {
          const params = new URLSearchParams({ reason: "expired", message: reason });
          window.location.href = `/login?${params.toString()}`;
        }
        return Promise.reject(error);
      }

      // Abonnement expiré : le backend bloque les actions d'écriture avec
      // un 403 + error: "SUBSCRIPTION_EXPIRED" (cf. SubscriptionAccessFilter).
      // On redirige vers la page d'abonnement plutôt que de laisser l'appelant
      // afficher une erreur brute ou un échec silencieux. On ne redirige que
      // si on n'est pas déjà sur /subscription, pour ne pas boucler (la route
      // de paiement elle-même reste exemptée côté backend, mais par prudence
      // on évite aussi toute redirection en boucle côté client).
      if (error.response?.status === 403 && error.response?.data?.error === "SUBSCRIPTION_EXPIRED") {
        if (window.location.pathname !== "/subscription") {
          window.location.href = "/subscription?reason=expired";
        }
        return Promise.reject(error);
      }

      // Detect offline / network failure
      const isNetworkError = !error.response 
          || error.code === 'ERR_NETWORK' 
          || error.code === 'ECONNABORTED'
          || error.message === 'Network Error'
          || error.message?.includes('net::ERR_INTERNET_DISCONNECTED')
          || error.message?.includes('net::ERR_FAILED');
      
      if (isNetworkError) {
        const config = error.config;
        if (config && config.method?.toLowerCase() === 'get' && !config.responseType) {
          const key = getCacheKey(config.url, config.params);
          const cached = getCachedResponse(key);
          if (cached !== null) {
            return Promise.resolve({
              data: cached,
              status: 200,
              statusText: 'OK (Cached)',
              headers: {},
              config: config,
              fromCache: true
            });
          }
        }
      }
      return Promise.reject(error);
    }
);

export default api;