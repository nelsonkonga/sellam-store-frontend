/**
 * Tests unitaires pour notificationService
 * Tests pour la récupération des notifications
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getNotifications } from '../notificationService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('devrait récupérer les notifications pour une boutique', async () => {
      const shopId = 'shop-123';
      const mockNotifications = [
        {
          id: 1,
          message: 'Stock bas : Coca-Cola 33cl',
          type: 'STOCK_LOW',
          read: false,
          createdAt: '2026-08-27T10:00:00Z'
        },
        {
          id: 2,
          message: 'Nouvelle vente enregistrée',
          type: 'SALE',
          read: true,
          createdAt: '2026-08-27T09:00:00Z'
        }
      ];
      api.get.mockResolvedValue({ data: mockNotifications });

      const result = await getNotifications(shopId);

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: { shopId } });
      expect(result).toEqual(mockNotifications);
    });

    it('devrait retourner un tableau vide si aucune notification', async () => {
      const shopId = 'shop-123';
      api.get.mockResolvedValue({ data: [] });

      const result = await getNotifications(shopId);

      expect(result).toEqual([]);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      const shopId = 'shop-123';
      api.get.mockRejectedValue(new Error('Erreur réseau'));

      await expect(getNotifications(shopId)).rejects.toThrow('Erreur réseau');
    });

    it('devrait inclure différents types de notifications', async () => {
      const shopId = 'shop-123';
      const mockNotifications = [
        {
          id: 1,
          message: 'Stock bas',
          type: 'STOCK_LOW',
          read: false
        },
        {
          id: 2,
          message: 'Comportement suspect détecté',
          type: 'SUSPICIOUS_ACTIVITY',
          read: false
        },
        {
          id: 3,
          message: 'Rappel de bilan quotidien',
          type: 'BALANCE_REMINDER',
          read: true
        }
      ];
      api.get.mockResolvedValue({ data: mockNotifications });

      const result = await getNotifications(shopId);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('STOCK_LOW');
      expect(result[1].type).toBe('SUSPICIOUS_ACTIVITY');
      expect(result[2].type).toBe('BALANCE_REMINDER');
    });

    it('devrait filtrer les notifications par boutique', async () => {
      const shopId = 'shop-456';
      const mockNotifications = [
        {
          id: 1,
          message: 'Notification boutique 456',
          type: 'STOCK_LOW',
          read: false
        }
      ];
      api.get.mockResolvedValue({ data: mockNotifications });

      const result = await getNotifications(shopId);

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: { shopId: 'shop-456' } });
      expect(result).toHaveLength(1);
    });
  });
});