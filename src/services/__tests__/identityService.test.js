import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../api';
import {
  listMyMemberships,
  getMembershipByShop,
  createMembership,
  updateMembershipRole,
  toggleMembershipActive,
  deleteMembership,
  updateMembershipPermissions,
  getMyShops,
} from '../identityService';

vi.mock('../api');

describe('identityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists memberships for current user', async () => {
    const memberships = [{ id: 'm1' }];
    api.get.mockResolvedValue({ data: memberships });

    const result = await listMyMemberships();

    expect(api.get).toHaveBeenCalledWith('/identity/memberships');
    expect(result).toEqual(memberships);
  });

  it('gets membership for a shop', async () => {
    const membership = { id: 'm1', shopId: 'shop-1' };
    api.get.mockResolvedValue({ data: membership });

    const result = await getMembershipByShop('shop-1');

    expect(api.get).toHaveBeenCalledWith('/identity/memberships/shop/shop-1');
    expect(result).toEqual(membership);
  });

  it('creates a membership', async () => {
    const payload = { personId: 'person-1', shopId: 'shop-1', role: 'MANAGER' };
    const response = { id: 'm1' };
    api.post.mockResolvedValue({ data: response });

    const result = await createMembership(payload);

    expect(api.post).toHaveBeenCalledWith('/identity/memberships', payload);
    expect(result).toEqual(response);
  });

  it('updates membership role', async () => {
    const response = { id: 'm1', role: 'CASHIER' };
    api.put.mockResolvedValue({ data: response });

    const result = await updateMembershipRole('m1', 'CASHIER');

    expect(api.put).toHaveBeenCalledWith('/identity/memberships/m1/role', { role: 'CASHIER' });
    expect(result).toEqual(response);
  });

  it('toggles active flag', async () => {
    const response = { id: 'm1', active: false };
    api.patch.mockResolvedValue({ data: response });

    const result = await toggleMembershipActive('m1');

    expect(api.patch).toHaveBeenCalledWith('/identity/memberships/m1/toggle-active');
    expect(result).toEqual(response);
  });

  it('deletes a membership', async () => {
    api.delete.mockResolvedValue({});

    await deleteMembership('m1');

    expect(api.delete).toHaveBeenCalledWith('/identity/memberships/m1');
  });

  it('updates membership permissions', async () => {
    const payload = { grantedOverrides: ['VIEW_PRODUCTS'], revokedOverrides: ['EDIT_PRODUCTS'] };
    const response = { id: 'm1', grantedOverrides: payload.grantedOverrides };
    api.put.mockResolvedValue({ data: response });

    const result = await updateMembershipPermissions('m1', payload);

    expect(api.put).toHaveBeenCalledWith('/identity/memberships/m1/permissions', payload);
    expect(result).toEqual(response);
  });

  it('gets shops accessible to current user', async () => {
    const shops = [{ id: 'shop-1', name: 'Boutique A' }];
    api.get.mockResolvedValue({ data: shops });

    const result = await getMyShops();

    expect(api.get).toHaveBeenCalledWith('/identity/shops');
    expect(result).toEqual(shops);
  });
});
