import React, { forwardRef } from 'react';
import { useHaptics } from '@/hooks/mobile/useHaptics';
import { HapticFeedbackType } from '@/lib/mobile/haptics';
import { cn } from '@/lib/utils';

interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Type of haptic feedback to trigger on press
   * @default 'medium'
   */
  hapticType?: HapticFeedbackType;

  /**
   * Disable haptic feedback for this button
   * @default false
   */
  disableHaptics?: boolean;

  /**
   * Visual variant for the button
   * @default undefined (uses className styling)
   */
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary' | string;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Button content
   */
  children: React.ReactNode;
}

/**
 * Button component with built-in haptic feedback
 * Follows WCAG 2.1 AA guidelines for touch targets and accessibility
 *
 * @example
 * ```tsx
 * <HapticButton
 *   hapticType="heavy"
 *   onClick={handleSubmit}
 *   aria-label="Submit form"
 * >
 *   Submit
 * </HapticButton>
 * ```
 */
export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  (
    {
      hapticType = 'medium',
      disableHaptics = false,
      variant,
      className,
      onClick,
      onMouseDown,
      onTouchStart,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { trigger, isSupported } = useHaptics();

    const handleInteraction = (callback?: React.MouseEventHandler<HTMLButtonElement>) => {
      return (e: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback if enabled and supported
        if (!disableHaptics && !disabled && isSupported) {
          trigger(hapticType);
        }

        // Call original callback
        callback?.(e);
      };
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback on touch start for immediate response
      if (!disableHaptics && !disabled && isSupported) {
        trigger(hapticType);
      }

      // Call original callback
      onTouchStart?.(e as any);
    };

    return (
      <button
        ref={ref}
        onClick={handleInteraction(onClick)}
        onMouseDown={handleInteraction(onMouseDown)}
        onTouchStart={handleTouchStart}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',

          // WCAG 2.1 AA - Minimum touch target size (44x44px recommended, 40x40px minimum)
          'min-h-[44px] min-w-[44px] px-4 py-2',

          // Touch states with clear visual feedback
          'active:scale-95 active:opacity-80',

          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',

          // High contrast mode support
          '@media (prefers-contrast: high) border-2',

          className
        )}
        // Accessibility attributes
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

HapticButton.displayName = 'HapticButton';
