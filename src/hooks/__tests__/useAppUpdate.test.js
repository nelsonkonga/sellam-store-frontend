import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppUpdate } from '../useAppUpdate';

describe('useAppUpdate', () => {
  const originalServiceWorker = navigator.serviceWorker;
  let registration;
  let waiting;
  let swListeners;
  let reloadMock;

  beforeEach(() => {
    vi.useFakeTimers();
    swListeners = {};
    waiting = {
      state: 'installed',
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
    };
    registration = {
      waiting,
      installing: null,
      addEventListener: vi.fn(),
      update: vi.fn(() => Promise.resolve()),
    };
    navigator.serviceWorker = {
      controller: {},
      getRegistration: vi.fn(() => Promise.resolve(registration)),
      addEventListener: vi.fn((event, handler) => {
        swListeners[event] = handler;
      }),
      register: vi.fn(),
      ready: Promise.resolve({ showNotification: vi.fn() }),
    };
    reloadMock = vi.fn();
    vi.stubGlobal('location', { reload: reloadMock });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    navigator.serviceWorker = originalServiceWorker;
  });

  async function flush() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it('signale une mise à jour déjà en attente', async () => {
    const { result } = renderHook(() => useAppUpdate());
    await flush();
    expect(result.current.updateAvailable).toBe(true);
  });

  it('écoute le changement de contrôleur avant d’activer le worker en attente', async () => {
    const { result } = renderHook(() => useAppUpdate());
    await flush();

    await act(async () => {
      result.current.applyUpdate();
      await Promise.resolve();
    });

    expect(navigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function),
      { once: true }
    );
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    const listenOrder = navigator.serviceWorker.addEventListener.mock.invocationCallOrder[0];
    const messageOrder = waiting.postMessage.mock.invocationCallOrder[0];
    expect(listenOrder).toBeLessThan(messageOrder);
    expect(reloadMock).not.toHaveBeenCalled();

    act(() => {
      swListeners.controllerchange();
    });
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('recharge tout de suite quand aucun worker n’est en attente', async () => {
    registration.waiting = null;
    const { result } = renderHook(() => useAppUpdate());
    await flush();

    await act(async () => {
      result.current.applyUpdate();
      await Promise.resolve();
    });

    expect(waiting.postMessage).not.toHaveBeenCalled();
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('recharge si le worker en attente ignore le message', async () => {
    const { result } = renderHook(() => useAppUpdate());
    await flush();

    await act(async () => {
      result.current.applyUpdate();
      await Promise.resolve();
    });

    expect(reloadMock).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
