import { v4 as uuidv4 } from 'uuid';
import db from '../db/localDb.js';
import api from './api';

export async function registerSaleOfflineFirst(shopId, productId, quantity) {
    const localActionId = uuidv4();


    const product = await db.products.get(productId);
    if (!product) throw new Error('Produit introuvable localement');
    if (product.stockQuantity < quantity) throw new Error('Stock insuffisant');

    await db.products.update(productId, {
        stockQuantity: product.stockQuantity - quantity
    });

    await db.pendingActions.add({
        type: 'REGISTER_SALE',
        shopId,
        payload: { productId, quantity, clientActionId: localActionId },
        createdAt: new Date().toISOString(),
        synced: false
    });

    if (navigator.onLine) {
        await syncPendingActions();
    }

    return { success: true, offline: !navigator.onLine };
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
            console.error('[syncPendingActions] réponse de synchronisation invalide : processedActionIds manquant ou invalide', response.data);
            return;
        }

        const normalizedIds = processedActionIds
            .map((id) => (typeof id === 'string' ? Number(id) : id))
            .map((id) => (Number.isFinite(id) ? id : null))
            .filter((id) => id !== null);

        if (normalizedIds.length !== processedActionIds.length) {
            console.warn('[syncPendingActions] certains processedActionIds n\'ont pas pu être interprétés comme des nombres', processedActionIds);
        }

        for (const localId of normalizedIds) {
            await db.pendingActions.update(localId, { synced: true });
        }

        if (conflicts && conflicts.length > 0) {
            console.error('Conflits de synchronisation détectés :', conflicts);
            // TODO Rang 1 (suite) : afficher une alerte UI claire pour chaque conflit
        }

        await db.syncMeta.put({ key: 'lastSync', value: new Date().toISOString() });
    } catch (error) {
        console.error('Échec de synchronisation :', error.message);
        if (error.response) {
            console.error('Statut HTTP serveur :', error.response.status);
            console.error('Détails de l\'erreur serveur :', error.response.data);
        } else if (error.request) {
            console.error('Aucune réponse du serveur (problème réseau ou serveur injoignable).');
        }
    }
}