import axios from "axios";

// Instance axios unique pour toute l'app, avec l'URL de base du backend Spring Boot
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});


// --- Pont entre axios (hors React) et le AuthContext (React) ---
// Un intercepteur axios vit en dehors de l'arbre de composants et ne peut donc
// pas appeler useAuth() directement. AuthProvider enregistre ici, à chaque
// changement de token, la valeur courante + une fonction de déconnexion.
// Cela permet à l'intercepteur de toujours lire le dernier token connu,
// et de déclencher un vrai logout() React en cas de 401.
let currentToken = null;
let onUnauthorized = () => {};

export function registerAuthAccessors({ token, logout }) {
  currentToken = token;
  onUnauthorized = logout;
}

// Ajoute automatiquement le token JWT courant à chaque requête
api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Gère globalement les 401 : le token est invalide/expiré, on déconnecte
// l'utilisateur et on renvoie vers /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
      // Redirection dure : à ce stade on est hors du contexte React Router,
      // un changement d'URL complet est la façon la plus fiable de forcer /login.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
