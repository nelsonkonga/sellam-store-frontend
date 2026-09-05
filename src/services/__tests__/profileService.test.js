/**
 * Tests unitaires pour profileService
 * Tests pour la mise à jour du profil (photo, thème)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateProfilePicture, updateThemePreference } from '../profileService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfilePicture', () => {
    it('devrait mettre à jour la photo de profil', async () => {
      const mockFile = new File(['image'], 'profile.jpg', { type: 'image/jpeg' });
      const mockResponse = { pictureUrl: 'https://example.com/profile.jpg' };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await updateProfilePicture(mockFile);

      expect(api.put).toHaveBeenCalledWith(
        '/profile/picture',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('devrait gérer les erreurs d\'upload', async () => {
      const mockFile = new File(['image'], 'profile.jpg', { type: 'image/jpeg' });
      api.put.mockRejectedValue(new Error('Erreur lors de l\'upload'));

      await expect(updateProfilePicture(mockFile)).rejects.toThrow('Erreur lors de l\'upload');
    });

    it('devrait rejeter les fichiers non image', async () => {
      const mockFile = new File(['document'], 'document.pdf', { type: 'application/pdf' });
      api.put.mockRejectedValue(new Error('Format de fichier non supporté'));

      await expect(updateProfilePicture(mockFile)).rejects.toThrow('Format de fichier non supporté');
    });

    it('devrait rejeter les fichiers trop volumineux', async () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      api.put.mockRejectedValue(new Error('Fichier trop volumineux'));

      await expect(updateProfilePicture(largeFile)).rejects.toThrow('Fichier trop volumineux');
    });

    it('devrait retourner l\'URL publique de la photo', async () => {
      const mockFile = new File(['image'], 'profile.jpg', { type: 'image/jpeg' });
      const mockResponse = { pictureUrl: 'https://storage.example.com/profiles/abc123.jpg' };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await updateProfilePicture(mockFile);

      expect(result.pictureUrl).toContain('https://');
      expect(result.pictureUrl).toContain('.jpg');
    });
  });

  describe('updateThemePreference', () => {
    it('devrait mettre à jour la préférence de thème en mode clair', async () => {
      const themePreference = 'LIGHT';
      const mockResponse = { themePreference: 'LIGHT' };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await updateThemePreference(themePreference);

      expect(api.put).toHaveBeenCalledWith('/profile/theme', { themePreference });
      expect(result).toEqual(mockResponse);
    });

    it('devrait mettre à jour la préférence de thème en mode sombre', async () => {
      const themePreference = 'DARK';
      const mockResponse = { themePreference: 'DARK' };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await updateThemePreference(themePreference);

      expect(api.put).toHaveBeenCalledWith('/profile/theme', { themePreference });
      expect(result).toEqual(mockResponse);
    });

    it('devrait mettre à jour la préférence de thème en mode système', async () => {
      const themePreference = 'SYSTEM';
      const mockResponse = { themePreference: 'SYSTEM' };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await updateThemePreference(themePreference);

      expect(api.put).toHaveBeenCalledWith('/profile/theme', { themePreference });
      expect(result).toEqual(mockResponse);
    });

    it('devrait rejeter une préférence de thème invalide', async () => {
      const themePreference = 'INVALID_THEME';
      api.put.mockRejectedValue(new Error('Préférence de thème invalide'));

      await expect(updateThemePreference(themePreference)).rejects.toThrow('Préférence de thème invalide');
    });

    it('devrait gérer les erreurs de mise à jour', async () => {
      const themePreference = 'LIGHT';
      api.put.mockRejectedValue(new Error('Erreur serveur'));

      await expect(updateThemePreference(themePreference)).rejects.toThrow('Erreur serveur');
    });

    it('devrait supporter les différents modes de thème', async () => {
      const validThemes = ['LIGHT', 'DARK', 'SYSTEM'];

      for (const theme of validThemes) {
        const mockResponse = { themePreference: theme };
        api.put.mockResolvedValue({ data: mockResponse });

        const result = await updateThemePreference(theme);

        expect(result.themePreference).toBe(theme);
      }
    });
  });
});