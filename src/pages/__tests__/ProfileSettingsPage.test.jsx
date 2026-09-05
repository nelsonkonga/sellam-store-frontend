import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileSettingsPage from '../ProfileSettingsPage';

const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    name: 'Alice Example',
    logout: mockLogout,
    phoneNumber: '0612345678',
    email: 'alice@example.com',
    profilePictureUrl: '',
    isManager: true,
    systemRole: 'SHOP_MANAGER',
    login: mockLogin,
  }),
}));

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'LIGHT', setTheme: vi.fn() }),
}));

vi.mock('../../context/ShopContext', () => ({
  useShop: () => ({ selectedShop: { id: 'shop-1', name: 'Boutique Test' } }),
}));

vi.mock('../../components/ProfilePictureUpload', () => ({
  default: () => <div>ProfilePictureUpload</div>,
}));

vi.mock('../../components/ThemeSelector', () => ({
  default: () => <div>ThemeSelector</div>,
}));

vi.mock('../../components/BottomNav', () => ({
  default: () => <div>BottomNav</div>,
}));

vi.mock('../../services/profileService', () => ({
  updateThemePreference: vi.fn(),
  updateProfilePicture: vi.fn(),
  getCanChangeEmail: vi.fn().mockResolvedValue({ canChange: true, reason: '' }),
  getCanChangePhone: vi.fn().mockResolvedValue({ canChange: true, reason: '' }),
  changeEmail: vi.fn(),
  changePhone: vi.fn(),
}));

describe('ProfileSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait garder les champs verrouillés jusqu au clic sur le crayon', async () => {
    render(
      <MemoryRouter>
        <ProfileSettingsPage />
      </MemoryRouter>
    );

    const phoneInput = await screen.findByDisplayValue('0612345678');
    expect(phoneInput).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /modifier le numéro de téléphone/i }));

    await waitFor(() => expect(screen.getByDisplayValue('0612345678')).not.toBeDisabled());
  });
});
