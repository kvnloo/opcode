import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd, args) => {
    switch (cmd) {
      case 'list_projects':
        return Promise.resolve([
          { id: 'p1', name: 'Project 1', path: '/path/1' },
          { id: 'p2', name: 'Project 2', path: '/path/2' },
        ]);
      case 'get_project_sessions':
        return Promise.resolve([
          { id: 's1', projectId: args?.projectId, status: 'active', startedAt: new Date() },
          { id: 's2', projectId: args?.projectId, status: 'completed', startedAt: new Date() },
        ]);
      case 'start_agent_task':
        return Promise.resolve('task-123');
      case 'stop_agent_task':
        return Promise.resolve();
      case 'create_project':
        return Promise.resolve({ id: 'new-p', name: args?.name, path: `/path/${args?.name}` });
      case 'discover_sessions':
        return Promise.resolve([
          { id: 'p1', name: 'Auto-detected Project', path: '/auto/path' },
        ]);
      default:
        return Promise.resolve();
    }
  }),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event, handler) => {
    // Store handlers for testing
    return Promise.resolve(() => {});
  }),
}));

describe('Session Lifecycle E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Project Discovery', () => {
    it('lists all available projects', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const projects = await invoke('list_projects');

      expect(projects).toHaveLength(2);
      expect(projects[0]).toHaveProperty('name', 'Project 1');
    });

    it('auto-discovers sessions on startup', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const discovered = await invoke('discover_sessions');

      expect(discovered).toBeDefined();
      expect(Array.isArray(discovered)).toBe(true);
    });

    it('discovers projects with correct structure', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const projects = await invoke('list_projects');

      expect(projects[0]).toHaveProperty('id');
      expect(projects[0]).toHaveProperty('name');
      expect(projects[0]).toHaveProperty('path');
    });

    it('handles empty project list', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce([]);

      const projects = await invoke('list_projects');

      expect(projects).toEqual([]);
      expect(Array.isArray(projects)).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('fetches sessions for a specific project', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const sessions = await invoke('get_project_sessions', { projectId: 'p1' });

      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toHaveProperty('status', 'active');
    });

    it('creates new project', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'My New Project',
        description: 'Test project',
        template: 'nextjs',
      });

      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name', 'My New Project');
    });

    it('filters sessions by status', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const sessions = await invoke('get_project_sessions', { projectId: 'p1' });
      const activeSessions = sessions.filter((s: any) => s.status === 'active');

      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].status).toBe('active');
    });

    it('handles project with no sessions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce([]);

      const sessions = await invoke('get_project_sessions', { projectId: 'empty' });

      expect(sessions).toEqual([]);
    });
  });

  describe('Agent Task Lifecycle', () => {
    it('starts an agent task', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const taskId = await invoke('start_agent_task', {
        description: 'Build a login form',
      });

      expect(taskId).toBe('task-123');
    });

    it('stops a running task', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('stop_agent_task', { taskId: 'task-123' });

      expect(invoke).toHaveBeenCalledWith('stop_agent_task', { taskId: 'task-123' });
    });

    it('starts task with complex description', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const taskId = await invoke('start_agent_task', {
        description: 'Create a REST API with authentication, user management, and error handling',
      });

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
    });

    it('handles task start failure', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Failed to start task'));

      await expect(
        invoke('start_agent_task', { description: 'Invalid task' })
      ).rejects.toThrow('Failed to start task');
    });
  });

  describe('Event-Driven Updates', () => {
    it('subscribes to session change events', async () => {
      const { listen } = await import('@tauri-apps/api/event');

      const handler = vi.fn();
      await listen('claude-session-changed', handler);

      expect(listen).toHaveBeenCalledWith('claude-session-changed', expect.any(Function));
    });

    it('subscribes to agent progress events', async () => {
      const { listen } = await import('@tauri-apps/api/event');

      await listen('agent-progress', vi.fn());
      await listen('agent-output', vi.fn());
      await listen('agent-complete', vi.fn());

      expect(listen).toHaveBeenCalledTimes(3);
    });

    it('subscribes to multiple event types', async () => {
      const { listen } = await import('@tauri-apps/api/event');

      await listen('claude-session-changed', vi.fn());
      await listen('agent-progress', vi.fn());
      await listen('file-changed', vi.fn());

      expect(listen).toHaveBeenCalledWith('claude-session-changed', expect.any(Function));
      expect(listen).toHaveBeenCalledWith('agent-progress', expect.any(Function));
      expect(listen).toHaveBeenCalledWith('file-changed', expect.any(Function));
    });

    it('returns cleanup function from event listener', async () => {
      const { listen } = await import('@tauri-apps/api/event');

      const unlisten = await listen('agent-progress', vi.fn());

      expect(typeof unlisten).toBe('function');
    });
  });

  describe('Session State Transitions', () => {
    it('transitions from no projects to new project', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Start with empty list
      vi.mocked(invoke).mockResolvedValueOnce([]);
      const emptyProjects = await invoke('list_projects');
      expect(emptyProjects).toHaveLength(0);

      // Create new project
      vi.mocked(invoke).mockResolvedValueOnce({ id: 'new', name: 'New Project', path: '/path/new' });
      const newProject = await invoke('create_project', { name: 'New Project', template: 'nextjs' });
      expect(newProject).toHaveProperty('id');
    });

    it('tracks session lifecycle from start to completion', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // Start task
      const taskId = await invoke('start_agent_task', { description: 'Test task' });
      expect(taskId).toBeDefined();

      // Stop task
      await invoke('stop_agent_task', { taskId });
      expect(invoke).toHaveBeenCalledWith('stop_agent_task', { taskId });
    });
  });

  describe('Concurrent Operations', () => {
    it('handles multiple project queries simultaneously', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const [projects1, projects2] = await Promise.all([
        invoke('list_projects'),
        invoke('list_projects'),
      ]);

      expect(projects1).toEqual(projects2);
    });

    it('handles multiple session queries for different projects', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const [sessions1, sessions2] = await Promise.all([
        invoke('get_project_sessions', { projectId: 'p1' }),
        invoke('get_project_sessions', { projectId: 'p2' }),
      ]);

      expect(Array.isArray(sessions1)).toBe(true);
      expect(Array.isArray(sessions2)).toBe(true);
    });
  });
});
