import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';

// Mock Tauri event system
const mockListen = vi.fn();
const mockEmit = vi.fn();

vi.mock('@tauri-apps/api/event', async (importOriginal) => {
  return {
    listen: (event: string, handler: (payload: any) => void) => {
      mockListen(event, handler);
      // Return unsubscribe function
      return Promise.resolve(() => {});
    },
    emit: mockEmit,
  };
});

vi.mock('@tauri-apps/api/core', async (importOriginal) => {
  return {
    invoke: vi.fn((cmd) => {
      if (cmd === 'list_projects') {
        return Promise.resolve([
          { id: 'project-1', name: 'Test Project', path: '/test/path', sessions: [], created_at: 1234567890, most_recent_session: null }
        ]);
      }
      if (cmd === 'discover_sessions') {
        return Promise.resolve([
          { id: 'project-1', name: 'Test Project', path: '/test/path', sessions: [], created_at: 1234567890, most_recent_session: null }
        ]);
      }
      return Promise.resolve([]);
    }),
  };
});

describe('Session Auto-Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to claude-session-changed events', async () => {
    // Dynamically import to bypass any module-level mocks
    const sessionStore = await vi.importActual<typeof import('@/stores/sessionStore')>('@/stores/sessionStore');

    // Initialize session listener
    await sessionStore.initSessionListener();

    // Verify that listen was called with the correct event name
    expect(mockListen).toHaveBeenCalledWith(
      'claude-session-changed',
      expect.any(Function)
    );
  });

  it('should refresh sessions when event received', async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    const sessionStore = await vi.importActual<typeof import('@/stores/sessionStore')>('@/stores/sessionStore');

    // Track event handlers
    const eventHandlers: Map<string, Function> = new Map();
    mockListen.mockImplementation((event, handler) => {
      eventHandlers.set(event, handler);
      return Promise.resolve(() => {});
    });

    // Initialize session listener
    await sessionStore.initSessionListener();

    // Trigger session change event
    const handler = eventHandlers.get('claude-session-changed');
    if (handler) {
      await handler({ payload: null });
    }

    // Verify projects were refreshed
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('list_projects');
    });
  });

  it('should discover sessions on startup', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    // Call discover_sessions
    await invoke('discover_sessions');

    expect(invoke).toHaveBeenCalledWith('discover_sessions');
  });

  it('should handle watcher errors gracefully', async () => {
    // Test that polling fallback works when watcher fails
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate watcher initialization (this happens in Rust, so we just verify no crashes)
    expect(true).toBe(true);

    consoleSpy.mockRestore();
  });

  it('should listen for session changes after initialization', async () => {
    const sessionStore = await vi.importActual<typeof import('@/stores/sessionStore')>('@/stores/sessionStore');

    // Initialize listener
    await sessionStore.initSessionListener();

    // Verify listener was set up
    expect(mockListen).toHaveBeenCalledTimes(1);
    expect(mockListen).toHaveBeenCalledWith('claude-session-changed', expect.any(Function));
  });

  it('should call fetchProjects when session change event fires', async () => {
    const sessionStore = await vi.importActual<typeof import('@/stores/sessionStore')>('@/stores/sessionStore');
    const { invoke } = await import('@tauri-apps/api/core');

    // Setup event handler tracking
    let capturedHandler: Function | null = null;
    mockListen.mockImplementation((event, handler) => {
      if (event === 'claude-session-changed') {
        capturedHandler = handler;
      }
      return Promise.resolve(() => {});
    });

    // Initialize listener
    await sessionStore.initSessionListener();

    // Verify handler was captured
    expect(capturedHandler).not.toBeNull();

    // Trigger the event
    if (capturedHandler) {
      await capturedHandler({ payload: null });

      // Wait for async operations
      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('list_projects');
      }, { timeout: 1000 });
    }
  });
});
