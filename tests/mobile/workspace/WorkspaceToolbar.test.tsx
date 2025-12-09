import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceToolbar } from '@/components/mobile/workspace/WorkspaceToolbar';
import type { WorkspacePane } from '@/components/mobile/workspace/WorkspaceToolbar';

// Mock haptics hook
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    selection: vi.fn(),
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
  }),
}));

describe('WorkspaceToolbar', () => {
  const mockOnPaneChange = vi.fn();
  const mockOnStop = vi.fn();

  const defaultProps = {
    activePane: 'console' as WorkspacePane,
    onPaneChange: mockOnPaneChange,
    onStop: mockOnStop,
    isAgentRunning: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all 6 icons', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      // Stop + 5 pane buttons = 6 buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });

    it('should render stop button', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const stopButton = screen.getByLabelText('Stop agent');
      expect(stopButton).toBeInTheDocument();
    });

    it('should render all pane buttons', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      expect(screen.getByLabelText('Console')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent')).toBeInTheDocument();
      expect(screen.getByLabelText('Deploy')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview')).toBeInTheDocument();
    });

    it('should render button labels', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.getByText('Console')).toBeInTheDocument();
      expect(screen.getByText('Agent')).toBeInTheDocument();
      expect(screen.getByText('Deploy')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('should have proper toolbar layout', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} />);

      const toolbar = container.querySelector('nav');
      expect(toolbar).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0');
      expect(toolbar).toHaveClass('flex', 'items-center');
    });

    it('should apply safe area padding', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} />);

      const toolbar = container.querySelector('nav');
      expect(toolbar).toHaveStyle({ paddingBottom: 'env(safe-area-inset-bottom)' });
    });
  });

  describe('Active state', () => {
    it('should highlight console when active', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="console" />);

      const consoleButton = screen.getByLabelText('Console');
      expect(consoleButton).toHaveClass('text-white');
      expect(consoleButton).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight agent when active', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="agent" />);

      const agentButton = screen.getByLabelText('Agent');
      expect(agentButton).toHaveClass('text-white');
    });

    it('should show blue indicator on active pane', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} activePane="console" />);

      const consoleButton = screen.getByLabelText('Console');
      const indicator = consoleButton.querySelector('.bg-blue-500');

      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('h-0.5', 'rounded-full');
    });

    it('should not show indicator on inactive panes', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="console" />);

      const agentButton = screen.getByLabelText('Agent');
      const indicator = agentButton.querySelector('.bg-blue-500');

      expect(indicator).not.toBeInTheDocument();
    });

    it('should apply muted text to inactive buttons', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="console" />);

      const agentButton = screen.getByLabelText('Agent');
      expect(agentButton).toHaveClass('text-zinc-400');
    });
  });

  describe('Click handlers', () => {
    it('should call onPaneChange when console clicked', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const consoleButton = screen.getByLabelText('Console');
      fireEvent.click(consoleButton);

      expect(mockOnPaneChange).toHaveBeenCalledTimes(1);
      expect(mockOnPaneChange).toHaveBeenCalledWith('console');
    });

    it('should call onPaneChange when agent clicked', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const agentButton = screen.getByLabelText('Agent');
      fireEvent.click(agentButton);

      expect(mockOnPaneChange).toHaveBeenCalledWith('agent');
    });

    it('should call onPaneChange with correct pane for all buttons', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const panes: Array<{ label: string; id: WorkspacePane }> = [
        { label: 'Console', id: 'console' },
        { label: 'Agent', id: 'agent' },
        { label: 'Deploy', id: 'deploy' },
        { label: 'Share', id: 'share' },
        { label: 'Preview', id: 'preview' },
      ];

      panes.forEach(({ label, id }) => {
        const button = screen.getByLabelText(label);
        fireEvent.click(button);

        expect(mockOnPaneChange).toHaveBeenCalledWith(id);
      });

      expect(mockOnPaneChange).toHaveBeenCalledTimes(5);
    });

    it('should call onStop when stop button clicked', () => {
      render(<WorkspaceToolbar {...defaultProps} isAgentRunning={true} />);

      const stopButton = screen.getByLabelText('Stop agent');
      fireEvent.click(stopButton);

      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('Stop button states', () => {
    it('should be disabled when agent not running', () => {
      render(<WorkspaceToolbar {...defaultProps} isAgentRunning={false} />);

      const stopButton = screen.getByLabelText('Stop agent');
      expect(stopButton).toBeDisabled();
      expect(stopButton).toHaveClass('text-zinc-700', 'cursor-not-allowed');
    });

    it('should be enabled when agent running', () => {
      render(<WorkspaceToolbar {...defaultProps} isAgentRunning={true} />);

      const stopButton = screen.getByLabelText('Stop agent');
      expect(stopButton).not.toBeDisabled();
      expect(stopButton).toHaveClass('text-red-400');
    });

    it('should show filled square icon when agent running', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} isAgentRunning={true} />);

      const stopButton = screen.getByLabelText('Stop agent');
      const icon = stopButton.querySelector('svg');

      expect(icon).toHaveAttribute('fill', 'currentColor');
    });

    it('should show unfilled square icon when agent not running', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} isAgentRunning={false} />);

      const stopButton = screen.getByLabelText('Stop agent');
      const icon = stopButton.querySelector('svg');

      expect(icon).toHaveAttribute('fill', 'none');
    });

    it('should not call onStop when disabled', () => {
      render(<WorkspaceToolbar {...defaultProps} isAgentRunning={false} />);

      const stopButton = screen.getByLabelText('Stop agent');
      fireEvent.click(stopButton);

      expect(mockOnStop).not.toHaveBeenCalled();
    });
  });

  describe('Button styling', () => {
    it('should have proper touch target size', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
      });
    });

    it('should have flex layout for buttons', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
      });
    });

    it('should have equal flex for all buttons', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('flex-1');
      });
    });

    it('should have hover states for inactive buttons', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="console" />);

      const agentButton = screen.getByLabelText('Agent');
      expect(agentButton).toHaveClass('hover:text-zinc-300');
    });

    it('should have active press states', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole('button').slice(1); // Skip stop button
      buttons.forEach((button) => {
        // Verify the button has transition classes
        expect(button.className).toContain('transition-all');
      });
    });
  });

  describe('Icons', () => {
    it('should render correct icon for each pane', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      // Check that each button has an SVG icon
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const icon = button.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });

    it('should have consistent icon size', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const icon = button.querySelector('svg');
        expect(icon).toHaveAttribute('width', '20');
        expect(icon).toHaveAttribute('height', '20');
      });
    });
  });

  describe('Label styling', () => {
    it('should have consistent label size', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const labels = screen
        .getAllByRole('button')
        .map((btn) => btn.querySelector('span'))
        .filter(Boolean);

      labels.forEach((label) => {
        expect(label).toHaveClass('text-[10px]', 'font-medium');
      });
    });

    it('should have spacing between icon and label', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const labels = screen
        .getAllByRole('button')
        .map((btn) => btn.querySelector('span'))
        .filter(Boolean);

      labels.forEach((label) => {
        expect(label).toHaveClass('mt-0.5');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      expect(screen.getByLabelText('Stop agent')).toBeInTheDocument();
      expect(screen.getByLabelText('Console')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent')).toBeInTheDocument();
      expect(screen.getByLabelText('Deploy')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview')).toBeInTheDocument();
    });

    it('should mark active pane with aria-current', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="agent" />);

      const agentButton = screen.getByLabelText('Agent');
      expect(agentButton).toHaveAttribute('aria-current', 'page');
    });

    it('should not mark inactive panes with aria-current', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="agent" />);

      const consoleButton = screen.getByLabelText('Console');
      expect(consoleButton).not.toHaveAttribute('aria-current');
    });

    it('should have semantic nav element', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should be fixed at bottom', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} />);

      const toolbar = container.querySelector('nav');
      expect(toolbar).toHaveClass('fixed', 'bottom-0');
    });

    it('should span full width', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} />);

      const toolbar = container.querySelector('nav');
      expect(toolbar).toHaveClass('left-0', 'right-0');
    });

    it('should have proper background', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} />);

      const toolbar = container.querySelector('nav');
      expect(toolbar).toHaveClass('bg-zinc-900');
    });

    it('should have top border', () => {
      const { container } = render(<WorkspaceToolbar {...defaultProps} />);

      const toolbar = container.querySelector('nav');
      expect(toolbar).toHaveClass('border-t', 'border-zinc-800');
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid pane changes', () => {
      render(<WorkspaceToolbar {...defaultProps} />);

      const consoleButton = screen.getByLabelText('Console');
      const agentButton = screen.getByLabelText('Agent');

      fireEvent.click(consoleButton);
      fireEvent.click(agentButton);
      fireEvent.click(consoleButton);
      fireEvent.click(agentButton);

      expect(mockOnPaneChange).toHaveBeenCalledTimes(4);
    });

    it('should handle clicking active pane', () => {
      render(<WorkspaceToolbar {...defaultProps} activePane="console" />);

      const consoleButton = screen.getByLabelText('Console');
      fireEvent.click(consoleButton);

      expect(mockOnPaneChange).toHaveBeenCalledWith('console');
    });
  });
});
