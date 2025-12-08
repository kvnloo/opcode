import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/renderWithProviders';
import { QuickCommands } from '@/components/mobile/terminal/QuickCommands';

describe('QuickCommands', () => {
  const defaultProps = {
    onSelect: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders all quick command buttons', () => {
      render(<QuickCommands {...defaultProps} />);

      expect(screen.getByRole('button', { name: /^claude$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^git$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^npm$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^bun$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^cd$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^ls$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^cat$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^mkdir$/i })).toBeInTheDocument();
    });

    it('renders buttons in correct order', () => {
      render(<QuickCommands {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const labels = buttons.map(btn => btn.textContent);

      expect(labels).toEqual(['claude', 'git', 'npm', 'bun', 'cd', 'ls', 'cat', 'mkdir']);
    });

    it('renders buttons with monospace font', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      expect(button).toHaveClass('font-mono');
    });

    it('applies scrollable container', () => {
      const { container } = render(<QuickCommands {...defaultProps} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls onSelect with command when button is clicked', () => {
      const onSelect = vi.fn();
      render(<QuickCommands onSelect={onSelect} />);

      const gitButton = screen.getByRole('button', { name: /^git$/i });
      fireEvent.click(gitButton);

      expect(onSelect).toHaveBeenCalledWith('git');
    });

    it('calls onSelect for each different button', () => {
      const onSelect = vi.fn();
      render(<QuickCommands onSelect={onSelect} />);

      fireEvent.click(screen.getByRole('button', { name: /^claude$/i }));
      fireEvent.click(screen.getByRole('button', { name: /^npm$/i }));
      fireEvent.click(screen.getByRole('button', { name: /^ls$/i }));

      expect(onSelect).toHaveBeenCalledTimes(3);
      expect(onSelect).toHaveBeenNthCalledWith(1, 'claude');
      expect(onSelect).toHaveBeenNthCalledWith(2, 'npm');
      expect(onSelect).toHaveBeenNthCalledWith(3, 'ls');
    });

    it('allows same button to be clicked multiple times', () => {
      const onSelect = vi.fn();
      render(<QuickCommands onSelect={onSelect} />);

      const gitButton = screen.getByRole('button', { name: /^git$/i });

      fireEvent.click(gitButton);
      fireEvent.click(gitButton);
      fireEvent.click(gitButton);

      expect(onSelect).toHaveBeenCalledTimes(3);
      expect(onSelect).toHaveBeenNthCalledWith(1, 'git');
      expect(onSelect).toHaveBeenNthCalledWith(2, 'git');
      expect(onSelect).toHaveBeenNthCalledWith(3, 'git');
    });
  });

  describe('Button Styling', () => {
    it('applies hover styles', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      expect(button).toHaveClass('hover:bg-[#444]');
    });

    it('applies background color', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      expect(button).toHaveClass('bg-[#333]');
    });

    it('applies text color', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      expect(button).toHaveClass('text-[#d4d4d4]');
    });

    it('applies rounded corners', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      expect(button).toHaveClass('rounded');
    });

    it('prevents text wrapping', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      expect(button).toHaveClass('whitespace-nowrap');
    });

    it('applies transition effects', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      expect(button).toHaveClass('transition-colors');
    });
  });

  describe('Touch Interactions', () => {
    it('handles tap gesture on touch devices', () => {
      const onSelect = vi.fn();
      render(<QuickCommands onSelect={onSelect} />);

      const button = screen.getByRole('button', { name: /^npm$/i });
      fireEvent.click(button);

      expect(onSelect).toHaveBeenCalledWith('npm');
    });

    it('handles rapid taps', () => {
      const onSelect = vi.fn();
      render(<QuickCommands onSelect={onSelect} />);

      const button = screen.getByRole('button', { name: /^ls$/i });

      // Simulate rapid taps
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('all buttons are accessible', () => {
      render(<QuickCommands {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(8);
    });

    it('buttons have readable text', () => {
      render(<QuickCommands {...defaultProps} />);

      expect(screen.getByText('claude')).toBeVisible();
      expect(screen.getByText('git')).toBeVisible();
      expect(screen.getByText('npm')).toBeVisible();
    });

    it('buttons are keyboard accessible', () => {
      render(<QuickCommands {...defaultProps} />);

      const button = screen.getByRole('button', { name: /^git$/i });
      // Button should be rendered and focusable
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  describe('Command List', () => {
    it('includes all expected commands', () => {
      render(<QuickCommands {...defaultProps} />);

      const expectedCommands = ['claude', 'git', 'npm', 'bun', 'cd', 'ls', 'cat', 'mkdir'];

      expectedCommands.forEach(cmd => {
        expect(screen.getByRole('button', { name: new RegExp(`^${cmd}$`, 'i') })).toBeInTheDocument();
      });
    });

    it('does not include unexpected commands', () => {
      render(<QuickCommands {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const unexpectedCommands = ['rm', 'mv', 'cp', 'sudo', 'chmod'];

      unexpectedCommands.forEach(cmd => {
        const found = buttons.some(btn => btn.textContent === cmd);
        expect(found).toBe(false);
      });
    });
  });

  describe('Layout', () => {
    it('displays buttons horizontally', () => {
      const { container } = render(<QuickCommands {...defaultProps} />);

      const wrapper = container.querySelector('.flex');
      expect(wrapper).toBeInTheDocument();
    });

    it('has gap between buttons', () => {
      const { container } = render(<QuickCommands {...defaultProps} />);

      const wrapper = container.querySelector('.gap-2');
      expect(wrapper).toBeInTheDocument();
    });

    it('has padding around buttons', () => {
      const { container } = render(<QuickCommands {...defaultProps} />);

      const wrapper = container.querySelector('.p-2');
      expect(wrapper).toBeInTheDocument();
    });
  });
});
