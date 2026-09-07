import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
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

function getCacheKey(config) {
  const paramsStr = config.params ? JSON.stringify(config.params) : "";
  return `offline_cache_${config.url}_${paramsStr}`;
}

api.interceptors.response.use(
    (response) => {
      if (response.config.method?.toLowerCase() === 'get' && !response.config.responseType) {
        try {
          const key = getCacheKey(response.config);
          localStorage.setItem(key, JSON.stringify(response.data));
        } catch (err) {
          // Ignore localStorage errors (quota exceeded, etc.)
        }
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
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
          try {
            const key = getCacheKey(config);
            const cached = localStorage.getItem(key);
            if (cached) {
              return Promise.resolve({
                data: JSON.parse(cached),
                status: 200,
                statusText: 'OK (Cached)',
                headers: {},
                config: config,
                fromCache: true
              });
            }
          } catch (err) {
            // Ignore parse errors
          }
        }
      }
      return Promise.reject(error);
    }
);

export default api;