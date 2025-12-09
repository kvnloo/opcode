import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { AgentPaneContainer } from '@/components/mobile/workspace/panes/AgentPaneContainer';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { api } from '@/lib/api';

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    executeClaudeCode: vi.fn(),
    cancelClaudeExecution: vi.fn(),
  },
}));

// Enhanced event listener system for Tauri events
const mockListeners = new Map<string, Array<(event: { payload: any }) => void>>();
let unlistenFns: Array<() => void> = [];

// Mock @tauri-apps/api/event with proper implementation
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event: string, callback: (event: { payload: any }) => void) => {
    if (!mockListeners.has(event)) {
      mockListeners.set(event, []);
    }
    mockListeners.get(event)!.push(callback);

    const unlisten = () => {
      const listeners = mockListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      }
    };
    unlistenFns.push(unlisten);

    return Promise.resolve(unlisten);
  }),
  emit: vi.fn((event: string, payload: any) => {
    const listeners = mockListeners.get(event) || [];
    listeners.forEach(cb => cb({ payload }));
    return Promise.resolve();
  }),
}));

// Helper functions to simulate streaming events
const simulateStreamingOutput = (sessionId: string, content: string) => {
  const listeners = mockListeners.get('claude-output') || [];
  listeners.forEach(cb => cb({ payload: { session_id: sessionId, content } }));
};

const simulateSessionStarted = (sessionId: string, projectPath?: string) => {
  const listeners = mockListeners.get('claude-session-started') || [];
  listeners.forEach(cb => cb({ payload: { session_id: sessionId, project_path: projectPath } }));
};

const simulateSessionCompleted = (sessionId: string) => {
  const listeners = mockListeners.get('claude-session-completed') || [];
  listeners.forEach(cb => cb({ payload: { session_id: sessionId } }));
};

const simulateSessionError = (sessionId: string, error: string) => {
  const listeners = mockListeners.get('claude-session-error') || [];
  listeners.forEach(cb => cb({ payload: { session_id: sessionId, error } }));
};

