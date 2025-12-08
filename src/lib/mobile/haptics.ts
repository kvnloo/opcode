/**
 * Haptic Feedback Utilities
 * Provides cross-platform haptic feedback with graceful fallback
 * Uses Tauri vibration plugin when available
 */

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

interface HapticPattern {
  duration: number;
  intensity?: number;
}

const HAPTIC_PATTERNS: Record<HapticFeedbackType, HapticPattern | HapticPattern[]> = {
  light: { duration: 10, intensity: 0.3 },
  medium: { duration: 15, intensity: 0.6 },
  heavy: { duration: 25, intensity: 1.0 },
  success: [
    { duration: 10, intensity: 0.5 },
    { duration: 10, intensity: 0.7 },
  ],
  error: [
    { duration: 15, intensity: 0.8 },
    { duration: 15, intensity: 0.8 },
    { duration: 15, intensity: 0.8 },
  ],
  selection: { duration: 5, intensity: 0.4 },
};

class HapticManager {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;
  private useNativeVibration: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check if running in Tauri environment
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      try {
        // Try to import Tauri vibration plugin
        // Note: This requires @tauri-apps/plugin-haptics to be added to dependencies
        // For now, we'll use a placeholder check
        this.isSupported = true;
      } catch (e) {
        console.debug('Tauri haptics not available');
      }
    }

    // Fallback to browser Vibration API
    if (!this.isSupported && 'vibrate' in navigator) {
      this.useNativeVibration = true;
      this.isSupported = true;
    }

    // Check user preferences
    this.loadPreferences();
  }

  private loadPreferences() {
    try {
      const stored = localStorage.getItem('haptics-enabled');
      this.isEnabled = stored === null ? true : stored === 'true';
    } catch (e) {
      // localStorage not available
      this.isEnabled = true;
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem('haptics-enabled', String(this.isEnabled));
    } catch (e) {
      // localStorage not available
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.savePreferences();
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  private async vibrateTauri(pattern: HapticPattern | HapticPattern[]) {
    try {
      // Placeholder for Tauri haptics implementation
      // When @tauri-apps/plugin-haptics is available:
      // const { vibrate } = await import('@tauri-apps/plugin-haptics');
      // await vibrate(pattern);

      // For now, fall back to native vibration
      this.vibrateNative(pattern);
    } catch (e) {
      console.debug('Tauri vibration failed', e);
      this.vibrateNative(pattern);
    }
  }

  private vibrateNative(pattern: HapticPattern | HapticPattern[]) {
    if (!('vibrate' in navigator)) return;

    try {
      if (Array.isArray(pattern)) {
        // Convert pattern array to vibration sequence
        const sequence: number[] = [];
        pattern.forEach((p, i) => {
          sequence.push(p.duration);
          if (i < pattern.length - 1) {
            sequence.push(50); // 50ms pause between vibrations
          }
        });
        navigator.vibrate(sequence);
      } else {
        navigator.vibrate(pattern.duration);
      }
    } catch (e) {
      console.debug('Native vibration failed', e);
    }
  }

  public async trigger(type: HapticFeedbackType) {
    if (!this.isSupported || !this.isEnabled) return;

    const pattern = HAPTIC_PATTERNS[type];

    if (this.useNativeVibration) {
      this.vibrateNative(pattern);
    } else {
      await this.vibrateTauri(pattern);
    }
  }
}

// Singleton instance
const hapticManager = new HapticManager();

// Public API
export const haptics = {
  /**
   * Light tap feedback - for subtle interactions
   */
  light: () => hapticManager.trigger('light'),

  /**
   * Medium impact - for standard button presses
   */
  medium: () => hapticManager.trigger('medium'),

  /**
   * Heavy impact - for significant actions
   */
  heavy: () => hapticManager.trigger('heavy'),

  /**
   * Success pattern - for successful operations
   */
  success: () => hapticManager.trigger('success'),

  /**
   * Error pattern - for errors or warnings
   */
  error: () => hapticManager.trigger('error'),

  /**
   * Selection feedback - for selection changes
   */
  selection: () => hapticManager.trigger('selection'),

  /**
   * Check if haptics are supported on this device
   */
  isSupported: () => hapticManager.getSupported(),

  /**
   * Check if haptics are currently enabled
   */
  isEnabled: () => hapticManager.getEnabled(),

  /**
   * Enable or disable haptic feedback
   */
  setEnabled: (enabled: boolean) => hapticManager.setEnabled(enabled),
};
