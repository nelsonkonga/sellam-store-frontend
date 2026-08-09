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

api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
);

export default api;