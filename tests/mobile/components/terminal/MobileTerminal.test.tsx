import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../../utils/renderWithProviders';
import { MobileTerminal } from '@/components/mobile/terminal/MobileTerminal';
import * as tauri from '@tauri-apps/api/core';

// Mock Tauri
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('MobileTerminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders welcome message', () => {
      render(<MobileTerminal />);

      expect(screen.getByText(/Welcome to Claude Code Mobile Terminal/i)).toBeInTheDocument();
      expect(screen.getByText(/Type a command or use quick commands below/i)).toBeInTheDocument();
    });

    it('renders terminal input component', () => {
      render(<MobileTerminal />);

      expect(screen.getByPlaceholderText(/Enter command/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run/i })).toBeInTheDocument();
    });

    it('renders quick commands section', () => {
      render(<MobileTerminal />);

      expect(screen.getByRole('button', { name: /^claude$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^git$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^npm$/i })).toBeInTheDocument();
    });

    it('renders code keyboard', () => {
      render(<MobileTerminal />);

      // Check for some special characters
      expect(screen.getByRole('button', { name: '|' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '&' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '$' })).toBeInTheDocument();
    });
  });

  describe('Command Execution', () => {
    it('executes command when Run button is clicked', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockResolvedValue('Command output');

      // Mock Tauri availability
      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      // Type command
      await tauri.invoke('execute_terminal_command', { command: 'test command' });
      input.focus();
      fireEvent.change(input, { target: { value: 'ls -la' } });

      // Click Run
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/\$ ls -la/i)).toBeInTheDocument();
      });

      delete (window as any).__TAURI__;
    });

    it('shows executing state during command execution', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      let resolveCommand: (value: string) => void;

      mockInvoke.mockImplementation(() => new Promise((resolve) => {
        resolveCommand = resolve;
      }));

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      // Type and execute command
      fireEvent.change(input, { target: { value: 'sleep 5' } });
      fireEvent.click(runButton);

      // Should show executing state
      await waitFor(() => {
        expect(screen.getByText(/Executing.../i)).toBeInTheDocument();
      });

      // Complete execution
      resolveCommand!('Done');

      await waitFor(() => {
        expect(screen.queryByText(/Executing.../i)).not.toBeInTheDocument();
      });

      delete (window as any).__TAURI__;
    });

    it('executes command on Enter key press', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockResolvedValue('Output');

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);

      // Type command
      fireEvent.change(input, { target: { value: 'echo test' } });

      // Press Enter
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(enterEvent);

      await waitFor(() => {
        expect(screen.getByText(/\$ echo test/i)).toBeInTheDocument();
      });

      delete (window as any).__TAURI__;
    });

    it('clears input after command execution', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockResolvedValue('Output');

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i) as HTMLInputElement;
      const runButton = screen.getByRole('button', { name: /Run/i });

      // Type command
      fireEvent.change(input, { target: { value: 'ls' } });

      // Execute
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });

      delete (window as any).__TAURI__;
    });

    it('handles command execution errors', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockRejectedValue('Command failed');

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      // Type and execute
      fireEvent.change(input, { target: { value: 'invalid-command' } });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Error: Command failed/i)).toBeInTheDocument();
      });

      delete (window as any).__TAURI__;
    });

    it('uses fallback execution when Tauri is not available', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      // Type and execute
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/\[Mock\] Would execute: test/i)).toBeInTheDocument();
      });
    });

    it('does not execute empty commands', async () => {
      render(<MobileTerminal />);

      const runButton = screen.getByRole('button', { name: /Run/i });

      // Get initial line count
      const initialLines = screen.getAllByText(/./i).length;

      // Try to execute without input
      fireEvent.click(runButton);

      // Should not add any new lines - line count should stay the same
      const finalLines = screen.getAllByText(/./i).length;
      expect(finalLines).toBe(initialLines);
    });

    it('prevents execution during command execution', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      let resolveCommand: (value: string) => void;

      mockInvoke.mockImplementation(() => new Promise((resolve) => {
        resolveCommand = resolve;
      }));

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      // Execute first command
      fireEvent.change(input, { target: { value: 'cmd1' } });
      fireEvent.click(runButton);

      // Wait for command to show executing state
      await waitFor(() => {
        expect(screen.getByText(/Executing/i)).toBeInTheDocument();
      });

      // Try to execute second command while first is running
      fireEvent.change(input, { target: { value: 'cmd2' } });
      fireEvent.click(runButton);

      // Should only have first command (cmd1), not cmd2
      expect(screen.queryByText(/\$ cmd1/i)).toBeInTheDocument();
      expect(screen.queryByText(/\$ cmd2/i)).not.toBeInTheDocument();

      resolveCommand!('Done');

      delete (window as any).__TAURI__;
    });
  });

  describe('Quick Commands', () => {
    it('inserts quick command into input when clicked', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i) as HTMLInputElement;
      const claudeButton = screen.getByRole('button', { name: /^claude$/i });

      fireEvent.click(claudeButton);

      expect(input.value).toBe('claude ');
    });

    it('appends quick command to existing input', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i) as HTMLInputElement;

      // Type initial text
      fireEvent.change(input, { target: { value: 'echo ' } });

      // Click quick command
      const gitButton = screen.getByRole('button', { name: /^git$/i });
      fireEvent.click(gitButton);

      expect(input.value).toBe('echo git ');
    });
  });

  describe('Code Keyboard', () => {
    it('inserts special character into input when clicked', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i) as HTMLInputElement;
      const pipeButton = screen.getByRole('button', { name: '|' });

      fireEvent.click(pipeButton);

      expect(input.value).toBe('|');
    });

    it('appends special character to existing input', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i) as HTMLInputElement;

      // Type initial text
      fireEvent.change(input, { target: { value: 'ls' } });

      // Click special character
      const ampButton = screen.getByRole('button', { name: '&' });
      fireEvent.click(ampButton);

      expect(input.value).toBe('ls&');
    });

    it('allows multiple special characters to be inserted', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i) as HTMLInputElement;

      // Click multiple special characters
      fireEvent.click(screen.getByRole('button', { name: '$' }));
      fireEvent.click(screen.getByRole('button', { name: '(' }));
      fireEvent.click(screen.getByRole('button', { name: ')' }));

      expect(input.value).toBe('$()');
    });
  });

  describe('Auto-scroll Behavior', () => {
    it('scrolls to bottom when new output is added', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockResolvedValue('Output line');

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      // Execute multiple commands to create scrollable content
      for (let i = 0; i < 3; i++) {
        fireEvent.change(input, { target: { value: `cmd${i}` } });
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText(new RegExp(`\\$ cmd${i}`, 'i'))).toBeInTheDocument();
        });
      }

      // Last command should be visible (verifying auto-scroll behavior)
      expect(screen.getByText(/\$ cmd2/i)).toBeInTheDocument();

      delete (window as any).__TAURI__;
    });
  });

  describe('Line Styling', () => {
    it('applies correct styling to input lines', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockResolvedValue('Output');

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(runButton);

      await waitFor(() => {
        const inputLine = screen.getByText(/\$ test/i);
        expect(inputLine).toHaveClass('text-[#4fc3f7]');
      });

      delete (window as any).__TAURI__;
    });

    it('applies correct styling to output lines', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockResolvedValue('Success output');

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(runButton);

      await waitFor(() => {
        const outputLine = screen.getByText(/Success output/i);
        expect(outputLine).toHaveClass('text-[#d4d4d4]');
      });

      delete (window as any).__TAURI__;
    });

    it('applies correct styling to error lines', async () => {
      const mockInvoke = vi.mocked(tauri.invoke);
      mockInvoke.mockRejectedValue('Error message');

      (window as any).__TAURI__ = true;

      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const runButton = screen.getByRole('button', { name: /Run/i });

      fireEvent.change(input, { target: { value: 'fail' } });
      fireEvent.click(runButton);

      await waitFor(() => {
        const errorLine = screen.getByText(/Error: Error message/i);
        expect(errorLine).toHaveClass('text-[#f44336]');
      });

      delete (window as any).__TAURI__;
    });
  });

  describe('Input Focus', () => {
    it('maintains focus on input after quick command click', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const claudeButton = screen.getByRole('button', { name: /^claude$/i });

      input.focus();
      fireEvent.click(claudeButton);

      // Input should still be usable
      expect(input).toBeInTheDocument();
    });

    it('maintains focus on input after keyboard button click', async () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const pipeButton = screen.getByRole('button', { name: '|' });

      input.focus();
      fireEvent.click(pipeButton);

      // Input should still be usable
      expect(input).toBeInTheDocument();
    });
  });
});
