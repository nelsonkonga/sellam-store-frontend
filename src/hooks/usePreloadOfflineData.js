import { useState, useCallback } from "react";
import api from "../services/api";
import db from "../db/localDb";

/**
 * Hook qui rapatrie les données serveur (produits, boutiques) vers IndexedDB
 * pour permettre leur consultation/usage hors ligne ensuite.
 * Expose l'état de chargement pour afficher un feedback UI si besoin.
 */
export function usePreloadOfflineData() {
    const [isPreloading, setIsPreloading] = useState(false);
    const [preloadError, setPreloadError] = useState(null);

    const preload = useCallback(async (shopId) => {
        setIsPreloading(true);
        setPreloadError(null);

        try {
            const [productsRes, shopsRes] = await Promise.all([
                api.get(`/products?shopId=${shopId}`),
                api.get("/shops"),
            ]);

            await db.products.bulkPut(productsRes.data);
            await db.shops.bulkPut(shopsRes.data);

            await db.syncMeta.put({ key: "lastPreload", value: new Date().toISOString() });
        } catch (err) {
            console.error("Échec du préchargement offline :", err);
            setPreloadError(err);
        } finally {
            setIsPreloading(false);
        }
    }, []);

    return { preload, isPreloading, preloadError };
}