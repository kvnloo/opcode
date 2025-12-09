import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShellPane } from '@/components/mobile/workspace/panes/ShellPane';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd, args) => {
    if (cmd === 'execute_terminal_command') {
      const { command } = args;
      if (command === 'pwd') return Promise.resolve('/projects/test-project');
      if (command === 'ls' || command === 'ls -la') return Promise.resolve('src/\ntests/\npackage.json\nREADME.md');
      if (command.startsWith('echo ')) return Promise.resolve(command.slice(5));
      if (command.startsWith('cd ')) return Promise.resolve(`Changed directory to: ${command.slice(3)}`);
      if (command === 'error-test') return Promise.reject(new Error('Command failed'));
      return Promise.resolve(`[Output] ${command}`);
    }
    return Promise.reject(new Error(`Unknown command: ${cmd}`));
  }),
}));

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
    projectPath: '/projects/test-project',
    onBack: mockOnBack,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    // Set up TAURI environment for real command execution in tests
    (window as any).__TAURI__ = true;

    // Reset the invoke mock to default behavior
    const { invoke } = await import('@tauri-apps/api/core');
    vi.mocked(invoke).mockImplementation((cmd, args: any) => {
      if (cmd === 'execute_terminal_command') {
        const { command } = args;
        if (command === 'pwd') return Promise.resolve('/projects/test-project');
        if (command === 'ls' || command === 'ls -la') return Promise.resolve('src/\ntests/\npackage.json\nREADME.md');
        if (command.startsWith('echo ')) return Promise.resolve(command.slice(5));
        if (command.startsWith('cd ')) return Promise.resolve(`Changed directory to: ${command.slice(3)}`);
        if (command === 'error-test') return Promise.reject(new Error('Command failed'));
        return Promise.resolve(`[Output] ${command}`);
      }
      return Promise.reject(new Error(`Unknown command: ${cmd}`));
    });
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
      const { container } = render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Wait a bit for async execution
      await new Promise(resolve => setTimeout(resolve, 50));

      await waitFor(() => {
        // Wait for command to appear
        expect(screen.getByText('ls')).toBeInTheDocument();
        // Check for output content
        const text = container.textContent || '';
        expect(text).toContain('src/');
      }, { timeout: 2000 });
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

      // Wait for async execution
      await new Promise(resolve => setTimeout(resolve, 50));

      await waitFor(() => {
        expect(screen.getByText('echo Hello World')).toBeInTheDocument();
        expect(screen.getByText('Hello World')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Tauri Integration', () => {
    it('shows loading state during command execution', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('output'), 100)));

      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'slow-command' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Executing...')).toBeInTheDocument();
      });

      // Should complete
      await waitFor(() => {
        expect(screen.queryByText('Executing...')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('handles command execution errors', async () => {
      const { container } = render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'error-test' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Wait for async execution
      await new Promise(resolve => setTimeout(resolve, 50));

      await waitFor(() => {
        expect(screen.getByText('error-test')).toBeInTheDocument();
        const text = container.textContent || '';
        expect(text).toContain('Error: Command failed');
      }, { timeout: 2000 });
    });

    it('executes real commands via Tauri invoke', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('execute_terminal_command', {
          command: 'pwd',
          cwd: '/projects/test-project',
          projectId: 'test-project',
        });
      });
    });

    it('falls back to mock when Tauri is not available', async () => {
      // Disable Tauri
      delete (window as any).__TAURI__;

      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'custom-command' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/\[Mock\] Would execute/)).toBeInTheDocument();
      });

      // Restore Tauri for other tests
      (window as any).__TAURI__ = true;
    });
  });

  describe('Command History Navigation', () => {
    it('navigates history with arrow keys', async () => {
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
        expect((input as HTMLInputElement).value).toBe('');
      });

      // Navigate up to previous command
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
      expect((input as HTMLInputElement).value).toBe('pwd');

      // Navigate up to even earlier command
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
      expect((input as HTMLInputElement).value).toBe('ls');

      // Navigate down
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      expect((input as HTMLInputElement).value).toBe('pwd');
    });

    it('clears input when navigating past end of history', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');

      // Execute a command
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('');
      });

      // Navigate up
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
      expect((input as HTMLInputElement).value).toBe('ls');

      // Navigate down past end
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('does nothing on arrow up when no history', () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');

      // Try to navigate up with no history
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  describe('Built-in Commands', () => {
    it('help command shows available commands', async () => {
      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'help' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Available commands/i)).toBeInTheDocument();
        expect(screen.getByText(/Other commands are executed via terminal/i)).toBeInTheDocument();
      });
    });

    it('prevents execution while command is running', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('output'), 100)));

      render(<ShellPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');

      // Start first command
      fireEvent.change(input, { target: { value: 'slow-command-1' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Try to execute second command immediately
      fireEvent.change(input, { target: { value: 'slow-command-2' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Should only have been called once
      await waitFor(() => {
        expect(invoke).toHaveBeenCalledTimes(1);
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
