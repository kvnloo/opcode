import { describe, it, expect, vi, beforeEach } from 'vitest';

type EventHandler = (payload: any) => void;
const eventHandlers: Map<string, EventHandler[]> = new Map();

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event: string, handler: EventHandler) => {
    const handlers = eventHandlers.get(event) || [];
    handlers.push(handler);
    eventHandlers.set(event, handlers);
    return Promise.resolve(() => {
      const h = eventHandlers.get(event) || [];
      eventHandlers.set(event, h.filter(fn => fn !== handler));
    });
  }),
  emit: vi.fn((event: string, payload: any) => {
    const handlers = eventHandlers.get(event) || [];
    handlers.forEach(h => h({ payload }));
    return Promise.resolve();
  }),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(() => Promise.resolve()),
}));

describe('Real-Time Updates E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventHandlers.clear();
  });

  describe('Agent Progress Updates', () => {
    it('receives progress updates in real-time', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const progressHandler = vi.fn();
      await listen('agent-progress', progressHandler);

      // Simulate backend emitting progress
      await emit('agent-progress', { taskId: 'task-1', progress: { current: 50, total: 100 } });

      expect(progressHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { taskId: 'task-1', progress: { current: 50, total: 100 } }
        })
      );
    });

    it('receives output stream in real-time', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const outputHandler = vi.fn();
      await listen('agent-output', outputHandler);

      await emit('agent-output', { taskId: 'task-1', output: 'Creating file...' });
      await emit('agent-output', { taskId: 'task-1', output: 'File created!' });

      expect(outputHandler).toHaveBeenCalledTimes(2);
    });

    it('tracks multiple progress updates', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const progressHandler = vi.fn();
      await listen('agent-progress', progressHandler);

      await emit('agent-progress', { taskId: 'task-1', progress: { current: 25, total: 100 } });
      await emit('agent-progress', { taskId: 'task-1', progress: { current: 50, total: 100 } });
      await emit('agent-progress', { taskId: 'task-1', progress: { current: 75, total: 100 } });
      await emit('agent-progress', { taskId: 'task-1', progress: { current: 100, total: 100 } });

      expect(progressHandler).toHaveBeenCalledTimes(4);
    });

    it('receives completion notification', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const completeHandler = vi.fn();
      await listen('agent-complete', completeHandler);

      await emit('agent-complete', { taskId: 'task-1', success: true });

      expect(completeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { taskId: 'task-1', success: true }
        })
      );
    });
  });

  describe('Session Updates', () => {
    it('receives session change notifications', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const sessionHandler = vi.fn();
      await listen('claude-session-changed', sessionHandler);

      await emit('claude-session-changed', null);

      expect(sessionHandler).toHaveBeenCalled();
    });

    it('receives project creation events', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const projectHandler = vi.fn();
      await listen('project-created', projectHandler);

      await emit('project-created', { id: 'new-proj', name: 'New Project' });

      expect(projectHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { id: 'new-proj', name: 'New Project' }
        })
      );
    });

    it('receives session status updates', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const statusHandler = vi.fn();
      await listen('session-status-changed', statusHandler);

      await emit('session-status-changed', { sessionId: 's1', status: 'active' });
      await emit('session-status-changed', { sessionId: 's1', status: 'completed' });

      expect(statusHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('Connection Status Updates', () => {
    it('receives Tailscale connection events', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const connectedHandler = vi.fn();
      const disconnectedHandler = vi.fn();

      await listen('tailscale-connected', connectedHandler);
      await listen('tailscale-disconnected', disconnectedHandler);

      await emit('tailscale-connected', 'mypc.ts.net');
      expect(connectedHandler).toHaveBeenCalled();

      await emit('tailscale-disconnected', null);
      expect(disconnectedHandler).toHaveBeenCalled();
    });

    it('receives connection status change events', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const statusHandler = vi.fn();
      await listen('connection-status-changed', statusHandler);

      await emit('connection-status-changed', { mode: 'local', connected: true });
      await emit('connection-status-changed', { mode: 'tailscale', connected: true });
      await emit('connection-status-changed', { mode: 'disconnected', connected: false });

      expect(statusHandler).toHaveBeenCalledTimes(3);
    });

    it('receives connection error events', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const errorHandler = vi.fn();
      await listen('connection-error', errorHandler);

      await emit('connection-error', { error: 'Connection timeout' });

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { error: 'Connection timeout' }
        })
      );
    });
  });

  describe('File Change Updates', () => {
    it('receives file edit notifications', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const fileHandler = vi.fn();
      await listen('file-changed', fileHandler);

      await emit('file-changed', {
        path: '/src/app.tsx',
        action: 'modified',
      });

      expect(fileHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { path: '/src/app.tsx', action: 'modified' }
        })
      );
    });

    it('receives multiple file change events', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const fileHandler = vi.fn();
      await listen('file-changed', fileHandler);

      await emit('file-changed', { path: '/src/app.tsx', action: 'created' });
      await emit('file-changed', { path: '/src/utils.ts', action: 'modified' });
      await emit('file-changed', { path: '/src/old.js', action: 'deleted' });

      expect(fileHandler).toHaveBeenCalledTimes(3);
    });

    it('receives directory change notifications', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const dirHandler = vi.fn();
      await listen('directory-changed', dirHandler);

      await emit('directory-changed', { path: '/src', action: 'modified' });

      expect(dirHandler).toHaveBeenCalled();
    });
  });

  describe('Event Handler Cleanup', () => {
    it('removes event listener on cleanup', async () => {
      const { listen } = await import('@tauri-apps/api/event');

      const handler = vi.fn();
      const unlisten = await listen('agent-progress', handler);

      // Verify listener is registered
      expect(eventHandlers.get('agent-progress')).toContain(handler);

      // Cleanup
      unlisten();

      // Verify listener is removed
      expect(eventHandlers.get('agent-progress')).not.toContain(handler);
    });

    it('handles multiple listeners for same event', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const handler1 = vi.fn();
      const handler2 = vi.fn();

      await listen('agent-progress', handler1);
      await listen('agent-progress', handler2);

      await emit('agent-progress', { taskId: 'task-1', progress: { current: 50, total: 100 } });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('only removes specific handler on cleanup', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const handler1 = vi.fn();
      const handler2 = vi.fn();

      await listen('agent-progress', handler1);
      const unlisten2 = await listen('agent-progress', handler2);

      // Remove second handler
      unlisten2();

      await emit('agent-progress', { taskId: 'task-1', progress: { current: 50, total: 100 } });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Complex Event Flows', () => {
    it('handles task lifecycle events', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const startHandler = vi.fn();
      const progressHandler = vi.fn();
      const outputHandler = vi.fn();
      const completeHandler = vi.fn();

      await listen('agent-started', startHandler);
      await listen('agent-progress', progressHandler);
      await listen('agent-output', outputHandler);
      await listen('agent-complete', completeHandler);

      // Simulate full task lifecycle
      await emit('agent-started', { taskId: 'task-1' });
      await emit('agent-progress', { taskId: 'task-1', progress: { current: 50, total: 100 } });
      await emit('agent-output', { taskId: 'task-1', output: 'Working...' });
      await emit('agent-complete', { taskId: 'task-1', success: true });

      expect(startHandler).toHaveBeenCalledTimes(1);
      expect(progressHandler).toHaveBeenCalledTimes(1);
      expect(outputHandler).toHaveBeenCalledTimes(1);
      expect(completeHandler).toHaveBeenCalledTimes(1);
    });

    it('handles concurrent task updates', async () => {
      const { listen, emit } = await import('@tauri-apps/api/event');

      const progressHandler = vi.fn();
      await listen('agent-progress', progressHandler);

      // Simulate multiple tasks progressing simultaneously
      await emit('agent-progress', { taskId: 'task-1', progress: { current: 25, total: 100 } });
      await emit('agent-progress', { taskId: 'task-2', progress: { current: 50, total: 100 } });
      await emit('agent-progress', { taskId: 'task-1', progress: { current: 50, total: 100 } });
      await emit('agent-progress', { taskId: 'task-2', progress: { current: 75, total: 100 } });

      expect(progressHandler).toHaveBeenCalledTimes(4);
    });
  });
});
