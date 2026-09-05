import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CashRegistersPage from '../CashRegistersPage';
import { useShop } from '../../context/ShopContext';
import { listRegisters, getCashStatus } from '../../services/cashService';

vi.mock('../../context/ShopContext', () => ({
  useShop: vi.fn(),
}));

vi.mock('../../services/cashService', () => ({
  listRegisters: vi.fn(),
  getCashStatus: vi.fn(),
  createRegister: vi.fn(),
}));

describe('CashRegistersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShop.mockReturnValue({ selectedShopId: 'shop-1', selectedShop: { id: 'shop-1', name: 'Boutique Test' } });
    listRegisters.mockResolvedValue([{ id: 'r1', label: 'Caisse 1', active: true }]);
    getCashStatus.mockResolvedValue({ hasActiveSession: true, activeSession: { id: 's1', registerLabel: 'Caisse 1' } });
  });

  it('renders the cash registers title and loads registers', async () => {
    render(<CashRegistersPage />);

    expect(screen.getByText(/caisses/i)).toBeInTheDocument();
    expect(await screen.findByText('Caisse 1')).toBeInTheDocument();
    expect(listRegisters).toHaveBeenCalledWith('shop-1');
  });
});
