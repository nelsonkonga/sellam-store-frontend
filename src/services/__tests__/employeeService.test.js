/**
 * Tests unitaires pour employeeService
 * Tests pour la création et gestion des employés
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  listEmployees, 
  createEmployee, 
  updateEmployee, 
  changeEmployeePassword, 
  toggleEmployeeActive, 
  getEmployeePermissions, 
  updateEmployeePermissions, 
  deleteEmployee 
} from '../employeeService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('employeeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listEmployees', () => {
    it('devrait lister les employés d\'une boutique', async () => {
      const mockEmployees = [
        { id: 1, name: 'Jean Dupont', role: 'CASHIER', active: true },
        { id: 2, name: 'Marie Kouam', role: 'MANAGER', active: true },
      ];
      api.get.mockResolvedValue({ data: mockEmployees });

      const result = await listEmployees('shop-123');

      expect(api.get).toHaveBeenCalledWith('/users/shop/shop-123');
      expect(result).toEqual(mockEmployees);
    });

    it('devrait retourner un tableau vide si aucun employé', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await listEmployees('shop-123');

      expect(result).toEqual([]);
    });
  });

  describe('createEmployee', () => {
    it('devrait créer un nouvel employé', async () => {
      const newEmployee = {
        name: 'Paul Mbarga',
        phoneNumber: '+237690000000',
        password: 'password123',
        role: 'CASHIER',
      };
      const mockResponse = { id: 3, ...newEmployee, active: true };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await createEmployee('shop-123', newEmployee);

      expect(api.post).toHaveBeenCalledWith('/users/shop/shop-123', newEmployee);
      expect(result).toEqual(mockResponse);
    });

    it('devrait valider les données de l\'employé', async () => {
      const invalidEmployee = {
        name: '', // Nom vide
        phoneNumber: '', // Numéro vide
        password: '123', // Mot de passe trop court
      };

      api.post.mockRejectedValue(new Error('Données invalides'));

      await expect(createEmployee('shop-123', invalidEmployee)).rejects.toThrow('Données invalides');
    });
  });

  describe('updateEmployee', () => {
    it('devrait mettre à jour un employé existant', async () => {
      const updatedEmployee = {
        id: 1,
        name: 'Jean Dupont',
        phoneNumber: '+237690000001',
        role: 'MANAGER',
      };
      api.put.mockResolvedValue({ data: updatedEmployee });

      const result = await updateEmployee(1, updatedEmployee);

      expect(api.put).toHaveBeenCalledWith('/users/1', updatedEmployee);
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe('changeEmployeePassword', () => {
    it('devrait changer le mot de passe d\'un employé', async () => {
      api.patch.mockResolvedValue({ data: { success: true } });

      await changeEmployeePassword(1, 'newPassword123');

      expect(api.patch).toHaveBeenCalledWith('/users/1/password', {
        newPassword: 'newPassword123',
      });
    });

    it('devrait valider la longueur du mot de passe', async () => {
      api.patch.mockRejectedValue(new Error('Mot de passe trop court'));

      await expect(changeEmployeePassword(1, '123')).rejects.toThrow('Mot de passe trop court');
    });
  });

  describe('toggleEmployeeActive', () => {
    it('devrait activer/désactiver un employé', async () => {
      const toggledEmployee = { id: 1, active: false };
      api.patch.mockResolvedValue({ data: toggledEmployee });

      const result = await toggleEmployeeActive(1);

      expect(api.patch).toHaveBeenCalledWith('/users/1/toggle-active');
      expect(result).toEqual(toggledEmployee);
    });
  });

  describe('getEmployeePermissions', () => {
    it('devrait récupérer les permissions d\'un employé', async () => {
      const mockPermissions = {
        defaultPermissions: ['VIEW_PRODUCTS', 'CREATE_INVOICE'],
        grantedOverrides: ['EDIT_PRODUCTS'],
        revokedOverrides: ['DELETE_INVOICE_LINE'],
      };
      api.get.mockResolvedValue({ data: mockPermissions });

      const result = await getEmployeePermissions(1);

      expect(api.get).toHaveBeenCalledWith('/users/1/permissions');
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('updateEmployeePermissions', () => {
    it('devrait mettre à jour les permissions d\'un employé', async () => {
      const permissionsPayload = {
        grantedOverrides: ['EDIT_PRODUCTS', 'MANAGE_DAILY_BALANCE'],
        revokedOverrides: ['DELETE_INVOICE_LINE'],
      };
      api.put.mockResolvedValue({ data: { success: true } });

      await updateEmployeePermissions(1, permissionsPayload);

      expect(api.put).toHaveBeenCalledWith('/users/1/permissions', permissionsPayload);
    });
  });

  describe('deleteEmployee', () => {
    it('devrait supprimer un employé', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      await deleteEmployee(1);

      expect(api.delete).toHaveBeenCalledWith('/users/1');
    });
  });
});
