import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Workspace pane types
type WorkspacePane = 'console' | 'agent' | 'deploy' | 'share' | 'preview';

// Task interface
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

// Checkpoint interface
interface Checkpoint {
  id: string;
  taskId: string;
  description: string;
  timestamp: Date;
  canRollback: boolean;
}

// Device frame types
type DeviceFrame = 'iphone' | 'android' | 'desktop';

// Workspace state interface
interface WorkspaceState {
  // Current project
  currentProject: { id: string; name: string; path: string } | null;

  // Navigation
  activePane: WorkspacePane;
  toolsOverlayOpen: boolean;
  activeToolPane: string | null;

  // Agent state
  agentStatus: 'idle' | 'running' | 'error' | 'complete';
  tasks: Task[];
  currentTaskId: string | null;
  checkpoints: Checkpoint[];
  workDurationSeconds: number;

  // Preview state
  previewUrl: string;
  deviceFrame: DeviceFrame;
  isPreviewLoading: boolean;

  // Publishing state
  subdomain: string;
  subdomainAvailable: boolean | null;
  publishStatus: 'unpublished' | 'checking' | 'publishing' | 'published' | 'error';
  publishError: string | null;

  // Actions
  setProject: (project: { id: string; name: string; path: string } | null) => void;
  setActivePane: (pane: WorkspacePane) => void;
  openToolsOverlay: () => void;
  closeToolsOverlay: () => void;
  setActiveToolPane: (paneId: string | null) => void;
  closeToolPane: () => void;

  // Agent actions
  startAgent: (taskDescription: string) => Promise<string>;
  stopAgent: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addCheckpoint: (checkpoint: Checkpoint) => void;
  rollbackToCheckpoint: (checkpointId: string) => void;
  incrementWorkDuration: () => void;
  clearTasks: () => void;
  initAgentListeners: () => Promise<void>;

  // Preview actions
  setPreviewUrl: (url: string) => void;
  setDeviceFrame: (frame: DeviceFrame) => void;
  setPreviewLoading: (loading: boolean) => void;
  refreshPreview: () => void;

  // Publishing actions
  setSubdomain: (subdomain: string) => void;
  checkSubdomainAvailability: () => Promise<void>;
  publish: () => Promise<void>;
  unpublish: () => void;

  // Reset
  resetWorkspace: () => void;
}

const workspaceStore: StateCreator<
  WorkspaceState,
  [],
  [['zustand/subscribeWithSelector', never], ['zustand/persist', Partial<WorkspaceState>]],
  WorkspaceState
