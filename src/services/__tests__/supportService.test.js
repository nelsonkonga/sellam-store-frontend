import { describe, it, expect, vi, beforeEach } from 'vitest';
import supportService from '../supportService';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('supportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not duplicate /api when creating a support ticket', async () => {
    api.post.mockResolvedValue({ data: { id: 'ticket-1' } });

    await supportService.createTicket({ subject: 'Test' });

    expect(api.post).toHaveBeenCalledWith('/support/tickets', { subject: 'Test' });
  });

  it('should use the canonical support routes for ticket listing and admin actions', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.put.mockResolvedValue({ data: { ok: true } });

    await supportService.listMyTickets();
    await supportService.listAllTickets();
    await supportService.updateTicketStatus('ticket-1', 'IN_PROGRESS');

    expect(api.get).toHaveBeenNthCalledWith(1, '/support/tickets/my');
    expect(api.get).toHaveBeenNthCalledWith(2, '/support/admin/tickets');
    expect(api.put).toHaveBeenCalledWith('/support/admin/tickets/ticket-1/status', { status: 'IN_PROGRESS' });
  });
});
