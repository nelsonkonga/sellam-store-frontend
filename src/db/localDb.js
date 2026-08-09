import Dexie from 'dexie';

export const db = new Dexie('SellamLocalDB');

db.version(1).stores({

    products: 'id, shopId, name, stockQuantity, updatedAt',
    shops: 'id, name',

    sales: 'id, shopId, productId, quantity, totalPrice, soldAt, synced',


    pendingActions: '++localId, type, shopId, payload, createdAt, synced',


    syncMeta: 'key, value'
});

export default db;