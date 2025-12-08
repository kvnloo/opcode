import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNavigation, NavigationTab } from '@/components/mobile/navigation/BottomNavigation';

describe('BottomNavigation', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    active: 'apps' as NavigationTab,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all navigation tabs', () => {
      render(<BottomNavigation {...defaultProps} />);

      expect(screen.getByLabelText('Apps')).toBeInTheDocument();
      expect(screen.getByLabelText('Create')).toBeInTheDocument();
      expect(screen.getByLabelText('Account')).toBeInTheDocument();
    });

    it('should render tab labels correctly', () => {
      render(<BottomNavigation {...defaultProps} />);

      expect(screen.getByText('Apps')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should render navigation as nav element', () => {
      const { container } = render(<BottomNavigation {...defaultProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Active state handling', () => {
    it('should apply active styles to Apps tab when active', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const appsButton = screen.getByLabelText('Apps');
      expect(appsButton).toHaveClass('text-primary');
      expect(appsButton).toHaveClass('bg-primary/10');
    });

    it('should apply active styles to Create tab when active', () => {
      render(<BottomNavigation active="create" onChange={mockOnChange} />);

      const createButton = screen.getByLabelText('Create');
      expect(createButton).toHaveClass('text-primary');
      expect(createButton).toHaveClass('bg-primary/10');
    });

    it('should apply active styles to Account tab when active', () => {
      render(<BottomNavigation active="account" onChange={mockOnChange} />);

      const accountButton = screen.getByLabelText('Account');
      expect(accountButton).toHaveClass('text-primary');
      expect(accountButton).toHaveClass('bg-primary/10');
    });

    it('should apply inactive styles to non-active tabs', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const createButton = screen.getByLabelText('Create');
      const accountButton = screen.getByLabelText('Account');

      expect(createButton).toHaveClass('text-muted-foreground');
      expect(accountButton).toHaveClass('text-muted-foreground');
    });

    it('should set aria-current="page" on active tab', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const appsButton = screen.getByLabelText('Apps');
      expect(appsButton).toHaveAttribute('aria-current', 'page');
    });

    it('should not set aria-current on inactive tabs', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const createButton = screen.getByLabelText('Create');
      const accountButton = screen.getByLabelText('Account');

      expect(createButton).not.toHaveAttribute('aria-current');
      expect(accountButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('Navigation on tap', () => {
    it('should call onChange with Apps when Apps tab is clicked', () => {
      render(<BottomNavigation active="create" onChange={mockOnChange} />);

      const appsButton = screen.getByLabelText('Apps');
      fireEvent.click(appsButton);

      expect(mockOnChange).toHaveBeenCalledWith('apps');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with Create when Create tab is clicked', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const createButton = screen.getByLabelText('Create');
      fireEvent.click(createButton);

      expect(mockOnChange).toHaveBeenCalledWith('create');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with Account when Account tab is clicked', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const accountButton = screen.getByLabelText('Account');
      fireEvent.click(accountButton);

      expect(mockOnChange).toHaveBeenCalledWith('account');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should allow clicking active tab', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const appsButton = screen.getByLabelText('Apps');
      fireEvent.click(appsButton);

      expect(mockOnChange).toHaveBeenCalledWith('apps');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all tabs', () => {
      render(<BottomNavigation {...defaultProps} />);

      expect(screen.getByLabelText('Apps')).toBeInTheDocument();
      expect(screen.getByLabelText('Create')).toBeInTheDocument();
      expect(screen.getByLabelText('Account')).toBeInTheDocument();
    });

    it('should have button role for all tabs', () => {
      render(<BottomNavigation {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('should be keyboard navigable', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      // Verify all buttons are in the tab order (no negative tabindex)
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });

      // Verify buttons are standard HTML buttons (focusable by default)
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Icon rendering', () => {
    it('should render icons for all tabs', () => {
      const { container } = render(<BottomNavigation {...defaultProps} />);

      // Check that svg icons are rendered (lucide-react renders as svg)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });

    it('should apply primary color to active tab icon', () => {
      render(<BottomNavigation active="apps" onChange={mockOnChange} />);

      const appsButton = screen.getByLabelText('Apps');
      const icon = appsButton.querySelector('svg');

      expect(icon).toHaveClass('text-primary');
    });
  });

  describe('Safe area handling', () => {
    it('should apply safe area inset padding', () => {
      const { container } = render(<BottomNavigation {...defaultProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveStyle({ paddingBottom: 'env(safe-area-inset-bottom)' });
    });
  });

  describe('Styling', () => {
    it('should have proper layout classes', () => {
      const { container } = render(<BottomNavigation {...defaultProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('flex');
      expect(nav).toHaveClass('items-center');
      expect(nav).toHaveClass('justify-around');
    });

    it('should have border and background', () => {
      const { container } = render(<BottomNavigation {...defaultProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-card');
      expect(nav).toHaveClass('border-t');
      expect(nav).toHaveClass('border-border');
    });

    it('should have minimum touch target size', () => {
      render(<BottomNavigation {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-w-[64px]');
        expect(button).toHaveClass('min-h-[48px]');
      });
    });
  });
});
