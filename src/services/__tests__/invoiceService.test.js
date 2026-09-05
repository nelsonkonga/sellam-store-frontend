/**
 * Tests unitaires pour invoiceService
 * Tests pour la création et gestion des factures
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createInvoice, 
  addInvoiceLine, 
  removeInvoiceLine, 
  applyInvoiceDiscount, 
  validateInvoice 
} from '../invoiceService';
import api from '../api';

// Mock de l'API
vi.mock('../api');

describe('invoiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInvoice', () => {
    it('devrait créer une nouvelle facture', async () => {
      const mockInvoice = {
        id: 'inv-123',
        shopId: 'shop-123',
        invoiceNumber: 'INV-001',
        lines: [],
        subtotal: 0,
        totalAmount: 0,
      };
      api.post.mockResolvedValue({ data: mockInvoice });

      const result = await createInvoice('shop-123');

      expect(api.post).toHaveBeenCalledWith('/invoices?shopId=shop-123', { customerName: null });
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('addInvoiceLine', () => {
    it('devrait ajouter une ligne à une facture', async () => {
      const mockLine = {
        saleId: 1,
        productName: 'Coca-Cola 33cl',
        quantity: 2,
        unitPrice: 500,
        totalPrice: 1000,
        margin: 400,
      };
      const updatedInvoice = {
        id: 'inv-123',
        lines: [mockLine],
        subtotal: 1000,
        totalAmount: 1000,
      };
      api.post.mockResolvedValue({ data: updatedInvoice });

      const result = await addInvoiceLine('inv-123', 1, 2);

      expect(api.post).toHaveBeenCalledWith('/invoices/inv-123/lines', {
        productId: 1,
        quantity: 2,
        discountType: null,
        discountValue: null,
      });
      expect(result).toEqual(updatedInvoice);
    });

    it('devrait supporter les remises par ligne', async () => {
      api.post.mockResolvedValue({ data: {} });

      await addInvoiceLine('inv-123', 1, 2, 'PERCENTAGE', 10);

      expect(api.post).toHaveBeenCalledWith('/invoices/inv-123/lines', {
        productId: 1,
        quantity: 2,
        discountType: 'PERCENTAGE',
        discountValue: 10,
      });
    });
  });

  describe('removeInvoiceLine', () => {
    it('devrait supprimer une ligne d\'une facture', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      await removeInvoiceLine('inv-123', 1);

      expect(api.delete).toHaveBeenCalledWith('/invoices/inv-123/lines/1?isManagerAction=false');
    });
  });

  describe('applyInvoiceDiscount', () => {
    it('devrait appliquer une remise sur la facture', async () => {
      const updatedInvoice = {
        id: 'inv-123',
        subtotal: 10000,
        discountAmount: 1000,
        totalAmount: 9000,
      };
      api.post.mockResolvedValue({ data: updatedInvoice });

      const result = await applyInvoiceDiscount('inv-123', 'PERCENTAGE', 10);

      expect(api.post).toHaveBeenCalledWith('/invoices/inv-123/discount', {
        discountType: 'PERCENTAGE',
        discountValue: 10,
      });
      expect(result).toEqual(updatedInvoice);
    });

    it('devrait supporter les remises en montant fixe', async () => {
      api.post.mockResolvedValue({ data: {} });

      await applyInvoiceDiscount('inv-123', 'FIXED_AMOUNT', 500);

      expect(api.post).toHaveBeenCalledWith('/invoices/inv-123/discount', {
        discountType: 'FIXED_AMOUNT',
        discountValue: 500,
      });
    });
  });

  describe('validateInvoice', () => {
    it('devrait valider une facture', async () => {
      const validatedInvoice = {
        id: 'inv-123',
        status: 'VALIDATED',
        validatedAt: '2026-08-27T10:00:00Z',
      };
      api.post.mockResolvedValue({ data: validatedInvoice });

      const result = await validateInvoice('inv-123');

      expect(api.post).toHaveBeenCalledWith('/invoices/inv-123/validate', { customerName: null });
      expect(result).toEqual(validatedInvoice);
    });
  });
});
