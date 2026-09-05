import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '../ForgotPasswordPage';

vi.mock('../../services/authService', () => ({
  forgotPassword: vi.fn().mockResolvedValue({ message: 'OK' }),
  resetPassword: vi.fn().mockResolvedValue({ message: 'OK' }),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche l’étape d’identification de la réinitialisation', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /réinitialisation du mot de passe/i })).toBeInTheDocument();
    expect(screen.getByText(/identifiez votre compte/i)).toBeInTheDocument();
  });
});
