import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
/**
 * Tests for useKeyboardHeight hook
 * Tests virtual keyboard height detection and state management
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useKeyboardHeight, useIsKeyboardOpen } from '@/hooks/mobile/useKeyboardHeight';

// Mock visualViewport
const createMockVisualViewport = (height: number) => ({
  height,
  width: 375,
  offsetLeft: 0,
  offsetTop: 0,
  pageLeft: 0,
  pageTop: 0,
  scale: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onresize: null,
  onscroll: null,
});

describe('useKeyboardHeight', () => {
  let mockVisualViewport: any;

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      value: 667,
      writable: true,
      configurable: true,
    });

    mockVisualViewport = createMockVisualViewport(667);
    Object.defineProperty(window, 'visualViewport', {
      value: mockVisualViewport,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    test('should return 0 when keyboard is closed', () => {
      const { result } = renderHook(() => useKeyboardHeight());

      expect(result.current).toBe(0);
    });

    test('should handle missing visualViewport gracefully', () => {
      Object.defineProperty(window, 'visualViewport', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useKeyboardHeight());

      expect(result.current).toBe(0);
    });
  });

  describe('Keyboard Opening', () => {
    test('should detect keyboard opening', async () => {
      const { result } = renderHook(() => useKeyboardHeight());

      expect(result.current).toBe(0);

      // Simulate keyboard opening (viewport shrinks)
      act(() => {
        mockVisualViewport.height = 400;
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'resize'
        )?.[1];
        resizeCallback?.();
      });

      await waitFor(() => {
        expect(result.current).toBe(267); // 667 - 400
      });
    });

    test('should calculate correct keyboard height for different sizes', async () => {
      const { result } = renderHook(() => useKeyboardHeight());

      // Test various keyboard heights
      const testCases = [
        { viewportHeight: 500, expectedKeyboardHeight: 167 },
        { viewportHeight: 350, expectedKeyboardHeight: 317 },
        { viewportHeight: 300, expectedKeyboardHeight: 367 },
      ];

      for (const testCase of testCases) {
        act(() => {
          mockVisualViewport.height = testCase.viewportHeight;
          const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
            (call: any[]) => call[0] === 'resize'
          )?.[1];
          resizeCallback?.();
        });

        await waitFor(() => {
          expect(result.current).toBe(testCase.expectedKeyboardHeight);
        });
      }
    });

    test('should handle rapid keyboard height changes', async () => {
      const { result } = renderHook(() => useKeyboardHeight());

      const heights = [600, 500, 450, 400, 350];

      for (const height of heights) {
        act(() => {
          mockVisualViewport.height = height;
          const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
            (call: any[]) => call[0] === 'resize'
          )?.[1];
          resizeCallback?.();
        });
      }

      await waitFor(() => {
        expect(result.current).toBe(317); // 667 - 350
      });
    });
  });

  describe('Keyboard Closing', () => {
    test('should detect keyboard closing', async () => {
      const { result } = renderHook(() => useKeyboardHeight());

      // Open keyboard
      act(() => {
        mockVisualViewport.height = 400;
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'resize'
        )?.[1];
        resizeCallback?.();
      });

      await waitFor(() => {
        expect(result.current).toBe(267);
      });

      // Close keyboard
      act(() => {
        mockVisualViewport.height = 667;
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'resize'
        )?.[1];
        resizeCallback?.();
      });

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should never return negative keyboard height', async () => {
      const { result } = renderHook(() => useKeyboardHeight());

      // Viewport larger than window (shouldn't happen but test anyway)
      act(() => {
        mockVisualViewport.height = 800;
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'resize'
        )?.[1];
        resizeCallback?.();
      });

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });

    test('should handle viewport height equal to window height', async () => {
      const { result } = renderHook(() => useKeyboardHeight());

      act(() => {
        mockVisualViewport.height = 667;
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'resize'
        )?.[1];
        resizeCallback?.();
      });

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });

    test('should handle viewport height of 0', async () => {
      const { result } = renderHook(() => useKeyboardHeight());

      act(() => {
        mockVisualViewport.height = 0;
        const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
          (call: any[]) => call[0] === 'resize'
        )?.[1];
        resizeCallback?.();
      });

      await waitFor(() => {
        expect(result.current).toBe(667);
      });
    });
  });

  describe('Cleanup', () => {
    test('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardHeight());

      unmount();

      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    test('should handle unmount when visualViewport is missing', () => {
      Object.defineProperty(window, 'visualViewport', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { unmount } = renderHook(() => useKeyboardHeight());

      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('useIsKeyboardOpen', () => {
  let mockVisualViewport: any;

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      value: 667,
      writable: true,
      configurable: true,
    });

    mockVisualViewport = createMockVisualViewport(667);
    Object.defineProperty(window, 'visualViewport', {
      value: mockVisualViewport,
      writable: true,
      configurable: true,
    });
  });

  test('should return false when keyboard is closed', () => {
    const { result } = renderHook(() => useIsKeyboardOpen());

    expect(result.current).toBe(false);
  });

  test('should return true when keyboard is open', async () => {
    const { result } = renderHook(() => useIsKeyboardOpen());

    act(() => {
      mockVisualViewport.height = 400;
      const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'resize'
      )?.[1];
      resizeCallback?.();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  test('should toggle between true and false', async () => {
    const { result } = renderHook(() => useIsKeyboardOpen());

    // Open keyboard
    act(() => {
      mockVisualViewport.height = 400;
      const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'resize'
      )?.[1];
      resizeCallback?.();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    // Close keyboard
    act(() => {
      mockVisualViewport.height = 667;
      const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'resize'
      )?.[1];
      resizeCallback?.();
    });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  test('should handle height of exactly 0 as keyboard open', async () => {
    const { result } = renderHook(() => useIsKeyboardOpen());

    act(() => {
      mockVisualViewport.height = 0;
      const resizeCallback = mockVisualViewport.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'resize'
      )?.[1];
      resizeCallback?.();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
