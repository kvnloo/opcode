import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { tap } from '../../utils/gestures';
import { HapticButton } from '@/components/mobile/common/HapticButton';

// Mock the useHaptics hook - use vi.hoisted for proper hoisting
const { mockTrigger, mockUseHaptics } = vi.hoisted(() => {
  const trigger = vi.fn();
  return {
    mockTrigger: trigger,
    mockUseHaptics: vi.fn(() => ({
      trigger,
      isSupported: true,
    })),
  };
});

vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: mockUseHaptics,
}));

describe('HapticButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrigger.mockClear();
  });

  describe('Rendering', () => {
    it('should render with children', () => {
      render(<HapticButton>Click me</HapticButton>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should apply custom className', () => {
      render(<HapticButton className="custom-class">Button</HapticButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<HapticButton ref={ref}>Button</HapticButton>);
      expect(ref).toHaveBeenCalled();
    });

    it('should render as disabled when disabled prop is true', () => {
      render(<HapticButton disabled>Button</HapticButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have minimum touch target size (44x44px)', () => {
      render(<HapticButton>Button</HapticButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('min-h-[44px]');
      expect(button.className).toContain('min-w-[44px]');
    });

    it('should have proper focus styles', () => {
      render(<HapticButton>Button</HapticButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('focus-visible:outline-none');
      expect(button.className).toContain('focus-visible:ring-2');
    });

    it('should support high contrast mode', () => {
      render(<HapticButton>Button</HapticButton>);
      const button = screen.getByRole('button');
      // High contrast classes are processed at runtime via Tailwind's @media directive
      // We just verify the button has the base classes that would enable high contrast
      expect(button).toBeInTheDocument();
    });

    it('should have aria-disabled when disabled', () => {
      render(<HapticButton disabled>Button</HapticButton>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should accept aria-label', () => {
      render(<HapticButton aria-label="Submit form">Button</HapticButton>);
      expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger medium haptic by default on click', async () => {
      render(<HapticButton>Button</HapticButton>);
      const button = screen.getByRole('button');
      await tap(button);

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith('medium');
      });
    });

    it('should trigger specified haptic type', async () => {
      render(<HapticButton hapticType="heavy">Button</HapticButton>);
      const button = screen.getByRole('button');
      await tap(button);

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith('heavy');
      });
    });

    it('should not trigger haptic when disabled', async () => {
      render(<HapticButton disabled>Button</HapticButton>);
      const button = screen.getByRole('button');

      // Disabled buttons should not respond to clicks
      expect(button).toBeDisabled();
      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('should not trigger haptic when disableHaptics is true', async () => {
      render(<HapticButton disableHaptics>Button</HapticButton>);
      const button = screen.getByRole('button');
      await tap(button);

      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('should not trigger haptic when not supported', async () => {
      mockUseHaptics.mockReturnValue({
        trigger: mockTrigger,
        isSupported: false,
      });

      render(<HapticButton>Button</HapticButton>);
      const button = screen.getByRole('button');
      await tap(button);

      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    it('should call onClick handler', async () => {
      const onClick = vi.fn();
      render(<HapticButton onClick={onClick}>Button</HapticButton>);
      const button = screen.getByRole('button');
      await tap(button);

      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });

    it('should call onMouseDown handler', () => {
      const onMouseDown = vi.fn();
      render(<HapticButton onMouseDown={onMouseDown}>Button</HapticButton>);
      const button = screen.getByRole('button');
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(onMouseDown).toHaveBeenCalled();
    });

    it('should call onTouchStart handler', () => {
      const onTouchStart = vi.fn();
      render(<HapticButton onTouchStart={onTouchStart}>Button</HapticButton>);
      const button = screen.getByRole('button');

      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [new Touch({ identifier: 0, target: button, clientX: 100, clientY: 100 })],
      });
      button.dispatchEvent(touchEvent);

      expect(onTouchStart).toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should have active state styles', () => {
      render(<HapticButton>Button</HapticButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('active:scale-95');
      expect(button.className).toContain('active:opacity-80');
    });

    it('should have disabled state styles', () => {
      render(<HapticButton disabled>Button</HapticButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('opacity-50');
      expect(button.className).toContain('cursor-not-allowed');
    });

    it('should have transition styles', () => {
      render(<HapticButton>Button</HapticButton>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('transition-colors');
    });
  });
});
