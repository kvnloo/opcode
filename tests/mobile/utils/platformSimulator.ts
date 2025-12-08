/**
 * Platform simulation utilities for testing responsive behavior
 * Simulates different devices by setting window dimensions and user agent
 */

interface PlatformConfig {
  width: number;
  height: number;
  userAgent: string;
  touchSupport: boolean;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  mobile: {
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    touchSupport: true,
  },
  tablet: {
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    touchSupport: true,
  },
  desktop: {
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    touchSupport: false,
  },
};

/**
 * Simulates a mobile device (iPhone)
 * Sets window size to 375x667 and mobile user agent
 *
 * @example
 * ```tsx
 * import { simulateMobile } from '@/tests/mobile/utils/platformSimulator';
 *
 * beforeEach(() => {
 *   simulateMobile();
 * });
 *
 * test('shows mobile menu', () => {
 *   render(<Navigation />);
 *   expect(screen.getByLabelText('hamburger menu')).toBeVisible();
 * });
 * ```
 */
export function simulateMobile(): void {
  setPlatform(PLATFORM_CONFIGS.mobile);
}

/**
 * Simulates a tablet device (iPad)
 * Sets window size to 768x1024 and tablet user agent
 */
export function simulateTablet(): void {
  setPlatform(PLATFORM_CONFIGS.tablet);
}

/**
 * Simulates a desktop device
 * Sets window size to 1920x1080 and desktop user agent
 */
export function simulateDesktop(): void {
  setPlatform(PLATFORM_CONFIGS.desktop);
}

/**
 * Sets custom platform dimensions and user agent
 *
 * @example
 * ```tsx
 * simulateCustomPlatform({
 *   width: 414,
 *   height: 896,
 *   userAgent: 'Custom UA',
 *   touchSupport: true
 * });
 * ```
 */
export function simulateCustomPlatform(config: PlatformConfig): void {
  setPlatform(config);
}

/**
 * Internal function to set platform configuration
 */
function setPlatform(config: PlatformConfig): void {
  // Set window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: config.width,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: config.height,
  });

  // Set user agent
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: config.userAgent,
  });

  // Set touch support
  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    configurable: true,
    value: config.touchSupport ? {} : undefined,
  });

  // Trigger resize event to update media queries
  window.dispatchEvent(new Event('resize'));
}

/**
 * Restores window to default desktop dimensions
 * Use in afterEach to clean up
 */
export function restoreDefaultPlatform(): void {
  simulateDesktop();
}

/**
 * Gets current simulated viewport dimensions
 */
export function getCurrentViewport(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Checks if current viewport matches mobile breakpoint
 */
export function isMobileViewport(): boolean {
  return window.innerWidth < 768;
}

/**
 * Checks if current viewport matches tablet breakpoint
 */
export function isTabletViewport(): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Checks if current viewport matches desktop breakpoint
 */
export function isDesktopViewport(): boolean {
  return window.innerWidth >= 1024;
}
