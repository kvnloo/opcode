import { describe, test, expect, vi } from 'vitest';
/**
 * Tests for useSwipeNavigation hook
 * Tests swipe gesture handling, navigation, and edge cases
 */

import { renderHook, act } from '@testing-library/react';
import { useSwipeNavigation } from '@/hooks/mobile/useSwipeNavigation';
import { PanInfo } from 'framer-motion';

// Helper to create PanInfo mock
const createPanInfo = (offsetX: number, velocityX: number = 0): PanInfo => ({
  point: { x: 0, y: 0 },
  delta: { x: 0, y: 0 },
  offset: { x: offsetX, y: 0 },
  velocity: { x: velocityX, y: 0 },
});

describe('useSwipeNavigation', () => {
  const items = ['home', 'profile', 'settings', 'about'];

  describe('Initial State', () => {
    test('should initialize with first item by default', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      expect(result.current.currentItem).toBe('home');
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.direction).toBe('right');
    });

    test('should initialize with specified initial item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'settings' })
      );

      expect(result.current.currentItem).toBe('settings');
      expect(result.current.currentIndex).toBe(2);
    });

    test('should set canGoNext and canGoPrevious correctly', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      expect(result.current.canGoNext).toBe(true);
      expect(result.current.canGoPrevious).toBe(false);
    });
  });

  describe('Navigation Methods', () => {
    test('goNext should move to next item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      act(() => {
        result.current.goNext();
      });

      expect(result.current.currentItem).toBe('profile');
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.direction).toBe('right');
    });

    test('goPrevious should move to previous item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'profile' })
      );

      act(() => {
        result.current.goPrevious();
      });

      expect(result.current.currentItem).toBe('home');
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.direction).toBe('left');
    });

    test('goTo should navigate to specific item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      act(() => {
        result.current.goTo('about');
      });

      expect(result.current.currentItem).toBe('about');
      expect(result.current.currentIndex).toBe(3);
      expect(result.current.direction).toBe('right');
    });

    test('goTo should set correct direction when going backwards', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'about' })
      );

      act(() => {
        result.current.goTo('home');
      });

      expect(result.current.direction).toBe('left');
    });

    test('goNext should not move past last item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'about' })
      );

      act(() => {
        result.current.goNext();
      });

      expect(result.current.currentItem).toBe('about');
      expect(result.current.currentIndex).toBe(3);
    });

    test('goPrevious should not move before first item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      act(() => {
        result.current.goPrevious();
      });

      expect(result.current.currentItem).toBe('home');
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('Swipe Gesture Handling', () => {
    test('should navigate next on swipe left with sufficient offset', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, threshold: 50 })
      );

      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-100, 0));
      });

      expect(result.current.currentItem).toBe('profile');
      expect(result.current.currentIndex).toBe(1);
    });

    test('should navigate previous on swipe right with sufficient offset', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'profile', threshold: 50 })
      );

      act(() => {
        result.current.handleDragEnd({}, createPanInfo(100, 0));
      });

      expect(result.current.currentItem).toBe('home');
      expect(result.current.currentIndex).toBe(0);
    });

    test('should navigate on high velocity even with low offset', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, threshold: 50, velocityThreshold: 500 })
      );

      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-30, -600));
      });

      expect(result.current.currentItem).toBe('profile');
      expect(result.current.currentIndex).toBe(1);
    });

    test('should not navigate with insufficient offset and velocity', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, threshold: 50, velocityThreshold: 500 })
      );

      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-30, -200));
      });

      expect(result.current.currentItem).toBe('home');
      expect(result.current.currentIndex).toBe(0);
    });

    test('should not navigate past boundaries on swipe', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, threshold: 50 })
      );

      // Try to swipe right at first item
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(100, 0));
      });

      expect(result.current.currentItem).toBe('home');
      expect(result.current.currentIndex).toBe(0);
    });

    test('should respect custom threshold', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, threshold: 100 })
      );

      // Below threshold
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-80, 0));
      });

      expect(result.current.currentItem).toBe('home');

      // Above threshold
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-120, 0));
      });

      expect(result.current.currentItem).toBe('profile');
    });

    test('should respect custom velocity threshold', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, threshold: 50, velocityThreshold: 1000 })
      );

      // Below velocity threshold
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-30, -800));
      });

      expect(result.current.currentItem).toBe('home');

      // Above velocity threshold
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-30, -1200));
      });

      expect(result.current.currentItem).toBe('profile');
    });
  });

  describe('Boundary Conditions', () => {
    test('canGoNext should be false at last item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'about' })
      );

      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(true);
    });

    test('canGoPrevious should be false at first item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      expect(result.current.canGoNext).toBe(true);
      expect(result.current.canGoPrevious).toBe(false);
    });

    test('both should be true in middle items', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'profile' })
      );

      expect(result.current.canGoNext).toBe(true);
      expect(result.current.canGoPrevious).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single item', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items: ['only'] })
      );

      expect(result.current.currentItem).toBe('only');
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(false);

      act(() => {
        result.current.goNext();
      });

      expect(result.current.currentItem).toBe('only');
    });

    test('should handle two items', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items: ['first', 'second'] })
      );

      expect(result.current.canGoNext).toBe(true);
      expect(result.current.canGoPrevious).toBe(false);

      act(() => {
        result.current.goNext();
      });

      expect(result.current.currentItem).toBe('second');
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(true);
    });

    test('should handle rapid navigation', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      act(() => {
        result.current.goNext();
        result.current.goNext();
        result.current.goNext();
      });

      expect(result.current.currentItem).toBe('about');

      act(() => {
        result.current.goPrevious();
        result.current.goPrevious();
      });

      expect(result.current.currentItem).toBe('profile');
    });

    test('should handle exact threshold value', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, threshold: 50 })
      );

      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-50, 0));
      });

      // At exact threshold, should NOT navigate (needs to be greater than)
      expect(result.current.currentItem).toBe('home');

      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-51, 0));
      });

      expect(result.current.currentItem).toBe('profile');
    });

    test('should use Math.abs for offset comparison', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'profile', threshold: 50 })
      );

      // Positive offset (swipe right)
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(100, 0));
      });

      expect(result.current.currentItem).toBe('home');

      // Negative offset (swipe left)
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-100, 0));
      });

      expect(result.current.currentItem).toBe('profile');
    });
  });

  describe('Direction Tracking', () => {
    test('should track direction correctly when navigating forward', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items })
      );

      act(() => {
        result.current.goNext();
      });

      expect(result.current.direction).toBe('right');
    });

    test('should track direction correctly when navigating backward', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'profile' })
      );

      act(() => {
        result.current.goPrevious();
      });

      expect(result.current.direction).toBe('left');
    });

    test('should update direction on swipe gestures', () => {
      const { result } = renderHook(() =>
        useSwipeNavigation({ items, initialItem: 'profile' })
      );

      // Swipe right (go previous)
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(100, 0));
      });

      expect(result.current.direction).toBe('left');

      // Swipe left (go next)
      act(() => {
        result.current.handleDragEnd({}, createPanInfo(-100, 0));
      });

      expect(result.current.direction).toBe('right');
    });
  });
});
