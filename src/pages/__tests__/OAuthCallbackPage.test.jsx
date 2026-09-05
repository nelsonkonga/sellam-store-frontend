import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import OAuthCallbackPage from '../OAuthCallbackPage';

const mockLogin = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  it('doit accepter les paramètres OAuth dans l’URL de query string', async () => {
    window.history.pushState(
      {},
      'oauth-callback',
      '/oauth-callback?token=test-token&personId=person-123&name=Nelson+Konga&email=nelson%40gmail.com&emailVerified=true'
    );

    render(
      <MemoryRouter initialEntries={['/oauth-callback?token=test-token&personId=person-123&name=Nelson+Konga&email=nelson%40gmail.com&emailVerified=true']}>
        <Routes>
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/shops" element={<div>shops</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        token: 'test-token',
        accountId: 'person-123',
        name: 'Nelson Konga',
        email: 'nelson@gmail.com',
        emailVerified: true,
      });
    });
  });
});
