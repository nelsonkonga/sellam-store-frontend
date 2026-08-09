import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { registerAuthAccessors } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "token",
  accountId: "accountId",
  userType: "userType",
  shopId: "shopId",
  name: "name",
  phoneNumber: "phoneNumber",
  email: "email",
  emailVerified: "emailVerified",
  tokenExpiresAt: "tokenExpiresAt",
};

/**
 * Fournit l'état d'authentification à toute l'application :
 * token, accountId, userType, shopId, name, isAuthenticated, et les actions login()/logout().
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token));
  const [accountId, setAccountId] = useState(() =>
      localStorage.getItem(STORAGE_KEYS.accountId)
  );
  const [userType, setUserType] = useState(() => localStorage.getItem(STORAGE_KEYS.userType) || "ACCOUNT");
  const [shopId, setShopId] = useState(() => localStorage.getItem(STORAGE_KEYS.shopId));
  const [name, setName] = useState(() => localStorage.getItem(STORAGE_KEYS.name));
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem(STORAGE_KEYS.phoneNumber));
  const [tokenExpiresAt, setTokenExpiresAt] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.tokenExpiresAt);
    return stored ? parseInt(stored, 10) : null;
  });

    const [email, setEmail] = useState(() => localStorage.getItem(STORAGE_KEYS.email));
    const [emailVerified, setEmailVerified] = useState(
        () => localStorage.getItem(STORAGE_KEYS.emailVerified) === "true"
    );

    const login = useCallback(({ token, accountId, userType, shopId, name, phoneNumber, email, emailVerified }) => {

        const decoded = jwtDecode(token);
        const expiresAt = decoded.exp * 1000; // conversion en millisecondes pour Date.now()

        localStorage.setItem(STORAGE_KEYS.token, token);
        localStorage.setItem(STORAGE_KEYS.accountId, accountId);
        localStorage.setItem(STORAGE_KEYS.userType, userType || "ACCOUNT");
        if (shopId) localStorage.setItem(STORAGE_KEYS.shopId, shopId);
        else localStorage.removeItem(STORAGE_KEYS.shopId);
        localStorage.setItem(STORAGE_KEYS.name, name);
        localStorage.setItem(STORAGE_KEYS.tokenExpiresAt, expiresAt.toString());
        if (phoneNumber) localStorage.setItem(STORAGE_KEYS.phoneNumber, phoneNumber);
        if (email) localStorage.setItem(STORAGE_KEYS.email, email);
        localStorage.setItem(STORAGE_KEYS.emailVerified, String(!!emailVerified));

        setToken(token);
        setAccountId(accountId);
        setUserType(userType || "ACCOUNT");
        setShopId(shopId || null);
        setName(name);
        setTokenExpiresAt(expiresAt);
        if (phoneNumber) setPhoneNumber(phoneNumber);
        setEmail(email || null);
        setEmailVerified(!!emailVerified);
    }, []);

    const logout = useCallback(() => {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        setToken(null);
        setAccountId(null);
        setUserType("ACCOUNT");
        setShopId(null);
        setName(null);
        setPhoneNumber(null);
        setTokenExpiresAt(null);
        setEmail(null);
        setEmailVerified(false);
    }, []);


  const isTokenExpired = useCallback(() => {
    if (!tokenExpiresAt) return true;
    return Date.now() > tokenExpiresAt;
  }, [tokenExpiresAt]);

    const markEmailVerified = useCallback(() => {
        localStorage.setItem(STORAGE_KEYS.emailVerified, "true");
        setEmailVerified(true);
    }, []);

  useEffect(() => {
    registerAuthAccessors({ token, logout, isTokenExpired });
  }, [token, logout, isTokenExpired]);

    const isManager = userType === "ACCOUNT";
    const isEmployee = userType === "USER";

    const value = {
        token,
        accountId,
        userType,
        shopId,
        name,
        phoneNumber,
        tokenExpiresAt,
        isAuthenticated: !!token,
        isTokenExpired,
        isManager,
        isEmployee,
        email,
        emailVerified,
        markEmailVerified,
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