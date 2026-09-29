/**
 * Tests pour DashboardPage
 * Le cockpit charge un résumé agrégé, pas les listes brutes de produits et de ventes.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DashboardPage from '../../pages/DashboardPage';
import { getDashboardData } from '../../services/dashboardService';
import { getNotifications } from '../../services/notificationService';
import { getCashStatus } from '../../services/cashService';

vi.mock('../../services/dashboardService', () => ({
  getDashboardData: vi.fn(),
}));

vi.mock('../../services/notificationService', () => ({
  getNotifications: vi.fn(),
}));

vi.mock('../../services/cashService', () => ({
  getCashStatus: vi.fn(),
}));

vi.mock('../../hooks/usePendingInvoices', () => ({
  usePendingInvoices: () => ({ pendingInvoices: [] }),
}));

vi.mock('../../context/ShopContext', () => ({
  useShop: () => ({
    selectedShopId: 'shop-123',
    selectedShopName: 'Test Boutique',
    selectedShop: { id: 'shop-123', name: 'Test Boutique', logoUrl: null },
    shops: [{ id: 'shop-123', name: 'Test Boutique' }],
    selectShop: vi.fn(),
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ name: 'Alice' }),
}));

function amount(digits) {
  return (_content, element) =>
    element?.tagName === 'P' &&
    (element.textContent || '').replace(/[\s\u202f\u00a0]/g, '').includes(digits);
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getNotifications.mockResolvedValue([]);
    getCashStatus.mockResolvedValue({ hasActiveSession: false, activeSession: null });
  });

  it('devrait afficher les ventes du jour', async () => {
    getDashboardData.mockResolvedValue({
      kpis: { totalSalesToday: 0, totalMarginToday: 0, averageBasket: 0, lowStockCount: 0 },
      recentInvoices: [],
      criticalProducts: [],
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Ventes du jour')).toBeInTheDocument();
  });

  it('devrait afficher les montants agrégés du jour', async () => {
    getDashboardData.mockResolvedValue({
      kpis: { totalSalesToday: 4000, totalMarginToday: 1500, averageBasket: 2000, lowStockCount: 0 },
      recentInvoices: [],
      criticalProducts: [],
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(amount('4000'))).toBeInTheDocument();
      expect(screen.getByText(amount('1500'))).toBeInTheDocument();
    });
  });

  it('devrait afficher les produits en stock critique', async () => {
    getDashboardData.mockResolvedValue({
      kpis: { totalSalesToday: 0, totalMarginToday: 0, averageBasket: 0, lowStockCount: 2 },
      recentInvoices: [],
      criticalProducts: [
        { id: 1, name: 'Coca-Cola 33cl', sellingPrice: 500, stockQuantity: 2, alertThreshold: 5 },
        { id: 2, name: 'Pain de mie', sellingPrice: 1500, stockQuantity: 1, alertThreshold: 5 },
      ],
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Coca-Cola 33cl')).toBeInTheDocument();
    expect(screen.getByText('Stock critique')).toBeInTheDocument();
  });

  it('devrait afficher 0 FCFA si aucune vente', async () => {
    getDashboardData.mockResolvedValue({
      kpis: { totalSalesToday: 0, totalMarginToday: 0, averageBasket: 0, lowStockCount: 0 },
      recentInvoices: [],
      criticalProducts: [],
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await screen.findByText('Ventes du jour');
    expect(screen.getAllByText(amount('0FCFA')).length).toBeGreaterThan(0);
  });

  it('devrait charger le résumé de la boutique au montage', async () => {
    getDashboardData.mockResolvedValue({
      kpis: { totalSalesToday: 0, totalMarginToday: 0, averageBasket: 0, lowStockCount: 0 },
      recentInvoices: [],
      criticalProducts: [],
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getDashboardData).toHaveBeenCalledWith('shop-123');
      expect(getNotifications).toHaveBeenCalledWith('shop-123');
      expect(getCashStatus).toHaveBeenCalledWith('shop-123');
    });
  });
});
