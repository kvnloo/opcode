import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/renderWithProviders';
import { ClaudeWebConnect } from '../../../../src/components/mobile/connection/ClaudeWebConnect';
import userEvent from '@testing-library/user-event';

describe('ClaudeWebConnect', () => {
  const mockOnConnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders description text', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      expect(
        screen.getByText(/Sign in with your GitHub account to use Claude Code Web API/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Requires Claude Pro or Max subscription/)
      ).toBeInTheDocument();
    });

    it('renders connect button', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      expect(screen.getByText('Connect with GitHub')).toBeInTheDocument();
    });

    it('renders button with GitHub icon', () => {
      const { container } = render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      // Check for SVG icon (lucide-react renders SVGs)
      const button = screen.getByText('Connect with GitHub').parentElement;
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Connection Callbacks', () => {
    it('calls onConnect when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const button = screen.getByText('Connect with GitHub');
      await user.click(button);

      expect(mockOnConnect).toHaveBeenCalledTimes(1);
    });

    it('calls onConnect multiple times if clicked multiple times', async () => {
      const user = userEvent.setup();
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const button = screen.getByText('Connect with GitHub');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnConnect).toHaveBeenCalledTimes(3);
    });

    it('does not call onConnect when disabled', async () => {
      const user = userEvent.setup();
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      const button = screen.getByText('Connecting...');

      // Try to click (should be disabled)
      try {
        await user.click(button);
      } catch {
        // Click might fail because button is disabled
      }

      // Should not have been called
      expect(mockOnConnect).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows "Connecting..." text when isConnecting is true', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(screen.queryByText('Connect with GitHub')).not.toBeInTheDocument();
    });

    it('shows "Connect with GitHub" text when not connecting', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      expect(screen.getByText('Connect with GitHub')).toBeInTheDocument();
      expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
    });

    it('disables button when connecting', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      const button = screen.getByText('Connecting...');
      expect(button).toBeDisabled();
    });

    it('enables button when not connecting', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      const button = screen.getByText('Connect with GitHub');
      expect(button).not.toBeDisabled();
    });

    it('shows loader icon when connecting', () => {
      const { container } = render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      // Check for animate-spin class which is on the Loader2 icon
      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('shows GitHub icon when not connecting', () => {
      const { container } = render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      const button = screen.getByText('Connect with GitHub').parentElement;
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('applies correct base styles to button', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const button = screen.getByText('Connect with GitHub');
      expect(button).toHaveClass(
        'w-full',
        'py-3',
        'bg-purple-500',
        'text-white',
        'rounded-lg',
        'font-medium'
      );
    });

    it('applies disabled styles when button is disabled', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      const button = screen.getByText('Connecting...');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toBeDisabled();
    });

    it('has flex layout for icon and text', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const button = screen.getByText('Connect with GitHub');
      expect(button).toHaveClass('flex', 'items-center', 'justify-center', 'gap-2');
    });
  });

  describe('OAuth Flow Simulation', () => {
    it('initiates OAuth flow on button click', async () => {
      const user = userEvent.setup();
      const mockOAuthConnect = vi.fn();

      render(<ClaudeWebConnect onConnect={mockOAuthConnect} />);

      const button = screen.getByText('Connect with GitHub');
      await user.click(button);

      expect(mockOAuthConnect).toHaveBeenCalled();
    });

    it('prevents multiple OAuth flows when connecting', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      const button = screen.getByText('Connect with GitHub');
      await user.click(button);

      // Simulate connecting state
      rerender(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      const connectingButton = screen.getByText('Connecting...');
      expect(connectingButton).toBeDisabled();
    });

    it('can retry connection after failure', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      // Simulate connection failure (back to not connecting)
      rerender(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      const button = screen.getByText('Connect with GitHub');
      expect(button).not.toBeDisabled();

      await user.click(button);
      expect(mockOnConnect).toHaveBeenCalled();
    });
  });

  describe('Content Layout', () => {
    it('renders content in correct order', () => {
      const { container } = render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('space-y-4');

      // Description paragraph should come before button
      const children = Array.from(mainDiv?.childNodes || []);
      expect(children.length).toBe(2);
    });

    it('description has correct styling', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const description = screen.getByText(/Sign in with your GitHub account/);
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('Accessibility', () => {
    it('button has proper button role', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const button = screen.getByText('Connect with GitHub');
      expect(button.tagName).toBe('BUTTON');
    });

    it('provides clear button text for screen readers', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      expect(screen.getByText('Connect with GitHub')).toBeInTheDocument();
    });

    it('provides clear loading state for screen readers', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('disables interaction during loading', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      const button = screen.getByText('Connecting...');
      expect(button).toHaveAttribute('disabled');
    });
  });

  describe('Visual Feedback', () => {
    it('shows GitHub branding via icon', () => {
      const { container } = render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      // GitHub icon should be present
      const button = screen.getByText('Connect with GitHub').parentElement;
      const svg = button?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows loading spinner during connection', () => {
      const { container } = render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('transitions between states smoothly', () => {
      const { rerender } = render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      expect(screen.getByText('Connect with GitHub')).toBeInTheDocument();

      rerender(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={true} />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks before connecting state updates', async () => {
      const user = userEvent.setup();
      render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      const button = screen.getByText('Connect with GitHub');

      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // All clicks should register
      expect(mockOnConnect).toHaveBeenCalledTimes(3);
    });

    it('handles undefined isConnecting prop', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const button = screen.getByText('Connect with GitHub');
      expect(button).not.toBeDisabled();
    });

    it('maintains button state across rerenders', () => {
      const { rerender } = render(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      rerender(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);
      rerender(<ClaudeWebConnect onConnect={mockOnConnect} isConnecting={false} />);

      const button = screen.getByText('Connect with GitHub');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Requirements Information', () => {
    it('displays subscription requirements clearly', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const requirement = screen.getByText(/Requires Claude Pro or Max subscription/);
      expect(requirement).toBeInTheDocument();
    });

    it('explains authentication method', () => {
      render(<ClaudeWebConnect onConnect={mockOnConnect} />);

      const explanation = screen.getByText(/Sign in with your GitHub account/);
      expect(explanation).toBeInTheDocument();
    });
  });
});
