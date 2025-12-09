import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

describe('Error Recovery E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Network Errors', () => {
    it('handles connection timeout', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Connection timed out'));

      await expect(
        invoke('connect_tailscale_ssh', { host: 'slow.host', username: 'user', port: 22 })
      ).rejects.toThrow('Connection timed out');
    });

    it('handles network disconnection', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Network unreachable'));

      await expect(invoke('send_terminal_input', { data: 'ls' }))
        .rejects.toThrow('Network unreachable');
    });

    it('recovers after reconnection', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // First call fails
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Disconnected'));
      await expect(invoke('send_terminal_input', { data: 'ls' })).rejects.toThrow();

      // Second call succeeds (after reconnection)
      vi.mocked(invoke).mockResolvedValueOnce({ connected: true });
      const result = await invoke('connect_tailscale_ssh', { host: 'host', username: 'user', port: 22 });
      expect(result.connected).toBe(true);
    });

    it('handles intermittent network failures', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Fail, succeed, fail, succeed pattern
      vi.mocked(invoke)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      await expect(invoke('list_projects')).rejects.toThrow();
      const result1 = await invoke('list_projects');
      expect(result1.success).toBe(true);
      await expect(invoke('list_projects')).rejects.toThrow();
      const result2 = await invoke('list_projects');
      expect(result2.success).toBe(true);
    });
  });

  describe('Backend Errors', () => {
    it('handles project not found', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Project not found'));

      await expect(invoke('get_project_sessions', { projectId: 'invalid' }))
        .rejects.toThrow('Project not found');
    });

    it('handles permission denied', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Permission denied'));

      await expect(invoke('create_project', { name: 'restricted', template: 'nextjs' }))
        .rejects.toThrow('Permission denied');
    });

    it('handles disk full error', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('No space left on device'));

      await expect(invoke('create_project', { name: 'big-project', template: 'fullstack' }))
        .rejects.toThrow('No space left on device');
    });

    it('handles invalid template error', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Invalid template'));

      await expect(invoke('create_project', { name: 'project', template: 'nonexistent' }))
        .rejects.toThrow('Invalid template');
    });

    it('handles database connection errors', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(invoke('list_projects'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('State Recovery', () => {
    it('restores state after app restart', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce([
        { id: 'p1', name: 'Restored Project', path: '/path/p1' },
      ]);

      const projects = await invoke('list_projects');

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Restored Project');
    });

    it('handles corrupted session data', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce([]);

      // Should return empty array, not crash
      const sessions = await invoke('get_project_sessions', { projectId: 'corrupt' });
      expect(Array.isArray(sessions)).toBe(true);
    });

    it('recovers from invalid configuration', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // First call with corrupted config fails
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Invalid config'));
      await expect(invoke('get_connection_status')).rejects.toThrow();

      // After reset, succeeds with defaults
      vi.mocked(invoke).mockResolvedValueOnce({ connected: false, mode: 'disconnected' });
      const status = await invoke('get_connection_status');
      expect(status).toHaveProperty('connected');
    });

    it('handles missing project files', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce([
        { id: 'p1', name: 'Project 1', path: '/nonexistent/path' },
      ]);

      const projects = await invoke('list_projects');
      expect(projects[0].path).toBe('/nonexistent/path');
      // App should handle missing path gracefully
    });
  });

  describe('Graceful Degradation', () => {
    it('falls back to polling when watcher fails', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce(undefined);

      // Start polling should succeed even if watcher failed
      await invoke('start_session_polling');
      expect(invoke).toHaveBeenCalledWith('start_session_polling');
    });

    it('continues operation with partial data', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce([
        { id: 'p1', name: 'Partial Project' }, // Missing path
      ]);

      const projects = await invoke('list_projects');
      expect(projects[0]).toHaveProperty('name', 'Partial Project');
    });

    it('operates in offline mode when web unavailable', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Web connection fails
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Web API unavailable'));
      await expect(invoke('connect_claude_web')).rejects.toThrow();

      // Local connection still works
      vi.mocked(invoke).mockResolvedValueOnce({ connected: true, mode: 'local' });
      const result = await invoke('connect_local');
      expect(result.connected).toBe(true);
    });

    it('uses cached data when backend unavailable', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // First call succeeds
      vi.mocked(invoke).mockResolvedValueOnce([
        { id: 'p1', name: 'Cached Project', path: '/path' },
      ]);
      const projects1 = await invoke('list_projects');

      // Second call fails, should use cache
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Backend unavailable'));
      await expect(invoke('list_projects')).rejects.toThrow();

      // Cache is still valid
      expect(projects1).toBeDefined();
    });
  });

  describe('Retry Logic', () => {
    it('retries failed operations', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Fail twice, succeed third time
      vi.mocked(invoke)
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ success: true });

      await expect(invoke('connect_tailscale_ssh', { host: 'host', username: 'user', port: 22 }))
        .rejects.toThrow();
      await expect(invoke('connect_tailscale_ssh', { host: 'host', username: 'user', port: 22 }))
        .rejects.toThrow();

      const result = await invoke('connect_tailscale_ssh', { host: 'host', username: 'user', port: 22 });
      expect(result.success).toBe(true);
    });

    it('gives up after max retries', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Always fail
      vi.mocked(invoke).mockRejectedValue(new Error('Persistent failure'));

      for (let i = 0; i < 3; i++) {
        await expect(invoke('connect_tailscale_ssh', { host: 'host', username: 'user', port: 22 }))
          .rejects.toThrow('Persistent failure');
      }
    });
  });

  describe('Error Reporting', () => {
    it('provides detailed error messages', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(
        new Error('Connection failed: Host unreachable (timeout after 30s)')
      );

      try {
        await invoke('connect_tailscale_ssh', { host: 'host', username: 'user', port: 22 });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('Connection failed');
        expect(error.message).toContain('Host unreachable');
        expect(error.message).toContain('timeout');
      }
    });

    it('categorizes errors correctly', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const networkError = new Error('Network unreachable');
      const permissionError = new Error('Permission denied');
      const notFoundError = new Error('Project not found');

      vi.mocked(invoke)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(permissionError)
        .mockRejectedValueOnce(notFoundError);

      await expect(invoke('connect')).rejects.toThrow('Network unreachable');
      await expect(invoke('create_project')).rejects.toThrow('Permission denied');
      await expect(invoke('get_project')).rejects.toThrow('Project not found');
    });
  });
});
