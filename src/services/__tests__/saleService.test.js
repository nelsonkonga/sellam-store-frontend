/**
 * Tests unitaires pour saleService
 * Tests pour la récupération des ventes et calcul des marges
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTodaySales, getSalesByPeriod } from '../saleService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('saleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodaySales', () => {
    it('devrait récupérer les ventes du jour pour une boutique', async () => {
      const mockSales = [
        { id: 1, totalPrice: 2500, margin: 1000, date: '2026-08-27' },
        { id: 2, totalPrice: 1500, margin: 500, date: '2026-08-27' },
      ];
      api.get.mockResolvedValue({ data: mockSales });

      const result = await getTodaySales('shop-123');

      expect(api.get).toHaveBeenCalledWith('/sales/today', { params: { shopId: 'shop-123' } });
      expect(result).toEqual(mockSales);
    });

    it('devrait retourner un tableau vide si aucune vente', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await getTodaySales('shop-123');

      expect(result).toEqual([]);
    });
  });

  describe('getSalesByPeriod', () => {
    it('devrait récupérer les ventes pour une période donnée', async () => {
      const mockSales = [
        { id: 1, totalPrice: 5000, margin: 2000, period: 'this_week' },
      ];
      api.get.mockResolvedValue({ data: mockSales });

      const result = await getSalesByPeriod('shop-123', 'this_week');

      expect(api.get).toHaveBeenCalledWith('/sales/shop/shop-123', { params: { period: 'this_week' } });
      expect(result).toEqual(mockSales);
    });

    it('devrait utiliser la période "recent" par défaut', async () => {
      api.get.mockResolvedValue({ data: [] });

      await getSalesByPeriod('shop-123');

      expect(api.get).toHaveBeenCalledWith('/sales/shop/shop-123', { params: { period: 'recent' } });
    });

    it('devrait supporter différentes périodes', async () => {
      const periods = ['today', 'this_week', 'this_month', 'recent'];
      
      for (const period of periods) {
        api.get.mockResolvedValue({ data: [] });
        await getSalesByPeriod('shop-123', period);
        expect(api.get).toHaveBeenCalledWith('/sales/shop/shop-123', { params: { period } });
      }
    });
  });
});
