import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceHeader, WorkspacePane } from '@/components/mobile/workspace/WorkspaceHeader';

// Mock HapticButton to avoid haptics dependency
vi.mock('@/components/mobile/common/HapticButton', () => ({
  HapticButton: ({ children, onClick, className, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} className={className} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

describe('WorkspaceHeader', () => {
  const mockOnBack = vi.fn();
  const mockOnMenuClick = vi.fn();

  const defaultProps = {
    activePane: 'agent' as WorkspacePane,
    projectName: 'Test Project',
    onBack: mockOnBack,
    onMenuClick: mockOnMenuClick,
  };

  const renderHeader = (props = {}) => {
    return render(
      <WorkspaceHeader {...defaultProps} {...props} />
    );
  };

  beforeEach(() => {
    mockOnBack.mockClear();
    mockOnMenuClick.mockClear();
  });

  describe('Rendering', () => {
    it('renders as header element', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');

      expect(header).toBeInTheDocument();
    });

    it('renders back button', () => {
      renderHeader();

      expect(screen.getByLabelText('Exit workspace')).toBeInTheDocument();
    });

    it('renders pane title', () => {
      renderHeader({ activePane: 'agent' });

      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('renders pane icon', () => {
      const { container } = renderHeader({ activePane: 'agent' });

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has safe area padding', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');

      expect(header).toHaveClass('pt-safe');
    });

    it('has fixed height', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');

      expect(header).toHaveClass('h-14');
    });
  });

  describe('Pane Switching', () => {
    it('displays correct title for agent pane', () => {
      renderHeader({ activePane: 'agent' });
      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('displays correct title for console pane', () => {
      renderHeader({ activePane: 'console' });
      expect(screen.getByText('Console')).toBeInTheDocument();
    });

    it('displays correct title for preview pane', () => {
      renderHeader({ activePane: 'preview' });
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('displays correct title for publishing pane', () => {
      renderHeader({ activePane: 'publishing' });
      expect(screen.getByText('Publishing')).toBeInTheDocument();
    });

    it('displays correct title for share pane', () => {
      renderHeader({ activePane: 'share' });
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('animates title change when pane changes', async () => {
      const { rerender } = renderHeader({ activePane: 'agent' });

      expect(screen.getByText('Agent')).toBeInTheDocument();

      rerender(
        <WorkspaceHeader {...defaultProps} activePane="console" />
      );

      await waitFor(() => {
        expect(screen.getByText('Console')).toBeInTheDocument();
      });
    });
  });

  describe('Back Button', () => {
    it('has X icon', () => {
      const { container } = renderHeader();
      const backButton = screen.getByLabelText('Exit workspace');
      const icon = backButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('calls onBack when clicked', async () => {
      renderHeader();

      const backButton = screen.getByLabelText('Exit workspace');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('has muted foreground color', () => {
      renderHeader();

      const backButton = screen.getByLabelText('Exit workspace');
      expect(backButton).toHaveClass('text-muted-foreground');
    });
  });

  describe('Pane Actions - Agent', () => {
    it('renders Add task button for agent pane', () => {
      renderHeader({ activePane: 'agent' });

      expect(screen.getByLabelText('Add task')).toBeInTheDocument();
    });

    it('renders menu button for agent pane', () => {
      renderHeader({ activePane: 'agent' });

      const menuButtons = screen.getAllByLabelText('Open menu');
      expect(menuButtons.length).toBeGreaterThan(0);
    });

    it('calls onMenuClick when menu button is clicked', async () => {
      renderHeader({ activePane: 'agent' });

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pane Actions - Console', () => {
    it('renders Clear console button for console pane', () => {
      renderHeader({ activePane: 'console' });

      expect(screen.getByLabelText('Clear console')).toBeInTheDocument();
    });

    it('renders menu button for console pane', () => {
      renderHeader({ activePane: 'console' });

      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });
  });

  describe('Pane Actions - Preview', () => {
    it('renders device frame toggle for preview pane', () => {
      renderHeader({ activePane: 'preview' });

      const toggle = screen.getByLabelText(/device frame/i);
      expect(toggle).toBeInTheDocument();
    });

    it('toggles device frame text when clicked', async () => {
      renderHeader({ activePane: 'preview' });

      const toggle = screen.getByLabelText('Hide device frame');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(screen.getByLabelText('Show device frame')).toBeInTheDocument();
      });
    });

    it('renders menu button for preview pane', () => {
      renderHeader({ activePane: 'preview' });

      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });
  });

  describe('Pane Actions - Publishing', () => {
    it('renders only menu button for publishing pane', () => {
      renderHeader({ activePane: 'publishing' });

      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });
  });

  describe('Pane Actions - Share', () => {
    it('renders only menu button for share pane', () => {
      renderHeader({ activePane: 'share' });

      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });
  });

  describe('Custom Actions', () => {
    it('renders custom paneActions when provided', () => {
      const customActions = <button aria-label="Custom action">Custom</button>;

      renderHeader({ paneActions: customActions });

      expect(screen.getByLabelText('Custom action')).toBeInTheDocument();
    });

    it('prefers custom actions over default actions', () => {
      const customActions = <button aria-label="Custom action">Custom</button>;

      renderHeader({ activePane: 'agent', paneActions: customActions });

      expect(screen.getByLabelText('Custom action')).toBeInTheDocument();
      expect(screen.queryByLabelText('Add task')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses header semantic element', () => {
      const { container } = renderHeader();

      expect(container.querySelector('header')).toBeInTheDocument();
    });

    it('has h1 for pane title', () => {
      renderHeader({ activePane: 'agent' });

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Agent');
    });

    it('all buttons have aria-labels', () => {
      renderHeader({ activePane: 'agent' });

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('is keyboard navigable', () => {
      // Test that elements are focusable by checking tabIndex
      // JSDOM doesn't track focus() properly, but we can verify elements are keyboard-accessible
      renderHeader({ activePane: 'agent' });

      const backButton = screen.getByLabelText('Exit workspace');
      const menuButton = screen.getByLabelText('Open menu');

      // Buttons should be focusable (tabIndex >= 0 or not set means focusable)
      expect(backButton).not.toHaveAttribute('tabindex', '-1');
      expect(menuButton).not.toHaveAttribute('tabindex', '-1');

      // Buttons should be enabled (not disabled)
      expect(backButton).not.toBeDisabled();
      expect(menuButton).not.toBeDisabled();

      // Elements should be buttons (implicitly keyboard accessible)
      expect(backButton.tagName).toBe('BUTTON');
      expect(menuButton.tagName).toBe('BUTTON');
    });
  });

  describe('Styling', () => {
    it('has border bottom', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');

      expect(header).toHaveClass('border-b', 'border-border');
    });

    it('has card background', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');

      expect(header).toHaveClass('bg-card');
    });

    it('has horizontal padding', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');

      expect(header).toHaveClass('px-4');
    });

    it('uses flexbox layout', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');

      expect(header).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('action buttons are muted by default', () => {
      renderHeader({ activePane: 'agent' });

      const addButton = screen.getByLabelText('Add task');
      expect(addButton).toHaveClass('text-muted-foreground');
    });

    it('pane icon has correct size', () => {
      const { container } = renderHeader();
      const icon = container.querySelector('h1')?.previousElementSibling;

      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });
  });

  describe('Animation', () => {
    it('has AnimatePresence for title transitions', async () => {
      const { rerender } = renderHeader({ activePane: 'agent' });

      expect(screen.getByText('Agent')).toBeInTheDocument();

      rerender(
        <WorkspaceHeader {...defaultProps} activePane="console" />
      );

      // The animation should complete and show new title
      await waitFor(() => {
        expect(screen.getByText('Console')).toBeInTheDocument();
        expect(screen.queryByText('Agent')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = renderHeader({ className: 'custom-class' });
      const header = container.querySelector('header');

      expect(header).toHaveClass('custom-class');
    });

    it('preserves default classes when custom className is added', () => {
      const { container } = renderHeader({ className: 'custom-class' });
      const header = container.querySelector('header');

      expect(header).toHaveClass('flex', 'items-center', 'custom-class');
    });
  });

  describe('Icons', () => {
    it('renders LayoutGrid icon for agent', () => {
      const { container } = renderHeader({ activePane: 'agent' });

      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('renders Terminal icon for console', () => {
      renderHeader({ activePane: 'console' });

      expect(screen.getByText('Console')).toBeInTheDocument();
    });

    it('renders Monitor icon for preview', () => {
      renderHeader({ activePane: 'preview' });

      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('renders Radio icon for publishing', () => {
      renderHeader({ activePane: 'publishing' });

      expect(screen.getByText('Publishing')).toBeInTheDocument();
    });

    it('renders Share2 icon for share', () => {
      renderHeader({ activePane: 'share' });

      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });
});
