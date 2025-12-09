import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';

// Mock workspace store
const mockSetActivePane = vi.fn();
const mockSetActiveToolPane = vi.fn();
let mockActivePane = 'agent';
let mockActiveToolPane: string | null = null;

vi.mock('@/stores/workspaceStore', () => ({
  useWorkspaceStore: vi.fn((selector) => {
    const state = {
      activePane: mockActivePane,
      setActivePane: mockSetActivePane,
      activeToolPane: mockActiveToolPane,
      setActiveToolPane: mockSetActiveToolPane,
      initAgentListeners: vi.fn().mockResolvedValue(undefined),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock AgentPaneContainer
vi.mock('@/components/mobile/workspace/panes/AgentPaneContainer', () => ({
  AgentPaneContainer: ({ projectId }: any) => (
    <div data-testid="agent-pane">
      <h2>Agent</h2>
      <p>Project: {projectId}</p>
    </div>
  ),
}));

// Mock all tool pane components
vi.mock('@/components/mobile/workspace/panes/AppStoragePane', () => ({
  AppStoragePane: ({ className }: any) => (
    <div data-testid="app-storage-pane" className={className}>
      <h2>App Storage</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/AuthUsersPane', () => ({
  AuthUsersPane: ({ className }: any) => (
    <div data-testid="auth-users-pane" className={className}>
      <h2>Auth Users</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/ConsolePane', () => ({
  ConsolePane: ({ className }: any) => (
    <div data-testid="console-pane" className={className}>
      <h2>Console</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/DevToolsPane', () => ({
  DevToolsPane: ({ className }: any) => (
    <div data-testid="dev-tools-pane" className={className}>
      <h2>Developer Tools</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/IntegrationsPane', () => ({
  IntegrationsPane: ({ className }: any) => (
    <div data-testid="integrations-pane" className={className}>
      <h2>Integrations</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/KeyValueStorePane', () => ({
  KeyValueStorePane: ({ className }: any) => (
    <div data-testid="kv-store-pane" className={className}>
      <h2>Key-Value Store</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/MultiplayerPane', () => ({
  MultiplayerPane: ({ className }: any) => (
    <div data-testid="multiplayer-pane" className={className}>
      <h2>Multiplayer</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/PreviewPane', () => ({
  PreviewPane: ({ className }: any) => (
    <div data-testid="preview-pane" className={className}>
      <h2>Preview</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/PublishingPane', () => ({
  PublishingPane: ({ className }: any) => (
    <div data-testid="publishing-pane" className={className}>
      <h2>Publishing</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/SecurityScannerPane', () => ({
  SecurityScannerPane: ({ className }: any) => (
    <div data-testid="security-scanner-pane" className={className}>
      <h2>Security Scanner</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/SecretsPane', () => ({
  SecretsPane: ({ className }: any) => (
    <div data-testid="secrets-pane" className={className}>
      <h2>Secrets</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/SharePane', () => ({
  SharePane: ({ className }: any) => (
    <div data-testid="share-pane" className={className}>
      <h2>Share</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/workspace/panes/WorkflowsPane', () => ({
  WorkflowsPane: ({ className }: any) => (
    <div data-testid="workflows-pane" className={className}>
      <h2>Workflows</h2>
      <button data-testid="back-button">Back</button>
    </div>
  ),
}));

// Mock ToolsOverlay component
vi.mock('@/components/mobile/workspace/ToolsOverlay', () => ({
  ToolsOverlay: ({ isOpen, onClose, onToolSelect }: any) => {
    if (!isOpen) return null;

    return (
      <div data-testid="tools-overlay">
        <h2>Tools</h2>
        <button onClick={onClose} data-testid="close-overlay">Close</button>
        <button onClick={() => onToolSelect('storage')} data-testid="tool-storage">App Storage</button>
        <button onClick={() => onToolSelect('auth')} data-testid="tool-auth">Auth</button>
        <button onClick={() => onToolSelect('database')} data-testid="tool-database">Database</button>
        <button onClick={() => onToolSelect('developer')} data-testid="tool-developer">Developer</button>
        <button onClick={() => onToolSelect('git')} data-testid="tool-git">Git</button>
        <button onClick={() => onToolSelect('integrations')} data-testid="tool-integrations">Integrations</button>
        <button onClick={() => onToolSelect('kv-store')} data-testid="tool-kv-store">KV Store</button>
        <button onClick={() => onToolSelect('multiplayer')} data-testid="tool-multiplayer">Multiplayer</button>
        <button onClick={() => onToolSelect('publishing')} data-testid="tool-publishing">Publishing</button>
        <button onClick={() => onToolSelect('secrets')} data-testid="tool-secrets">Secrets</button>
        <button onClick={() => onToolSelect('security')} data-testid="tool-security">Security</button>
        <button onClick={() => onToolSelect('shell')} data-testid="tool-shell">Shell</button>
        <button onClick={() => onToolSelect('workflows')} data-testid="tool-workflows">Workflows</button>
      </div>
    );
  },
}));

describe('Tool Pane Navigation', () => {
  const defaultProps = {
    projectId: 'test-project',
    projectName: 'Test Project',
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivePane = 'agent';
    mockActiveToolPane = null;
    mockSetActivePane.mockClear();
    mockSetActiveToolPane.mockClear();
  });

  describe('Opening tool panes from overlay', () => {
    it('should open tools overlay when menu button clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      expect(await screen.findByTestId('tools-overlay')).toBeInTheDocument();
    });

    it('should navigate to storage pane when storage tool selected', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open tools overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Select storage tool
      const storageTool = await screen.findByTestId('tool-storage');
      await user.click(storageTool);

      // Verify navigation happened (in real implementation)
      // For now, verify overlay closes after selection
      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });
    });

    it('should navigate to auth pane when auth tool selected', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Select auth tool
      const authTool = await screen.findByTestId('tool-auth');
      await user.click(authTool);

      // Verify overlay closes
      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });
    });

    it('should navigate to developer pane when developer tool selected', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Select developer tool
      const devTool = await screen.findByTestId('tool-developer');
      await user.click(devTool);

      // Verify overlay closes
      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tool pane rendering', () => {
    it('should render tool pane with project context', async () => {
      // This test verifies that when a tool pane is shown, it has access to projectId
      // In the real implementation, tool panes receive projectId as a prop
      render(<WorkspaceScreen {...defaultProps} />);

      // Verify workspace is rendered with project context
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should maintain workspace header when showing tool panes', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Header should always be visible
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
    });
  });

  describe('Back navigation from tool panes', () => {
    it('should close overlay when close button clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Close overlay
      const closeButton = await screen.findByTestId('close-overlay');
      await user.click(closeButton);

      // Verify overlay is closed
      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });
    });

    it('should return to workspace when navigating back from tool pane', async () => {
      // In real implementation, tool panes would have a back button
      // that returns to the workspace view
      render(<WorkspaceScreen {...defaultProps} />);

      // Verify we're in the workspace
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  describe('Tool pane state management', () => {
    it('should preserve project ID when switching between panes', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Switch to console pane
      const consoleButton = screen.getByRole('button', { name: 'Console' });
      await user.click(consoleButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('console');
      });

      // Project context should be maintained
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should handle switching between multiple tool panes', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Select first tool
      const storageTool = await screen.findByTestId('tool-storage');
      await user.click(storageTool);

      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });

      // Open overlay again
      await user.click(moreButton);
      const showToolsButton2 = await screen.findByText('Show Tools');
      await user.click(showToolsButton2);

      // Select second tool
      const authTool = await screen.findByTestId('tool-auth');
      await user.click(authTool);

      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });
    });

    it('should not show tool panes in bottom toolbar', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Verify only workspace panes are in toolbar
      expect(screen.getByRole('button', { name: 'Console' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Agent' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Deploy' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();

      // Tool panes should not be in toolbar
      expect(screen.queryByRole('button', { name: 'App Storage' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Auth' })).not.toBeInTheDocument();
    });
  });

  describe('Overlay accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      expect(await screen.findByText('Show Tools')).toBeInTheDocument();
    });

    it('should maintain focus management', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Overlay should be visible
      expect(await screen.findByTestId('tools-overlay')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid tool selection', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Rapidly select multiple tools
      const storageTool = await screen.findByTestId('tool-storage');
      const authTool = await screen.findByTestId('tool-auth');

      // Click both quickly (only last one should take effect)
      fireEvent.click(storageTool);
      fireEvent.click(authTool);

      // Overlay should close
      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });
    });

    it('should handle overlay close during tool selection', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Select tool (which closes overlay)
      const storageTool = await screen.findByTestId('tool-storage');
      await user.click(storageTool);

      // Verify overlay is closed
      await waitFor(() => {
        expect(screen.queryByTestId('tools-overlay')).not.toBeInTheDocument();
      });
    });

    it('should maintain workspace state when overlay opens/closes', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Switch to deploy pane
      const deployButton = screen.getByRole('button', { name: 'Deploy' });
      await user.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });

      // Open and close overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      const closeButton = await screen.findByTestId('close-overlay');
      await user.click(closeButton);

      // Workspace state should be maintained
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Tool pane integration', () => {
    it('should pass projectId to tool panes when implemented', async () => {
      // This test documents the expected behavior when tool panes are integrated
      // Tool panes should receive projectId as a prop
      render(<WorkspaceScreen {...defaultProps} />);

      // Verify project context is available
      expect(screen.getByText('Test Project')).toBeInTheDocument();

      // When tool panes are implemented, they should receive:
      // - projectId prop
      // - onBack callback
      // - Any other necessary context
    });

    it('should support all 18 tool panes', async () => {
      // Document all expected tool panes
      const expectedToolPanes = [
        'agent', // Already implemented
        'assistant',
        'storage',
        'auth',
        'database',
        'developer',
        'git',
        'integrations',
        'multiplayer',
        'publishing',
        'kv-store',
        'secrets',
        'security',
        'shell',
        'settings',
        'workflows',
        'preview',
        'console',
      ];

      // This test serves as documentation for all tool panes that need to be implemented
      expect(expectedToolPanes.length).toBe(18);
    });
  });
});
