import { useState, useEffect, useCallback } from 'react';
import { haptics, HapticFeedbackType } from '@/lib/mobile/haptics';

interface UseHapticsReturn {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  success: () => void;
  error: () => void;
  selection: () => void;
  trigger: (type: HapticFeedbackType) => void;
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * React hook for haptic feedback
 *
 * @example
 * ```tsx
 * const { medium, isSupported, isEnabled } = useHaptics();
 *
 * <button onClick={() => {
 *   medium();
 *   handleClick();
 * }}>
 *   Click me
 * </button>
 * ```
 */
export function useHaptics(): UseHapticsReturn {
  const [isSupported, setIsSupported] = useState(haptics.isSupported());
  const [isEnabled, setIsEnabledState] = useState(haptics.isEnabled());

  useEffect(() => {
    // Detect platform support on mount
    setIsSupported(haptics.isSupported());
    setIsEnabledState(haptics.isEnabled());
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    haptics.setEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  const trigger = useCallback((type: HapticFeedbackType) => {
    if (!isSupported || !isEnabled) return;

    switch (type) {
      case 'light':
        haptics.light();
        break;
      case 'medium':
        haptics.medium();
        break;
      case 'heavy':
        haptics.heavy();
        break;
      case 'success':
        haptics.success();
        break;
      case 'error':
        haptics.error();
        break;
      case 'selection':
        haptics.selection();
        break;
    }
  }, [isSupported, isEnabled]);

  return {
    light: useCallback(() => {
      if (isSupported && isEnabled) haptics.light();
    }, [isSupported, isEnabled]),

    medium: useCallback(() => {
      if (isSupported && isEnabled) haptics.medium();
    }, [isSupported, isEnabled]),

    heavy: useCallback(() => {
      if (isSupported && isEnabled) haptics.heavy();
    }, [isSupported, isEnabled]),

    success: useCallback(() => {
      if (isSupported && isEnabled) haptics.success();
    }, [isSupported, isEnabled]),

    error: useCallback(() => {
      if (isSupported && isEnabled) haptics.error();
    }, [isSupported, isEnabled]),

    selection: useCallback(() => {
      if (isSupported && isEnabled) haptics.selection();
    }, [isSupported, isEnabled]),

    trigger,
    isSupported,
    isEnabled,
    setEnabled,
  };
}
