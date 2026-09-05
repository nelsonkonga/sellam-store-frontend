/**
 * Tests unitaires pour authService
 * Tests pour l'authentification (login, register, password reset)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, register, forgotPassword, resetPassword } from '../authService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const credentials = {
        phoneNumber: '690000000',
        password: 'secret123'
      };
      const mockResponse = {
        token: 'jwt-token',
        accountId: 'account-123',
        name: 'Alice'
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('devrait gérer les erreurs de connexion', async () => {
      const credentials = {
        phoneNumber: '690000000',
        password: 'wrong-password'
      };
      api.post.mockRejectedValue(new Error('Identifiants invalides'));

      await expect(login(credentials)).rejects.toThrow('Identifiants invalides');
    });

    it('devrait supporter l\'authentification par email', async () => {
      const credentials = {
        phoneNumber: 'alice@example.com',
        password: 'secret123'
      };
      const mockResponse = {
        token: 'jwt-token',
        accountId: 'account-123',
        name: 'Alice'
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('devrait créer un nouveau compte', async () => {
      const registrationData = {
        name: 'Alice',
        phoneNumber: '690000000',
        password: 'secret123'
      };
      const mockResponse = {
        token: 'jwt-token',
        accountId: 'account-123',
        name: 'Alice'
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await register(registrationData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', registrationData);
      expect(result).toEqual(mockResponse);
    });

    it('devrait gérer les erreurs d\'inscription', async () => {
      const registrationData = {
        name: 'Alice',
        phoneNumber: '690000000',
        password: '123' // Mot de passe trop court
      };
      api.post.mockRejectedValue(new Error('Mot de passe trop court'));

      await expect(register(registrationData)).rejects.toThrow('Mot de passe trop court');
    });

    it('devrait rejeter l\'inscription avec un numéro déjà utilisé', async () => {
      const registrationData = {
        name: 'Alice',
        phoneNumber: '690000000',
        password: 'secret123'
      };
      api.post.mockRejectedValue(new Error('Numéro de téléphone déjà utilisé'));

      await expect(register(registrationData)).rejects.toThrow('Numéro de téléphone déjà utilisé');
    });
  });

  describe('forgotPassword', () => {
    it('devrait initier la réinitialisation de mot de passe', async () => {
      const data = { phoneNumber: '690000000' };
      const mockResponse = { message: 'Email de réinitialisation envoyé' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await forgotPassword(data);

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', data);
      expect(result).toEqual(mockResponse);
    });

    it('devrait gérer les erreurs de numéro introuvable', async () => {
      const data = { phoneNumber: '999999999' };
      api.post.mockRejectedValue(new Error('Numéro de téléphone non trouvé'));

      await expect(forgotPassword(data)).rejects.toThrow('Numéro de téléphone non trouvé');
    });
  });

  describe('resetPassword', () => {
    it('devrait réinitialiser le mot de passe avec un token valide', async () => {
      const data = {
        resetToken: 'valid-token',
        newPassword: 'newSecret123'
      };
      const mockResponse = { message: 'Mot de passe réinitialisé avec succès' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await resetPassword(data);

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', data);
      expect(result).toEqual(mockResponse);
    });

    it('devrait rejeter un token invalide', async () => {
      const data = {
        resetToken: 'invalid-token',
        newPassword: 'newSecret123'
      };
      api.post.mockRejectedValue(new Error('Token invalide ou expiré'));

      await expect(resetPassword(data)).rejects.toThrow('Token invalide ou expiré');
    });

    it('devrait rejeter un mot de passe trop faible', async () => {
      const data = {
        resetToken: 'valid-token',
        newPassword: '123'
      };
      api.post.mockRejectedValue(new Error('Mot de passe trop faible'));

      await expect(resetPassword(data)).rejects.toThrow('Mot de passe trop faible');
    });
  });
});