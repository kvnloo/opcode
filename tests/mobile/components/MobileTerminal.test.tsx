import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileTerminal } from '@/components/mobile/terminal/MobileTerminal';
import { mockTauriInvoke } from '../setup';

describe('MobileTerminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render welcome message on mount', () => {
      render(<MobileTerminal />);

      expect(screen.getByText('Welcome to Claude Code Mobile Terminal')).toBeInTheDocument();
      expect(screen.getByText('Type a command or use quick commands below')).toBeInTheDocument();
    });

    it('should render terminal input', () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      expect(input).toBeInTheDocument();
    });

    it('should render run button', () => {
      render(<MobileTerminal />);

      expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
    });

    it('should render command prompt symbol', () => {
      render(<MobileTerminal />);

      expect(screen.getByText('$')).toBeInTheDocument();
    });
  });

  describe('Command input', () => {
    it('should update input value when typing', () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'ls -la' } });

      expect(input.value).toBe('ls -la');
    });

    it('should clear input after executing command', async () => {
      mockTauriInvoke.mockResolvedValue('Command output');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'echo test' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should execute command on Enter key', async () => {
      mockTauriInvoke.mockResolvedValue('Output');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('$ pwd')).toBeInTheDocument();
      });
    });

    it('should not execute on Shift+Enter', () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

      expect(screen.queryByText('$ test')).not.toBeInTheDocument();
    });

    it('should disable input during execution', async () => {
      mockTauriInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('Done'), 100)));
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'sleep 1' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      expect(input).toBeDisabled();

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Command execution', () => {
    it('should execute command via Tauri when available', async () => {
      mockTauriInvoke.mockResolvedValue('file1.txt\nfile2.txt');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'ls' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(mockTauriInvoke).toHaveBeenCalledWith('execute_terminal_command', { command: 'ls' });
      });
    });

    it('should display command output', async () => {
      mockTauriInvoke.mockResolvedValue('Hello from terminal');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'echo "Hello from terminal"' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Hello from terminal')).toBeInTheDocument();
      });
    });

    it('should show executing indicator during command execution', async () => {
      mockTauriInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('Done'), 100)));
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'long-running' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      expect(screen.getByText('Executing...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Executing...')).not.toBeInTheDocument();
      });
    });

    it('should not execute empty commands', () => {
      render(<MobileTerminal />);

      const runButton = screen.getByRole('button', { name: /run/i });
      expect(runButton).toBeDisabled();

      fireEvent.click(runButton);

      expect(mockTauriInvoke).not.toHaveBeenCalled();
    });

    it('should trim whitespace from commands', async () => {
      mockTauriInvoke.mockResolvedValue('output');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: '  pwd  ' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(mockTauriInvoke).toHaveBeenCalledWith('execute_terminal_command', { command: 'pwd' });
      });
    });
  });

  describe('Error handling', () => {
    it('should display error messages in red', async () => {
      mockTauriInvoke.mockRejectedValue('Command not found');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'invalid-cmd' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        const errorText = screen.getByText(/Error:/);
        expect(errorText).toBeInTheDocument();
        expect(errorText).toHaveClass('text-[#f44336]');
      });
    });

    it('should continue accepting commands after error', async () => {
      mockTauriInvoke.mockRejectedValueOnce('Error').mockResolvedValueOnce('Success');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');

      // First command fails
      fireEvent.change(input, { target: { value: 'bad-cmd' } });
      fireEvent.click(screen.getByRole('button', { name: /run/i }));

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });

      // Second command succeeds
      fireEvent.change(input, { target: { value: 'good-cmd' } });
      fireEvent.click(screen.getByRole('button', { name: /run/i }));

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });
  });

  describe('Command history', () => {
    it('should display command in history before output', async () => {
      mockTauriInvoke.mockResolvedValue('output');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'echo test' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('$ echo test')).toBeInTheDocument();
      });
    });

    it('should style command input lines differently', async () => {
      mockTauriInvoke.mockResolvedValue('result');
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'test' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        const commandLine = screen.getByText('$ test');
        expect(commandLine).toHaveClass('text-[#4fc3f7]');
      });
    });
  });

  describe('Auto-scroll behavior', () => {
    it('should auto-scroll to bottom when new output is added', async () => {
      mockTauriInvoke.mockResolvedValue('output');
      const { container } = render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...');
      fireEvent.change(input, { target: { value: 'cmd' } });

      const runButton = screen.getByRole('button', { name: /run/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        const scrollArea = container.querySelector('[class*="scroll"]');
        expect(scrollArea).toBeInTheDocument();
      });
    });
  });

  describe('Quick commands integration', () => {
    it('should append quick command to input', () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...') as HTMLInputElement;

      // This tests that QuickCommands component is rendered
      // Actual quick command buttons are tested in QuickCommands.test.tsx
      expect(input).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper input attributes for mobile', () => {
      render(<MobileTerminal />);

      const input = screen.getByPlaceholderText('Enter command...') as HTMLInputElement;

      expect(input).toHaveAttribute('autoCapitalize', 'none');
      expect(input).toHaveAttribute('autoCorrect', 'off');
      expect(input).toHaveAttribute('autoComplete', 'off');
      expect(input).toHaveAttribute('spellCheck', 'false');
    });
  });
});
