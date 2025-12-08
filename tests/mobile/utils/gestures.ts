import { fireEvent } from '@testing-library/react';

/**
 * Touch gesture simulation utilities for testing mobile interactions
 */

interface TouchPoint {
  clientX: number;
  clientY: number;
  identifier: number;
}

interface SwipeOptions {
  distance?: number;
  duration?: number;
}

/**
 * Simulates a swipe left gesture on an element
 *
 * @param element - The element to swipe on
 * @param options - Swipe configuration
 *
 * @example
 * ```tsx
 * import { swipeLeft } from '@/tests/mobile/utils/gestures';
 *
 * test('swipes to next item', async () => {
 *   render(<SwipeableList />);
 *   const item = screen.getByTestId('swipeable-item');
 *
 *   await swipeLeft(item);
 *   expect(screen.getByText('Next Item')).toBeVisible();
 * });
 * ```
 */
export async function swipeLeft(
  element: Element,
  options: SwipeOptions = {}
): Promise<void> {
  const { distance = 200, duration = 300 } = options;
  await swipe(element, { startX: 200, startY: 100, endX: 200 - distance, endY: 100 }, duration);
}

/**
 * Simulates a swipe right gesture on an element
 */
export async function swipeRight(
  element: Element,
  options: SwipeOptions = {}
): Promise<void> {
  const { distance = 200, duration = 300 } = options;
  await swipe(element, { startX: 100, startY: 100, endX: 100 + distance, endY: 100 }, duration);
}

/**
 * Simulates a swipe up gesture on an element
 */
export async function swipeUp(
  element: Element,
  options: SwipeOptions = {}
): Promise<void> {
  const { distance = 200, duration = 300 } = options;
  await swipe(element, { startX: 100, startY: 300, endX: 100, endY: 300 - distance }, duration);
}

/**
 * Simulates a swipe down gesture on an element
 */
export async function swipeDown(
  element: Element,
  options: SwipeOptions = {}
): Promise<void> {
  const { distance = 200, duration = 300 } = options;
  await swipe(element, { startX: 100, startY: 100, endX: 100, endY: 100 + distance }, duration);
}

/**
 * Low-level swipe function
 */
async function swipe(
  element: Element,
  coordinates: { startX: number; startY: number; endX: number; endY: number },
  duration: number
): Promise<void> {
  const { startX, startY, endX, endY } = coordinates;

  // Touch start
  const touchStart = createTouchEvent('touchstart', [
    { clientX: startX, clientY: startY, identifier: 0 },
  ]);
  fireEvent(element, touchStart);

  // Touch move (simulate intermediate points)
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;

    const touchMove = createTouchEvent('touchmove', [
      { clientX: currentX, clientY: currentY, identifier: 0 },
    ]);
    fireEvent(element, touchMove);

    // Small delay between move events
    await new Promise((resolve) => setTimeout(resolve, duration / steps));
  }

  // Touch end
  const touchEnd = createTouchEvent('touchend', []);
  fireEvent(element, touchEnd);
}

/**
 * Simulates a tap gesture on an element
 *
 * @example
 * ```tsx
 * test('handles tap', async () => {
 *   render(<Button />);
 *   await tap(screen.getByRole('button'));
 *   expect(onTap).toHaveBeenCalled();
 * });
 * ```
 */
export async function tap(element: Element, point?: { x: number; y: number }): Promise<void> {
  const x = point?.x ?? 100;
  const y = point?.y ?? 100;

  const touchStart = createTouchEvent('touchstart', [{ clientX: x, clientY: y, identifier: 0 }]);
  fireEvent(element, touchStart);

  await new Promise((resolve) => setTimeout(resolve, 50));

  const touchEnd = createTouchEvent('touchend', []);
  fireEvent(element, touchEnd);

  // Also fire click event for components using onClick handlers
  fireEvent.click(element);
}

/**
 * Simulates a long press gesture on an element
 *
 * @param element - The element to long press
 * @param duration - Duration of the press in ms (default: 500ms)
 */
export async function longPress(element: Element, duration: number = 500): Promise<void> {
  const x = 100;
  const y = 100;

  const touchStart = createTouchEvent('touchstart', [{ clientX: x, clientY: y, identifier: 0 }]);
  fireEvent(element, touchStart);

  await new Promise((resolve) => setTimeout(resolve, duration));

  const touchEnd = createTouchEvent('touchend', []);
  fireEvent(element, touchEnd);
}

/**
 * Simulates a pinch gesture (two-finger zoom)
 *
 * @param element - The element to pinch
 * @param direction - 'in' for zoom out, 'out' for zoom in
 * @param scale - Scale factor (default: 2)
 */
export async function pinch(
  element: Element,
  direction: 'in' | 'out',
  scale: number = 2
): Promise<void> {
  const centerX = 200;
  const centerY = 200;
  const startDistance = 100;
  const endDistance = direction === 'out' ? startDistance * scale : startDistance / scale;

  // Initial touch positions
  const finger1Start = { x: centerX - startDistance / 2, y: centerY };
  const finger2Start = { x: centerX + startDistance / 2, y: centerY };

  // Final touch positions
  const finger1End = { x: centerX - endDistance / 2, y: centerY };
  const finger2End = { x: centerX + endDistance / 2, y: centerY };

  // Touch start with two fingers
  const touchStart = createTouchEvent('touchstart', [
    { clientX: finger1Start.x, clientY: finger1Start.y, identifier: 0 },
    { clientX: finger2Start.x, clientY: finger2Start.y, identifier: 1 },
  ]);
  fireEvent(element, touchStart);

  // Touch move
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const finger1X = finger1Start.x + (finger1End.x - finger1Start.x) * progress;
    const finger2X = finger2Start.x + (finger2End.x - finger2Start.x) * progress;

    const touchMove = createTouchEvent('touchmove', [
      { clientX: finger1X, clientY: centerY, identifier: 0 },
      { clientX: finger2X, clientY: centerY, identifier: 1 },
    ]);
    fireEvent(element, touchMove);

    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  // Touch end
  const touchEnd = createTouchEvent('touchend', []);
  fireEvent(element, touchEnd);
}

/**
 * Creates a touch event with the specified touches
 */
function createTouchEvent(type: string, touches: TouchPoint[]): TouchEvent {
  const touchList = touches.map(
    (touch) =>
      new Touch({
        identifier: touch.identifier,
        target: document.body,
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.clientX,
        screenY: touch.clientY,
        pageX: touch.clientX,
        pageY: touch.clientY,
      })
  );

  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touchList,
    targetTouches: touchList,
    changedTouches: touchList,
  });
}
