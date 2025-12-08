/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliant helpers for screen readers, focus management, and user preferences
 */

/**
 * Announce message to screen readers
 * Uses ARIA live regions for accessibility announcements
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  // Find or create live region
  let liveRegion = document.getElementById(`sr-live-${priority}`);

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = `sr-live-${priority}`;
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';

    // Add screen-reader-only styles
    Object.assign(liveRegion.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });

    document.body.appendChild(liveRegion);
  }

  // Clear previous message and announce new one
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
}

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within an element (for modals, dialogs)
   */
  trapFocus: (element: HTMLElement): (() => void) => {
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Return focus to previously focused element
   */
  returnFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  },

  /**
   * Get currently focused element
   */
  getCurrentFocus: (): HTMLElement | null => {
    return document.activeElement as HTMLElement;
  },

  /**
   * Move focus to element by selector or ref
   */
  moveFocusTo: (target: HTMLElement | string) => {
    const element = typeof target === 'string'
      ? document.querySelector<HTMLElement>(target)
      : target;

    if (element) {
      element.focus();

      // Scroll into view if needed
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  },
};

/**
 * Detect user preference for reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect high contrast mode preference
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Windows high contrast mode
  const highContrastMedia = window.matchMedia('(prefers-contrast: high)');
  if (highContrastMedia.matches) return true;

  // Fallback detection for older browsers
  const testDiv = document.createElement('div');
  testDiv.style.borderColor = 'transparent';
  testDiv.style.borderWidth = '1px';
  document.body.appendChild(testDiv);

  const isHighContrast = window.getComputedStyle(testDiv).borderColor !== 'transparent';
  document.body.removeChild(testDiv);

  return isHighContrast;
}

/**
 * Detect dark mode preference
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get user's preferred font size multiplier
 * Returns 1 for default, >1 for larger, <1 for smaller
 */
export function getFontScalePreference(): number {
  if (typeof window === 'undefined') return 1;

  // Create a test element
  const testDiv = document.createElement('div');
  testDiv.style.fontSize = '16px';
  testDiv.style.position = 'absolute';
  testDiv.style.visibility = 'hidden';
  document.body.appendChild(testDiv);

  const computedSize = parseFloat(window.getComputedStyle(testDiv).fontSize);
  document.body.removeChild(testDiv);

  // Return multiplier (computed / default)
  return computedSize / 16;
}

/**
 * Listen for accessibility preference changes
 */
export function watchAccessibilityPreferences(callbacks: {
  onReducedMotionChange?: (enabled: boolean) => void;
  onHighContrastChange?: (enabled: boolean) => void;
  onDarkModeChange?: (enabled: boolean) => void;
}): () => void {
  if (typeof window === 'undefined') return () => {};

  const listeners: Array<() => void> = [];

  // Watch reduced motion
  if (callbacks.onReducedMotionChange) {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotionHandler = (e: MediaQueryListEvent) => {
      callbacks.onReducedMotionChange!(e.matches);
    };
    reducedMotionQuery.addEventListener('change', reducedMotionHandler);
    listeners.push(() => reducedMotionQuery.removeEventListener('change', reducedMotionHandler));
  }

  // Watch high contrast
  if (callbacks.onHighContrastChange) {
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const highContrastHandler = (e: MediaQueryListEvent) => {
      callbacks.onHighContrastChange!(e.matches);
    };
    highContrastQuery.addEventListener('change', highContrastHandler);
    listeners.push(() => highContrastQuery.removeEventListener('change', highContrastHandler));
  }

  // Watch dark mode
  if (callbacks.onDarkModeChange) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const darkModeHandler = (e: MediaQueryListEvent) => {
      callbacks.onDarkModeChange!(e.matches);
    };
    darkModeQuery.addEventListener('change', darkModeHandler);
    listeners.push(() => darkModeQuery.removeEventListener('change', darkModeHandler));
  }

  // Return cleanup function
  return () => {
    listeners.forEach(cleanup => cleanup());
  };
}

/**
 * ARIA utilities for dynamic content
 */
export const aria = {
  /**
   * Set ARIA attributes on an element
   */
  setAttributes: (element: HTMLElement, attributes: Record<string, string>) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key.startsWith('aria-') ? key : `aria-${key}`, value);
    });
  },

  /**
   * Announce loading state
   */
  announceLoading: (message: string = 'Loading...') => {
    announceToScreenReader(message, 'polite');
  },

  /**
   * Announce success
   */
  announceSuccess: (message: string) => {
    announceToScreenReader(message, 'polite');
  },

  /**
   * Announce error
   */
  announceError: (message: string) => {
    announceToScreenReader(message, 'assertive');
  },

  /**
   * Create accessible label for form field
   */
  labelField: (input: HTMLElement, _label: string, required: boolean = false) => {
    const labelId = `${input.id || 'field'}-label`;
    input.setAttribute('aria-labelledby', labelId);
    if (required) {
      input.setAttribute('aria-required', 'true');
    }
    return labelId;
  },

  /**
   * Create accessible description for element
   */
  describeElement: (element: HTMLElement, _description: string) => {
    const descId = `${element.id || 'element'}-desc`;
    element.setAttribute('aria-describedby', descId);
    return descId;
  },
};

/**
 * Keyboard navigation helpers
 */
export const keyboard = {
  /**
   * Check if Enter or Space key was pressed (for custom buttons)
   */
  isActivationKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' ';
  },

  /**
   * Check if Escape key was pressed
   */
  isEscapeKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Escape';
  },

  /**
   * Get arrow key direction
   */
  getArrowDirection: (event: KeyboardEvent): 'up' | 'down' | 'left' | 'right' | null => {
    switch (event.key) {
      case 'ArrowUp': return 'up';
      case 'ArrowDown': return 'down';
      case 'ArrowLeft': return 'left';
      case 'ArrowRight': return 'right';
      default: return null;
    }
  },
};

/**
 * Color contrast checker (WCAG 2.1 AA compliance)
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return { ratio: 0, passesAA: false, passesAAA: false };
  }

  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);

  const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

  return {
    ratio,
    passesAA: ratio >= 4.5,      // WCAG AA for normal text
    passesAAA: ratio >= 7,        // WCAG AAA for normal text
  };
}
