import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ShopsPage from '../ShopsPage';

const { mockSelectShop, mockGetShops, mockGetShopsSummaries } = vi.hoisted(() => ({
  mockSelectShop: vi.fn(),
  mockGetShops: vi.fn(),
  mockGetShopsSummaries: vi.fn(),
}));

vi.mock('../../services/shopService', () => ({
  getShops: mockGetShops,
  getShopsSummaries: mockGetShopsSummaries,
  createShop: vi.fn(),
  uploadShopLogo: vi.fn(),
}));

vi.mock('../../context/ShopContext', () => ({
  useShop: () => ({ selectShop: mockSelectShop, selectedShopId: 'shop-1' }),
}));

describe('ShopsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetShopsSummaries.mockResolvedValue([
      {
        id: 'shop-1',
        name: 'Boutique Principale',
        address: 'Paris, FR',
        logoUrl: '',
      },
    ]);
  });

  it('affiche le sélecteur de boutique selon le design Stitch', async () => {
    render(
      <MemoryRouter>
        <ShopsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /vos boutiques/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/sélectionnez un espace de travail pour continuer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nouvelle boutique/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ouvrir/i })).toBeInTheDocument();
  });
});
