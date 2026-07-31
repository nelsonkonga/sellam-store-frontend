import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);

const STORAGE_KEYS = {
  shopId: "selectedShopId",
  shopName: "selectedShopName",
};

/**
 * Fournit la boutique actuellement sélectionnée par le gérant.
 * Persisté en localStorage (contrairement au thème) : on ne veut pas
 * redemander de choisir sa boutique à chaque rechargement de page.
 */
export function ShopProvider({ children }) {
  const { accountId } = useAuth();
  const [selectedShopId, setSelectedShopId] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.shopId)
  );
  const [selectedShopName, setSelectedShopName] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.shopName)
  );

  // Sélectionne la boutique active (appelé au clic sur une carte boutique dans ShopsPage)
  const selectShop = useCallback((id, name) => {
    localStorage.setItem(STORAGE_KEYS.shopId, id);
    localStorage.setItem(STORAGE_KEYS.shopName, name || "");
    setSelectedShopId(id);
    setSelectedShopName(name || "");
  }, []);

  // Efface la boutique active (utile par exemple lors d'un logout complet)
  const clearShop = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.shopId);
    localStorage.removeItem(STORAGE_KEYS.shopName);
    setSelectedShopId(null);
    setSelectedShopName(null);
  }, []);

  // Nettoyage automatique en cas de déconnexion ou changement de compte
  useEffect(() => {
    if (!accountId) {
      clearShop();
    }
  }, [accountId, clearShop]);

  const value = { selectedShopId, selectedShopName, selectShop, clearShop };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop doit être utilisé à l'intérieur d'un <ShopProvider>");
  }
  return ctx;
}
