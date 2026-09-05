import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ShopsPage from '../ShopsPage';

const mockSelectShop = vi.fn();
const mockGetShops = vi.fn();

vi.mock('../../services/shopService', () => ({
  getShops: mockGetShops,
  createShop: vi.fn(),
  uploadShopLogo: vi.fn(),
}));

vi.mock('../../context/ShopContext', () => ({
  useShop: () => ({ selectShop: mockSelectShop }),
}));

describe('ShopsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetShops.mockResolvedValue([
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
