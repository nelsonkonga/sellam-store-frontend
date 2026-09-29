/**
 * Tests pour NewSalePage
 * Tests pour l'enregistrement des ventes
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NewSalePage from '../../pages/NewSalePage';
import { getProducts } from '../../services/productService';

vi.mock('../../services/productService', () => ({
  getProducts: vi.fn(),
  getProductByBarcode: vi.fn(),
}));

vi.mock('../../services/salesOfflineService', () => ({
  saveInvoiceOfflineFirst: vi.fn(),
}));

vi.mock('../../context/ShopContext', () => ({
  useShop: () => ({
    selectedShopId: 'shop-123',
    selectedShop: { id: 'shop-123', name: 'Test Boutique' },
  }),
}));

const searchPlaceholder = 'Rechercher (ou scanner code-barre)...';

describe('NewSalePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le titre "Nouvelle vente"', async () => {
    getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Nouvelle vente')).toBeInTheDocument();
  });

  it('devrait charger les produits au montage', async () => {
    const mockProducts = [
      { id: 1, name: 'Coca-Cola 33cl', sellingPrice: 500, stockQuantity: 50 },
      { id: 2, name: 'Pain de mie', sellingPrice: 1500, stockQuantity: 20 },
    ];
    getProducts.mockResolvedValue(mockProducts);

    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getProducts).toHaveBeenCalledWith('shop-123');
    });
  });

  it('devrait afficher la barre de recherche', async () => {
    getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    );

    expect(await screen.findByPlaceholderText(searchPlaceholder)).toBeInTheDocument();
  });

  it('devrait filtrer les produits lors de la recherche', async () => {
    const mockProducts = [
      { id: 1, name: 'Coca-Cola 33cl', sellingPrice: 500, stockQuantity: 50 },
      { id: 2, name: 'Pain de mie', sellingPrice: 1500, stockQuantity: 20 },
    ];
    getProducts.mockResolvedValue(mockProducts);

    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText(searchPlaceholder);
    fireEvent.change(searchInput, { target: { value: 'Coca' } });

    expect(await screen.findByText('Coca-Cola 33cl')).toBeInTheDocument();
    expect(screen.queryByText('Pain de mie')).not.toBeInTheDocument();
  });

  it('devrait afficher un message si aucun produit trouvé', async () => {
    getProducts.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <NewSalePage />
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText(searchPlaceholder);
    fireEvent.change(searchInput, { target: { value: 'Produit inexistant' } });

    expect(await screen.findByText('Aucun produit trouvé.')).toBeInTheDocument();
  });
});
