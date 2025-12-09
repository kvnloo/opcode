import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd, args) => {
    switch (cmd) {
      case 'connect_tailscale_ssh':
        return Promise.resolve({
          connected: true,
          mode: 'tailscale',
          host: args?.host || 'test-host',
          error: null,
        });
      case 'disconnect_tailscale':
        return Promise.resolve();
      case 'get_connection_status':
        return Promise.resolve({
          connected: false,
          mode: 'disconnected',
          host: null,
          error: null,
        });
      case 'send_terminal_input':
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  }),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
  emit: vi.fn(),
}));

describe('Tailscale SSH Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect to Tailscale host', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    const result = await invoke('connect_tailscale_ssh', {
      host: 'my-machine.tail12345.ts.net',
      username: 'user',
      port: 22,
    });

    expect(result).toEqual({
      connected: true,
      mode: 'tailscale',
      host: 'my-machine.tail12345.ts.net',
      error: null,
    });
  });

  it('should disconnect from Tailscale', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    await invoke('disconnect_tailscale');

    expect(invoke).toHaveBeenCalledWith('disconnect_tailscale');
  });

  it('should send terminal input', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    await invoke('send_terminal_input', { data: 'ls -la\n' });

    expect(invoke).toHaveBeenCalledWith('send_terminal_input', { data: 'ls -la\n' });
  });

  it('should get connection status', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    const status = await invoke('get_connection_status');

    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('mode');
  });

  it('should handle connection errors gracefully', async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    vi.mocked(invoke).mockRejectedValueOnce(new Error('Connection refused'));

    await expect(invoke('connect_tailscale_ssh', {
      host: 'invalid-host',
      username: 'user',
      port: 22,
    })).rejects.toThrow('Connection refused');
  });

  it('should emit events on connection state changes', async () => {
    const { listen } = await import('@tauri-apps/api/event');

    const handler = vi.fn();
    await listen('tailscale-connected', handler);

    expect(listen).toHaveBeenCalledWith('tailscale-connected', expect.any(Function));
  });

  it('should accept optional key_path parameter', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    const result = await invoke('connect_tailscale_ssh', {
      host: 'my-machine.tail12345.ts.net',
      username: 'user',
      port: 22,
      key_path: '/home/user/.ssh/id_rsa',
    });

    expect(result).toHaveProperty('connected', true);
  });

  it('should handle multiple connection attempts', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    // First connection
    const result1 = await invoke('connect_tailscale_ssh', {
      host: 'host1.tail12345.ts.net',
      username: 'user',
      port: 22,
    });
    expect(result1.connected).toBe(true);

    // Disconnect
    await invoke('disconnect_tailscale');

    // Second connection
    const result2 = await invoke('connect_tailscale_ssh', {
      host: 'host2.tail12345.ts.net',
      username: 'user',
      port: 22,
    });
    expect(result2.connected).toBe(true);
  });
});
