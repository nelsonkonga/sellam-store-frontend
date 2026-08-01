import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { registerAuthAccessors } from "../services/api";

const AuthContext = createContext(null);

// Clés localStorage : on persiste l'auth (contrairement au thème) pour éviter
// de forcer une reconnexion à chaque rechargement de page.
const STORAGE_KEYS = {
  token: "token",
  accountId: "accountId",
  name: "name",
  phoneNumber: "phoneNumber",
};

/**
 * Fournit l'état d'authentification à toute l'application :
 * token, accountId, name, isAuthenticated, et les actions login()/logout().
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token));
  const [accountId, setAccountId] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.accountId)
  );
  const [name, setName] = useState(() => localStorage.getItem(STORAGE_KEYS.name));
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem(STORAGE_KEYS.phoneNumber));

  // Appelé après un login/register réussi (voir authService).
  // Stocke les infos de session en state + localStorage.
  const login = useCallback(({ token, accountId, name, phoneNumber }) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.accountId, accountId);
    localStorage.setItem(STORAGE_KEYS.name, name);
    if (phoneNumber) localStorage.setItem(STORAGE_KEYS.phoneNumber, phoneNumber);
    setToken(token);
    setAccountId(accountId);
    setName(name);
    if (phoneNumber) setPhoneNumber(phoneNumber);
  }, []);

  // Efface toute trace de session. Utilisé au clic "Se déconnecter"
  // et automatiquement par l'intercepteur axios sur une erreur 401.
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.accountId);
    localStorage.removeItem(STORAGE_KEYS.name);
    localStorage.removeItem(STORAGE_KEYS.phoneNumber);
    setToken(null);
    setAccountId(null);
    setName(null);
    setPhoneNumber(null);
  }, []);

  // Tient api.js informé du token courant et de la fonction de déconnexion,
  // pour que l'intercepteur axios (hors arbre React) puisse s'en servir.
  useEffect(() => {
    registerAuthAccessors({ token, logout });
  }, [token, logout]);

  const value = {
    token,
    accountId,
    name,
    phoneNumber,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return ctx;
}
