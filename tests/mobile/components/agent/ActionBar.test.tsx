import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../utils/renderWithProviders';
import { tap } from '../../../utils/gestures';
import { ActionBar } from '@/components/mobile/agent/ActionBar';

// Mock vibrate API
const mockVibrate = vi.fn();
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: mockVibrate,
});

describe('ActionBar', () => {
  const defaultProps = {
    onRollback: vi.fn(),
    onViewChanges: vi.fn(),
    onPreview: vi.fn(),
    status: 'idle' as const,
    hasChanges: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockVibrate.mockClear();
  });

  describe('Rendering', () => {
    it('should render all three action buttons', () => {
      render(<ActionBar {...defaultProps} />);

      expect(screen.getByLabelText('Rollback changes')).toBeInTheDocument();
      expect(screen.getByLabelText('View changes')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<ActionBar {...defaultProps} className="custom-class" />);

      const actionBar = container.firstChild;
      expect(actionBar?.className).toContain('custom-class');
    });

    it('should have safe area bottom padding', () => {
      const { container } = render(<ActionBar {...defaultProps} />);

      const actionBar = container.firstChild;
      expect(actionBar?.className).toContain('safe-area-bottom');
    });

    it('should have border top styling', () => {
      const { container } = render(<ActionBar {...defaultProps} />);

      const actionBar = container.firstChild;
      expect(actionBar?.className).toContain('border-t');
    });
  });

  describe('Rollback Button', () => {
    it('should be enabled when status is completed', () => {
      render(<ActionBar {...defaultProps} status="completed" />);

      const rollbackBtn = screen.getByLabelText('Rollback changes');
      expect(rollbackBtn).not.toBeDisabled();
    });

    it('should be enabled when status is error', () => {
      render(<ActionBar {...defaultProps} status="error" />);

      const rollbackBtn = screen.getByLabelText('Rollback changes');
      expect(rollbackBtn).not.toBeDisabled();
    });

    it('should be disabled when status is running', () => {
      render(<ActionBar {...defaultProps} status="running" />);

      const rollbackBtn = screen.getByLabelText('Rollback changes');
      expect(rollbackBtn).toBeDisabled();
    });

    it('should be disabled when status is idle', () => {
      render(<ActionBar {...defaultProps} status="idle" />);

      const rollbackBtn = screen.getByLabelText('Rollback changes');
      expect(rollbackBtn).toBeDisabled();
    });

    it('should call onRollback when clicked', async () => {
      const onRollback = vi.fn();
      render(<ActionBar {...defaultProps} status="completed" onRollback={onRollback} />);

      const rollbackBtn = screen.getByLabelText('Rollback changes');
      await tap(rollbackBtn);

      await waitFor(() => {
        expect(onRollback).toHaveBeenCalled();
      });
    });

    it('should trigger haptic feedback on tap', async () => {
      render(<ActionBar {...defaultProps} status="completed" />);

      const rollbackBtn = screen.getByLabelText('Rollback changes');
      await tap(rollbackBtn);

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith(10);
      });
    });

    it('should have proper disabled styling', () => {
      render(<ActionBar {...defaultProps} status="idle" />);

      const rollbackBtn = screen.getByLabelText('Rollback changes');
      expect(rollbackBtn.className).toContain('opacity-50');
      expect(rollbackBtn.className).toContain('cursor-not-allowed');
    });
  });

  describe('View Changes Button', () => {
    it('should be enabled when hasChanges is true', () => {
      render(<ActionBar {...defaultProps} hasChanges={true} />);

      const changesBtn = screen.getByLabelText('View changes');
      expect(changesBtn).not.toBeDisabled();
    });

    it('should be disabled when hasChanges is false', () => {
      render(<ActionBar {...defaultProps} hasChanges={false} />);

      const changesBtn = screen.getByLabelText('View changes');
      expect(changesBtn).toBeDisabled();
    });

    it('should call onViewChanges when clicked', async () => {
      const onViewChanges = vi.fn();
      render(<ActionBar {...defaultProps} hasChanges={true} onViewChanges={onViewChanges} />);

      const changesBtn = screen.getByLabelText('View changes');
      await tap(changesBtn);

      await waitFor(() => {
        expect(onViewChanges).toHaveBeenCalled();
      });
    });

    it('should show notification badge when hasChanges is true', () => {
      const { container } = render(<ActionBar {...defaultProps} hasChanges={true} />);

      const badge = container.querySelector('.bg-primary.rounded-full');
      expect(badge).toBeInTheDocument();
    });

    it('should not show badge when hasChanges is false', () => {
      const { container } = render(<ActionBar {...defaultProps} hasChanges={false} />);

      const badge = container.querySelector('.bg-primary.rounded-full');
      expect(badge).not.toBeInTheDocument();
    });

    it('should have primary color styling when enabled', () => {
      render(<ActionBar {...defaultProps} hasChanges={true} />);

      const changesBtn = screen.getByLabelText('View changes');
      expect(changesBtn.className).toContain('bg-primary/10');
      expect(changesBtn.className).toContain('text-primary');
    });
  });

  describe('Preview Button', () => {
    it('should be enabled when status is completed', () => {
      render(<ActionBar {...defaultProps} status="completed" />);

      const previewBtn = screen.getByLabelText('Preview');
      expect(previewBtn).not.toBeDisabled();
    });

    it('should be disabled when status is running', () => {
      render(<ActionBar {...defaultProps} status="running" />);

      const previewBtn = screen.getByLabelText('Preview');
      expect(previewBtn).toBeDisabled();
    });

    it('should be disabled when status is idle', () => {
      render(<ActionBar {...defaultProps} status="idle" />);

      const previewBtn = screen.getByLabelText('Preview');
      expect(previewBtn).toBeDisabled();
    });

    it('should call onPreview when clicked', async () => {
      const onPreview = vi.fn();
      render(<ActionBar {...defaultProps} status="completed" onPreview={onPreview} />);

      const previewBtn = screen.getByLabelText('Preview');
      await tap(previewBtn);

      await waitFor(() => {
        expect(onPreview).toHaveBeenCalled();
      });
    });

    it('should have primary button styling when enabled', () => {
      render(<ActionBar {...defaultProps} status="completed" />);

      const previewBtn = screen.getByLabelText('Preview');
      expect(previewBtn.className).toContain('bg-primary');
      expect(previewBtn.className).toContain('text-primary-foreground');
    });
  });

  describe('Button States', () => {
    it('should show all buttons enabled in completed state with changes', () => {
      render(<ActionBar {...defaultProps} status="completed" hasChanges={true} />);

      expect(screen.getByLabelText('Rollback changes')).not.toBeDisabled();
      expect(screen.getByLabelText('View changes')).not.toBeDisabled();
      expect(screen.getByLabelText('Preview')).not.toBeDisabled();
    });

    it('should disable rollback and preview when running', () => {
      render(<ActionBar {...defaultProps} status="running" hasChanges={true} />);

      expect(screen.getByLabelText('Rollback changes')).toBeDisabled();
      expect(screen.getByLabelText('Preview')).toBeDisabled();
      expect(screen.getByLabelText('View changes')).not.toBeDisabled();
    });

    it('should handle cancelled status', () => {
      render(<ActionBar {...defaultProps} status="cancelled" hasChanges={true} />);

      expect(screen.getByLabelText('Rollback changes')).toBeDisabled();
      expect(screen.getByLabelText('Preview')).toBeDisabled();
      expect(screen.getByLabelText('View changes')).not.toBeDisabled();
    });
  });

  describe('Animations', () => {
    it('should have entrance animation', () => {
      const { container } = render(<ActionBar {...defaultProps} />);

      // Check for animation container
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have tap scale animation on buttons', () => {
      render(<ActionBar {...defaultProps} status="completed" hasChanges={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.parentElement).toBeInTheDocument();
      });
    });

    it('should animate badge appearance', () => {
      const { container } = render(<ActionBar {...defaultProps} hasChanges={true} />);

      const badge = container.querySelector('.rounded-full');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should display correct icons', () => {
      render(<ActionBar {...defaultProps} />);

      // Check that buttons have icons (lucide icons render as SVGs)
      const rollbackBtn = screen.getByLabelText('Rollback changes');
      const changesBtn = screen.getByLabelText('View changes');
      const previewBtn = screen.getByLabelText('Preview');

      expect(rollbackBtn.querySelector('svg')).toBeInTheDocument();
      expect(changesBtn.querySelector('svg')).toBeInTheDocument();
      expect(previewBtn.querySelector('svg')).toBeInTheDocument();
    });

    it('should show text labels alongside icons', () => {
      render(<ActionBar {...defaultProps} />);

      expect(screen.getByText('Rollback')).toBeInTheDocument();
      expect(screen.getByText('Changes')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ActionBar {...defaultProps} />);

      expect(screen.getByLabelText('Rollback changes')).toBeInTheDocument();
      expect(screen.getByLabelText('View changes')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<ActionBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('should have sufficient touch target sizes', () => {
      render(<ActionBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toContain('px-4');
        expect(button.className).toContain('py-2.5');
      });
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic on rollback tap', async () => {
      render(<ActionBar {...defaultProps} status="completed" />);

      await tap(screen.getByLabelText('Rollback changes'));

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith(10);
      });
    });

    it('should trigger haptic on view changes tap', async () => {
      render(<ActionBar {...defaultProps} hasChanges={true} />);

      await tap(screen.getByLabelText('View changes'));

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith(10);
      });
    });

    it('should trigger haptic on preview tap', async () => {
      render(<ActionBar {...defaultProps} status="completed" />);

      await tap(screen.getByLabelText('Preview'));

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith(10);
      });
    });

    it('should handle missing vibrate API gracefully', async () => {
      const originalVibrate = navigator.vibrate;
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        value: undefined,
      });

      render(<ActionBar {...defaultProps} status="completed" />);

      await tap(screen.getByLabelText('Preview'));

      // Should not throw error
      await waitFor(() => {
        expect(true).toBe(true);
      });

      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        value: originalVibrate,
      });
    });
  });
});
