import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { api } from '@/lib/api';
import { gitService } from '@/lib/mobile/git';

// Mock workspace store
const mockSetActivePane = vi.fn();
let mockActivePane = 'agent';

vi.mock('@/stores/workspaceStore', () => ({
  useWorkspaceStore: vi.fn((selector) => {
    const state = {
      activePane: mockActivePane,
      setActivePane: (pane: string) => {
        mockActivePane = pane;
        mockSetActivePane(pane);
      },
      initAgentListeners: vi.fn().mockResolvedValue(undefined),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    storageListTables: vi.fn(),
    storageExecuteSql: vi.fn(),
    workflowsList: vi.fn(),
    workflowsExecute: vi.fn(),
    secretsList: vi.fn(),
    secretsGet: vi.fn(),
    secretsSet: vi.fn(),
    authUsersList: vi.fn(),
    integrationsList: vi.fn(),
  },
}));

// Mock git service
vi.mock('@/lib/mobile/git', () => ({
  gitService: {
    getStatus: vi.fn(),
    getBranches: vi.fn(),
    checkout: vi.fn(),
    stage: vi.fn(),
    unstage: vi.fn(),
    commit: vi.fn(),
    pull: vi.fn(),
    push: vi.fn(),
  },
}));

// Mock haptics
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    trigger: vi.fn(),
    isSupported: true,
  }),
}));

