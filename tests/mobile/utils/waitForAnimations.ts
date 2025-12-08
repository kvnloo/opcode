import { act } from '@testing-library/react';

/**
 * Default animation durations in ms
 */
export const ANIMATION_DURATIONS = {
  SHORT: 150,
  MEDIUM: 300,
  LONG: 500,
  EXTRA_LONG: 1000,
} as const;

/**
 * Waits for Framer Motion animations to complete
 * Useful when testing components with enter/exit animations
 *
 * @param ms - Duration in milliseconds (default: 300ms for medium animations)
 *
 * @example
 * ```tsx
 * import { waitForAnimation } from '@/tests/mobile/utils/waitForAnimations';
 *
 * test('shows content after animation', async () => {
 *   render(<AnimatedComponent />);
 *
 *   await waitForAnimation();
 *   expect(screen.getByText('Content')).toBeVisible();
 * });
 * ```
 */
export async function waitForAnimation(ms: number = ANIMATION_DURATIONS.MEDIUM): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

/**
 * Waits for AnimatePresence exit animations to complete
 * Use this when testing component unmounting with exit animations
 *
 * @example
 * ```tsx
 * import { waitForExitAnimation } from '@/tests/mobile/utils/waitForAnimations';
 *
 * test('removes element with animation', async () => {
 *   const { rerender } = render(<Modal isOpen={true} />);
 *
 *   rerender(<Modal isOpen={false} />);
 *   await waitForExitAnimation();
 *
 *   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 * });
 * ```
 */
export async function waitForExitAnimation(ms: number = ANIMATION_DURATIONS.MEDIUM): Promise<void> {
  // Exit animations typically need a bit more time
  await waitForAnimation(ms + 50);
}

/**
 * Waits for multiple animations in sequence
 *
 * @param count - Number of animations to wait for
 * @param duration - Duration of each animation
 */
export async function waitForSequentialAnimations(
  count: number,
  duration: number = ANIMATION_DURATIONS.MEDIUM
): Promise<void> {
  for (let i = 0; i < count; i++) {
    await waitForAnimation(duration);
  }
}

/**
 * Advances timers and waits for animation frames
 * Use with vi.useFakeTimers()
 *
 * @example
 * ```tsx
 * test('animation with fake timers', async () => {
 *   vi.useFakeTimers();
 *   render(<AnimatedComponent />);
 *
 *   await advanceTimersForAnimation(300);
 *   expect(screen.getByText('Content')).toBeVisible();
 *
 *   vi.useRealTimers();
 * });
 * ```
 */
export async function advanceTimersForAnimation(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    // Allow pending promises and animation frames to resolve
    await Promise.resolve();
  });
}
