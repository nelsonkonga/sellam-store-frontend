import { v4 as uuidv4 } from 'uuid';
import db from '../db/localDb.js';
import api from './api';

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
    await db.pendingActions.add({
        type: 'SYNC_INVOICE',
        shopId,
        payload: { ...invoiceData, clientActionId: localActionId },
        createdAt: new Date().toISOString(),
        synced: false
    });

    // 4. Try to sync immediately if online
    if (navigator.onLine) {
        syncPendingActions().catch(console.error);
    }

    return { success: true, offline: !navigator.onLine, localActionId };
}

export async function syncPendingActions() {
    const all = await db.pendingActions.toArray();
    const unsynced = all.filter((action) => action.synced === false);
    if (unsynced.length === 0) return;

    try {
        const actionsPayload = unsynced.map(({ localId, type, shopId, payload, createdAt }) => ({
            localId,
            type,
            shopId,
            payload,
            createdAt,
        }));

        const response = await api.post('/sync', { actions: actionsPayload });
        const { processedActionIds, conflicts } = response.data;

        if (!Array.isArray(processedActionIds)) {
            console.error('[syncPendingActions] invalid response', response.data);
            return;
        }

        const normalizedIds = processedActionIds
            .map((id) => (typeof id === 'string' ? Number(id) : id))
            .map((id) => (Number.isFinite(id) ? id : null))
            .filter((id) => id !== null);

        for (const localId of normalizedIds) {
            await db.pendingActions.update(localId, { synced: true });
        }

        if (conflicts && conflicts.length > 0) {
            console.error('Conflits de synchronisation détectés :', conflicts);
            // We can emit an event or show toast here later
        }

        await db.syncMeta.put({ key: 'lastSync', value: new Date().toISOString() });
    } catch (error) {
        console.error('Échec de synchronisation :', error.message);
    }
}