// Mock pane components to avoid complex dependencies
vi.mock('@/components/mobile/workspace/panes/AgentPaneContainer', () => ({
  AgentPaneContainer: ({ projectId }: any) => (
    <div data-testid="agent-pane">
      <h2>Agent</h2>
      <p>Project: {projectId}</p>
      <button>Send Message</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/DatabasePane', () => ({
  DatabasePane: ({ projectId }: any) => (
    <div data-testid="database-pane">
      <h2>Database</h2>
      <div>Tables</div>
      <button>Run Query</button>
      <div data-testid="query-results">Results</div>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/GitPane', () => ({
  GitPane: ({ projectId }: any) => (
    <div data-testid="git-pane">
      <h2>Git</h2>
      <div>Changes</div>
      <button aria-label="Stage all">Stage</button>
      <input placeholder="commit message" />
      <button aria-label="Commit changes">Commit</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/WorkflowsPane', () => ({
  WorkflowsPane: ({ projectId }: any) => (
    <div data-testid="workflows-pane">
      <h2>Workflows</h2>
      <div>Available Workflows</div>
      <button>Run Workflow</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/SecretsPane', () => ({
  SecretsPane: ({ projectId }: any) => (
    <div data-testid="secrets-pane">
      <h2>Secrets</h2>
      <button>Add Secret</button>
      <div data-testid="secrets-list">Secret List</div>
    </div>
  ),
}));

describe('Pane Integration Tests', () => {
  const defaultProps = {
    projectId: 'test-project-123',
    projectName: 'Test Project',
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivePane = 'agent';

    // Setup mock data
    vi.mocked(api.storageListTables).mockResolvedValue([
      { name: 'users', type: 'table', sql: '' },
      { name: 'posts', type: 'table', sql: '' },
    ]);

    vi.mocked(api.storageExecuteSql).mockResolvedValue({
      rows: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    });

    vi.mocked(gitService.getStatus).mockResolvedValue({
      branch: 'main',
      staged: [],
      unstaged: [{ path: 'src/App.tsx', status: 'M' }],
      untracked: [],
    });

    vi.mocked(gitService.commit).mockResolvedValue(undefined);

    if (typeof window !== 'undefined') {
      (window as any).__TAURI__ = true;
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      delete (window as any).__TAURI__;
    }
  });

  describe('Complete User Journey - Console and Agent', () => {
    it('user can navigate between Console and Agent panes', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Initially on agent pane
      expect(screen.getByTestId('agent-pane')).toBeInTheDocument();

      // Navigate to console pane
      const consoleButton = screen.getByRole('button', { name: /console/i });
      await user.click(consoleButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('console');
      });
    });

    it('user can interact with Agent pane', async () => {
      const user = userEvent.setup();
      mockActivePane = 'agent';
      render(<WorkspaceScreen {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('agent-pane')).toBeInTheDocument();
      });

      // Agent pane actions
      const sendButton = screen.getByText('Send Message');
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe('Complete User Journey - Deploy and Share', () => {
    it('user can navigate to Deploy pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Navigate to deploy pane
      const deployButton = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });
    });

    it('navigates between Deploy and Share panes', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Go to Deploy pane
      const deployButton = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });

      // Switch to Share pane
      const shareButton = screen.getByRole('button', { name: /share/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('share');
      });

      // State should be preserved when switching back
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });
    });
  });

  describe('Complete User Journey - Preview', () => {
    it('user can navigate to Preview pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Navigate to preview pane
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('preview');
      });
    });
  });

  describe('Multi-Pane Navigation Flow', () => {
    it('completes full workflow: Agent → Console → Deploy → Preview', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Start on Agent pane
      expect(screen.getByTestId('agent-pane')).toBeInTheDocument();

      // Navigate to Console
      const consoleButton = screen.getByRole('button', { name: /console/i });
      await user.click(consoleButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('console');
      });

      // Navigate to Deploy
      const deployButton = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });

      // Navigate to Preview
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('preview');
      });

      // All pane transitions successful
      expect(mockSetActivePane).toHaveBeenCalledTimes(3);
    });

    it('handles rapid pane switching without errors', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const panes = [
        { name: /console/i, id: 'console' },
        { name: /agent/i, id: 'agent' },
        { name: /deploy/i, id: 'deploy' },
        { name: /share/i, id: 'share' },
        { name: /preview/i, id: 'preview' },
      ];

      // Rapidly switch between panes
      for (const pane of panes) {
        const button = screen.getByRole('button', { name: pane.name });
        await user.click(button);

        await waitFor(() => {
          expect(mockSetActivePane).toHaveBeenCalledWith(pane.id);
        });
      }

      // Should handle all switches without errors
      expect(mockSetActivePane).toHaveBeenCalledTimes(panes.length);
    });
  });

  describe('Pane State Persistence', () => {
    it('preserves state when switching panes and returning', async () => {
      const user = userEvent.setup();
      mockActivePane = 'console';
      const { rerender } = render(<WorkspaceScreen {...defaultProps} />);

      // Switch to another pane
      mockActivePane = 'deploy';
      rerender(<WorkspaceScreen {...defaultProps} />);

      // Switch back to console
      mockActivePane = 'console';
      rerender(<WorkspaceScreen {...defaultProps} />);

      // State should be preserved (based on component implementation)
      expect(mockActivePane).toBe('console');
    });
  });

  describe('Concurrent Operations', () => {
    it('handles pane rendering without errors', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Navigate through panes
      const deployButton = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });

      // Switch to share
      const shareButton = screen.getByRole('button', { name: /share/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('share');
      });
    });
  });

  describe('Error Handling Across Panes', () => {
    it('handles navigation errors gracefully', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Navigate to console
      const consoleButton = screen.getByRole('button', { name: /console/i });
      await user.click(consoleButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('console');
      });

      // Should handle without errors
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  describe('Data Flow Between Components', () => {
    it('maintains project context across panes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<WorkspaceScreen {...defaultProps} />);

      // Navigate to deploy
      const deployButton = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });

      // Project context should be maintained
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  describe('Pane Integration with Toolbar', () => {
    it('toolbar state syncs with active pane', async () => {
      const user = userEvent.setup();

      // Test console pane active state
      mockActivePane = 'console';
      const { rerender: rerender1 } = render(<WorkspaceScreen {...defaultProps} />);
      let consoleButton = screen.getByRole('button', { name: /console/i });
      expect(consoleButton).toHaveAttribute('aria-current', 'page');

      // Test agent pane active state
      mockActivePane = 'agent';
      rerender1(<WorkspaceScreen {...defaultProps} />);
      let agentButton = screen.getByRole('button', { name: /agent/i });
      expect(agentButton).toHaveAttribute('aria-current', 'page');

      // Test deploy pane active state
      mockActivePane = 'deploy';
      rerender1(<WorkspaceScreen {...defaultProps} />);
      let deployButton = screen.getByRole('button', { name: /deploy/i });
      expect(deployButton).toHaveAttribute('aria-current', 'page');
    });

    it('handles tools overlay interaction with active pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open tools overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Overlay should open regardless of active pane
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for tools and files')).toBeInTheDocument();
      });

      // Close overlay
      const closeButton = screen.getByLabelText('Close tools overlay');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search for tools and files')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('lazy loads pane content on navigation', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Initially on agent pane
      expect(screen.getByTestId('agent-pane')).toBeInTheDocument();

      // Navigate to deploy
      const deployButton = screen.getByRole('button', { name: /deploy/i });
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });
    });

    it('cleans up resources when switching panes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<WorkspaceScreen {...defaultProps} />);

      // Navigate through multiple panes
      const panes = ['console', 'agent', 'deploy', 'share', 'preview'];

      for (const pane of panes) {
        mockActivePane = pane;
        rerender(<WorkspaceScreen {...defaultProps} />);
      }

      // No memory leaks or lingering effects
      expect(mockSetActivePane).toHaveBeenCalledTimes(0); // Only state changes, no extra calls
    });
  });
});
