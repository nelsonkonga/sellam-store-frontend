import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../api';
import { getSaleTypes, createSaleType } from '../saleTypeService';

vi.mock('../api');

describe('saleTypeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists sale types for a shop', async () => {
    const saleTypes = [{ id: 'a1', name: 'Unité' }];
    api.get.mockResolvedValue({ data: saleTypes });

    const result = await getSaleTypes('shop-1');

    expect(api.get).toHaveBeenCalledWith('/sale-types', { params: { shopId: 'shop-1' } });
    expect(result).toEqual(saleTypes);
  });

  it('creates a custom sale type', async () => {
    const payload = { name: 'Pack', unitLabel: 'pack' };
    const created = { id: 't2', ...payload };
    api.post.mockResolvedValue({ data: created });

    const result = await createSaleType('shop-1', payload);

    expect(api.post).toHaveBeenCalledWith('/sale-types', payload, { params: { shopId: 'shop-1' } });
    expect(result).toEqual(created);
  });
});
