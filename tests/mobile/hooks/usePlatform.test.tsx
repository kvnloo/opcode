import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
/**
 * Tests for usePlatform hook
 * Tests platform detection, responsive behavior, and derived hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { usePlatform, useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/mobile/usePlatform';
import {
  simulateMobile,
  simulateTablet,
  simulateDesktop,
  simulateCustomPlatform,
  restoreDefaultPlatform,
} from '../utils/platformSimulator';

// Mock @tauri-apps/plugin-os
vi.mock('@tauri-apps/plugin-os', () => ({
  platform: vi.fn(),
}));

describe('usePlatform', () => {
  beforeEach(() => {
    restoreDefaultPlatform();
    delete (window as any).__TAURI__;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Platform Detection', () => {
    test('should detect desktop platform by default', async () => {
      simulateDesktop();
      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('desktop');
      });
    });

    test('should detect mobile platform', async () => {
      simulateMobile();
      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });

    test('should detect tablet platform', async () => {
      simulateTablet();
      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });
    });
  });

  describe('Tauri Platform Detection', () => {
    test('should detect iOS as mobile via Tauri', async () => {
      const { platform } = await import('@tauri-apps/plugin-os');
      (platform as ReturnType<typeof vi.fn>).mockResolvedValue('ios');

      Object.defineProperty(window, '__TAURI__', {
        value: {},
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });

    test('should detect iOS as tablet via Tauri when width >= 768', async () => {
      const { platform } = await import('@tauri-apps/plugin-os');
      (platform as ReturnType<typeof vi.fn>).mockResolvedValue('ios');

      Object.defineProperty(window, '__TAURI__', {
        value: {},
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });
    });

    test('should detect android as mobile via Tauri', async () => {
      const { platform } = await import('@tauri-apps/plugin-os');
      (platform as ReturnType<typeof vi.fn>).mockResolvedValue('android');

      Object.defineProperty(window, '__TAURI__', {
        value: {},
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window, 'innerWidth', {
        value: 412,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });

    test('should fall back to user agent detection when Tauri plugin fails', async () => {
      const { platform } = await import('@tauri-apps/plugin-os');
      (platform as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Plugin not available'));

      Object.defineProperty(window, '__TAURI__', {
        value: {},
        writable: true,
        configurable: true,
      });

      simulateMobile();

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });
  });

  describe('Responsive Behavior', () => {
    test('should update platform on window resize', async () => {
      simulateDesktop();
      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('desktop');
      });

      // Resize to mobile
      simulateMobile();

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });

    test('should transition from mobile to tablet on resize', async () => {
      simulateMobile();
      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });

      // Resize to tablet
      simulateTablet();

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });
    });

    test('should handle rapid resize events', async () => {
      simulateDesktop();
      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('desktop');
      });

      // Rapid resizes
      simulateMobile();
      simulateTablet();
      simulateDesktop();
      simulateMobile();

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle custom viewport sizes', async () => {
      simulateCustomPlatform({
        width: 600,
        height: 800,
        userAgent: 'Mozilla/5.0 (Android)',
        touchSupport: true,
      });

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });

    test('should handle exactly 768px width as tablet', async () => {
      simulateCustomPlatform({
        width: 768,
        height: 1024,
        userAgent: 'Mozilla/5.0 (iPad)',
        touchSupport: true,
      });

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });
    });

    test('should handle 767px width as mobile', async () => {
      simulateCustomPlatform({
        width: 767,
        height: 1024,
        userAgent: 'Mozilla/5.0 (iPad)',
        touchSupport: true,
      });

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });
  });

  describe('Cleanup', () => {
    test('should remove resize listener on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(removeEventListenerSpy).not.toHaveBeenCalled();
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});

describe('useIsMobile', () => {
  beforeEach(() => {
    restoreDefaultPlatform();
    delete (window as any).__TAURI__;
  });

  test('should return true for mobile platform', async () => {
    simulateMobile();
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  test('should return true for tablet platform', async () => {
    simulateTablet();
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  test('should return false for desktop platform', async () => {
    simulateDesktop();
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

describe('useIsTablet', () => {
  beforeEach(() => {
    restoreDefaultPlatform();
    delete (window as any).__TAURI__;
  });

  test('should return true for tablet platform', async () => {
    simulateTablet();
    const { result } = renderHook(() => useIsTablet());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  test('should return false for mobile platform', async () => {
    simulateMobile();
    const { result } = renderHook(() => useIsTablet());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  test('should return false for desktop platform', async () => {
    simulateDesktop();
    const { result } = renderHook(() => useIsTablet());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

describe('useIsDesktop', () => {
  beforeEach(() => {
    restoreDefaultPlatform();
    delete (window as any).__TAURI__;
  });

  test('should return true for desktop platform', async () => {
    simulateDesktop();
    const { result } = renderHook(() => useIsDesktop());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  test('should return false for mobile platform', async () => {
    simulateMobile();
    const { result } = renderHook(() => useIsDesktop());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  test('should return false for tablet platform', async () => {
    simulateTablet();
    const { result } = renderHook(() => useIsDesktop());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
