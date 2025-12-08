import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/renderWithProviders';
import { TerminalInput } from '@/components/mobile/terminal/TerminalInput';

describe('TerminalInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onExecute: vi.fn(),
    isExecuting: false,
  };

  describe('Rendering', () => {
    it('renders input field with placeholder', () => {
      render(<TerminalInput {...defaultProps} />);

      expect(screen.getByPlaceholderText(/Enter command/i)).toBeInTheDocument();
    });

    it('renders dollar sign prompt', () => {
      render(<TerminalInput {...defaultProps} />);

      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('renders Run button', () => {
      render(<TerminalInput {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Run/i })).toBeInTheDocument();
    });

    it('displays current value', () => {
      render(<TerminalInput {...defaultProps} value="ls -la" />);

      const input = screen.getByPlaceholderText(/Enter command/i) as HTMLInputElement;
      expect(input.value).toBe('ls -la');
    });

    it('shows Play icon when not executing', () => {
      render(<TerminalInput {...defaultProps} />);

      // Play icon should be present
      const button = screen.getByRole('button', { name: /Run/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('shows Loader icon when executing', () => {
      render(<TerminalInput {...defaultProps} isExecuting={true} />);

      // Loader icon should be present and animating
      const button = screen.getByRole('button', { name: /Run/i });
      const loader = button.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Input Interaction', () => {
    it('calls onChange when user types', () => {
      const onChange = vi.fn();
      render(<TerminalInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      fireEvent.change(input, { target: { value: 'git status' } });

      expect(onChange).toHaveBeenCalledWith('git status');
    });

    it('allows multiple characters to be typed', () => {
      const onChange = vi.fn();
      render(<TerminalInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByPlaceholderText(/Enter command/i);

      fireEvent.change(input, { target: { value: 'n' } });
      fireEvent.change(input, { target: { value: 'np' } });
      fireEvent.change(input, { target: { value: 'npm' } });

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith('npm');
    });

    it('disables input when executing', () => {
      render(<TerminalInput {...defaultProps} isExecuting={true} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toBeDisabled();
    });

    it('enables input when not executing', () => {
      render(<TerminalInput {...defaultProps} isExecuting={false} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).not.toBeDisabled();
    });
  });

  describe('Run Button Interaction', () => {
    it('calls onExecute when Run button is clicked', () => {
      const onExecute = vi.fn();
      render(<TerminalInput {...defaultProps} value="test" onExecute={onExecute} />);

      const button = screen.getByRole('button', { name: /Run/i });
      fireEvent.click(button);

      expect(onExecute).toHaveBeenCalledTimes(1);
    });

    it('disables Run button when input is empty', () => {
      render(<TerminalInput {...defaultProps} value="" />);

      const button = screen.getByRole('button', { name: /Run/i });
      expect(button).toBeDisabled();
    });

    it('disables Run button when input is whitespace only', () => {
      render(<TerminalInput {...defaultProps} value="   " />);

      const button = screen.getByRole('button', { name: /Run/i });
      expect(button).toBeDisabled();
    });

    it('enables Run button when input has content', () => {
      render(<TerminalInput {...defaultProps} value="ls" />);

      const button = screen.getByRole('button', { name: /Run/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Run button when executing', () => {
      render(<TerminalInput {...defaultProps} value="test" isExecuting={true} />);

      const button = screen.getByRole('button', { name: /Run/i });
      expect(button).toBeDisabled();
    });

    it('applies enabled styling when button is active', () => {
      render(<TerminalInput {...defaultProps} value="test" />);

      const button = screen.getByRole('button', { name: /Run/i });
      expect(button).toHaveClass('bg-[#0dbc79]');
    });

    it('applies disabled styling when button is inactive', () => {
      render(<TerminalInput {...defaultProps} value="" />);

      const button = screen.getByRole('button', { name: /Run/i });
      expect(button).toHaveClass('bg-[#333]');
      expect(button).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Keyboard Interactions', () => {
    it('calls onExecute when Enter key is pressed', () => {
      const onExecute = vi.fn();
      render(<TerminalInput {...defaultProps} value="test" onExecute={onExecute} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

      expect(onExecute).toHaveBeenCalledTimes(1);
    });

    it('does not execute when Shift+Enter is pressed', () => {
      const onExecute = vi.fn();
      render(<TerminalInput {...defaultProps} value="test" onExecute={onExecute} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

      expect(onExecute).not.toHaveBeenCalled();
    });

    it('prevents default behavior on Enter', () => {
      render(<TerminalInput {...defaultProps} value="test" />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      input.dispatchEvent(event);

      expect(preventDefault).toHaveBeenCalled();
    });

    it('does not execute on other keys', () => {
      const onExecute = vi.fn();
      render(<TerminalInput {...defaultProps} value="test" onExecute={onExecute} />);

      const input = screen.getByPlaceholderText(/Enter command/i);

      fireEvent.keyDown(input, { key: 'Space' });
      fireEvent.keyDown(input, { key: 'a' });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onExecute).not.toHaveBeenCalled();
    });
  });

  describe('Input Attributes', () => {
    it('disables autocapitalize', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveAttribute('autoCapitalize', 'none');
    });

    it('disables autocorrect', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveAttribute('autoCorrect', 'off');
    });

    it('disables autocomplete', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveAttribute('autoComplete', 'off');
    });

    it('disables spellcheck', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveAttribute('spellCheck', 'false');
    });
  });

  describe('Styling', () => {
    it('applies monospace font', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveClass('font-mono');
    });

    it('applies terminal color scheme', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveClass('bg-transparent');
      expect(input).toHaveClass('text-[#d4d4d4]');
    });

    it('applies placeholder styling', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveClass('placeholder:text-[#666]');
    });
  });

  describe('Accessibility', () => {
    it('has proper input type', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('Run button has accessible name', () => {
      render(<TerminalInput {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Run/i })).toBeInTheDocument();
    });

    it('input is focusable', () => {
      render(<TerminalInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Enter command/i);
      // Input element should be rendered and focusable
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    });
  });
});
