/**
 * Tests pour DashboardPage
 * Tests pour le tableau de bord et le Bilan Flash
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DashboardPage from '../pages/DashboardPage';
import * as productService from '../services/productService';
import * as saleService from '../services/saleService';
import * as invoiceService from '../services/invoiceService';
import * as notificationService from '../services/notificationService';

// Mock des services
vi.mock('../services/productService');
vi.mock('../services/saleService');
vi.mock('../services/invoiceService');
vi.mock('../services/notificationService');
vi.mock('../context/ShopContext');
vi.mock('../context/AuthContext');

const mockShopContext = {
  selectedShopId: 'shop-123',
  selectedShop: { id: 'shop-123', name: 'Test Boutique' },
};

const mockAuthContext = {
  isAuthenticated: true,
  isManager: true,
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../context/ShopContext').useShop = () => mockShopContext;
    require('../context/AuthContext').useAuth = () => mockAuthContext;
  });

  it('devrait afficher le titre "Tableau de bord"', async () => {
    productService.getProducts.mockResolvedValue([]);
    saleService.getTodaySales.mockResolvedValue([]);
    invoiceService.getInvoices.mockResolvedValue([]);
    notificationService.getNotifications.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    });
  });

  it('devrait afficher les ventes du jour', async () => {
    const mockSales = [
      { id: 1, totalPrice: 2500, margin: 1000 },
      { id: 2, totalPrice: 1500, margin: 500 },
    ];
    const totalSales = 4000;
    const totalMargin = 1500;

    productService.getProducts.mockResolvedValue([]);
    saleService.getTodaySales.mockResolvedValue(mockSales);
    invoiceService.getInvoices.mockResolvedValue([]);
    notificationService.getNotifications.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/4 000/)).toBeInTheDocument();
      expect(screen.getByText(/1 500/)).toBeInTheDocument();
    });
  });

  it('devrait afficher les alertes de stock bas', async () => {
    const mockProducts = [
      { id: 1, name: 'Coca-Cola 33cl', sellingPrice: 500, stockQuantity: 2 },
      { id: 2, name: 'Pain de mie', sellingPrice: 1500, stockQuantity: 1 },
    ];

    productService.getProducts.mockResolvedValue(mockProducts);
    saleService.getTodaySales.mockResolvedValue([]);
    invoiceService.getInvoices.mockResolvedValue([]);
    notificationService.getNotifications.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Stock bas/)).toBeInTheDocument();
    });
  });

  it('devrait afficher 0 FCFA si aucune vente', async () => {
    productService.getProducts.mockResolvedValue([]);
    saleService.getTodaySales.mockResolvedValue([]);
    invoiceService.getInvoices.mockResolvedValue([]);
    notificationService.getNotifications.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  it('devrait charger les données au montage', async () => {
    productService.getProducts.mockResolvedValue([]);
    saleService.getTodaySales.mockResolvedValue([]);
    invoiceService.getInvoices.mockResolvedValue([]);
    notificationService.getNotifications.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalledWith('shop-123');
      expect(saleService.getTodaySales).toHaveBeenCalledWith('shop-123');
    });
  });
});
