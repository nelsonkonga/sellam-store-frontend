import { v4 as uuidv4 } from 'uuid';
import db from '../db/localDb.js';
import api from './api';

async function getCurrentUserId() {
    // Récupérer l'ID utilisateur depuis localStorage
    return localStorage.getItem('accountId');
}

export async function saveInvoiceOfflineFirst(shopId, invoiceData) {
    const localActionId = uuidv4();

    // invoiceData expected to have:
    // { customerName, lines: [{ productId, quantity, lineDiscountAmount, lineDiscountType }], discountAmount, discountType }

    // 1. Validate stock locally
    for (const line of invoiceData.lines) {
        const product = await db.products.get(line.productId);
        if (!product) throw new Error(`Produit introuvable localement (ID: ${line.productId})`);
        if (product.stockQuantity < line.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name}`);
        }
    }

    // 2. Decrement stock locally
    for (const line of invoiceData.lines) {
        const product = await db.products.get(line.productId);
        await db.products.update(line.productId, {
            stockQuantity: product.stockQuantity - line.quantity
        });
    }

    // 3. Save pending action
    const now = new Date().toISOString();
    await db.pendingActions.add({
        type: 'SYNC_INVOICE',
        shopId,
        payload: { ...invoiceData, clientActionId: localActionId },
        createdAt: now,
        localCreatedAt: now, // Date réelle de création locale
        soldBy: await getCurrentUserId(), // ID de l'utilisateur qui a créé la facture
        synced: false
    });

    // 4. Try to sync immediately if online.
    // IMPORTANT : on attend la synchronisation avant de rendre la main à l'appelant.
    // Sans ce "await", la page redirige (ex: vers /dashboard) avant que la facture
    // n'atteigne réellement le serveur, donnant l'impression que la vente "disparaît"
    // (dashboard, stock, bilan du jour non mis à jour tant que la sync n'a pas eu lieu).
    let syncSucceeded = false;
    let syncErrorMessage = null;

    if (navigator.onLine) {
        try {
            await syncPendingActions();
            syncSucceeded = true;
        } catch (error) {
            console.error('Échec de synchronisation immédiate :', error);
            syncErrorMessage = error?.message || "Échec de synchronisation avec le serveur.";
        }
    }

    return {
        success: true,
        offline: !navigator.onLine,
        localActionId,
        synced: syncSucceeded,
        syncError: syncErrorMessage,
    };
}

export async function syncPendingActions() {
    const all = await db.pendingActions.toArray();
    const unsynced = all.filter((action) => action.synced === false);
    if (unsynced.length === 0) return;

    const actionsPayload = unsynced.map(({ localId, type, shopId, payload, createdAt, localCreatedAt, soldBy }) => ({
        localId,
        type,
        shopId,
        payload,
        createdAt,
        localCreatedAt, // Inclure la date réelle de création locale
        soldBy, // Inclure l'ID de l'utilisateur qui a créé la facture
    }));

    // Note : on laisse l'erreur remonter à l'appelant (au lieu de l'avaler dans un catch local)
    // pour que saveInvoiceOfflineFirst puisse détecter l'échec et en informer l'utilisateur.
    const response = await api.post('/sync', { actions: actionsPayload });
    const { processedActionIds, conflicts } = response.data;

    if (!Array.isArray(processedActionIds)) {
        console.error('[syncPendingActions] invalid response', response.data);
        throw new Error("Réponse de synchronisation invalide du serveur.");
    }

    const normalizedIds = processedActionIds
        .map((id) => (typeof id === 'string' ? Number(id) : id))
        .map((id) => (Number.isFinite(id) ? id : null))
        .filter((id) => id !== null);

    for (const localId of normalizedIds) {
        await db.pendingActions.update(localId, { synced: true });
    }

    if (conflicts && conflicts.length > 0) {
        throw new Error(conflicts.join(" "));
    }

    await db.syncMeta.put({ key: 'lastSync', value: new Date().toISOString() });
}