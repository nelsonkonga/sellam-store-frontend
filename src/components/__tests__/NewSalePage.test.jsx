/**
 * Tests pour NewSalePage
 * Tests pour l'enregistrement des ventes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NewSalePage from '../pages/NewSalePage';
import * as productService from '../services/productService';
import * as invoiceService from '../services/invoiceService';

// Mock des services
vi.mock('../services/productService');
vi.mock('../services/invoiceService');
vi.mock('../context/ShopContext');
vi.mock('../context/AuthContext');

const mockShopContext = {
  selectedShopId: 'shop-123',
  selectedShop: { id: 'shop-123', name: 'Test Boutique' },
};

const mockAuthContext = {
  isAuthenticated: true,
};

describe('NewSalePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock du contexte Shop
    require('../context/ShopContext').useShop = () => mockShopContext;
    // Mock du contexte Auth
    require('../context/AuthContext').useAuth = () => mockAuthContext;
  });

  it('devrait afficher le titre "Nouvelle vente"', async () => {
    productService.getProducts.mockResolvedValue([]);
    invoiceService.createInvoice.mockResolvedValue({ id: 'inv-123' });

    render(
      <BrowserRouter>
        <NewSalePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nouvelle vente')).toBeInTheDocument();
    });
  });

  it('devrait charger les produits au montage', async () => {
    const mockProducts = [
      { id: 1, name: 'Coca-Cola 33cl', sellingPrice: 500, stockQuantity: 50 },
      { id: 2, name: 'Pain de mie', sellingPrice: 1500, stockQuantity: 20 },
    ];
    productService.getProducts.mockResolvedValue(mockProducts);
    invoiceService.createInvoice.mockResolvedValue({ id: 'inv-123' });

    render(
      <BrowserRouter>
        <NewSalePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalledWith('shop-123');
    });
  });

  it('devrait afficher la barre de recherche', async () => {
    productService.getProducts.mockResolvedValue([]);
    invoiceService.createInvoice.mockResolvedValue({ id: 'inv-123' });

    render(
      <BrowserRouter>
        <NewSalePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher un produit...')).toBeInTheDocument();
    });
  });

  it('devrait filtrer les produits lors de la recherche', async () => {
    const mockProducts = [
      { id: 1, name: 'Coca-Cola 33cl', sellingPrice: 500, stockQuantity: 50 },
      { id: 2, name: 'Pain de mie', sellingPrice: 1500, stockQuantity: 20 },
    ];
    productService.getProducts.mockResolvedValue(mockProducts);
    invoiceService.createInvoice.mockResolvedValue({ id: 'inv-123' });

    render(
      <BrowserRouter>
        <NewSalePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Rechercher un produit...');
      fireEvent.change(searchInput, { target: { value: 'Coca' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Coca-Cola 33cl')).toBeInTheDocument();
      expect(screen.queryByText('Pain de mie')).not.toBeInTheDocument();
    });
  });

  it('devrait afficher un message si aucun produit trouvé', async () => {
    productService.getProducts.mockResolvedValue([]);
    invoiceService.createInvoice.mockResolvedValue({ id: 'inv-123' });

    render(
      <BrowserRouter>
        <NewSalePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Rechercher un produit...');
      fireEvent.change(searchInput, { target: { value: 'Produit inexistant' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Aucun produit trouvé.')).toBeInTheDocument();
    });
  });
});
