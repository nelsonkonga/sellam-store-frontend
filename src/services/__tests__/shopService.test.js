/**
 * Tests unitaires pour shopService
 * Tests pour la création et gestion des boutiques
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getShops, createShop, updateShopSettings, uploadShopLogo } from '../shopService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('shopService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getShops', () => {
    it('devrait récupérer toutes les boutiques de l\'utilisateur', async () => {
      const mockShops = [
        { id: 'shop-1', name: 'Alimentation Nlonkak', address: 'Carrefour Nlonkak' },
        { id: 'shop-2', name: 'Alimentation Omnisports', address: 'Quartier Omnisports' },
      ];
      api.get.mockResolvedValue({ data: mockShops });

      const result = await getShops();

      expect(api.get).toHaveBeenCalledWith('/shops');
      expect(result).toEqual(mockShops);
    });

    it('devrait retourner un tableau vide si aucune boutique', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await getShops();

      expect(result).toEqual([]);
    });
  });

  describe('createShop', () => {
    it('devrait créer une nouvelle boutique', async () => {
      const newShop = {
        name: 'Alimentation Bastos',
        address: 'Quartier Bastos, Yaoundé',
      };
      const mockResponse = { id: 'shop-3', ...newShop };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await createShop(newShop);

      expect(api.post).toHaveBeenCalledWith('/shops', newShop);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateShopSettings', () => {
    it('devrait mettre à jour les paramètres d\'une boutique', async () => {
      const settings = {
        name: 'Alimentation Nlonkak Centre',
        address: 'Carrefour Nlonkak, Yaoundé',
      };
      const mockResponse = { success: true };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await updateShopSettings('shop-1', settings);

      expect(api.patch).toHaveBeenCalledWith('/shops/shop-1/settings', settings);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadShopLogo', () => {
    it('devrait uploader le logo d\'une boutique', async () => {
      const mockFile = new File(['logo'], 'logo.png', { type: 'image/png' });
      const mockResponse = { logoUrl: 'https://example.com/logo.png' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadShopLogo('shop-1', mockFile);

      expect(api.post).toHaveBeenCalledWith(
        '/shops/shop-1/logo',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual('https://example.com/logo.png');
    });
  });
});
