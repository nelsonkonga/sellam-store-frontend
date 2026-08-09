import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getShops } from "../services/shopService";
import { usePreloadOfflineData } from "../hooks/usePreloadOfflineData";

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
  const { preload, isPreloading } = usePreloadOfflineData();
  const [selectedShopId, setSelectedShopId] = useState(() =>
      localStorage.getItem(STORAGE_KEYS.shopId)
  );
  const [selectedShopName, setSelectedShopName] = useState(() =>
      localStorage.getItem(STORAGE_KEYS.shopName)
  );
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);


  const selectShop = useCallback(
      (id, name) => {
        localStorage.setItem(STORAGE_KEYS.shopId, id);
        localStorage.setItem(STORAGE_KEYS.shopName, name || "");
        setSelectedShopId(id);
        setSelectedShopName(name || "");

        preload(id);
      },
      [preload]
  );

  const clearShop = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.shopId);
    localStorage.removeItem(STORAGE_KEYS.shopName);
    setSelectedShopId(null);
    setSelectedShopName(null);
  }, []);

  const fetchShops = useCallback(async () => {
    if (!accountId) {
      setShops([]);
      return;
    }
    setLoadingShops(true);
    try {
      const data = await getShops();
      setShops(data);

      if (data.length > 0 && !selectedShopId) {
        selectShop(data[0].id, data[0].name);
      }
    } catch (err) {
      console.error("Failed to load shops", err);
    } finally {
      setLoadingShops(false);
    }
  }, [accountId, selectedShopId, selectShop]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    if (!accountId) {
      clearShop();
    }
  }, [accountId, clearShop]);

  const selectedShop = shops.find((s) => s.id === selectedShopId) || null;

  const value = {
    selectedShopId,
    selectedShopName,
    selectedShop,
    selectShop,
    clearShop,
    refreshShops: fetchShops,
    shops,
    loadingShops,
    isPreloadingOfflineData: isPreloading,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop doit être utilisé à l'intérieur d'un <ShopProvider>");
  }
  return ctx;
}