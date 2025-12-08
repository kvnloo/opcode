import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/renderWithProviders';
import { CodeKeyboard } from '@/components/mobile/terminal/CodeKeyboard';

describe('CodeKeyboard', () => {
  const defaultProps = {
    onInsert: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders all special character buttons', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const expectedKeys = [
        '⇥', '|', '&', ';', '-', '/', '~', '"', "'", '`',
        '{', '}', '[', ']', '(', ')', '<', '>', '$', '\\'
      ];

      expectedKeys.forEach(key => {
        expect(screen.getByRole('button', { name: key })).toBeInTheDocument();
      });
    });

    it('renders exactly 20 buttons', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(20);
    });

    it('applies monospace font to all buttons', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('font-mono');
      });
    });

    it('applies scrollable container', () => {
      const { container } = render(<CodeKeyboard {...defaultProps} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Character Insertion', () => {
    it('inserts tab character when tab button is clicked', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      const tabButton = screen.getByRole('button', { name: '⇥' });
      fireEvent.click(tabButton);

      expect(onInsert).toHaveBeenCalledWith('\t');
    });

    it('inserts pipe character when pipe button is clicked', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      const pipeButton = screen.getByRole('button', { name: '|' });
      fireEvent.click(pipeButton);

      expect(onInsert).toHaveBeenCalledWith('|');
    });

    it('inserts ampersand character', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '&' }));
      expect(onInsert).toHaveBeenCalledWith('&');
    });

    it('inserts semicolon character', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: ';' }));
      expect(onInsert).toHaveBeenCalledWith(';');
    });

    it('inserts dollar sign character', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '$' }));
      expect(onInsert).toHaveBeenCalledWith('$');
    });

    it('inserts opening brace', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '{' }));
      expect(onInsert).toHaveBeenCalledWith('{');
    });

    it('inserts closing brace', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '}' }));
      expect(onInsert).toHaveBeenCalledWith('}');
    });

    it('inserts opening bracket', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '[' }));
      expect(onInsert).toHaveBeenCalledWith('[');
    });

    it('inserts closing bracket', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: ']' }));
      expect(onInsert).toHaveBeenCalledWith(']');
    });

    it('inserts opening parenthesis', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '(' }));
      expect(onInsert).toHaveBeenCalledWith('(');
    });

    it('inserts closing parenthesis', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: ')' }));
      expect(onInsert).toHaveBeenCalledWith(')');
    });

    it('inserts quote characters', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '"' }));
      expect(onInsert).toHaveBeenCalledWith('"');

      fireEvent.click(screen.getByRole('button', { name: "'" }));
      expect(onInsert).toHaveBeenCalledWith("'");

      fireEvent.click(screen.getByRole('button', { name: '`' }));
      expect(onInsert).toHaveBeenCalledWith('`');
    });

    it('inserts backslash character', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '\\' }));
      expect(onInsert).toHaveBeenCalledWith('\\');
    });
  });

  describe('Multiple Insertions', () => {
    it('handles multiple character insertions in sequence', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      fireEvent.click(screen.getByRole('button', { name: '$' }));
      fireEvent.click(screen.getByRole('button', { name: '(' }));
      fireEvent.click(screen.getByRole('button', { name: ')' }));

      expect(onInsert).toHaveBeenCalledTimes(3);
      expect(onInsert).toHaveBeenNthCalledWith(1, '$');
      expect(onInsert).toHaveBeenNthCalledWith(2, '(');
      expect(onInsert).toHaveBeenNthCalledWith(3, ')');
    });

    it('allows same character to be inserted multiple times', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      const pipeButton = screen.getByRole('button', { name: '|' });

      fireEvent.click(pipeButton);
      fireEvent.click(pipeButton);
      fireEvent.click(pipeButton);

      expect(onInsert).toHaveBeenCalledTimes(3);
      expect(onInsert).toHaveBeenCalledWith('|');
    });
  });

  describe('Button Styling', () => {
    it('applies fixed minimum width to buttons', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-w-[36px]');
      });
    });

    it('applies fixed height to buttons', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('h-[36px]');
      });
    });

    it('applies background color', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('bg-[#333]');
      });
    });

    it('applies hover styles', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('hover:bg-[#444]');
      });
    });

    it('applies active scale effect', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('active:scale-95');
      });
    });

    it('centers button content', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('flex');
        expect(button).toHaveClass('items-center');
        expect(button).toHaveClass('justify-center');
      });
    });

    it('applies rounded corners', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('rounded');
      });
    });

    it('applies transition effects', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('transition-colors');
      });
    });
  });

  describe('Touch Interactions', () => {
    it('handles tap gestures', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      const button = screen.getByRole('button', { name: '|' });
      fireEvent.click(button);

      expect(onInsert).toHaveBeenCalledWith('|');
    });

    it('handles rapid taps', () => {
      const onInsert = vi.fn();
      render(<CodeKeyboard onInsert={onInsert} />);

      const button = screen.getByRole('button', { name: ';' });

      fireEvent.click(button);
      fireEvent.click(button);

      expect(onInsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('Layout', () => {
    it('displays buttons horizontally', () => {
      const { container } = render(<CodeKeyboard {...defaultProps} />);

      const wrapper = container.querySelector('.flex');
      expect(wrapper).toBeInTheDocument();
    });

    it('has gap between buttons', () => {
      const { container } = render(<CodeKeyboard {...defaultProps} />);

      const wrapper = container.querySelector('.gap-1');
      expect(wrapper).toBeInTheDocument();
    });

    it('has padding around buttons', () => {
      const { container } = render(<CodeKeyboard {...defaultProps} />);

      const wrapper = container.querySelector('.p-2');
      expect(wrapper).toBeInTheDocument();
    });

    it('uses dark background', () => {
      const { container } = render(<CodeKeyboard {...defaultProps} />);

      const wrapper = container.querySelector('.bg-\\[\\#252526\\]');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all buttons are keyboard accessible', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      // All buttons should be rendered and not disabled
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
      });
    });

    it('buttons have readable labels', () => {
      render(<CodeKeyboard {...defaultProps} />);

      expect(screen.getByText('|')).toBeVisible();
      expect(screen.getByText('&')).toBeVisible();
      expect(screen.getByText('$')).toBeVisible();
    });
  });

  describe('Special Characters Coverage', () => {
    it('includes all common shell operators', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const shellOperators = ['|', '&', ';', '>', '<', '$'];
      shellOperators.forEach(op => {
        expect(screen.getByRole('button', { name: op })).toBeInTheDocument();
      });
    });

    it('includes all bracket types', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const brackets = ['{', '}', '[', ']', '(', ')'];
      brackets.forEach(bracket => {
        expect(screen.getByRole('button', { name: bracket })).toBeInTheDocument();
      });
    });

    it('includes all quote types', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const quotes = ['"', "'", '`'];
      quotes.forEach(quote => {
        expect(screen.getByRole('button', { name: quote })).toBeInTheDocument();
      });
    });

    it('includes path and file characters', () => {
      render(<CodeKeyboard {...defaultProps} />);

      const pathChars = ['/', '~', '\\', '-'];
      pathChars.forEach(char => {
        expect(screen.getByRole('button', { name: char })).toBeInTheDocument();
      });
    });
  });
});
