import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileLayout, MobilePane } from '@/layouts/MobileLayout';

// Mock usePlatform hook
vi.mock('@/hooks/mobile/usePlatform', () => ({
  usePlatform: vi.fn(() => 'mobile'),
}));

describe('MobileLayout', () => {
  const mockOnPaneChange = vi.fn();

  beforeEach(() => {
    mockOnPaneChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders children content', () => {
      render(
        <MobileLayout>
          <div>Test Content</div>
        </MobileLayout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders bottom navigation', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      expect(screen.getByText('Apps')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('has full height container', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('h-screen', 'flex', 'flex-col');
    });

    it('has background color', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('bg-background');
    });
  });

  describe('Platform Detection', () => {
    it('renders full layout on mobile', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      usePlatform.mockReturnValue('mobile');

      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      expect(screen.getByText('Apps')).toBeInTheDocument();
    });

    it('renders children only on desktop', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      usePlatform.mockReturnValue('desktop');

      const { container } = render(
        <MobileLayout>
          <div>Test Content</div>
        </MobileLayout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      // Navigation should not be present on desktop
      expect(screen.queryByText('Apps')).not.toBeInTheDocument();
    });
  });

  describe('Active Pane', () => {
    it('defaults to apps pane', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const appsButton = screen.getByText('Apps').closest('button');
      expect(appsButton).toHaveClass('text-primary');
    });

    it('respects activePane prop', () => {
      render(
        <MobileLayout activePane="create">
          <div>Content</div>
        </MobileLayout>
      );

      const createButton = screen.getByText('Create').closest('button');
      expect(createButton).toHaveClass('text-primary');
    });

    it('updates when activePane changes', () => {
      const { rerender } = render(
        <MobileLayout activePane="apps">
          <div>Content</div>
        </MobileLayout>
      );

      let appsButton = screen.getByText('Apps').closest('button');
      expect(appsButton).toHaveClass('text-primary');

      rerender(
        <MobileLayout activePane="account">
          <div>Content</div>
        </MobileLayout>
      );

      const accountButton = screen.getByText('Account').closest('button');
      expect(accountButton).toHaveClass('text-primary');
    });
  });

  describe('Navigation Interaction', () => {
    it('calls onPaneChange when tab is clicked', async () => {
      render(
        <MobileLayout onPaneChange={mockOnPaneChange}>
          <div>Content</div>
        </MobileLayout>
      );

      const createButton = screen.getByText('Create').closest('button');
      fireEvent.click(createButton!);

      expect(mockOnPaneChange).toHaveBeenCalledWith('create');
    });

    it('handles navigation to each pane', async () => {
      render(
        <MobileLayout onPaneChange={mockOnPaneChange}>
          <div>Content</div>
        </MobileLayout>
      );

      const panes: { text: string; id: MobilePane }[] = [
        { text: 'Apps', id: 'apps' },
        { text: 'Create', id: 'create' },
        { text: 'Account', id: 'account' },
      ];

      for (const pane of panes) {
        mockOnPaneChange.mockClear();
        const button = screen.getByText(pane.text).closest('button');
        fireEvent.click(button!);

        expect(mockOnPaneChange).toHaveBeenCalledWith(pane.id);
      }
    });
  });

  describe('Layout Structure', () => {
    it('has flex column layout', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('flex-col');
    });

    it('main content has flex-1 to fill space', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const mainContent = container.querySelector('.flex-1');
      expect(mainContent).toBeInTheDocument();
    });

    it('main content has overflow-hidden', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const mainContent = container.querySelector('.overflow-hidden');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Bottom Navigation', () => {
    it('renders all navigation items', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      expect(screen.getByText('Apps')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('navigation has border-t', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const nav = container.querySelector('.border-t');
      expect(nav).toBeInTheDocument();
    });

    it('navigation has safe area padding', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const nav = container.querySelector('.pb-safe');
      expect(nav).toBeInTheDocument();
    });

    it('navigation items have minimum width', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const appsButton = screen.getByText('Apps').closest('button');
      expect(appsButton).toHaveClass('min-w-[60px]');
    });
  });

  describe('Icons', () => {
    it('renders emoji icons for all tabs', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      // Check for emoji presence
      const container = screen.getByText('Apps').closest('button');
      expect(container?.textContent).toContain('📱');
    });

    it('create tab has plus emoji', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const container = screen.getByText('Create').closest('button');
      expect(container?.textContent).toContain('➕');
    });

    it('account tab has user emoji', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const container = screen.getByText('Account').closest('button');
      expect(container?.textContent).toContain('👤');
    });
  });

  describe('Accessibility', () => {
    it('navigation uses button elements', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it('is keyboard navigable', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const appsButton = screen.getByText('Apps').closest('button');
      appsButton?.focus();

      expect(appsButton).toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('applies transition classes to navigation items', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const appsButton = screen.getByText('Apps').closest('button');
      expect(appsButton).toHaveClass('transition-colors');
    });

    it('active tab has primary background', () => {
      render(
        <MobileLayout activePane="apps">
          <div>Content</div>
        </MobileLayout>
      );

      const appsButton = screen.getByText('Apps').closest('button');
      expect(appsButton).toHaveClass('bg-primary/10');
    });

    it('inactive tabs have muted foreground', () => {
      render(
        <MobileLayout activePane="apps">
          <div>Content</div>
        </MobileLayout>
      );

      const createButton = screen.getByText('Create').closest('button');
      expect(createButton).toHaveClass('text-muted-foreground');
    });

    it('navigation has card background', () => {
      const { container } = render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );

      const nav = container.querySelector('.bg-card');
      expect(nav).toBeInTheDocument();
    });
  });
});
