/**
 * Tests for useHaptics hook
 * Tests haptic feedback functionality, support detection, and enable/disable state
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHaptics } from '@/hooks/mobile/useHaptics';
import { haptics } from '@/lib/mobile/haptics';

// Mock the haptics library
vi.mock('@/lib/mobile/haptics', () => ({
  haptics: {
    isSupported: vi.fn(),
    isEnabled: vi.fn(),
    setEnabled: vi.fn(),
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    selection: vi.fn(),
  },
}));

describe('useHaptics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  describe('Initial State', () => {
    test('should initialize with correct support status', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { result } = renderHook(() => useHaptics());

      expect(result.current.isSupported).toBe(true);
      expect(result.current.isEnabled).toBe(true);
    });

    test('should initialize with unsupported platform', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useHaptics());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.isEnabled).toBe(false);
    });

    test('should initialize with haptics disabled', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useHaptics());

      expect(result.current.isSupported).toBe(true);
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('Haptic Feedback Methods', () => {
    test('should trigger light haptic', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
      });

      expect(haptics.light).toHaveBeenCalledTimes(1);
    });

    test('should trigger medium haptic', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.medium();
      });

      expect(haptics.medium).toHaveBeenCalledTimes(1);
    });

    test('should trigger heavy haptic', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.heavy();
      });

      expect(haptics.heavy).toHaveBeenCalledTimes(1);
    });

    test('should trigger success haptic', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.success();
      });

      expect(haptics.success).toHaveBeenCalledTimes(1);
    });

    test('should trigger error haptic', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.error();
      });

      expect(haptics.error).toHaveBeenCalledTimes(1);
    });

    test('should trigger selection haptic', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.selection();
      });

      expect(haptics.selection).toHaveBeenCalledTimes(1);
    });

    test('should trigger haptic via generic trigger method', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.trigger('light');
      });

      expect(haptics.light).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.trigger('medium');
      });

      expect(haptics.medium).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.trigger('heavy');
      });

      expect(haptics.heavy).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.trigger('success');
      });

      expect(haptics.success).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.trigger('error');
      });

      expect(haptics.error).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.trigger('selection');
      });

      expect(haptics.selection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State Behavior', () => {
    test('should not trigger haptics when disabled', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
        result.current.medium();
        result.current.heavy();
      });

      expect(haptics.light).not.toHaveBeenCalled();
      expect(haptics.medium).not.toHaveBeenCalled();
      expect(haptics.heavy).not.toHaveBeenCalled();
    });

    test('should not trigger via trigger method when disabled', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.trigger('light');
        result.current.trigger('medium');
        result.current.trigger('success');
      });

      expect(haptics.light).not.toHaveBeenCalled();
      expect(haptics.medium).not.toHaveBeenCalled();
      expect(haptics.success).not.toHaveBeenCalled();
    });
  });

  describe('Unsupported Platform Behavior', () => {
    test('should not trigger haptics when unsupported', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
        result.current.medium();
        result.current.heavy();
      });

      expect(haptics.light).not.toHaveBeenCalled();
      expect(haptics.medium).not.toHaveBeenCalled();
      expect(haptics.heavy).not.toHaveBeenCalled();
    });

    test('should not trigger via trigger method when unsupported', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.trigger('error');
        result.current.trigger('success');
      });

      expect(haptics.error).not.toHaveBeenCalled();
      expect(haptics.success).not.toHaveBeenCalled();
    });
  });

  describe('Enable/Disable Functionality', () => {
    test('should enable haptics', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useHaptics());

      expect(result.current.isEnabled).toBe(false);

      act(() => {
        result.current.setEnabled(true);
      });

      expect(haptics.setEnabled).toHaveBeenCalledWith(true);
      expect(result.current.isEnabled).toBe(true);
    });

    test('should disable haptics', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { result } = renderHook(() => useHaptics());

      expect(result.current.isEnabled).toBe(true);

      act(() => {
        result.current.setEnabled(false);
      });

      expect(haptics.setEnabled).toHaveBeenCalledWith(false);
      expect(result.current.isEnabled).toBe(false);
    });

    test('should prevent haptics after disabling', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
      });

      expect(haptics.light).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.setEnabled(false);
      });

      act(() => {
        result.current.light();
      });

      // Should still be 1 call (not 2)
      expect(haptics.light).toHaveBeenCalledTimes(1);
    });

    test('should allow haptics after enabling', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
      });

      expect(haptics.light).not.toHaveBeenCalled();

      act(() => {
        result.current.setEnabled(true);
      });

      act(() => {
        result.current.light();
      });

      expect(haptics.light).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid haptic triggers', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.light();
        }
      });

      expect(haptics.light).toHaveBeenCalledTimes(10);
    });

    test('should handle mixed haptic types in sequence', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
        result.current.medium();
        result.current.heavy();
        result.current.success();
        result.current.error();
        result.current.selection();
      });

      expect(haptics.light).toHaveBeenCalledTimes(1);
      expect(haptics.medium).toHaveBeenCalledTimes(1);
      expect(haptics.heavy).toHaveBeenCalledTimes(1);
      expect(haptics.success).toHaveBeenCalledTimes(1);
      expect(haptics.error).toHaveBeenCalledTimes(1);
      expect(haptics.selection).toHaveBeenCalledTimes(1);
    });

    test('should handle rapid enable/disable toggling', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.setEnabled(false);
        result.current.setEnabled(true);
        result.current.setEnabled(false);
        result.current.setEnabled(true);
      });

      expect(haptics.setEnabled).toHaveBeenCalledTimes(4);
      expect(result.current.isEnabled).toBe(true);
    });

    test('should maintain separate supported and enabled states', () => {
      (haptics.isSupported as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (haptics.isEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const { result } = renderHook(() => useHaptics());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.isEnabled).toBe(true);

      // Even though enabled is true, haptics shouldn't trigger because unsupported
      act(() => {
        result.current.light();
      });

      expect(haptics.light).not.toHaveBeenCalled();
    });
  });

  describe('Function Stability', () => {
    test('callback functions should be stable when dependencies unchanged', () => {
      const { result, rerender } = renderHook(() => useHaptics());

      const firstLight = result.current.light;
      const firstMedium = result.current.medium;

      rerender();

      expect(result.current.light).toBe(firstLight);
      expect(result.current.medium).toBe(firstMedium);
    });

    test('callback functions should update when isEnabled changes', () => {
      const { result } = renderHook(() => useHaptics());

      const firstLight = result.current.light;

      act(() => {
        result.current.setEnabled(false);
      });

      expect(result.current.light).not.toBe(firstLight);
    });
  });
});
