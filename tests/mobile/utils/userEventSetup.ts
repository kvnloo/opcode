import { userEvent } from '@testing-library/user-event';

/**
 * Creates a configured userEvent instance for tests
 * Use this at the start of each test to handle async user interactions
 *
 * @example
 * ```tsx
 * import { setupUserEvent } from '@/tests/mobile/utils/userEventSetup';
 *
 * test('handles click', async () => {
 *   const user = setupUserEvent();
 *   render(<button>Click me</button>);
 *
 *   await user.click(screen.getByRole('button'));
 *   // assertions...
 * });
 * ```
 */
export function setupUserEvent() {
  return userEvent.setup({
    // Add delay to simulate more realistic user interactions
    delay: null, // null = no delay for faster tests
    // Skip pointer events to avoid issues in JSDOM
    pointerEventsCheck: 0,
    // Advance timers automatically for async operations
    advanceTimers: (delay) => {
      vi.advanceTimersByTime(delay);
    },
  });
}

/**
 * Creates a userEvent instance with realistic delays
 * Use this when testing animations or time-sensitive interactions
 */
export function setupRealisticUserEvent() {
  return userEvent.setup({
    delay: 10, // 10ms delay between keystrokes/events
    pointerEventsCheck: 0,
    advanceTimers: (delay) => {
      vi.advanceTimersByTime(delay);
    },
  });
}
