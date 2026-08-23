import { useState, useCallback } from "react";
import api from "../services/api";
import db from "../db/localDb";

/**
 * Hook qui rapatrie les données serveur (produits, boutiques, ventes,
 * factures, employés) vers IndexedDB + localStorage-cache pour
 * permettre leur consultation/usage hors ligne ensuite.
 * Expose l'état de chargement pour afficher un feedback UI si besoin.
 */
export function usePreloadOfflineData() {
    const [isPreloading, setIsPreloading] = useState(false);
    const [preloadError, setPreloadError] = useState(null);

    const preload = useCallback(async (shopId) => {
        setIsPreloading(true);
        setPreloadError(null);

        try {
            // Core data (products + shops) — critical for sales
            const [productsRes, shopsRes] = await Promise.all([
                api.get("/products", { params: { shopId } }),
                api.get("/shops"),
            ]);

            await db.products.bulkPut(productsRes.data);
            await db.shops.bulkPut(shopsRes.data);

            // Secondary data — best-effort, don't block on failures
            const secondaryFetches = [
                api.get("/sales/today", { params: { shopId } }).catch(() => null),
                api.get("/invoices", { params: { shopId } }).catch(() => null),
                api.get(`/users/shop/${shopId}`).catch(() => null),
                api.get("/products/top-selling", { params: { shopId } }).catch(() => null),
            ];
            await Promise.allSettled(secondaryFetches);
            // The api interceptor already caches all GET responses in localStorage,
            // so these fetches populate the offline cache automatically.

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