> = (set, get) => ({
  // Initial state
  currentProject: null,
  activePane: 'agent',
  toolsOverlayOpen: false,
  activeToolPane: null,
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

  // Project actions
  setProject: (project) => {
    set({
      currentProject: project,
      // Reset workspace state when switching projects
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

  // Navigation actions
  setActivePane: (pane) => set({ activePane: pane }),

  openToolsOverlay: () => set({ toolsOverlayOpen: true }),

  closeToolsOverlay: () => set({ toolsOverlayOpen: false }),

  setActiveToolPane: (paneId) => set({ activeToolPane: paneId }),

  closeToolPane: () => set({ activeToolPane: null }),

  // Agent actions
  startAgent: async (taskDescription: string) => {
    set({ agentStatus: 'running' });
    try {
      const { currentProject } = get();
      if (!currentProject) {
        throw new Error('No project selected');
      }

      // Call backend to start agent task
      const taskId = await invoke<string>('start_agent_task', {
        projectPath: currentProject.path,
        description: taskDescription,
      });

      const task: Task = {
        id: taskId,
        title: taskDescription,
        description: taskDescription,
        status: 'running',
        progress: { current: 0, total: 100 },
        fileEdits: [],
        startedAt: new Date(),
      };

      set((state) => ({
        tasks: [task, ...state.tasks],
        currentTaskId: taskId,
        workDurationSeconds: 0,
      }));

      return taskId;
    } catch (error) {
      set({ agentStatus: 'error' });
      throw error;
    }
  },

  stopAgent: async () => {
    const { currentTaskId } = get();
    if (currentTaskId) {
      try {
        // Call backend to stop agent task
        await invoke('stop_agent_task', { taskId: currentTaskId });
      } catch (error) {
        console.error('Failed to stop agent:', error);
      }

      set((state) => ({
        agentStatus: 'idle',
        tasks: state.tasks.map((task) =>
          task.id === currentTaskId && task.status === 'running'
            ? { ...task, status: 'error', error: 'Cancelled by user', completedAt: new Date() }
            : task
        ),
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

    // TODO: Implement actual rollback logic with backend
    console.log('Rolling back to checkpoint:', checkpoint);

    // For now, just mark all tasks after this checkpoint as cancelled
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

  // Preview actions
  setPreviewUrl: (url: string) => set({ previewUrl: url }),

  setDeviceFrame: (frame: DeviceFrame) => set({ deviceFrame: frame }),

  setPreviewLoading: (loading: boolean) => set({ isPreviewLoading: loading }),

  refreshPreview: () => {
    // Force reload by adding timestamp
    const { previewUrl } = get();
    const url = new URL(previewUrl, window.location.origin);
    url.searchParams.set('t', Date.now().toString());
    set({ previewUrl: url.pathname + url.search, isPreviewLoading: true });
  },

  // Publishing actions
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
      // TODO: Implement actual subdomain availability check
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Basic validation: alphanumeric and hyphens only, 3-63 chars
      const isValid = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(subdomain);

      // Simulated reserved subdomains
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
      // TODO: Implement actual publishing logic
      // This would call the backend API to:
      // 1. Build the project
      // 2. Deploy to subdomain
      // 3. Configure DNS/routing

      await new Promise((resolve) => setTimeout(resolve, 2000));

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
    // TODO: Implement actual unpublish logic
    set({
      publishStatus: 'unpublished',
      publishError: null
    });
  },

  // Subscribe to agent events
  initAgentListeners: async () => {
    // Listen for agent progress updates
    await listen('agent-progress', (event: any) => {
      const { taskId, progress, status } = event.payload;
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, progress, status } : t
        ),
      }));
    });

    // Listen for agent output
    await listen('agent-output', (event: any) => {
      const { taskId, output } = event.payload;
      // Update task with output (you might want to store output in Task interface)
      console.log(`Agent output for task ${taskId}:`, output);
    });

    // Listen for agent completion
    await listen('agent-complete', (event: any) => {
      const { taskId } = event.payload;
      set((state) => ({
        agentStatus: state.currentTaskId === taskId ? 'complete' : state.agentStatus,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: 'completed', completedAt: new Date() }
            : t
        ),
      }));
    });

    // Listen for agent errors
    await listen('agent-error', (event: any) => {
      const { taskId, error } = event.payload;
      set((state) => ({
        agentStatus: state.currentTaskId === taskId ? 'error' : state.agentStatus,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: 'error', error, completedAt: new Date() }
            : t
        ),
      }));
    });
  },

  // Reset workspace
  resetWorkspace: () => {
    set({
      currentProject: null,
      activePane: 'agent',
      toolsOverlayOpen: false,
      activeToolPane: null,
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

export const useWorkspaceStore = create<WorkspaceState>()(
  subscribeWithSelector(
    persist(workspaceStore, {
      name: 'workspace-storage',
      partialize: (state) => ({
        deviceFrame: state.deviceFrame,
        subdomain: state.subdomain,
        previewUrl: state.previewUrl
      })
    })
  )
);

// Selector hooks for commonly used state
export const useCurrentProject = () => useWorkspaceStore((state) => state.currentProject);
export const useActivePane = () => useWorkspaceStore((state) => state.activePane);
export const useActiveToolPane = () => useWorkspaceStore((state) => state.activeToolPane);
export const useAgentStatus = () => useWorkspaceStore((state) => state.agentStatus);
export const useTasks = () => useWorkspaceStore((state) => state.tasks);
export const useCurrentTask = () => {
  const tasks = useTasks();
  const currentTaskId = useWorkspaceStore((state) => state.currentTaskId);
  return tasks.find((t) => t.id === currentTaskId) || null;
};
export const usePreview = () => useWorkspaceStore((state) => ({
  url: state.previewUrl,
  deviceFrame: state.deviceFrame,
  isLoading: state.isPreviewLoading
}));
export const usePublishing = () => useWorkspaceStore((state) => ({
  subdomain: state.subdomain,
  subdomainAvailable: state.subdomainAvailable,
  status: state.publishStatus,
  error: state.publishError
}));
