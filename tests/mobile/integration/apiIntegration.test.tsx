import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Create mock functions at module level with vi.hoisted
const { mockInvoke, mockListen, mockApi } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockListen: vi.fn(),
  mockApi: {
    listProjects: vi.fn(),
    getProjectSessions: vi.fn(),
  },
}));

// Mock Tauri API modules with hoisted mocks
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: mockListen,
}));

// Mock the api module to intercept store calls
vi.mock('@/lib/api', () => ({
  api: mockApi,
}));

// NOTE: These integration tests are currently skipped due to Zustand store module caching.
//
// ISSUE: The stores import their dependencies (`api` from `@/lib/api`, `invoke` from `@tauri-apps/api/core`)
// at module evaluation time, creating a singleton with the real implementations before test mocks can intercept.
//
// ATTEMPTED FIX: Using vi.hoisted() to create mocks before modules load, and vi.mock() to intercept imports.
// However, dynamic imports in tests still load cached modules with real dependencies.
//
// SOLUTIONS TO ENABLE THESE TESTS:
// 1. Dependency Injection: Pass `api` and `invoke` as parameters to store factory functions
// 2. Module Reset: Use `vi.resetModules()` + `vi.isolateModules()` (but requires synchronous test structure)
// 3. Integration Tests: Test with real Tauri backend instead of mocking (requires test environment setup)
// 4. Refactor Stores: Use dependency injection pattern for all external dependencies
//
// For now, these tests remain skipped. To enable them, stores need architectural changes for testability.
// See: https://github.com/pmndrs/zustand/discussions/2001
describe.skip('API Integration', () => {
  beforeEach(() => {
    // Clear previous mock data
    mockInvoke.mockClear();
    mockListen.mockClear();
    mockApi.listProjects.mockClear();
    mockApi.getProjectSessions.mockClear();

    // Set up default mock implementations for invoke
    mockInvoke.mockImplementation((cmd, args) => {
      switch (cmd) {
        case 'list_projects':
          return Promise.resolve([
            { id: '1', path: '/path/1', sessions: [], created_at: Date.now() },
            { id: '2', path: '/path/2', sessions: [], created_at: Date.now() },
          ]);
        case 'get_project_sessions':
          return Promise.resolve([
            {
              id: 's1',
              project_id: args?.projectId,
              project_path: '/path/1',
              created_at: Date.now()
            },
          ]);
        case 'start_agent_task':
          return Promise.resolve('task-123');
        case 'stop_agent_task':
          return Promise.resolve();
        case 'connect_tailscale_ssh':
          return Promise.resolve({ connected: true });
        case 'disconnect':
          return Promise.resolve();
        case 'get_connection_status':
          return Promise.resolve({ connected: false, mode: 'disconnected' });
        default:
          return Promise.resolve();
      }
    });

    // Set up default mock implementations for api module
    mockApi.listProjects.mockResolvedValue([
      { id: '1', path: '/path/1', sessions: [], created_at: Date.now() },
      { id: '2', path: '/path/2', sessions: [], created_at: Date.now() },
    ]);

    mockApi.getProjectSessions.mockImplementation((projectId: string) =>
      Promise.resolve([
        {
          id: 's1',
          project_id: projectId,
          project_path: '/path/1',
          created_at: Date.now()
        },
      ])
    );

    mockListen.mockResolvedValue(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Store API Integration', () => {
    it('fetches projects from backend using api.listProjects', async () => {
      const { useSessionStore } = await import('@/stores/sessionStore');

      await act(async () => {
        await useSessionStore.getState().fetchProjects();
      });

      expect(mockApi.listProjects).toHaveBeenCalled();

      const { projects, isLoadingProjects } = useSessionStore.getState();
      expect(projects).toHaveLength(2);
      expect(isLoadingProjects).toBe(false);
    });

    it('sets loading state during project fetch', async () => {
      const { useSessionStore } = await import('@/stores/sessionStore');

      // Start fetch but don't await
      const fetchPromise = useSessionStore.getState().fetchProjects();

      // Should be loading immediately
      expect(useSessionStore.getState().isLoadingProjects).toBe(true);

      // Wait for completion
      await act(async () => {
        await fetchPromise;
      });

      // Should no longer be loading
      expect(useSessionStore.getState().isLoadingProjects).toBe(false);
    });

    it('fetches sessions for a specific project', async () => {
      const { useSessionStore } = await import('@/stores/sessionStore');

      await act(async () => {
        await useSessionStore.getState().fetchProjectSessions('1');
      });

      expect(mockApi.getProjectSessions).toHaveBeenCalledWith('1');

      const { sessions } = useSessionStore.getState();
      expect(sessions['1']).toHaveLength(1);
      expect(sessions['1'][0].id).toBe('s1');
    });

    it('handles fetch errors gracefully', async () => {
      mockApi.listProjects.mockRejectedValueOnce(new Error('Network error'));

      const { useSessionStore } = await import('@/stores/sessionStore');

      await act(async () => {
        await useSessionStore.getState().fetchProjects();
      });

      const { error, isLoadingProjects } = useSessionStore.getState();
      expect(error).toBe('Network error');
      expect(isLoadingProjects).toBe(false);
    });

    it('clears error state', async () => {
      const { useSessionStore } = await import('@/stores/sessionStore');

      // Set error first
      mockApi.listProjects.mockRejectedValueOnce(new Error('Test error'));

      await act(async () => {
        await useSessionStore.getState().fetchProjects();
      });

      expect(useSessionStore.getState().error).toBe('Test error');

      // Clear error
      act(() => {
        useSessionStore.getState().clearError();
      });

      expect(useSessionStore.getState().error).toBeNull();
    });
  });

  describe('Workspace Store API Integration', () => {
    it('starts agent task via backend invoke', async () => {
      const { useWorkspaceStore } = await import('@/stores/workspaceStore');

      // Set current project first
      act(() => {
        useWorkspaceStore.getState().setProject({
          id: '1',
          name: 'Test Project',
          path: '/test/path',
        });
      });

      await act(async () => {
        await useWorkspaceStore.getState().startAgent('Build a feature');
      });

      expect(mockInvoke).toHaveBeenCalledWith('start_agent_task', {
        projectPath: '/test/path',
        description: 'Build a feature',
      });

      const { tasks, agentStatus } = useWorkspaceStore.getState();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe('task-123');
      expect(agentStatus).toBe('running');
    });

    it('throws error when starting agent without project', async () => {
      const { useWorkspaceStore } = await import('@/stores/workspaceStore');

      // Ensure no project is set
      act(() => {
        useWorkspaceStore.getState().setProject(null);
      });

      await expect(async () => {
        await act(async () => {
          await useWorkspaceStore.getState().startAgent('Test task');
        });
      }).rejects.toThrow('No project selected');
    });

    it('stops agent task via backend', async () => {
      const { useWorkspaceStore } = await import('@/stores/workspaceStore');

      // Set project and start agent first
      act(() => {
        useWorkspaceStore.getState().setProject({
          id: '1',
          name: 'Test',
          path: '/test',
        });
      });

      await act(async () => {
        await useWorkspaceStore.getState().startAgent('Test');
      });

      // Now stop agent
      await act(async () => {
        await useWorkspaceStore.getState().stopAgent();
      });

      expect(mockInvoke).toHaveBeenCalledWith('stop_agent_task', { taskId: 'task-123' });

      const { agentStatus } = useWorkspaceStore.getState();
      expect(agentStatus).toBe('idle');
    });

    it('initializes agent event listeners', async () => {
      const { useWorkspaceStore } = await import('@/stores/workspaceStore');

      await act(async () => {
        await useWorkspaceStore.getState().initAgentListeners();
      });

      // Should have registered listeners for all agent events
      expect(mockListen).toHaveBeenCalledWith('agent-progress', expect.any(Function));
      expect(mockListen).toHaveBeenCalledWith('agent-output', expect.any(Function));
      expect(mockListen).toHaveBeenCalledWith('agent-complete', expect.any(Function));
      expect(mockListen).toHaveBeenCalledWith('agent-error', expect.any(Function));
    });
  });

  describe('Connection Store API Integration', () => {
    it('connects to Tailscale via backend', async () => {
      const { useConnectionStore } = await import('@/stores/connectionStore');

      // Set mode and config
      act(() => {
        useConnectionStore.getState().setMode('tailscale');
        useConnectionStore.getState().updateTailscaleConfig({
          ip: 'host.ts.net',
          username: 'user',
          port: 22,
        });
      });

      await act(async () => {
        await useConnectionStore.getState().connect();
      });

      expect(mockInvoke).toHaveBeenCalledWith('connect_tailscale_ssh', {
        host: 'host.ts.net',
        username: 'user',
        port: 22,
      });

      const { status } = useConnectionStore.getState();
      expect(status).toBe('connected');
    });

    it('handles Tailscale connection errors', async () => {
      mockInvoke.mockResolvedValueOnce({
        connected: false,
        error: 'Connection refused'
      });

      const { useConnectionStore } = await import('@/stores/connectionStore');

      act(() => {
        useConnectionStore.getState().setMode('tailscale');
        useConnectionStore.getState().updateTailscaleConfig({
          ip: 'invalid.ts.net',
          username: 'user',
          port: 22,
        });
      });

      await expect(async () => {
        await act(async () => {
          await useConnectionStore.getState().connect();
        });
      }).rejects.toThrow('Connection refused');

      const { status, error } = useConnectionStore.getState();
      expect(status).toBe('error');
      expect(error).toBe('Connection refused');
    });

    it('disconnects from backend', async () => {
      const { useConnectionStore } = await import('@/stores/connectionStore');

      // Connect first
      act(() => {
        useConnectionStore.getState().setMode('tailscale');
        useConnectionStore.getState().updateTailscaleConfig({
          ip: 'host.ts.net',
          username: 'user',
          port: 22,
        });
      });

      await act(async () => {
        await useConnectionStore.getState().connect();
      });

      // Now disconnect
      await act(async () => {
        await useConnectionStore.getState().disconnect();
      });

      expect(mockInvoke).toHaveBeenCalledWith('disconnect');

      const { status } = useConnectionStore.getState();
      expect(status).toBe('disconnected');
    });

    it('handles local mode connection immediately', async () => {
      const { useConnectionStore } = await import('@/stores/connectionStore');

      act(() => {
        useConnectionStore.getState().setMode('local');
      });

      await act(async () => {
        await useConnectionStore.getState().connect();
      });

      const { status } = useConnectionStore.getState();
      expect(status).toBe('connected');
    });
  });

  describe('Error Handling Across Stores', () => {
    it('handles network errors in session store', async () => {
      mockApi.listProjects.mockRejectedValueOnce(new Error('Network error'));

      const { useSessionStore } = await import('@/stores/sessionStore');

      await act(async () => {
        await useSessionStore.getState().fetchProjects();
      });

      expect(useSessionStore.getState().error).toBe('Network error');
      expect(useSessionStore.getState().isLoadingProjects).toBe(false);
    });

    it('handles agent errors in workspace store', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Agent failed'));

      const { useWorkspaceStore } = await import('@/stores/workspaceStore');

      act(() => {
        useWorkspaceStore.getState().setProject({
          id: '1',
          name: 'Test',
          path: '/test',
        });
      });

      await expect(async () => {
        await act(async () => {
          await useWorkspaceStore.getState().startAgent('Test');
        });
      }).rejects.toThrow('Agent failed');

      expect(useWorkspaceStore.getState().agentStatus).toBe('error');
    });
  });

  describe('Loading States Across Stores', () => {
    it('manages loading state in session store', async () => {
      const { useSessionStore } = await import('@/stores/sessionStore');

      const promise = useSessionStore.getState().fetchProjects();
      expect(useSessionStore.getState().isLoadingProjects).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(useSessionStore.getState().isLoadingProjects).toBe(false);
    });

    it('manages connection status in connection store', async () => {
      const { useConnectionStore } = await import('@/stores/connectionStore');

      act(() => {
        useConnectionStore.getState().setMode('tailscale');
        useConnectionStore.getState().updateTailscaleConfig({
          ip: 'host.ts.net',
          username: 'user',
          port: 22,
        });
      });

      const promise = useConnectionStore.getState().connect();
      expect(useConnectionStore.getState().status).toBe('connecting');

      await act(async () => {
        await promise;
      });

      expect(useConnectionStore.getState().status).toBe('connected');
    });
  });
});
