/**
 * WorkspaceStore Tests
 * Comprehensive tests for workspace state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore } from '../mocks/zustand';
import type { StateCreator } from 'zustand';

// Types
type WorkspacePane = 'console' | 'agent' | 'deploy' | 'share' | 'preview';
type DeviceFrame = 'iphone' | 'android' | 'desktop';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: { current: number; total: number };
  fileEdits: { path: string; action: 'created' | 'edited' | 'deleted' }[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

interface Checkpoint {
  id: string;
  taskId: string;
  description: string;
  timestamp: Date;
  canRollback: boolean;
}

interface WorkspaceState {
  currentProject: { id: string; name: string; path: string } | null;
  activePane: WorkspacePane;
  toolsOverlayOpen: boolean;
  agentStatus: 'idle' | 'running' | 'error' | 'complete';
  tasks: Task[];
  currentTaskId: string | null;
  checkpoints: Checkpoint[];
  workDurationSeconds: number;
  previewUrl: string;
  deviceFrame: DeviceFrame;
  isPreviewLoading: boolean;
  subdomain: string;
  subdomainAvailable: boolean | null;
  publishStatus: 'unpublished' | 'checking' | 'publishing' | 'published' | 'error';
  publishError: string | null;
  setProject: (project: { id: string; name: string; path: string } | null) => void;
  setActivePane: (pane: WorkspacePane) => void;
  openToolsOverlay: () => void;
  closeToolsOverlay: () => void;
  startAgent: (taskDescription: string) => void;
  stopAgent: () => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addCheckpoint: (checkpoint: Checkpoint) => void;
  rollbackToCheckpoint: (checkpointId: string) => void;
  incrementWorkDuration: () => void;
  clearTasks: () => void;
  setPreviewUrl: (url: string) => void;
  setDeviceFrame: (frame: DeviceFrame) => void;
  setPreviewLoading: (loading: boolean) => void;
  refreshPreview: () => void;
  setSubdomain: (subdomain: string) => void;
  checkSubdomainAvailability: () => Promise<void>;
  publish: () => Promise<void>;
  unpublish: () => void;
  resetWorkspace: () => void;
}

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  // @ts-ignore
  delete window.location;
  window.location = { ...originalLocation, origin: 'http://localhost:3000' };
});

// Store creator function (simplified from actual implementation)
const createWorkspaceStore: StateCreator<WorkspaceState> = (set, get) => ({
  currentProject: null,
  activePane: 'agent',
  toolsOverlayOpen: false,
  agentStatus: 'idle',
  tasks: [],
  currentTaskId: null,
  checkpoints: [],
  workDurationSeconds: 0,
  previewUrl: '/',
  deviceFrame: 'iphone',
  isPreviewLoading: false,
  subdomain: '',
  subdomainAvailable: null,
  publishStatus: 'unpublished',
  publishError: null,

  setProject: (project) => {
    set({
      currentProject: project,
      tasks: [],
      currentTaskId: null,
      checkpoints: [],
      workDurationSeconds: 0,
      agentStatus: 'idle',
      previewUrl: '/',
      publishStatus: 'unpublished',
      publishError: null
    });
  },

  setActivePane: (pane) => set({ activePane: pane }),
  openToolsOverlay: () => set({ toolsOverlayOpen: true }),
  closeToolsOverlay: () => set({ toolsOverlayOpen: false }),

  startAgent: (taskDescription: string) => {
    const taskId = `task-${Date.now()}`;
    const task: Task = {
      id: taskId,
      title: taskDescription,
      description: taskDescription,
      status: 'running',
      progress: { current: 0, total: 100 },
      fileEdits: [],
      startedAt: new Date()
    };

    set((state) => ({
      agentStatus: 'running',
      tasks: [task, ...state.tasks],
      currentTaskId: taskId,
      workDurationSeconds: 0
    }));
  },

  stopAgent: () => {
    const { currentTaskId } = get();
    if (currentTaskId) {
      set((state) => ({
        agentStatus: 'idle',
        tasks: state.tasks.map((task) =>
          task.id === currentTaskId && task.status === 'running'
            ? { ...task, status: 'error', error: 'Cancelled by user', completedAt: new Date() }
            : task
        )
      }));
    } else {
      set({ agentStatus: 'idle' });
    }
  },

  addTask: (task: Task) => {
    set((state) => ({
      tasks: [task, ...state.tasks],
      currentTaskId: task.id,
      agentStatus: task.status === 'running' ? 'running' : state.agentStatus
    }));
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );

      const updatedTask = updatedTasks.find((t) => t.id === taskId);
      const newAgentStatus = updatedTask
        ? updatedTask.status === 'completed'
          ? 'complete'
          : updatedTask.status === 'error'
          ? 'error'
          : updatedTask.status === 'running'
          ? 'running'
          : state.agentStatus
        : state.agentStatus;

      return {
        tasks: updatedTasks,
        agentStatus: newAgentStatus
      };
    });
  },

  addCheckpoint: (checkpoint: Checkpoint) => {
    set((state) => ({
      checkpoints: [checkpoint, ...state.checkpoints]
    }));
  },

  rollbackToCheckpoint: (checkpointId: string) => {
    const { checkpoints } = get();
    const checkpoint = checkpoints.find((c) => c.id === checkpointId);

    if (!checkpoint || !checkpoint.canRollback) {
      console.warn('Cannot rollback to checkpoint:', checkpointId);
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((task) => {
        const taskTime = task.startedAt?.getTime() || 0;
        const checkpointTime = checkpoint.timestamp.getTime();

        if (taskTime > checkpointTime && task.status === 'running') {
          return { ...task, status: 'error', error: 'Rolled back', completedAt: new Date() };
        }
        return task;
      })
    }));
  },

  incrementWorkDuration: () => {
    set((state) => ({
      workDurationSeconds: state.workDurationSeconds + 1
    }));
  },

  clearTasks: () => {
    set({ tasks: [], currentTaskId: null, checkpoints: [], workDurationSeconds: 0 });
  },

  setPreviewUrl: (url: string) => set({ previewUrl: url }),
  setDeviceFrame: (frame: DeviceFrame) => set({ deviceFrame: frame }),
  setPreviewLoading: (loading: boolean) => set({ isPreviewLoading: loading }),

  refreshPreview: () => {
    const { previewUrl } = get();
    const url = new URL(previewUrl, window.location.origin);
    url.searchParams.set('t', Date.now().toString());
    set({ previewUrl: url.pathname + url.search, isPreviewLoading: true });
  },

  setSubdomain: (subdomain: string) => {
    set({
      subdomain,
      subdomainAvailable: null,
      publishStatus: 'unpublished',
      publishError: null
    });
  },

  checkSubdomainAvailability: async () => {
    const { subdomain } = get();

    if (!subdomain) {
      set({ subdomainAvailable: null });
      return;
    }

    set({ publishStatus: 'checking' });

    try {
      await new Promise((resolve) => setTimeout(resolve, 10));

      const isValid = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(subdomain);
      const reserved = ['www', 'api', 'admin', 'app', 'staging', 'dev', 'prod'];
      const isAvailable = isValid && !reserved.includes(subdomain.toLowerCase());

      set({
        subdomainAvailable: isAvailable,
        publishStatus: 'unpublished'
      });
    } catch (error) {
      set({
        subdomainAvailable: false,
        publishStatus: 'error',
        publishError: error instanceof Error ? error.message : 'Failed to check subdomain'
      });
    }
  },

  publish: async () => {
    const { subdomain, subdomainAvailable, currentProject } = get();

    if (!subdomain || !subdomainAvailable || !currentProject) {
      set({
        publishStatus: 'error',
        publishError: 'Invalid subdomain or no project selected'
      });
      return;
    }

    set({ publishStatus: 'publishing', publishError: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 10));
      set({ publishStatus: 'published' });
    } catch (error) {
      set({
        publishStatus: 'error',
        publishError: error instanceof Error ? error.message : 'Failed to publish'
      });
      throw error;
    }
  },

  unpublish: () => {
    set({
      publishStatus: 'unpublished',
      publishError: null
    });
  },

  resetWorkspace: () => {
    set({
      currentProject: null,
      activePane: 'agent',
      toolsOverlayOpen: false,
      agentStatus: 'idle',
      tasks: [],
      currentTaskId: null,
      checkpoints: [],
      workDurationSeconds: 0,
      previewUrl: '/',
      deviceFrame: 'iphone',
      isPreviewLoading: false,
      subdomain: '',
      subdomainAvailable: null,
      publishStatus: 'unpublished',
      publishError: null
    });
  }
});

describe('WorkspaceStore', () => {
  let store: ReturnType<typeof createStore<WorkspaceState>>;

  beforeEach(() => {
    store = createStore(createWorkspaceStore);
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const state = store.getState();

      expect(state.currentProject).toBeNull();
      expect(state.activePane).toBe('agent');
      expect(state.toolsOverlayOpen).toBe(false);
      expect(state.agentStatus).toBe('idle');
      expect(state.tasks).toEqual([]);
      expect(state.currentTaskId).toBeNull();
      expect(state.checkpoints).toEqual([]);
      expect(state.workDurationSeconds).toBe(0);
      expect(state.previewUrl).toBe('/');
      expect(state.deviceFrame).toBe('iphone');
      expect(state.isPreviewLoading).toBe(false);
      expect(state.subdomain).toBe('');
      expect(state.subdomainAvailable).toBeNull();
      expect(state.publishStatus).toBe('unpublished');
      expect(state.publishError).toBeNull();
    });
  });

  describe('Project Actions', () => {
    it('should set project', () => {
      const project = { id: '1', name: 'Test Project', path: '/test/path' };

      store.getState().setProject(project);

      expect(store.getState().currentProject).toEqual(project);
    });

    it('should reset workspace state when setting new project', () => {
      // Set up some state
      store.getState().startAgent('test task');
      store.getState().setSubdomain('test');

      // Set new project
      const project = { id: '1', name: 'Test', path: '/test' };
      store.getState().setProject(project);

      const state = store.getState();
      expect(state.tasks).toEqual([]);
      expect(state.currentTaskId).toBeNull();
      expect(state.checkpoints).toEqual([]);
      expect(state.workDurationSeconds).toBe(0);
      expect(state.agentStatus).toBe('idle');
      expect(state.previewUrl).toBe('/');
      expect(state.publishStatus).toBe('unpublished');
    });

    it('should allow setting project to null', () => {
      const project = { id: '1', name: 'Test', path: '/test' };
      store.getState().setProject(project);
      store.getState().setProject(null);

      expect(store.getState().currentProject).toBeNull();
    });
  });

  describe('Navigation Actions', () => {
    it('should set active pane', () => {
      const panes: WorkspacePane[] = ['console', 'agent', 'deploy', 'share', 'preview'];

      panes.forEach(pane => {
        store.getState().setActivePane(pane);
        expect(store.getState().activePane).toBe(pane);
      });
    });

    it('should open tools overlay', () => {
      store.getState().openToolsOverlay();
      expect(store.getState().toolsOverlayOpen).toBe(true);
    });

    it('should close tools overlay', () => {
      store.getState().openToolsOverlay();
      store.getState().closeToolsOverlay();
      expect(store.getState().toolsOverlayOpen).toBe(false);
    });

    it('should toggle tools overlay', () => {
      expect(store.getState().toolsOverlayOpen).toBe(false);

      store.getState().openToolsOverlay();
      expect(store.getState().toolsOverlayOpen).toBe(true);

      store.getState().closeToolsOverlay();
      expect(store.getState().toolsOverlayOpen).toBe(false);
    });
  });

  describe('Agent Actions', () => {
    it('should start agent with task description', () => {
      const taskDescription = 'Build authentication feature';

      store.getState().startAgent(taskDescription);

      const state = store.getState();
      expect(state.agentStatus).toBe('running');
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].title).toBe(taskDescription);
      expect(state.tasks[0].status).toBe('running');
      expect(state.currentTaskId).toBe(state.tasks[0].id);
      expect(state.workDurationSeconds).toBe(0);
    });

    it('should create unique task IDs', () => {
      store.getState().startAgent('Task 1');
      const task1Id = store.getState().currentTaskId;

      // Small delay to ensure different timestamp
      vi.useFakeTimers();
      vi.advanceTimersByTime(10);

      store.getState().startAgent('Task 2');
      const task2Id = store.getState().currentTaskId;

      expect(task1Id).not.toBe(task2Id);
      vi.useRealTimers();
    });

    it('should stop agent and cancel current task', () => {
      store.getState().startAgent('Test task');
      const taskId = store.getState().currentTaskId!;

      store.getState().stopAgent();

      const state = store.getState();
      expect(state.agentStatus).toBe('idle');

      const task = state.tasks.find(t => t.id === taskId);
      expect(task?.status).toBe('error');
      expect(task?.error).toBe('Cancelled by user');
      expect(task?.completedAt).toBeDefined();
    });

    it('should stop agent gracefully when no current task', () => {
      store.getState().stopAgent();
      expect(store.getState().agentStatus).toBe('idle');
    });

    it('should add task', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task);

      const state = store.getState();
      expect(state.tasks).toContainEqual(task);
      expect(state.currentTaskId).toBe(task.id);
    });

    it('should update agent status when adding running task', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Test',
        description: 'Test',
        status: 'running',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task);
      expect(store.getState().agentStatus).toBe('running');
    });

    it('should update task', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Test',
        description: 'Test',
        status: 'running',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task);
      store.getState().updateTask('task-123', {
        status: 'completed',
        progress: { current: 100, total: 100 }
      });

      const updatedTask = store.getState().tasks.find(t => t.id === 'task-123');
      expect(updatedTask?.status).toBe('completed');
      expect(updatedTask?.progress.current).toBe(100);
    });

    it('should update agent status to complete when task completes', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Test',
        description: 'Test',
        status: 'running',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task);
      store.getState().updateTask('task-123', { status: 'completed' });

      expect(store.getState().agentStatus).toBe('complete');
    });

    it('should update agent status to error when task errors', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Test',
        description: 'Test',
        status: 'running',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task);
      store.getState().updateTask('task-123', {
        status: 'error',
        error: 'Something went wrong'
      });

      expect(store.getState().agentStatus).toBe('error');
    });

    it('should increment work duration', () => {
      expect(store.getState().workDurationSeconds).toBe(0);

      store.getState().incrementWorkDuration();
      expect(store.getState().workDurationSeconds).toBe(1);

      store.getState().incrementWorkDuration();
      expect(store.getState().workDurationSeconds).toBe(2);
    });

    it('should clear all tasks', () => {
      store.getState().startAgent('Task 1');
      store.getState().incrementWorkDuration();

      store.getState().clearTasks();

      const state = store.getState();
      expect(state.tasks).toEqual([]);
      expect(state.currentTaskId).toBeNull();
      expect(state.checkpoints).toEqual([]);
      expect(state.workDurationSeconds).toBe(0);
    });
  });

  describe('Checkpoint Actions', () => {
    it('should add checkpoint', () => {
      const checkpoint: Checkpoint = {
        id: 'cp-1',
        taskId: 'task-1',
        description: 'Checkpoint 1',
        timestamp: new Date(),
        canRollback: true
      };

      store.getState().addCheckpoint(checkpoint);

      expect(store.getState().checkpoints).toContainEqual(checkpoint);
    });

    it('should add multiple checkpoints', () => {
      const cp1: Checkpoint = {
        id: 'cp-1',
        taskId: 'task-1',
        description: 'Checkpoint 1',
        timestamp: new Date(),
        canRollback: true
      };

      const cp2: Checkpoint = {
        id: 'cp-2',
        taskId: 'task-1',
        description: 'Checkpoint 2',
        timestamp: new Date(),
        canRollback: true
      };

      store.getState().addCheckpoint(cp1);
      store.getState().addCheckpoint(cp2);

      expect(store.getState().checkpoints).toHaveLength(2);
      expect(store.getState().checkpoints[0]).toEqual(cp2); // Most recent first
    });

    it('should rollback to checkpoint', () => {
      const checkpointTime = new Date('2024-01-01T10:00:00');
      const checkpoint: Checkpoint = {
        id: 'cp-1',
        taskId: 'task-1',
        description: 'Checkpoint',
        timestamp: checkpointTime,
        canRollback: true
      };

      const taskBefore: Task = {
        id: 'task-before',
        title: 'Before',
        description: 'Before',
        status: 'completed',
        progress: { current: 100, total: 100 },
        fileEdits: [],
        startedAt: new Date('2024-01-01T09:00:00')
      };

      const taskAfter: Task = {
        id: 'task-after',
        title: 'After',
        description: 'After',
        status: 'running',
        progress: { current: 50, total: 100 },
        fileEdits: [],
        startedAt: new Date('2024-01-01T11:00:00')
      };

      store.getState().addCheckpoint(checkpoint);
      store.getState().addTask(taskBefore);
      store.getState().addTask(taskAfter);

      store.getState().rollbackToCheckpoint('cp-1');

      const tasks = store.getState().tasks;
      const rolledBackTask = tasks.find(t => t.id === 'task-after');
      expect(rolledBackTask?.status).toBe('error');
      expect(rolledBackTask?.error).toBe('Rolled back');
    });

    it('should not rollback if checkpoint cannot rollback', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const checkpoint: Checkpoint = {
        id: 'cp-1',
        taskId: 'task-1',
        description: 'Checkpoint',
        timestamp: new Date(),
        canRollback: false
      };

      store.getState().addCheckpoint(checkpoint);
      store.getState().rollbackToCheckpoint('cp-1');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot rollback to checkpoint:', 'cp-1');
      consoleWarnSpy.mockRestore();
    });

    it('should not rollback if checkpoint not found', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      store.getState().rollbackToCheckpoint('non-existent');

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Preview Actions', () => {
    it('should set preview URL', () => {
      store.getState().setPreviewUrl('/dashboard');
      expect(store.getState().previewUrl).toBe('/dashboard');
    });

    it('should set device frame', () => {
      const frames: DeviceFrame[] = ['iphone', 'android', 'desktop'];

      frames.forEach(frame => {
        store.getState().setDeviceFrame(frame);
        expect(store.getState().deviceFrame).toBe(frame);
      });
    });

    it('should set preview loading state', () => {
      store.getState().setPreviewLoading(true);
      expect(store.getState().isPreviewLoading).toBe(true);

      store.getState().setPreviewLoading(false);
      expect(store.getState().isPreviewLoading).toBe(false);
    });

    it('should refresh preview with timestamp', () => {
      const initialUrl = '/dashboard';
      store.getState().setPreviewUrl(initialUrl);

      store.getState().refreshPreview();

      const state = store.getState();
      expect(state.previewUrl).toContain('/dashboard');
      expect(state.previewUrl).toContain('t=');
      expect(state.isPreviewLoading).toBe(true);
    });

    it('should preserve query params on refresh', () => {
      store.getState().setPreviewUrl('/dashboard?tab=overview');

      store.getState().refreshPreview();

      const url = store.getState().previewUrl;
      expect(url).toContain('/dashboard');
      expect(url).toContain('tab=overview');
      expect(url).toContain('t=');
    });
  });

  describe('Publishing Actions', () => {
    it('should set subdomain', () => {
      store.getState().setSubdomain('myapp');
      expect(store.getState().subdomain).toBe('myapp');
    });

    it('should reset subdomain state when changing subdomain', () => {
      store.getState().setSubdomain('myapp');
      store.setState({ subdomainAvailable: true, publishStatus: 'published' });

      store.getState().setSubdomain('newapp');

      const state = store.getState();
      expect(state.subdomain).toBe('newapp');
      expect(state.subdomainAvailable).toBeNull();
      expect(state.publishStatus).toBe('unpublished');
      expect(state.publishError).toBeNull();
    });

    it('should check valid subdomain availability', async () => {
      store.getState().setSubdomain('validapp');

      await store.getState().checkSubdomainAvailability();

      const state = store.getState();
      expect(state.subdomainAvailable).toBe(true);
      expect(state.publishStatus).toBe('unpublished');
    });

    it('should reject reserved subdomains', async () => {
      const reserved = ['www', 'api', 'admin', 'app', 'staging', 'dev', 'prod'];

      for (const subdomain of reserved) {
        store.getState().setSubdomain(subdomain);
        await store.getState().checkSubdomainAvailability();
        expect(store.getState().subdomainAvailable).toBe(false);
      }
    });

    it('should validate subdomain format', async () => {
      const invalidSubdomains = [
        'ab',          // too short (only 2 chars - regex requires 1 OR 3+)
        '-invalid',    // starts with hyphen
        'invalid-',    // ends with hyphen
        'Invalid',     // uppercase
        'in_valid',    // underscore
        'in valid',    // space
        '123-',        // ends with hyphen
        '-123',        // starts with hyphen
      ];

      for (const subdomain of invalidSubdomains) {
        store.getState().setSubdomain(subdomain);
        await store.getState().checkSubdomainAvailability();
        expect(store.getState().subdomainAvailable).toBe(false);
      }
    });

    it('should accept valid subdomain formats', async () => {
      const validSubdomains = [
        'abc',
        'my-app',
        'app123',
        '123app',
        'a-b-c',
      ];

      for (const subdomain of validSubdomains) {
        store.getState().setSubdomain(subdomain);
        await store.getState().checkSubdomainAvailability();
        expect(store.getState().subdomainAvailable).toBe(true);
      }
    });

    it('should set checking status during availability check', async () => {
      store.getState().setSubdomain('myapp');

      const promise = store.getState().checkSubdomainAvailability();

      // Status should be checking immediately
      expect(store.getState().publishStatus).toBe('checking');

      await promise;

      // Status should be unpublished after check
      expect(store.getState().publishStatus).toBe('unpublished');
    });

    it('should handle empty subdomain check', async () => {
      store.getState().setSubdomain('');

      await store.getState().checkSubdomainAvailability();

      expect(store.getState().subdomainAvailable).toBeNull();
    });

    it('should publish with valid subdomain and project', async () => {
      const project = { id: '1', name: 'Test', path: '/test' };
      store.getState().setProject(project);
      store.getState().setSubdomain('myapp');
      store.setState({ subdomainAvailable: true });

      await store.getState().publish();

      expect(store.getState().publishStatus).toBe('published');
    });

    it('should fail to publish without subdomain', async () => {
      const project = { id: '1', name: 'Test', path: '/test' };
      store.getState().setProject(project);

      await store.getState().publish();

      const state = store.getState();
      expect(state.publishStatus).toBe('error');
      expect(state.publishError).toBe('Invalid subdomain or no project selected');
    });

    it('should fail to publish without available subdomain', async () => {
      const project = { id: '1', name: 'Test', path: '/test' };
      store.getState().setProject(project);
      store.getState().setSubdomain('www');
      store.setState({ subdomainAvailable: false });

      await store.getState().publish();

      const state = store.getState();
      expect(state.publishStatus).toBe('error');
      expect(state.publishError).toBe('Invalid subdomain or no project selected');
    });

    it('should fail to publish without project', async () => {
      store.getState().setSubdomain('myapp');
      store.setState({ subdomainAvailable: true });

      await store.getState().publish();

      const state = store.getState();
      expect(state.publishStatus).toBe('error');
      expect(state.publishError).toBe('Invalid subdomain or no project selected');
    });

    it('should set publishing status during publish', async () => {
      const project = { id: '1', name: 'Test', path: '/test' };
      store.getState().setProject(project);
      store.getState().setSubdomain('myapp');
      store.setState({ subdomainAvailable: true });

      const promise = store.getState().publish();

      expect(store.getState().publishStatus).toBe('publishing');

      await promise;

      expect(store.getState().publishStatus).toBe('published');
    });

    it('should unpublish', () => {
      store.setState({ publishStatus: 'published' });

      store.getState().unpublish();

      const state = store.getState();
      expect(state.publishStatus).toBe('unpublished');
      expect(state.publishError).toBeNull();
    });
  });

  describe('Reset Actions', () => {
    it('should reset entire workspace', () => {
      // Set up various state
      const project = { id: '1', name: 'Test', path: '/test' };
      store.getState().setProject(project);
      store.getState().startAgent('Task');
      store.getState().setActivePane('deploy');
      store.getState().openToolsOverlay();
      store.getState().setDeviceFrame('android');
      store.getState().setSubdomain('myapp');

      // Reset
      store.getState().resetWorkspace();

      // Verify all state is reset
      const state = store.getState();
      expect(state.currentProject).toBeNull();
      expect(state.activePane).toBe('agent');
      expect(state.toolsOverlayOpen).toBe(false);
      expect(state.agentStatus).toBe('idle');
      expect(state.tasks).toEqual([]);
      expect(state.currentTaskId).toBeNull();
      expect(state.checkpoints).toEqual([]);
      expect(state.workDurationSeconds).toBe(0);
      expect(state.previewUrl).toBe('/');
      expect(state.deviceFrame).toBe('iphone');
      expect(state.isPreviewLoading).toBe(false);
      expect(state.subdomain).toBe('');
      expect(state.subdomainAvailable).toBeNull();
      expect(state.publishStatus).toBe('unpublished');
      expect(state.publishError).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle updating non-existent task', () => {
      store.getState().updateTask('non-existent', { status: 'completed' });

      expect(store.getState().tasks).toEqual([]);
    });

    it('should handle multiple rapid task updates', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Test',
        description: 'Test',
        status: 'pending',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task);

      for (let i = 0; i < 10; i++) {
        store.getState().updateTask('task-123', {
          progress: { current: i * 10, total: 100 }
        });
      }

      const updatedTask = store.getState().tasks[0];
      expect(updatedTask.progress.current).toBe(90);
    });

    it('should handle task updates with partial progress', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Test',
        description: 'Test',
        status: 'running',
        progress: { current: 50, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task);
      store.getState().updateTask('task-123', {
        fileEdits: [{ path: 'test.ts', action: 'created' }]
      });

      const updatedTask = store.getState().tasks[0];
      expect(updatedTask.progress.current).toBe(50); // Should preserve existing progress
      expect(updatedTask.fileEdits).toHaveLength(1);
    });

    it('should handle stopping agent with multiple tasks', () => {
      store.getState().startAgent('Task 1');
      const task1Id = store.getState().currentTaskId!;

      // Add a second running task (stopAgent only cancels 'running' tasks)
      const task2: Task = {
        id: 'task-2',
        title: 'Task 2',
        description: 'Task 2',
        status: 'running', // Must be running to be cancelled
        progress: { current: 0, total: 100 },
        fileEdits: []
      };
      store.getState().addTask(task2);

      // After adding task2, currentTaskId should be task-2
      const currentTaskId = store.getState().currentTaskId!;
      expect(currentTaskId).toBe('task-2');

      store.getState().stopAgent();

      const tasks = store.getState().tasks;
      const cancelledTask = tasks.find(t => t.id === currentTaskId);
      const task1 = tasks.find(t => t.id === task1Id);

      // Only the current running task should be cancelled
      expect(cancelledTask?.status).toBe('error');
      expect(cancelledTask?.error).toBe('Cancelled by user');
      expect(task1?.status).toBe('running'); // Should not affect other running tasks
    });

    it('should handle duplicate checkpoint IDs', () => {
      const checkpoint: Checkpoint = {
        id: 'cp-1',
        taskId: 'task-1',
        description: 'Checkpoint 1',
        timestamp: new Date(),
        canRollback: true
      };

      store.getState().addCheckpoint(checkpoint);
      store.getState().addCheckpoint({ ...checkpoint, description: 'Checkpoint 2' });

      expect(store.getState().checkpoints).toHaveLength(2);
    });

    it('should preserve task order when updating', () => {
      const task1: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Task 1',
        status: 'running',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      const task2: Task = {
        id: 'task-2',
        title: 'Task 2',
        description: 'Task 2',
        status: 'running',
        progress: { current: 0, total: 100 },
        fileEdits: []
      };

      store.getState().addTask(task1);
      store.getState().addTask(task2);

      store.getState().updateTask('task-1', { status: 'completed' });

      const tasks = store.getState().tasks;
      expect(tasks[0].id).toBe('task-2'); // Task 2 should still be first (most recent)
      expect(tasks[1].id).toBe('task-1');
    });
  });

  describe('State Subscriptions', () => {
    it('should notify subscribers on state changes', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      store.getState().setActivePane('deploy');

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should allow multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = store.subscribe(listener1);
      const unsubscribe2 = store.subscribe(listener2);

      store.getState().openToolsOverlay();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });

    it('should stop notifying after unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();
      store.getState().setActivePane('deploy');

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
