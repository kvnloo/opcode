import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveLayout } from '@/layouts/ResponsiveLayout';

// Define MobilePane type for the mock
export type MobilePane = 'agent' | 'create' | 'apps' | 'account';

// Use vi.hoisted to ensure mock is defined before imports
const mockUseIsMobile = vi.hoisted(() => vi.fn(() => false));

// Mock useIsMobile hook
vi.mock('@/hooks/mobile/usePlatform', () => ({
  useIsMobile: mockUseIsMobile,
}));

// Mock the layout components
vi.mock('@/layouts/MobileLayout', () => ({
  MobileLayout: ({ children, activePane, onPaneChange }: any) => (
    <div data-testid="mobile-layout" data-active-pane={activePane}>
      {children}
      {onPaneChange && <button onClick={() => onPaneChange('test')}>Change Pane</button>}
    </div>
  ),
  MobilePane: {} as any, // Export type placeholder
}));

vi.mock('@/layouts/DesktopLayout', () => ({
  DesktopLayout: ({ children }: any) => (
    <div data-testid="desktop-layout">
      {children}
    </div>
  ),
}));

describe('ResponsiveLayout', () => {
  const mockOnPaneChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false); // Default to desktop
  });

  describe('Mobile Rendering', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it('renders MobileLayout on mobile', () => {
      render(
        <ResponsiveLayout>
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument();
    });

    it('renders children in MobileLayout', () => {
      render(
        <ResponsiveLayout>
          <div>Mobile Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByText('Mobile Content')).toBeInTheDocument();
    });

    it('prefers mobileChildren over children on mobile', () => {
      render(
        <ResponsiveLayout
          mobileChildren={<div>Mobile Specific</div>}
        >
          <div>Generic Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByText('Mobile Specific')).toBeInTheDocument();
      expect(screen.queryByText('Generic Content')).not.toBeInTheDocument();
    });

    it('passes activePane to MobileLayout', () => {
      render(
        <ResponsiveLayout activePane="create">
          <div>Content</div>
        </ResponsiveLayout>
      );

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toHaveAttribute('data-active-pane', 'create');
    });

    it('passes onPaneChange to MobileLayout', () => {
      render(
        <ResponsiveLayout onPaneChange={mockOnPaneChange}>
          <div>Content</div>
        </ResponsiveLayout>
      );

      const changePaneButton = screen.getByText('Change Pane');
      changePaneButton.click();

      expect(mockOnPaneChange).toHaveBeenCalledWith('test');
    });
  });

  describe('Desktop Rendering', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it('renders DesktopLayout on desktop', () => {
      render(
        <ResponsiveLayout>
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout')).not.toBeInTheDocument();
    });

    it('renders children in DesktopLayout', () => {
      render(
        <ResponsiveLayout>
          <div>Desktop Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByText('Desktop Content')).toBeInTheDocument();
    });

    it('prefers desktopChildren over children on desktop', () => {
      render(
        <ResponsiveLayout
          desktopChildren={<div>Desktop Specific</div>}
        >
          <div>Generic Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByText('Desktop Specific')).toBeInTheDocument();
      expect(screen.queryByText('Generic Content')).not.toBeInTheDocument();
    });

    it('does not pass mobile props to DesktopLayout', () => {
      render(
        <ResponsiveLayout activePane="apps" onPaneChange={mockOnPaneChange}>
          <div>Content</div>
        </ResponsiveLayout>
      );

      // Should not have mobile-specific elements
      expect(screen.queryByText('Change Pane')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Switching', () => {
    it('switches from desktop to mobile layout', () => {
      mockUseIsMobile.mockReturnValue(false);

      const { rerender } = render(
        <ResponsiveLayout>
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();

      mockUseIsMobile.mockReturnValue(true);

      rerender(
        <ResponsiveLayout>
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument();
    });

    it('switches from mobile to desktop layout', () => {
      mockUseIsMobile.mockReturnValue(true);

      const { rerender } = render(
        <ResponsiveLayout>
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();

      mockUseIsMobile.mockReturnValue(false);

      rerender(
        <ResponsiveLayout>
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout')).not.toBeInTheDocument();
    });
  });

  describe('Children Priority', () => {
    it('uses mobileChildren on mobile when both children are provided', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <ResponsiveLayout
          mobileChildren={<div>Mobile</div>}
          desktopChildren={<div>Desktop</div>}
        >
          <div>Generic</div>
        </ResponsiveLayout>
      );

      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.queryByText('Desktop')).not.toBeInTheDocument();
      expect(screen.queryByText('Generic')).not.toBeInTheDocument();
    });

    it('uses desktopChildren on desktop when both children are provided', () => {
      mockUseIsMobile.mockReturnValue(false);

      render(
        <ResponsiveLayout
          mobileChildren={<div>Mobile</div>}
          desktopChildren={<div>Desktop</div>}
        >
          <div>Generic</div>
        </ResponsiveLayout>
      );

      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.queryByText('Mobile')).not.toBeInTheDocument();
      expect(screen.queryByText('Generic')).not.toBeInTheDocument();
    });

    it('falls back to children when specific children not provided', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <ResponsiveLayout>
          <div>Generic Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByText('Generic Content')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards all mobile props correctly', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <ResponsiveLayout
          activePane="account"
          onPaneChange={mockOnPaneChange}
        >
          <div>Content</div>
        </ResponsiveLayout>
      );

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toHaveAttribute('data-active-pane', 'account');
    });

    it('does not break when mobile props provided on desktop', () => {
      mockUseIsMobile.mockReturnValue(false);

      render(
        <ResponsiveLayout
          activePane="account"
          onPaneChange={mockOnPaneChange}
        >
          <div>Content</div>
        </ResponsiveLayout>
      );

      // Should render without errors
      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined activePane gracefully', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <ResponsiveLayout>
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    });

    it('handles missing onPaneChange gracefully', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <ResponsiveLayout activePane="apps">
          <div>Content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    });

    it('renders with no children', () => {
      mockUseIsMobile.mockReturnValue(true);

      const { container } = render(<ResponsiveLayout />);

      expect(container).toBeInTheDocument();
    });
  });
});