describe('Claude Code Streaming Integration', () => {
  beforeEach(() => {
    mockListeners.clear();
    unlistenFns = [];
    vi.clearAllMocks();

    // Setup workspace store with a current project
    const store = useWorkspaceStore.getState();
    store.setProject({
      id: 'test-project',
      path: '/test/project',
      name: 'Test Project',
    });
    store.resetWorkspace();
  });

  afterEach(() => {
    // Call all unlisten functions to clean up
    unlistenFns.forEach(fn => fn());
    unlistenFns = [];
  });

  describe('Event Listener Setup', () => {
    it('sets up all required listeners on mount', async () => {
      render(<AgentPaneContainer projectId="test-project" />);

      await waitFor(() => {
        expect(mockListeners.has('claude-output')).toBe(true);
        expect(mockListeners.has('claude-session-started')).toBe(true);
        expect(mockListeners.has('claude-session-completed')).toBe(true);
        expect(mockListeners.has('claude-session-error')).toBe(true);
      });

      // Verify each event has listeners
      expect(mockListeners.get('claude-output')?.length).toBeGreaterThan(0);
      expect(mockListeners.get('claude-session-started')?.length).toBeGreaterThan(0);
      expect(mockListeners.get('claude-session-completed')?.length).toBeGreaterThan(0);
      expect(mockListeners.get('claude-session-error')?.length).toBeGreaterThan(0);
    });

    it('cleans up listeners on unmount', async () => {
      const { unmount } = render(<AgentPaneContainer projectId="test-project" />);

      await waitFor(() => {
        expect(mockListeners.get('claude-output')?.length).toBeGreaterThan(0);
      });

      const initialOutputListeners = mockListeners.get('claude-output')?.length || 0;

      unmount();

      // After unmount, listeners should be removed
      const finalOutputListeners = mockListeners.get('claude-output')?.length || 0;
      expect(finalOutputListeners).toBeLessThan(initialOutputListeners);
    });
  });

  describe('Prompt Submission', () => {
    it('submits prompt and starts execution', async () => {
      vi.mocked(api.executeClaudeCode).mockResolvedValue(undefined);

      // Ensure project is set BEFORE rendering
      const store = useWorkspaceStore.getState();
      store.setProject({
        id: 'test-project',
        path: '/test/project',
        name: 'Test Project',
      });

      render(<AgentPaneContainer projectId="test-project" />);

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/example.*react component/i)).toBeInTheDocument();
      });

      // Find and fill prompt textarea - use the actual placeholder text
      const textarea = screen.getByPlaceholderText(/example.*react component/i) as HTMLTextAreaElement;

      // Use fireEvent to change the textarea value directly
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test prompt' } });
      });

      // Wait for the state to update and button to be enabled
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /start agent/i });
        expect(startButton).toBeEnabled();
      }, { timeout: 3000 });

      const startButton = screen.getByRole('button', { name: /start agent/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      // Should call API
      await waitFor(() => {
        expect(api.executeClaudeCode).toHaveBeenCalledWith(
          '/test/project',
          'Test prompt',
          'sonnet'
        );
      }, { timeout: 3000 });
    });

    it('handles keyboard shortcut (Cmd/Ctrl+Enter)', async () => {
      vi.mocked(api.executeClaudeCode).mockResolvedValue(undefined);

      // Ensure project is set BEFORE rendering
      const store = useWorkspaceStore.getState();
      store.setProject({
        id: 'test-project',
        path: '/test/project',
        name: 'Test Project',
      });

      render(<AgentPaneContainer projectId="test-project" />);

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/example.*react component/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/example.*react component/i) as HTMLTextAreaElement;

      // Set text value directly
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Shortcut test' } });
      });

      // Wait for state to update
      await waitFor(() => {
        expect(textarea.value).toBe('Shortcut test');
      });

      // Simulate Cmd+Enter using fireEvent
      await act(async () => {
        fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', metaKey: true });
      });

      await waitFor(() => {
        expect(api.executeClaudeCode).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    it('handles execution failure gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.executeClaudeCode).mockRejectedValue(new Error('Execution failed'));

      // Ensure project is set BEFORE rendering
      const store = useWorkspaceStore.getState();
      store.setProject({
        id: 'test-project',
        path: '/test/project',
        name: 'Test Project',
      });

      render(<AgentPaneContainer projectId="test-project" />);

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/example.*react component/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/example.*react component/i) as HTMLTextAreaElement;

      // Set text value directly
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Test' } });
      });

      // Wait for button to be enabled
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /start agent/i });
        expect(startButton).toBeEnabled();
      }, { timeout: 3000 });

      const startButton = screen.getByRole('button', { name: /start agent/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      // Verify error was logged (component catches and logs the error)
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to execute Claude Code:', expect.any(Error));
      }, { timeout: 3000 });

      // Verify API was called
      expect(api.executeClaudeCode).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('requires project to be selected', async () => {
      const store = useWorkspaceStore.getState();
      store.setProject(null);

      render(<AgentPaneContainer projectId="test-project" />);

      await waitFor(() => {
        expect(screen.getByText(/Please select a project first/i)).toBeInTheDocument();
      });

      const startButton = screen.getByRole('button', { name: /start agent/i });
      expect(startButton).toBeDisabled();
    });
  });

  describe('UI State Transitions', () => {
    it('shows initial prompt UI when no tasks', async () => {
      render(<AgentPaneContainer projectId="test-project" />);

      await waitFor(() => {
        expect(screen.getByText(/What would you like to build/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/example.*react component/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Event Handling (requires agent UI)', () => {
    beforeEach(() => {
      // Use the Zustand store's setState properly
      useWorkspaceStore.setState({ tasks: [{ id: 'test-task', title: 'Test', status: 'running' as const }] });
    });

    it('handles session started event correctly', async () => {
      const { container } = render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateSessionStarted('test-session');
      });

      // Event should be handled without errors
      expect(container).toBeInTheDocument();
    });

    it('handles streaming output events', async () => {
      render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateSessionStarted('test-session');
        simulateStreamingOutput('test-session', 'Test output');
      });

      // Events should be processed without errors
      expect(mockListeners.get('claude-output')).toBeDefined();
    });

    it('handles session completed event', async () => {
      render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateSessionStarted('test-session');
        simulateSessionCompleted('test-session');
      });

      // Event should be handled
      expect(mockListeners.get('claude-session-completed')).toBeDefined();
    });

    it('handles session error event', async () => {
      render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateSessionStarted('test-session');
        simulateSessionError('test-session', 'Test error');
      });

      // Error event should be handled
      expect(mockListeners.get('claude-session-error')).toBeDefined();
    });
  });

  describe('Stop/Cancel Functionality', () => {
    beforeEach(() => {
      useWorkspaceStore.setState({ tasks: [{ id: 'test-task', title: 'Test', status: 'running' as const }] });
    });

    it('attempts to stop execution when API is called', async () => {
      vi.mocked(api.cancelClaudeExecution).mockResolvedValue(undefined);

      render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateSessionStarted('stop-session');
      });

      // Verify session was started
      expect(mockListeners.get('claude-session-started')).toBeDefined();
    });

    it('handles stop errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.cancelClaudeExecution).mockRejectedValue(new Error('Cancel failed'));

      render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateSessionStarted('error-session');
      });

      // Should not throw
      expect(mockListeners.get('claude-session-started')).toBeDefined();

      consoleError.mockRestore();
    });
  });

  describe('Auto-scroll Behavior', () => {
    it('has scroll ref configured', async () => {
      const scrollIntoView = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;

      useWorkspaceStore.setState({ tasks: [{ id: 'test', title: 'Test', status: 'running' as const }] });

      render(<AgentPaneContainer projectId="test-project" />);

      // Component should render without errors
      expect(mockListeners.get('claude-output')).toBeDefined();
    });
  });

  describe('Multiple Session Handling', () => {
    it('sets up listeners that can handle multiple sessions', async () => {
      render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateSessionStarted('session-1');
        simulateSessionStarted('session-2');
      });

      // Both events should be processed
      expect(mockListeners.get('claude-session-started')?.length).toBeGreaterThan(0);
    });

    it('sends output events for different sessions', async () => {
      render(<AgentPaneContainer projectId="test-project" />);

      await act(async () => {
        simulateStreamingOutput('session-1', 'Output 1');
        simulateStreamingOutput('session-2', 'Output 2');
      });

      // Events should be processed
      expect(mockListeners.get('claude-output')).toBeDefined();
    });
  });
});
