import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShellPane } from '@/components/mobile/workspace/panes/ShellPane';

// Mock useHaptics hook
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    trigger: vi.fn(),
    isSupported: true,
  }),
}));

describe('ShellPane', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    projectId: 'test-project',
    onBack: mockOnBack,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders header with back button', () => {
      render(<ShellPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeInTheDocument();
    });

    it('renders shell title', () => {
      render(<ShellPane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /shell/i })).toBeInTheDocument();
    });

    it('has terminal output area', () => {
      const { container } = render(<ShellPane {...defaultProps} />);

      // Look for the terminal output container with overflow-auto
      const terminal = container.querySelector('.overflow-auto');
      expect(terminal).toBeInTheDocument();
    });

    it('has command input field', () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      expect(input).toBeInTheDocument();
    });

    it('shows welcome message', () => {
      render(<ShellPane {...defaultProps} />);

      expect(screen.getByText(/Welcome to Shell/i)).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when back button clicked', () => {
      render(<ShellPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Command Execution', () => {
    it('allows typing in command input', () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'ls -la' } });

      expect((input as HTMLInputElement).value).toBe('ls -la');
    });

    it('executes command on Enter key press', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        // Input should be cleared after execution
        expect((input as HTMLInputElement).value).toBe('');
      });
    });

    it('displays command in output after execution', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'echo test' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        // Command should appear in output
        expect(screen.getByText('echo test')).toBeInTheDocument();
      });
    });
  });

  describe('Terminal Output', () => {
    it('displays command prompt symbol', () => {
      render(<ShellPane {...defaultProps} />);

      // Look for the $ prompt symbol
      expect(screen.getAllByText('$').length).toBeGreaterThan(0);
    });

    it('displays pwd output', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/\/projects\/test-project/)).toBeInTheDocument();
      });
    });

    it('displays help output', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'help' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Available commands/i)).toBeInTheDocument();
      });
    });

    it('displays ls output', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeInTheDocument();
        expect(screen.getByText(/package.json/)).toBeInTheDocument();
      });
    });

    it('preserves command history', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');

      // Execute first command
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('');
      });

      // Execute second command
      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        // Both commands should be visible
        expect(screen.getByText('ls')).toBeInTheDocument();
        expect(screen.getByText('pwd')).toBeInTheDocument();
      });
    });
  });

  describe('Clear Functionality', () => {
    it('has clear button', () => {
      render(<ShellPane {...defaultProps} />);

      const clearButton = screen.getByLabelText('Clear terminal');
      expect(clearButton).toBeInTheDocument();
    });

    it('clears terminal output when clear button clicked', async () => {
      render(<ShellPane {...defaultProps} />);

      // Execute a command first
      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('ls')).toBeInTheDocument();
      });

      // Clear output
      const clearButton = screen.getByLabelText('Clear terminal');
      fireEvent.click(clearButton);

      await waitFor(() => {
        // Command should no longer be visible
        expect(screen.queryByText(/src\//)).not.toBeInTheDocument();
      });
    });

    it('clears terminal when clear command is typed', async () => {
      render(<ShellPane {...defaultProps} />);

      // Execute a command first
      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('ls')).toBeInTheDocument();
      });

      // Type clear command
      fireEvent.change(input, { target: { value: 'clear' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        // Command should no longer be visible
        expect(screen.queryByText(/src\//)).not.toBeInTheDocument();
      });
    });
  });

  describe('Echo Command', () => {
    it('echoes text', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'echo Hello World' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Hello World')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ShellPane {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear terminal')).toBeInTheDocument();
    });

    it('has semantic heading structure', () => {
      render(<ShellPane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /shell/i })).toBeInTheDocument();
    });

    it('input is accessible', () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});
