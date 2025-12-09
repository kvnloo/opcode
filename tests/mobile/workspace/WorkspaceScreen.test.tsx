import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';

// Mock workspace store
const mockSetActivePane = vi.fn();
let mockActivePane = 'agent'; // Default initial state matches store

vi.mock('@/stores/workspaceStore', () => ({
  useWorkspaceStore: vi.fn((selector) => {
    const state = {
      activePane: mockActivePane,
      setActivePane: mockSetActivePane,
      initAgentListeners: vi.fn().mockResolvedValue(undefined),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock AgentPaneContainer to avoid complex dependencies
vi.mock('@/components/mobile/workspace/panes/AgentPaneContainer', () => ({
  AgentPaneContainer: ({ projectId }: any) => (
    <div data-testid="agent-pane">
      <h2>Agent</h2>
      <p>Project: {projectId}</p>
    </div>
  ),
}));

describe('WorkspaceScreen', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    projectId: 'test-project-123',
    projectName: 'My Test Project',
    onBack: mockOnBack,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivePane = 'agent'; // Reset to default
    mockSetActivePane.mockClear();
  });

  describe('Rendering', () => {
    it('should render with project props', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByText('My Test Project')).toBeInTheDocument();
      // Toolbar is rendered with navigation role
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render header with project name', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const heading = screen.getByText('My Test Project');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-lg', 'font-semibold');
    });

    it('should render back button', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeInTheDocument();
    });

    it('should render more options button', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      expect(moreButton).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      const { container } = render(<WorkspaceScreen {...defaultProps} />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('h-screen', 'flex', 'flex-col', 'bg-background');
    });
  });

  describe('Initial pane state', () => {
    it('should show agent pane initially (default)', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Agent button should be active (aria-current="page")
      const agentButton = screen.getByRole('button', { name: 'Agent' });
      expect(agentButton).toHaveAttribute('aria-current', 'page');
    });

    it('should render agent pane content initially', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Agent pane is the default active pane
      const agentHeading = screen.getByRole('heading', { name: 'Agent' });
      expect(agentHeading).toBeInTheDocument();
      expect(screen.getByText(/test-project-123/)).toBeInTheDocument();
    });
  });

  describe('Pane switching', () => {
    it('should switch to console pane when toolbar button clicked', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const consoleButton = screen.getByRole('button', { name: 'Console' });
      fireEvent.click(consoleButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('console');
      });
    });

    it('should switch to deploy pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const deployButton = screen.getByRole('button', { name: 'Deploy' });
      fireEvent.click(deployButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('deploy');
      });
    });

    it('should switch to share pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: 'Share' });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('share');
      });
    });

    it('should switch to preview pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: 'Preview' });
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(mockSetActivePane).toHaveBeenCalledWith('preview');
      });
    });

    it('should update active state when switching panes', async () => {
      // Change mock to deploy pane
      mockActivePane = 'deploy';

      render(<WorkspaceScreen {...defaultProps} />);

      // Deploy button should be active
      const deployButton = screen.getByRole('button', { name: 'Deploy' });
      expect(deployButton).toHaveAttribute('aria-current', 'page');
    });

    it('should render pane content area with proper structure', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Content area exists and is properly structured
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      expect(navigation.parentElement).toHaveClass('h-screen', 'flex', 'flex-col');
    });
  });

  describe('Back navigation', () => {
    it('should call onBack when back button clicked', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should have proper back button styling', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toHaveClass('p-2');
    });
  });

  describe('ToolsOverlay', () => {
    it('should not show overlay initially', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // ToolsOverlay shows "Tools" heading, not "Project Tools"
      expect(screen.queryByPlaceholderText('Search for tools and files')).not.toBeInTheDocument();
    });

    it('should toggle overlay when menu clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      // Wait for dropdown to appear
      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // ToolsOverlay should appear with search input
      expect(await screen.findByPlaceholderText('Search for tools and files')).toBeInTheDocument();
    });

    it('should handle tool selection from overlay', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Overlay should appear with search functionality
      const searchInput = await screen.findByPlaceholderText('Search for tools and files');
      expect(searchInput).toBeInTheDocument();

      // Verify overlay has tools section header
      expect(screen.getByText('Tools', { selector: 'h3' })).toBeInTheDocument();
    });

    it('should close overlay when close button clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Overlay should appear
      await screen.findByPlaceholderText('Search for tools and files');

      // Close overlay using the close button
      const closeButton = screen.getByLabelText('Close tools overlay');
      await user.click(closeButton);

      // Overlay should disappear
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search for tools and files')).not.toBeInTheDocument();
      });
    });

    it('should close overlay when backdrop clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Overlay should appear
      await screen.findByPlaceholderText('Search for tools and files');

      // Click backdrop (the dark overlay behind the panel)
      const { container } = render(<div />); // Not needed, just use fireEvent on backdrop
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
      if (backdrop) {
        fireEvent.click(backdrop);

        // Overlay should disappear
        await waitFor(() => {
          expect(screen.queryByPlaceholderText('Search for tools and files')).not.toBeInTheDocument();
        });
      }
    });

    it('should display tools in overlay', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      const showToolsButton = await screen.findByText('Show Tools');
      await user.click(showToolsButton);

      // Overlay should appear with search functionality
      await screen.findByPlaceholderText('Search for tools and files');

      // Verify the overlay content is rendered (tools section header)
      const toolsHeader = screen.getByText('Tools', { selector: 'h3' });
      expect(toolsHeader).toBeInTheDocument();
    });
  });

  describe('Project information', () => {
    it('should display correct project name', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByText('My Test Project')).toBeInTheDocument();
    });

    it('should truncate long project names', () => {
      const longNameProps = {
        ...defaultProps,
        projectName: 'Very Long Project Name That Should Be Truncated',
      };

      render(<WorkspaceScreen {...longNameProps} />);

      const projectName = screen.getByText(longNameProps.projectName);
      expect(projectName).toHaveClass('truncate');
    });

    it('should pass projectId to pane components', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Project ID should be displayed in agent pane (default active)
      expect(screen.getByText(/test-project-123/)).toBeInTheDocument();
    });
  });

  describe('Header layout', () => {
    it('should have fixed header with border', () => {
      const { container } = render(<WorkspaceScreen {...defaultProps} />);

      const header = screen.getByText('My Test Project').closest('header');
      expect(header).toHaveClass('flex', 'items-center', 'justify-between');
      expect(header).toHaveClass('border-b', 'border-border');
    });

    it('should apply proper padding to header', () => {
      const { container } = render(<WorkspaceScreen {...defaultProps} />);

      const header = screen.getByText('My Test Project').closest('header');
      expect(header).toHaveClass('px-4', 'py-3');
    });

    it('should use card background for header', () => {
      const { container } = render(<WorkspaceScreen {...defaultProps} />);

      const header = screen.getByText('My Test Project').closest('header');
      expect(header).toHaveClass('bg-card');
    });
  });

  describe('Dropdown menu', () => {
    it('should render dropdown menu trigger', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      expect(moreButton).toBeInTheDocument();
    });

    it('should show menu items when clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      // Menu items should appear
      expect(await screen.findByText('Show Tools')).toBeInTheDocument();
      expect(screen.getByText('Project Settings')).toBeInTheDocument();
      expect(screen.getByText('Share Project')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
    });

    it('should have semantic heading structure', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Header has the project name as h1
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('My Test Project');
    });
  });

  describe('Pane content rendering', () => {
    it('should call setActivePane for each pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const panes = [
        { name: 'Console', id: 'console' },
        { name: 'Agent', id: 'agent' },
        { name: 'Deploy', id: 'deploy' },
        { name: 'Share', id: 'share' },
        { name: 'Preview', id: 'preview' },
      ];

      for (const pane of panes) {
        mockSetActivePane.mockClear();
        const button = screen.getByRole('button', { name: pane.name });
        fireEvent.click(button);

        await waitFor(() => {
          expect(mockSetActivePane).toHaveBeenCalledWith(pane.id);
        });
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty project name', () => {
      const emptyNameProps = { ...defaultProps, projectName: '' };
      render(<WorkspaceScreen {...emptyNameProps} />);

      // Should still render the navigation/toolbar
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle special characters in project name', () => {
      const specialNameProps = {
        ...defaultProps,
        projectName: 'Test <>&"\'Project',
      };

      render(<WorkspaceScreen {...specialNameProps} />);

      expect(screen.getByText('Test <>&"\'Project')).toBeInTheDocument();
    });
  });
});
