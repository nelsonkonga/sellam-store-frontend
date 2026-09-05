/**
 * Tests unitaires pour balanceSettingsService
 * Tests pour la gestion des réglages de bilan quotidien
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getBalanceSettings, saveBalanceSetting } from '../balanceSettingsService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('balanceSettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBalanceSettings', () => {
    it('devrait récupérer les réglages de bilan pour une boutique', async () => {
      const shopId = 'shop-123';
      const mockSettings = [
        { dayOfWeek: 'MONDAY', balanceTime: '18:00', reminderFrequencyHours: 24 },
        { dayOfWeek: 'TUESDAY', balanceTime: '18:00', reminderFrequencyHours: 24 },
        { dayOfWeek: 'WEDNESDAY', balanceTime: '18:00', reminderFrequencyHours: 24 },
      ];
      api.get.mockResolvedValue({ data: mockSettings });

      const result = await getBalanceSettings(shopId);

      expect(api.get).toHaveBeenCalledWith('/balance-settings', { params: { shopId } });
      expect(result).toEqual(mockSettings);
    });

    it('devrait retourner un tableau vide si aucun réglage', async () => {
      const shopId = 'shop-123';
      api.get.mockResolvedValue({ data: [] });

      const result = await getBalanceSettings(shopId);

      expect(result).toEqual([]);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      const shopId = 'shop-123';
      api.get.mockRejectedValue(new Error('Erreur réseau'));

      await expect(getBalanceSettings(shopId)).rejects.toThrow('Erreur réseau');
    });
  });

  describe('saveBalanceSetting', () => {
    it('devrait créer un nouveau réglage de bilan', async () => {
      const shopId = 'shop-123';
      const settingData = {
        dayOfWeek: 'MONDAY',
        balanceTime: '18:00',
        reminderFrequencyHours: 24
      };
      const mockResponse = { id: 1, ...settingData };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await saveBalanceSetting(shopId, settingData);

      expect(api.post).toHaveBeenCalledWith('/balance-settings', settingData, { params: { shopId } });
      expect(result).toEqual(mockResponse);
    });

    it('devrait mettre à jour un réglage existant', async () => {
      const shopId = 'shop-123';
      const settingData = {
        dayOfWeek: 'MONDAY',
        balanceTime: '19:00', // Heure modifiée
        reminderFrequencyHours: 12 // Fréquence modifiée
      };
      const mockResponse = { id: 1, ...settingData };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await saveBalanceSetting(shopId, settingData);

      expect(api.post).toHaveBeenCalledWith('/balance-settings', settingData, { params: { shopId } });
      expect(result).toEqual(mockResponse);
    });

    it('devrait gérer les erreurs de sauvegarde', async () => {
      const shopId = 'shop-123';
      const settingData = {
        dayOfWeek: 'INVALID_DAY',
        balanceTime: '18:00',
        reminderFrequencyHours: 24
      };
      api.post.mockRejectedValue(new Error('Jour de la semaine invalide'));

      await expect(saveBalanceSetting(shopId, settingData)).rejects.toThrow('Jour de la semaine invalide');
    });

    it('devrait valider le format de l\'heure', async () => {
      const shopId = 'shop-123';
      const settingData = {
        dayOfWeek: 'MONDAY',
        balanceTime: '25:00', // Heure invalide
        reminderFrequencyHours: 24
      };
      api.post.mockRejectedValue(new Error('Format d\'heure invalide'));

      await expect(saveBalanceSetting(shopId, settingData)).rejects.toThrow('Format d\'heure invalide');
    });

    it('devrait valider la fréquence de rappel', async () => {
      const shopId = 'shop-123';
      const settingData = {
        dayOfWeek: 'MONDAY',
        balanceTime: '18:00',
        reminderFrequencyHours: -1 // Fréquence invalide
      };
      api.post.mockRejectedValue(new Error('Fréquence de rappel invalide'));

      await expect(saveBalanceSetting(shopId, settingData)).rejects.toThrow('Fréquence de rappel invalide');
    });
  });
});