import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useChatService from '../useChatService';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../context/ShopContext', () => ({
  useShop: vi.fn(),
}));

function MockSockJS() {
  return { close: vi.fn() };
}

vi.mock('sockjs-client', () => ({
  default: MockSockJS,
}));

const mockStompClient = {
  connected: true,
  debug: vi.fn(),
  connect: vi.fn((headers, onConnect) => onConnect && onConnect()),
  subscribe: vi.fn(),
  send: vi.fn(),
  disconnect: vi.fn((cb) => cb && cb()),
};

vi.mock('stompjs', () => ({
  default: {
    over: vi.fn(() => mockStompClient),
  },
}));

describe('useChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    useAuth.mockReturnValue({
      token: 'token-123',
      accountId: 'user-1',
    });

    useShop.mockReturnValue({
      selectedShop: { id: 'shop-1', name: 'Boutique Test' },
    });
  });

  it('connects using selectedShop data from the shop context', () => {
    renderHook(() => useChatService('conversation-1'));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/chat\/history\/conversation-1$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      })
    );
    expect(mockStompClient.connect).toHaveBeenCalled();
    expect(mockStompClient.send).not.toHaveBeenCalled();
  });
});
