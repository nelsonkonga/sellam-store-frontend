/**
 * Tests unitaires pour salesOfflineService
 * Tests pour le mode offline et la synchronisation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveInvoiceOfflineFirst, syncPendingActions } from '../salesOfflineService';
import db from '../../db/localDb';
import api from '../api';

// Mock de IndexedDB (Dexie)
vi.mock('../../db/localDb', () => ({
  default: {
    products: {
      get: vi.fn(),
      update: vi.fn(),
    },
    pendingActions: {
      add: vi.fn(),
      toArray: vi.fn(),
      update: vi.fn(),
    },
    syncMeta: {
      put: vi.fn(),
    },
  },
}));

// Mock de l'API avec une fonction factory pour éviter l'erreur import.meta.env
vi.mock('../api', () => {
  const mockApi = {
    post: vi.fn(),
  };
  return {
    default: mockApi,
  };
});

describe('salesOfflineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false, // Offline par défaut pour éviter sync automatique
    });
  });

  describe('saveInvoiceOfflineFirst', () => {
    it('devrait enregistrer une vente offline dans IndexedDB', async () => {
      const mockInvoice = {
        customerName: 'Test Client',
        lines: [
          { productId: 1, quantity: 2, lineDiscountAmount: 0, lineDiscountType: 'NONE' },
        ],
        discountAmount: 0,
        discountType: 'NONE',
      };

      db.products.get.mockResolvedValue({ id: 1, name: 'Coca-Cola', stockQuantity: 50 });
      db.products.update.mockResolvedValue();
      db.pendingActions.add.mockResolvedValue();

      const result = await saveInvoiceOfflineFirst('shop-123', mockInvoice);

      expect(result.success).toBe(true);
      expect(db.pendingActions.add).toHaveBeenCalledWith({
        type: 'SYNC_INVOICE',
        shopId: 'shop-123',
        payload: expect.any(Object),
        createdAt: expect.any(String),
        synced: false,
      });
    });

    it('devrait décrémenter le stock localement', async () => {
      const mockInvoice = {
        customerName: 'Test Client',
        lines: [
          { productId: 1, quantity: 3, lineDiscountAmount: 0, lineDiscountType: 'NONE' },
        ],
        discountAmount: 0,
        discountType: 'NONE',
      };
      const currentStock = 50;

      db.products.get.mockResolvedValue({ id: 1, name: 'Coca-Cola', stockQuantity: currentStock });
      db.products.update.mockResolvedValue();
      db.pendingActions.add.mockResolvedValue();

      await saveInvoiceOfflineFirst('shop-123', mockInvoice);

      expect(db.products.update).toHaveBeenCalledWith(1, {
        stockQuantity: currentStock - 3,
      });
    });

    it('devrait rejeter si stock insuffisant', async () => {
      const mockInvoice = {
        customerName: 'Test Client',
        lines: [
          { productId: 1, quantity: 100, lineDiscountAmount: 0, lineDiscountType: 'NONE' },
        ],
        discountAmount: 0,
        discountType: 'NONE',
      };

      db.products.get.mockResolvedValue({ id: 1, name: 'Coca-Cola', stockQuantity: 10 });

      await expect(saveInvoiceOfflineFirst('shop-123', mockInvoice)).rejects.toThrow('Stock insuffisant');
    });
  });

  describe('syncPendingActions', () => {
    it('devrait synchroniser les actions pending avec le serveur', async () => {
      const mockPendingActions = [
        {
          localId: 1,
          type: 'SYNC_INVOICE',
          shopId: 'shop-123',
          payload: {},
          createdAt: new Date().toISOString(),
          synced: false,
        },
      ];

      db.pendingActions.toArray.mockResolvedValue(mockPendingActions);
      db.pendingActions.update.mockResolvedValue();
      db.syncMeta.put.mockResolvedValue();

      // Mock de l'API pour la synchronisation
      api.post.mockResolvedValue({ data: { processedActionIds: [1], conflicts: [] } });

      await syncPendingActions();

      expect(db.pendingActions.toArray).toHaveBeenCalled();
      expect(db.pendingActions.update).toHaveBeenCalled();
    });

    it('devrait mettre à jour le méta-données de synchronisation', async () => {
      // Pour tester la mise à jour des métadonnées, il faut des actions à synchroniser
      const mockPendingActions = [
        {
          localId: 1,
          type: 'SYNC_INVOICE',
          shopId: 'shop-123',
          payload: {},
          createdAt: new Date().toISOString(),
          synced: false,
        },
      ];

      db.pendingActions.toArray.mockResolvedValue(mockPendingActions);
      db.pendingActions.update.mockResolvedValue();
      db.syncMeta.put.mockResolvedValue();
      api.post.mockResolvedValue({ data: { processedActionIds: [1], conflicts: [] } });

      await syncPendingActions();

      expect(db.syncMeta.put).toHaveBeenCalledWith({
        key: 'lastSync',
        value: expect.any(String),
      });
    });
  });
});
