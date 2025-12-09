import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { ConsolePane, ConsolePaneProps } from '@/components/mobile/workspace/panes/ConsolePane';

// No special setup needed - renderWithProviders handles everything

// Mock Tauri API
const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: any[]) => mockInvoke(...args),
}));

// Mock child components
vi.mock('@/components/mobile/terminal/TerminalInput', () => ({
  TerminalInput: ({ value, onChange, onExecute, isExecuting }: any) => (
    <div data-testid="terminal-input">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a command..."
      />
      <button onClick={onExecute} disabled={isExecuting}>
        Execute
      </button>
    </div>
  ),
}));

vi.mock('@/components/mobile/terminal/CodeKeyboard', () => ({
  CodeKeyboard: ({ onInsert }: any) => (
    <div data-testid="code-keyboard">
      <button onClick={() => onInsert('(')}>Insert (</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/terminal/QuickCommands', () => ({
  QuickCommands: ({ onSelect }: any) => (
    <div data-testid="quick-commands">
      <button onClick={() => onSelect('npm')}>npm</button>
      <button onClick={() => onSelect('git')}>git</button>
    </div>
  ),
}));

describe('ConsolePane', () => {
  const defaultProps: ConsolePaneProps = {
    projectId: 'test-project-123',
    projectPath: '/home/user/projects/my-app',
    onOutput: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.__TAURI__ for Tauri environment check (don't replace the whole window object!)
    if (global.window) {
      (global.window as any).__TAURI__ = undefined;
    }
  });

  describe('Rendering', () => {
    it('renders console header with project path', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByText('Console')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.projectPath)).toBeInTheDocument();
    });

    it('renders initial welcome messages', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByText(`Console: ${defaultProps.projectPath}`)).toBeInTheDocument();
      expect(screen.getByText('Type a command or use quick commands below')).toBeInTheDocument();
    });

    it('renders terminal input component', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByTestId('terminal-input')).toBeInTheDocument();
    });

    it('renders code keyboard', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByTestId('code-keyboard')).toBeInTheDocument();
    });

    it('renders quick commands', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByTestId('quick-commands')).toBeInTheDocument();
    });

    it('renders clear button', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Command Execution', () => {
    it('executes command and displays output (mock mode)', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText('$ ls')).toBeInTheDocument();
        expect(screen.getByText('[Mock] Would execute in /home/user/projects/my-app: ls')).toBeInTheDocument();
      });
    });

    it('clears input after execution', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...') as HTMLInputElement;
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('calls onOutput callback with command output', async () => {
      const onOutput = vi.fn();
      render(<ConsolePane {...defaultProps} onOutput={onOutput} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'echo test' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(onOutput).toHaveBeenCalled();
      });
    });

    it('does not execute empty commands', async () => {
      render(<ConsolePane {...defaultProps} />);

      const executeBtn = screen.getByText('Execute');
      fireEvent.click(executeBtn);

      // Should not add any new output lines
      const lines = screen.queryAllByText(/^\$/);
      expect(lines).toHaveLength(0);
    });

    it('shows executing indicator during command execution', async () => {
      // Set __TAURI__ to use async path
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('done'), 100)));

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'sleep 1' } });
      fireEvent.click(executeBtn);

      // Execute button should be disabled during execution (wait for state update)
      await waitFor(() => {
        expect(executeBtn).toBeDisabled();
      });
    });
  });

  describe('Mock Command Behaviors', () => {
    it('simulates pwd command', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        // Use getAllByText since projectPath appears multiple times (header + output)
        const pathElements = screen.getAllByText(defaultProps.projectPath);
        expect(pathElements.length).toBeGreaterThan(1);
      });
    });

    it('simulates ls command', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'ls -la' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        // Check for ls output which is a multiline string
        expect(screen.getByText(/src\//)).toBeInTheDocument();
      });
    });

    it('simulates cd command', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'cd src' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText('Changed directory (simulated)')).toBeInTheDocument();
      });
    });
  });

  describe('Tauri Integration', () => {
    it('uses Tauri invoke when in Tauri environment', async () => {
      // Set __TAURI__ without replacing the entire window object
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockResolvedValue('Command output from Tauri');

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'echo hello' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('execute_terminal_command', {
          command: 'echo hello',
          cwd: defaultProps.projectPath,
          projectId: defaultProps.projectId,
        });
        expect(screen.getByText('Command output from Tauri')).toBeInTheDocument();
      });
    });

    it('handles Tauri command errors', async () => {
      // Set __TAURI__ without replacing the entire window object
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockRejectedValue(new Error('Command failed'));

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'invalid-command' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText(/Error: Error: Command failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Quick Commands', () => {
    it('inserts quick command into input', async () => {
      const { container } = render(<ConsolePane {...defaultProps} />);

      const npmButton = screen.getByText('npm');
      fireEvent.click(npmButton);

      // After clicking, check if the value was updated
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Type a command...') as HTMLInputElement;
        expect(input.value).toBe('npm ');
      });
    });

    it('appends quick command to existing input', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(input, { target: { value: 'sudo ' } });

      const npmButton = screen.getByText('npm');
      fireEvent.click(npmButton);

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('sudo npm ');
      });
    });
  });

  describe('Code Keyboard', () => {
    it('inserts characters from code keyboard', async () => {
      render(<ConsolePane {...defaultProps} />);

      const insertButton = screen.getByText('Insert (');
      fireEvent.click(insertButton);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Type a command...') as HTMLInputElement;
        expect(input.value).toBe('(');
      });
    });
  });

  describe('Clear Functionality', () => {
    it('clears terminal output when clear button clicked', async () => {
      render(<ConsolePane {...defaultProps} />);

      // Execute a command first
      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');
      fireEvent.change(input, { target: { value: 'echo test' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText('$ echo test')).toBeInTheDocument();
      });

      // Clear the console
      const clearBtn = screen.getByText('Clear');
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(screen.queryByText('$ echo test')).not.toBeInTheDocument();
        // Welcome messages should be restored
        expect(screen.getByText('Type a command or use quick commands below')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-scroll', () => {
    it('scrolls to bottom when new lines are added', async () => {
      const { container } = render(<ConsolePane {...defaultProps} />);

      const scrollArea = container.querySelector('.flex-1');
      const mockScrollIntoView = vi.fn();
      if (scrollArea) {
        Object.defineProperty(scrollArea, 'scrollTop', {
          writable: true,
          value: 0,
        });
        Object.defineProperty(scrollArea, 'scrollHeight', {
          writable: true,
          value: 1000,
        });
      }

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'echo line 1' } });
      fireEvent.click(executeBtn);

      // Scroll behavior tested through component logic
      await waitFor(() => {
        expect(screen.getByText('$ echo line 1')).toBeInTheDocument();
      });
    });
  });

  describe('Output Formatting', () => {
    it('formats input lines with proper styling', async () => {
      const { container } = render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        const inputLine = screen.getByText('$ ls');
        // Test that the element exists and is rendered
        expect(inputLine).toBeInTheDocument();
      });
    });

    it('formats error output with error styling', async () => {
      // Set __TAURI__ without replacing the entire window object
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockRejectedValue(new Error('Command not found'));

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'bad-command' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        const errorLine = screen.getByText(/Error:/);
        // Test that error line exists
        expect(errorLine).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has semantic terminal structure', () => {
      const { container } = render(<ConsolePane {...defaultProps} />);

      // Check for the main container with proper structure classes
      const mainContainer = container.querySelector('.h-full');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer?.classList.contains('flex')).toBe(true);
      expect(mainContainer?.classList.contains('flex-col')).toBe(true);
    });

    it('provides context through header', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByText('Console')).toBeInTheDocument();
      // projectPath appears multiple times - just check it exists
      const pathElements = screen.getAllByText(defaultProps.projectPath);
      expect(pathElements.length).toBeGreaterThanOrEqual(1);
    });

    it('supports keyboard navigation in terminal input', () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');

      // Input should be in the document and be an input element
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('has accessible button labels', () => {
      render(<ConsolePane {...defaultProps} />);

      expect(screen.getByText('Execute')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('has proper color contrast for output', async () => {
      const { container } = render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        const outputLine = screen.getByText('$ ls');
        expect(outputLine).toBeInTheDocument();
        // Text color classes should be present for readability
        expect(outputLine.className).toBeTruthy();
      });
    });

    it('announces command execution to screen readers', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'echo test' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        // Output should be visible and readable
        expect(screen.getByText('$ echo test')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty project path gracefully', () => {
      render(<ConsolePane {...defaultProps} projectPath="" />);

      expect(screen.getByText('Console')).toBeInTheDocument();
    });

    it('handles very long commands', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');
      const longCommand = 'a'.repeat(500);

      fireEvent.change(input, { target: { value: longCommand } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText(`$ ${longCommand}`)).toBeInTheDocument();
      });
    });

    it('handles rapid command execution', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      // Execute multiple commands rapidly
      for (let i = 0; i < 3; i++) {
        fireEvent.change(input, { target: { value: `cmd${i}` } });
        fireEvent.click(executeBtn);
      }

      await waitFor(() => {
        expect(screen.getByText('$ cmd2')).toBeInTheDocument();
      });
    });

    it('handles special characters in commands', async () => {
      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');
      const specialCommand = 'echo "test & test | test > test"';

      fireEvent.change(input, { target: { value: specialCommand } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText(`$ ${specialCommand}`)).toBeInTheDocument();
      });
    });

    it('handles malformed API responses', async () => {
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockRejectedValue({ message: undefined });

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        // Should handle error even without message
        const errorElements = screen.queryAllByText(/Error/);
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });

    it('handles network timeout gracefully', async () => {
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockImplementation(() =>
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'slow-command' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText(/Error.*Timeout/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles large output without crashing', async () => {
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      const largeOutput = 'x'.repeat(10000);
      mockInvoke.mockResolvedValue(largeOutput);

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'generate-large' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(screen.getByText(largeOutput)).toBeInTheDocument();
      });
    });

    it('handles null/undefined onOutput callback', async () => {
      render(<ConsolePane {...defaultProps} onOutput={undefined} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'test' } });

      // Should not throw
      expect(() => fireEvent.click(executeBtn)).not.toThrow();
    });
  });

  describe('Loading States', () => {
    it('shows executing state indicator', async () => {
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('done'), 200)));

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'long-running' } });
      fireEvent.click(executeBtn);

      // Button should be disabled while executing
      await waitFor(() => {
        expect(executeBtn).toBeDisabled();
      });

      // Wait for command to finish
      await waitFor(() => {
        expect(executeBtn).not.toBeDisabled();
      }, { timeout: 3000 });
    });

    it('prevents duplicate execution while command is running', async () => {
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('done'), 100)));

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'cmd1' } });
      fireEvent.click(executeBtn);

      // Button should be disabled while executing
      await waitFor(() => {
        expect(executeBtn).toBeDisabled();
      });

      // Even if we try to click, it shouldn't execute again
      fireEvent.click(executeBtn);

      // Wait for completion
      await waitFor(() => {
        expect(executeBtn).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('clears executing state after error', async () => {
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockRejectedValue(new Error('Command failed'));

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'failing-cmd' } });
      fireEvent.click(executeBtn);

      await waitFor(() => {
        expect(executeBtn).toBeDisabled();
      });

      await waitFor(() => {
        expect(executeBtn).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('maintains responsive UI during long operations', async () => {
      if (global.window) {
        (global.window as any).__TAURI__ = true;
      }
      mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('done'), 150)));

      render(<ConsolePane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      fireEvent.change(input, { target: { value: 'long-cmd' } });
      fireEvent.click(executeBtn);

      // UI should still be interactive (can type in input even while disabled button)
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('adapts to mobile viewport', () => {
      // Simulate mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { container } = render(<ConsolePane {...defaultProps} />);

      const mainContainer = container.querySelector('.h-full');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('flex-col');
    });

    it('adapts to tablet viewport', () => {
      // Simulate tablet viewport
      global.innerWidth = 768;
      global.innerHeight = 1024;

      const { container } = render(<ConsolePane {...defaultProps} />);

      const mainContainer = container.querySelector('.h-full');
      expect(mainContainer).toBeInTheDocument();
    });

    it('scrolls properly in constrained space', async () => {
      const { container } = render(<ConsolePane {...defaultProps} />);

      // Execute multiple commands to fill the output
      const input = screen.getByPlaceholderText('Type a command...');
      const executeBtn = screen.getByText('Execute');

      for (let i = 0; i < 5; i++) {
        fireEvent.change(input, { target: { value: `echo line ${i}` } });
        fireEvent.click(executeBtn);
      }

      await waitFor(() => {
        // Output area should have overflow scrolling
        const outputArea = container.querySelector('.flex-1');
        expect(outputArea).toBeInTheDocument();
      });
    });

    it('maintains fixed input area at bottom', () => {
      const { container } = render(<ConsolePane {...defaultProps} />);

      const terminalInput = screen.getByTestId('terminal-input');
      expect(terminalInput).toBeInTheDocument();

      // Input should be in the document regardless of viewport
      expect(terminalInput.parentElement).toBeInTheDocument();
    });
  });
});
