/**
 * Reusable store mock factories for testing
 */
import { vi } from 'vitest';
import { mockProjects, mockSessions, mockSessionOutputs } from './testData';

/**
 * Creates a sessionStore mock with customizable state
 */
export function createSessionStoreMock(overrides: Partial<any> = {}) {
  const defaultState = {
    projects: mockProjects,
    sessions: mockSessions,
    currentSessionId: null,
    currentSession: null,
    sessionOutputs: mockSessionOutputs,
    isLoadingProjects: false,
    isLoadingSessions: false,
    isLoadingOutputs: false,
    error: null,
    fetchProjects: vi.fn().mockResolvedValue(undefined),
    fetchProjectSessions: vi.fn().mockResolvedValue(undefined),
    setCurrentSession: vi.fn(),
    fetchSessionOutput: vi.fn().mockResolvedValue(undefined),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    handleSessionUpdate: vi.fn(),
    handleOutputUpdate: vi.fn(),
    ...overrides
  };

  return defaultState;
}

/**
 * Creates a workspaceStore mock with customizable state
 */
export function createWorkspaceStoreMock(overrides: Partial<any> = {}) {
  const defaultState = {
    currentProject: null,
    activePane: 'agent' as const,
    toolsOverlayOpen: false,
    agentStatus: 'idle' as const,
    tasks: [],
    currentTaskId: null,
    checkpoints: [],
    workDurationSeconds: 0,
    previewUrl: '/',
    deviceFrame: 'iphone' as const,
    isPreviewLoading: false,
    subdomain: '',
    subdomainAvailable: null,
    publishStatus: 'unpublished' as const,
    publishError: null,
    setProject: vi.fn((project) => { defaultState.currentProject = project; }),
    setActivePane: vi.fn((pane) => { defaultState.activePane = pane; }),
    openToolsOverlay: vi.fn(),
    closeToolsOverlay: vi.fn(),
    startAgent: vi.fn(),
    stopAgent: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    addCheckpoint: vi.fn(),
    rollbackToCheckpoint: vi.fn(),
    incrementWorkDuration: vi.fn(),
    clearTasks: vi.fn(),
    initAgentListeners: vi.fn().mockResolvedValue(undefined),
    setPreviewUrl: vi.fn(),
    setDeviceFrame: vi.fn(),
    setPreviewLoading: vi.fn(),
    refreshPreview: vi.fn(),
    setSubdomain: vi.fn(),
    checkSubdomainAvailability: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    resetWorkspace: vi.fn(() => {
      defaultState.currentProject = null;
      defaultState.activePane = 'agent';
      defaultState.toolsOverlayOpen = false;
      defaultState.agentStatus = 'idle';
      defaultState.tasks = [];
      defaultState.currentTaskId = null;
      defaultState.checkpoints = [];
      defaultState.workDurationSeconds = 0;
    }),
    ...overrides
  };

  return defaultState;
}

/**
 * Creates a Zustand-like store wrapper for testing
 */
export function createZustandStoreMock(state: any) {
  return Object.assign(
    vi.fn((selector?: (state: any) => any) =>
      selector ? selector(state) : state
    ),
    {
      getState: () => state,
      setState: (updates: any) => {
        Object.assign(state, typeof updates === 'function' ? updates(state) : updates);
      },
      subscribe: vi.fn(),
      destroy: vi.fn(),
    }
  );
}
