import { useState, useEffect, useCallback } from "react";
import db from "../db/localDb.js";

/**
 * Transforme une pendingAction (type SYNC_INVOICE, non synchronisée) en un
 * objet "facture" affichable, avec la même forme que ce que renvoie l'API
 * (InvoicesPage / InvoiceDetailPage lisent invoice.invoiceNumber,
 * invoice.customerName, invoice.lines, invoice.totalAmount, etc.).
 *
 * Les IDs de produits ne sont résolus qu'au moment de l'affichage (on n'a
 * localement que productId + quantity dans invoiceData.lines), donc le
 * calcul du total et des noms de produits se fait ici à partir du cache
 * local des produits (db.products), déjà préchargé par usePreloadOfflineData.
 */
async function pendingActionToInvoice(action, productsById) {
    const payload = action.payload || {};
    const lines = (payload.lines || []).map((line) => {
        const product = productsById.get(String(line.productId));
        const quantity = Number(line.quantity) || 0;
        const unitPrice = product ? Number(product.sellingPrice) || 0 : 0;
        const lineSubtotal = unitPrice * quantity;
        const discountAmount = Number(line.lineDiscountAmount) || 0;
        return {
            saleId: `pending-${action.localId}-${line.productId}`,
            productId: line.productId,
            productName: product ? product.name : "Produit",
            quantity,
            lineSubtotal,
            discountAmount,
            totalPrice: lineSubtotal - discountAmount,
        };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.lineSubtotal, 0);
    const linesDiscount = lines.reduce((sum, l) => sum + l.discountAmount, 0);
    const invoiceDiscount = Number(payload.discountAmount) || 0;
    const totalAmount = subtotal - linesDiscount - invoiceDiscount;

    return {
        id: `pending-${action.localId}`,
        localActionId: payload.clientActionId,
        invoiceNumber: "En attente",
        customerName: payload.customerName || null,
        lines,
        subtotal,
        discountAmount: invoiceDiscount,
        totalAmount,
        totalMargin: null,
        status: "PENDING_SYNC",
        createdAt: action.localCreatedAt || action.createdAt,
        isPending: true,
    };
}

/**
 * Lit les pendingActions de type SYNC_INVOICE non encore synchronisées pour
 * une boutique donnée, et les expose comme des "factures" prêtes à afficher
 * -- pour qu'une facture créée hors ligne apparaisse immédiatement dans la
 * liste et sur sa propre page de détail, sans attendre la reconnexion.
 */
export function usePendingInvoices(shopId) {
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!shopId) {
            setPendingInvoices([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const allActions = await db.pendingActions.toArray();
            const relevant = allActions.filter(
                (a) => a.type === "SYNC_INVOICE" && a.synced === false && String(a.shopId) === String(shopId)
            );

            const allProducts = await db.products.toArray();
            const productsById = new Map(allProducts.map((p) => [String(p.id), p]));

            const invoices = await Promise.all(
                relevant.map((action) => pendingActionToInvoice(action, productsById))
            );

            // Les plus récentes d'abord, cohérent avec le tri habituel des factures
            invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setPendingInvoices(invoices);
        } catch (err) {
            console.error("[usePendingInvoices] Échec de lecture des factures en attente :", err);
            setPendingInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [shopId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { pendingInvoices, loading, refresh };
}

/**
 * Retrouve une facture en attente précise par son id "pending-<localId>",
 * pour l'affichage direct sur InvoiceDetailPage quand on clique dessus
 * depuis la liste avant que la sync n'ait eu lieu.
 */
export async function getPendingInvoiceById(pendingId) {
    const localId = Number(String(pendingId).replace("pending-", ""));
    if (!Number.isFinite(localId)) return null;

    const action = await db.pendingActions.get(localId);
    if (!action || action.type !== "SYNC_INVOICE") return null;

    const allProducts = await db.products.toArray();
    const productsById = new Map(allProducts.map((p) => [String(p.id), p]));

    return pendingActionToInvoice(action, productsById);
}