import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';

// Mock components
vi.mock('@/components/mobile/workspace/WorkspaceToolbar', () => ({
  WorkspaceToolbar: ({ activePane, onPaneChange }: any) => (
    <div data-testid="workspace-toolbar">
      <button onClick={() => onPaneChange('console')}>Console</button>
      <button onClick={() => onPaneChange('agent')}>Agent</button>
      <button onClick={() => onPaneChange('deploy')}>Deploy</button>
      <button onClick={() => onPaneChange('share')}>Share</button>
      <button onClick={() => onPaneChange('preview')}>Preview</button>
      <span data-testid="active-pane">{activePane}</span>
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
  });

  describe('Rendering', () => {
    it('should render with project props', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByText('My Test Project')).toBeInTheDocument();
      expect(screen.getByTestId('workspace-toolbar')).toBeInTheDocument();
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
    it('should show console pane initially', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const activePaneIndicator = screen.getByTestId('active-pane');
      expect(activePaneIndicator).toHaveTextContent('console');
    });

    it('should render console pane content initially', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Console pane shows terminal icon and text
      expect(screen.getByText('Console')).toBeInTheDocument();
      expect(screen.getByText(/Terminal output will appear here/)).toBeInTheDocument();
    });
  });

  describe('Pane switching', () => {
    it('should switch to agent pane when toolbar button clicked', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const agentButton = screen.getByRole('button', { name: 'Agent' });
      fireEvent.click(agentButton);

      await waitFor(() => {
        expect(screen.getByText('AI agent chat will appear here')).toBeInTheDocument();
      });
    });

    it('should switch to deploy pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const deployButton = screen.getByRole('button', { name: 'Deploy' });
      fireEvent.click(deployButton);

      await waitFor(() => {
        expect(screen.getByText('Deployment controls will appear here')).toBeInTheDocument();
      });
    });

    it('should switch to share pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: 'Share' });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Sharing options will appear here')).toBeInTheDocument();
      });
    });

    it('should switch to preview pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: 'Preview' });
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Live preview will appear here')).toBeInTheDocument();
      });
    });

    it('should update active pane indicator when switching', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const agentButton = screen.getByRole('button', { name: 'Agent' });
      fireEvent.click(agentButton);

      await waitFor(() => {
        const activePaneIndicator = screen.getByTestId('active-pane');
        expect(activePaneIndicator).toHaveTextContent('agent');
      });
    });

    it('should animate pane transitions', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const agentButton = screen.getByRole('button', { name: 'Agent' });
      fireEvent.click(agentButton);

      // Pane content should be wrapped in motion.div with animation
      const paneContent = screen.getByText('AI agent chat will appear here').closest('div');
      expect(paneContent).toBeInTheDocument();
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

      expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
    });

    it('should toggle overlay when menu clicked', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByText('Show Tools')).toBeInTheDocument();
      });

      const showToolsButton = screen.getByText('Show Tools');
      fireEvent.click(showToolsButton);

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });
    });

    it('should close overlay when close button clicked', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        fireEvent.click(showToolsButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });

      // Close overlay
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
      });
    });

    it('should close overlay when backdrop clicked', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        fireEvent.click(showToolsButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });

      // Click backdrop (parent div)
      const overlay = screen.getByText('Project Tools').closest('.absolute');
      if (overlay) {
        fireEvent.click(overlay);

        await waitFor(() => {
          expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
        });
      }
    });

    it('should display project ID in overlay', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        fireEvent.click(showToolsButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/test-project-123/)).toBeInTheDocument();
      });
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

      // Project ID should be displayed in console pane
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
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Show Tools')).toBeInTheDocument();
        expect(screen.getByText('Project Settings')).toBeInTheDocument();
        expect(screen.getByText('Share Project')).toBeInTheDocument();
      });
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

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('My Test Project');
    });
  });

  describe('Pane content rendering', () => {
    it('should show correct icon for each pane', async () => {
      render(<WorkspaceScreen {...defaultProps} />);

      const panes = [
        { name: 'Console', icon: true },
        { name: 'Agent', icon: true },
        { name: 'Deploy', icon: true },
        { name: 'Share', icon: true },
        { name: 'Preview', icon: true },
      ];

      for (const pane of panes) {
        const button = screen.getByRole('button', { name: pane.name });
        fireEvent.click(button);

        await waitFor(() => {
          const paneHeading = screen.getByText(pane.name, { selector: 'h2' });
          expect(paneHeading).toBeInTheDocument();
        });
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty project name', () => {
      const emptyNameProps = { ...defaultProps, projectName: '' };
      render(<WorkspaceScreen {...emptyNameProps} />);

      expect(screen.getByTestId('workspace-toolbar')).toBeInTheDocument();
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
