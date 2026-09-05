import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../api';
import {
  listRegisters,
  createRegister,
  openSession,
  closeSession,
  regularizeSession,
  resolveHandover,
  addMovement,
  getSessionDetail,
  listSessions,
  getCashStatus,
} from '../cashService';

vi.mock('../api');

describe('cashService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists registers for a shop', async () => {
    const data = [{ id: 'r1', label: 'Caisse 1' }];
    api.get.mockResolvedValue({ data });

    const result = await listRegisters('shop-1');

    expect(api.get).toHaveBeenCalledWith('/cash/registers/shop-1');
    expect(result).toEqual(data);
  });

  it('creates a register', async () => {
    const payload = { label: 'Caisse 2' };
    const response = { id: 'r2', ...payload };
    api.post.mockResolvedValue({ data: response });

    const result = await createRegister('shop-1', payload);

    expect(api.post).toHaveBeenCalledWith('/cash/registers/shop-1', payload);
    expect(result).toEqual(response);
  });

  it('opens a session', async () => {
    const payload = { openingCashAmount: 2500 };
    const response = { id: 's1', status: 'OPEN' };
    api.post.mockResolvedValue({ data: response });

    const result = await openSession('register-1', payload);

    expect(api.post).toHaveBeenCalledWith('/cash/sessions/open/register-1', payload);
    expect(result).toEqual(response);
  });

  it('closes a session', async () => {
    const payload = { closingDeclaredAmount: 3000 };
    const response = { id: 's1', status: 'CLOSED' };
    api.post.mockResolvedValue({ data: response });

    const result = await closeSession('s1', payload);

    expect(api.post).toHaveBeenCalledWith('/cash/sessions/s1/close', payload);
    expect(result).toEqual(response);
  });

  it('regularizes a session', async () => {
    const payload = { actualOpeningCashAmount: 2000 };
    const response = { id: 's1', status: 'REGULARIZED' };
    api.post.mockResolvedValue({ data: response });

    const result = await regularizeSession('s1', payload);

    expect(api.post).toHaveBeenCalledWith('/cash/sessions/s1/regularize', payload);
    expect(result).toEqual(response);
  });

  it('resolves a handover', async () => {
    const payload = { countedAmount: 1500, countedAt: '2026-09-02T10:00:00' };
    const response = { id: 's1', status: 'OPEN' };
    api.post.mockResolvedValue({ data: response });

    const result = await resolveHandover('pending-1', 'current-1', payload);

    expect(api.post).toHaveBeenCalledWith('/cash/sessions/handover/resolve', payload, { params: { pendingSessionId: 'pending-1', currentSessionId: 'current-1' } });
    expect(result).toEqual(response);
  });

  it('adds a movement', async () => {
    const payload = { type: 'VENTE_CASH', amount: 1200, reason: 'Vente' };
    const response = { id: 'm1', type: 'VENTE_CASH' };
    api.post.mockResolvedValue({ data: response });

    const result = await addMovement('s1', payload);

    expect(api.post).toHaveBeenCalledWith('/cash/sessions/s1/movements', payload);
    expect(result).toEqual(response);
  });

  it('gets session detail', async () => {
    const detail = { session: { id: 's1' }, movements: [] };
    api.get.mockResolvedValue({ data: detail });

    const result = await getSessionDetail('s1');

    expect(api.get).toHaveBeenCalledWith('/cash/sessions/s1');
    expect(result).toEqual(detail);
  });

  it('lists sessions for a shop', async () => {
    const sessions = [{ id: 's1' }];
    api.get.mockResolvedValue({ data: sessions });

    const result = await listSessions('shop-1');

    expect(api.get).toHaveBeenCalledWith('/cash/sessions/shop/shop-1');
    expect(result).toEqual(sessions);
  });

  it('gets cash status for a shop', async () => {
    const status = { hasActiveSession: true };
    api.get.mockResolvedValue({ data: status });

    const result = await getCashStatus('shop-1');

    expect(api.get).toHaveBeenCalledWith('/cash/status/shop-1');
    expect(result).toEqual(status);
  });
});
