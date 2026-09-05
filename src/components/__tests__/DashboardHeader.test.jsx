import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardHeader from '../DashboardHeader';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../context/ShopContext', () => ({
  useShop: () => ({
    shops: [{ id: 'shop-1', name: 'Boutique Test' }],
    selectedShopId: 'shop-1',
    selectShop: vi.fn(),
  }),
}));

describe('DashboardHeader', () => {
  it('devrait rediriger vers la page support au clic sur le bouton service client', () => {
    render(
      <MemoryRouter>
        <DashboardHeader userName="Alice" hasNotifications={false} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /service client/i }));

    expect(navigateMock).toHaveBeenCalledWith('/support');
  });
});
