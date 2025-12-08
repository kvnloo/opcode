/**
 * Tests for useOrientation hook
 * Tests screen orientation tracking and responsive behavior
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrientation, useIsLandscape, useIsPortrait } from '@/hooks/mobile/useOrientation';
import { simulateCustomPlatform, restoreDefaultPlatform } from '../utils/platformSimulator';

describe('useOrientation', () => {
  beforeEach(() => {
    restoreDefaultPlatform();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Detection', () => {
    test('should detect landscape orientation initially', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 1080,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('landscape');
    });

    test('should detect portrait orientation initially', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 667,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('portrait');
    });

    test('should handle square viewport as landscape', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 500,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('portrait');
    });
  });

  describe('Resize Events', () => {
    test('should update to landscape on resize', async () => {
      simulateCustomPlatform({
        width: 375,
        height: 667,
        userAgent: 'test',
        touchSupport: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('portrait');

      // Rotate to landscape
      Object.defineProperty(window, 'innerWidth', {
        value: 667,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 375,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        expect(result.current).toBe('landscape');
      });
    });

    test('should update to portrait on resize', async () => {
      simulateCustomPlatform({
        width: 667,
        height: 375,
        userAgent: 'test',
        touchSupport: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('landscape');

      // Rotate to portrait
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 667,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        expect(result.current).toBe('portrait');
      });
    });
  });

  describe('OrientationChange Events', () => {
    test('should respond to orientationchange event', async () => {
      simulateCustomPlatform({
        width: 375,
        height: 667,
        userAgent: 'test',
        touchSupport: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('portrait');

      // Trigger orientationchange
      Object.defineProperty(window, 'innerWidth', {
        value: 667,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 375,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('orientationchange'));

      await waitFor(() => {
        expect(result.current).toBe('landscape');
      });
    });

    test('should handle rapid orientation changes', async () => {
      const { result } = renderHook(() => useOrientation());

      // Multiple rapid changes
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true, configurable: true });
      window.dispatchEvent(new Event('orientationchange'));

      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true, configurable: true });
      window.dispatchEvent(new Event('orientationchange'));

      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true, configurable: true });
      window.dispatchEvent(new Event('orientationchange'));

      await waitFor(() => {
        expect(result.current).toBe('landscape');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle width exactly equal to height', async () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('portrait');
    });

    test('should handle width 1px wider than height', async () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 601,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toBe('landscape');
    });
  });

  describe('Cleanup', () => {
    test('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useOrientation());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });
  });
});

describe('useIsLandscape', () => {
  beforeEach(() => {
    restoreDefaultPlatform();
  });

  test('should return true for landscape orientation', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true, configurable: true });

    const { result } = renderHook(() => useIsLandscape());

    expect(result.current).toBe(true);
  });

  test('should return false for portrait orientation', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true, configurable: true });

    const { result } = renderHook(() => useIsLandscape());

    expect(result.current).toBe(false);
  });

  test('should update on orientation change', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true, configurable: true });

    const { result } = renderHook(() => useIsLandscape());

    expect(result.current).toBe(false);

    Object.defineProperty(window, 'innerWidth', { value: 667, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 375, writable: true, configurable: true });
    window.dispatchEvent(new Event('orientationchange'));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe('useIsPortrait', () => {
  beforeEach(() => {
    restoreDefaultPlatform();
  });

  test('should return true for portrait orientation', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true, configurable: true });

    const { result } = renderHook(() => useIsPortrait());

    expect(result.current).toBe(true);
  });

  test('should return false for landscape orientation', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true, configurable: true });

    const { result } = renderHook(() => useIsPortrait());

    expect(result.current).toBe(false);
  });

  test('should update on orientation change', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 667, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 375, writable: true, configurable: true });

    const { result } = renderHook(() => useIsPortrait());

    expect(result.current).toBe(false);

    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 667, writable: true, configurable: true });
    window.dispatchEvent(new Event('orientationchange'));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
