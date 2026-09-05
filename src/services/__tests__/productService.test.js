/**
 * Tests unitaires pour productService
 * Tests pour la création, modification de produits
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProducts, createProduct, updateProduct, uploadProductPicture } from '../productService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('devrait récupérer les produits d\'une boutique', async () => {
      const mockProducts = [
        { id: 1, name: 'Coca-Cola 33cl', sellingPrice: 500, stockQuantity: 50 },
        { id: 2, name: 'Pain de mie', sellingPrice: 1500, stockQuantity: 20 },
      ];
      api.get.mockResolvedValue({ data: mockProducts });

      const result = await getProducts('shop-123');

      expect(api.get).toHaveBeenCalledWith('/products', { params: { shopId: 'shop-123' } });
      expect(result).toEqual(mockProducts);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      api.get.mockRejectedValue(new Error('Erreur réseau'));

      await expect(getProducts('shop-123')).rejects.toThrow('Erreur réseau');
    });
  });

  describe('createProduct', () => {
    it('devrait créer un nouveau produit', async () => {
      const newProduct = {
        name: 'Riz local 1kg',
        sellingPrice: 2000,
        purchasePrice: 1500,
        stockQuantity: 30,
        shopId: 'shop-123',
      };
      const mockResponse = { id: 3, ...newProduct };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await createProduct(newProduct);

      expect(api.post).toHaveBeenCalledWith('/products', newProduct);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProduct', () => {
    it('devrait mettre à jour un produit existant', async () => {
      const updatedProduct = {
        id: 1,
        name: 'Coca-Cola 33cl',
        sellingPrice: 550, // Prix modifié
        stockQuantity: 45,
      };
      api.put.mockResolvedValue({ data: updatedProduct });

      const result = await updateProduct(1, updatedProduct);

      expect(api.put).toHaveBeenCalledWith('/products/1', updatedProduct);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('uploadProductPicture', () => {
    it('devrait uploader la photo d\'un produit', async () => {
      const mockFile = new File(['image'], 'product.jpg', { type: 'image/jpeg' });
      const mockResponse = { pictureUrl: 'https://example.com/product.jpg' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadProductPicture(1, mockFile);

      expect(api.post).toHaveBeenCalledWith(
        '/products/1/picture',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result.pictureUrl).toEqual('https://example.com/product.jpg');
    });
  });
});
