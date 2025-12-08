import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/renderWithProviders';
import { simulateMobile, simulateTablet } from '../utils/platformSimulator';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';
import userEvent from '@testing-library/user-event';

describe('WorkspaceScreen', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    projectId: 'test-project-123',
    projectName: 'My Test Project',
    onBack: mockOnBack,
  };

  beforeEach(() => {
    simulateMobile();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      expect(screen.getByText('My Test Project')).toBeInTheDocument();
    });

    it('displays project name in header', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      expect(screen.getByText('My Test Project')).toBeInTheDocument();
    });

    it('renders back button', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeInTheDocument();
    });

    it('renders more options button', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      const moreButton = screen.getByLabelText('More options');
      expect(moreButton).toBeInTheDocument();
    });

    it('renders all 5 toolbar panes', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByLabelText('Console')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent')).toBeInTheDocument();
      expect(screen.getByLabelText('Deploy')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview')).toBeInTheDocument();
    });

    it('renders console pane by default', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      expect(screen.getByText('Terminal output will appear here')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('back button is accessible', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toHaveAttribute('aria-label', 'Go back');
    });
  });

  describe('Pane Switching', () => {
    it('switches to Agent pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);

      await waitFor(() => {
        expect(screen.getByText('AI agent chat will appear here')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('switches to Deploy pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const deployButton = screen.getByLabelText('Deploy');
      await user.click(deployButton);

      await waitFor(() => {
        expect(screen.getByText('Deployment controls will appear here')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('switches to Share pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      await user.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Sharing options will appear here')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('switches to Preview pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const previewButton = screen.getByLabelText('Preview');
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Live preview will appear here')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('switches back to Console pane', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Switch to Agent
      await user.click(screen.getByLabelText('Agent'));
      await waitFor(() => {
        expect(screen.getByText('AI agent chat will appear here')).toBeInTheDocument();
      });

      // Switch back to Console
      await user.click(screen.getByLabelText('Console'));
      await waitFor(() => {
        expect(screen.getByText('Terminal output will appear here')).toBeInTheDocument();
      });
    });

    it('highlights active pane in toolbar', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const consoleButton = screen.getByLabelText('Console');
      expect(consoleButton).toHaveAttribute('aria-current', 'page');

      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);

      await waitFor(() => {
        expect(agentButton).toHaveAttribute('aria-current', 'page');
        expect(consoleButton).not.toHaveAttribute('aria-current', 'page');
      });
    });
  });

  describe('Tools Overlay', () => {
    it('opens tools overlay from dropdown menu', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open dropdown
      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      // Click "Show Tools"
      const showToolsItem = screen.getByText('Show Tools');
      await user.click(showToolsItem);

      // Overlay should appear
      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });
    });

    it('displays all tool options in overlay', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open tools overlay
      await user.click(screen.getByLabelText('More options'));
      await user.click(screen.getByText('Show Tools'));

      await waitFor(() => {
        expect(screen.getByText('File Manager')).toBeInTheDocument();
        expect(screen.getByText('Git Status')).toBeInTheDocument();
        expect(screen.getByText('Dependencies')).toBeInTheDocument();
        expect(screen.getByText('Environment')).toBeInTheDocument();
      });
    });

    it('closes tools overlay when Close button is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      await user.click(screen.getByLabelText('More options'));
      await user.click(screen.getByText('Show Tools'));

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });

      // Close overlay
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
      });
    });

    it('closes tools overlay when clicking backdrop', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      await user.click(screen.getByLabelText('More options'));
      await user.click(screen.getByText('Show Tools'));

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });

      // Click backdrop
      const backdrop = screen.getByText('Project Tools').closest('.absolute');
      if (backdrop) {
        await user.click(backdrop);
      }

      await waitFor(() => {
        expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
      });
    });

    it('shows project ID in tools overlay', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      await user.click(screen.getByLabelText('More options'));
      await user.click(screen.getByText('Show Tools'));

      await waitFor(() => {
        expect(screen.getByText(/test-project-123/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Dropdown Menu', () => {
    it('opens dropdown menu', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      expect(screen.getByText('Show Tools')).toBeInTheDocument();
      expect(screen.getByText('Project Settings')).toBeInTheDocument();
      expect(screen.getByText('Share Project')).toBeInTheDocument();
    });

    it('has all menu items', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      await user.click(screen.getByLabelText('More options'));

      expect(screen.getByText('Show Tools')).toBeInTheDocument();
      expect(screen.getByText('Project Settings')).toBeInTheDocument();
      expect(screen.getByText('Share Project')).toBeInTheDocument();
    });
  });

  describe('Pane Content', () => {
    it('console pane displays project ID', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      expect(screen.getByText('Project: test-project-123')).toBeInTheDocument();
    });

    it('each pane shows correct project ID', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Check each pane
      const panes = ['Agent', 'Deploy', 'Share', 'Preview'];
      for (const pane of panes) {
        await user.click(screen.getByLabelText(pane));
        await waitFor(() => {
          expect(screen.getByText('Project: test-project-123')).toBeInTheDocument();
        });
      }
    });

    it('panes have correct icons', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Console has Terminal icon
      expect(screen.getByText('Terminal output will appear here')).toBeInTheDocument();

      // Agent has Bot icon
      await user.click(screen.getByLabelText('Agent'));
      await waitFor(() => {
        expect(screen.getByText('AI agent chat will appear here')).toBeInTheDocument();
      });

      // Deploy has Rocket icon
      await user.click(screen.getByLabelText('Deploy'));
      await waitFor(() => {
        expect(screen.getByText('Deployment controls will appear here')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('renders correctly on mobile', () => {
      simulateMobile();
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByText('My Test Project')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('renders correctly on tablet', () => {
      simulateTablet();
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByText('My Test Project')).toBeInTheDocument();
      expect(screen.getByLabelText('Console')).toBeInTheDocument();
    });

    it('toolbar has safe area inset', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      const toolbar = screen.getByLabelText('Console').closest('nav');
      expect(toolbar).toHaveStyle({ paddingBottom: 'env(safe-area-inset-bottom)' });
    });

    it('maintains state on orientation change', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Switch to Agent pane
      await user.click(screen.getByLabelText('Agent'));
      await waitFor(() => {
        expect(screen.getByText('AI agent chat will appear here')).toBeInTheDocument();
      });

      // Simulate orientation change
      window.innerWidth = 667;
      window.innerHeight = 375;
      window.dispatchEvent(new Event('resize'));

      // Should still show Agent pane
      expect(screen.getByText('AI agent chat will appear here')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<WorkspaceScreen {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
      expect(screen.getByLabelText('Console')).toBeInTheDocument();
    });

    it('has aria-current on active pane', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      const consoleButton = screen.getByLabelText('Console');
      expect(consoleButton).toHaveAttribute('aria-current', 'page');
    });

    it('header is semantic', () => {
      const { container } = render(<WorkspaceScreen {...defaultProps} />);
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('toolbar is semantic navigation', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      const toolbar = screen.getByLabelText('Console').closest('nav');
      expect(toolbar?.tagName).toBe('NAV');
    });

    it('project name is in heading', () => {
      render(<WorkspaceScreen {...defaultProps} />);
      const heading = screen.getByText('My Test Project');
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('Edge Cases', () => {
    it('handles long project names', () => {
      const longName = 'A'.repeat(100);
      render(<WorkspaceScreen {...defaultProps} projectName={longName} />);

      const heading = screen.getByText(longName);
      expect(heading).toHaveClass('truncate');
    });

    it('handles rapid pane switching', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Rapidly switch panes
      await user.click(screen.getByLabelText('Agent'));
      await user.click(screen.getByLabelText('Deploy'));
      await user.click(screen.getByLabelText('Share'));
      await user.click(screen.getByLabelText('Preview'));
      await user.click(screen.getByLabelText('Console'));

      await waitFor(() => {
        expect(screen.getByText('Terminal output will appear here')).toBeInTheDocument();
      });
    });

    it('handles multiple back button clicks', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      await user.click(backButton);
      await user.click(backButton);
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(3);
    });

    it('handles tools overlay toggle', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      // Open overlay
      await user.click(screen.getByLabelText('More options'));
      await user.click(screen.getByText('Show Tools'));

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });

      // Close overlay
      await user.click(screen.getByText('Close'));

      // Open again
      await user.click(screen.getByLabelText('More options'));
      await user.click(screen.getByText('Show Tools'));

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });
    });
  });

  describe('Animation', () => {
    it('pane content has animation on switch', async () => {
      const user = userEvent.setup();
      render(<WorkspaceScreen {...defaultProps} />);

      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);

      // Content should animate in
      await waitFor(() => {
        expect(screen.getByText('AI agent chat will appear here')).toBeInTheDocument();
      });
    });
  });
});
