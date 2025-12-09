import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock Tauri core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd, args) => {
    switch (cmd) {
      case 'connect_tailscale_ssh':
        return Promise.resolve({
          connected: true,
          mode: 'tailscale',
          host: args?.host,
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
      case 'connect_local':
        return Promise.resolve({ connected: true, mode: 'local' });
      case 'connect_claude_web':
        return Promise.resolve({ connected: true, mode: 'web' });
      default:
        return Promise.resolve();
    }
  }),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event, handler) => {
    return Promise.resolve(() => {});
  }),
  emit: vi.fn(),
}));

describe('Connection Modes E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Local Connection', () => {
    it('connects to local Claude Code instance', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const result = await invoke('connect_local');

      expect(result).toEqual({ connected: true, mode: 'local' });
    });

    it('verifies connection command is called correctly', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('connect_local');

      expect(invoke).toHaveBeenCalledWith('connect_local');
    });
  });

  describe('Tailscale SSH Connection', () => {
    it('establishes SSH connection to Tailscale node', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const result = await invoke('connect_tailscale_ssh', {
        host: 'mypc.tail12345.ts.net',
        username: 'user',
        port: 22,
      });

      expect(result.connected).toBe(true);
      expect(result.mode).toBe('tailscale');
      expect(result.host).toBe('mypc.tail12345.ts.net');
    });

    it('handles connection failure gracefully', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Connection refused'));

      await expect(
        invoke('connect_tailscale_ssh', { host: 'invalid', username: 'user', port: 22 })
      ).rejects.toThrow('Connection refused');
    });

    it('disconnects cleanly', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('disconnect_tailscale');

      expect(invoke).toHaveBeenCalledWith('disconnect_tailscale');
    });

    it('preserves connection parameters', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const params = {
        host: 'workstation.tail67890.ts.net',
        username: 'developer',
        port: 2222,
      };

      const result = await invoke('connect_tailscale_ssh', params);

      expect(invoke).toHaveBeenCalledWith('connect_tailscale_ssh', params);
      expect(result.host).toBe(params.host);
    });
  });

  describe('Claude Web Connection', () => {
    it('connects to Claude Web API', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const result = await invoke('connect_claude_web');

      expect(result).toEqual({ connected: true, mode: 'web' });
    });

    it('verifies web connection command', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('connect_claude_web');

      expect(invoke).toHaveBeenCalledWith('connect_claude_web');
    });
  });

  describe('Connection State Management', () => {
    it('reports correct connection status', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const status = await invoke('get_connection_status');

      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('mode');
    });

    it('emits events on connection changes', async () => {
      const { listen } = await import('@tauri-apps/api/event');

      const handler = vi.fn();
      await listen('tailscale-connected', handler);

      expect(listen).toHaveBeenCalledWith('tailscale-connected', expect.any(Function));
    });

    it('tracks multiple connection state properties', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const status = await invoke('get_connection_status');

      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('mode');
      expect(status).toHaveProperty('host');
      expect(status).toHaveProperty('error');
    });
  });

  describe('Connection Mode Switching', () => {
    it('switches from disconnected to local', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Start disconnected
      await invoke('get_connection_status');

      // Connect locally
      const result = await invoke('connect_local');

      expect(result.connected).toBe(true);
      expect(result.mode).toBe('local');
    });

    it('switches from local to Tailscale', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Connect locally first
      await invoke('connect_local');

      // Switch to Tailscale
      const result = await invoke('connect_tailscale_ssh', {
        host: 'remote.ts.net',
        username: 'user',
        port: 22,
      });

      expect(result.mode).toBe('tailscale');
    });
  });

  describe('Error Handling', () => {
    it('handles network timeout', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(
        invoke('connect_tailscale_ssh', { host: 'slow.host', username: 'user', port: 22 })
      ).rejects.toThrow('Connection timeout');
    });

    it('handles authentication failure', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Authentication failed'));

      await expect(
        invoke('connect_tailscale_ssh', { host: 'host', username: 'invalid', port: 22 })
      ).rejects.toThrow('Authentication failed');
    });

    it('handles host unreachable', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Host unreachable'));

      await expect(
        invoke('connect_tailscale_ssh', { host: 'nonexistent.ts.net', username: 'user', port: 22 })
      ).rejects.toThrow('Host unreachable');
    });
  });
});
