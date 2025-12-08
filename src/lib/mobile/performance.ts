/**
 * Performance Optimization Utilities for Mobile
 * Provides tools for lazy loading, optimization, and resource management
 */

import { ComponentType, lazy } from 'react';

/**
 * Debounce function calls to reduce frequency
 * Useful for scroll, resize, and input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls to limit execution rate
 * Ensures function is called at most once per specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Create a lazy-loaded component with retry capability
 * Automatically retries failed imports up to maxRetries times
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let retries = 0;

      const attemptImport = () => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (retries < maxRetries) {
              retries++;
              console.warn(
                `Component import failed (attempt ${retries}/${maxRetries}). Retrying...`
              );
              setTimeout(attemptImport, retryDelay);
            } else {
              console.error('Component import failed after maximum retries', error);
              reject(error);
            }
          });
      };

      attemptImport();
    });
  });
}

/**
 * Image optimization helper
 * Returns optimized image attributes for responsive loading
 */
export function optimizeImage(src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
}) {
  const { width, height } = options || {};

  // In production, this would integrate with an image optimization service
  // For now, return basic responsive attributes
  return {
    src,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height }),
  };
}

/**
 * Memory management utilities
 */
export const memoryManagement = {
  /**
   * Clear component cache for React.lazy components
   */
  clearLazyCache: () => {
    // Clear module cache if needed
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes('component-cache')) {
            caches.delete(name);
          }
        });
      });
    }
  },

  /**
   * Monitor memory usage (if available)
   */
  getMemoryInfo: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const performance = window.performance as any;
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          usage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
        };
      }
    }
    return null;
  },

  /**
   * Request garbage collection (if available)
   * Note: Only works in development with special flags
   */
  requestGarbageCollection: () => {
    if (typeof window !== 'undefined') {
      const gc = (window as any).gc;
      if (typeof gc === 'function') {
        gc();
      }
    }
  },
};

/**
 * Bundle size tracking utilities
 */
export const bundleTracking = {
  /**
   * Log component load time for performance monitoring
   */
  trackComponentLoad: (componentName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    console.debug(`[Bundle] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);

    // In production, send to analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Component Load', {
        component: componentName,
        loadTime,
      });
    }
  },

  /**
   * Get current bundle load status
   */
  getBundleStats: () => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as any;
      const resources = window.performance.getEntriesByType('resource');

      return {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, resource: any) => sum + (resource.transferSize || 0), 0),
        loadTime: navigation?.loadEventEnd - navigation?.fetchStart,
        domInteractive: navigation?.domInteractive - navigation?.fetchStart,
      };
    }
    return null;
  },
};

/**
 * Intersection Observer helper for lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  });
}

/**
 * Prefetch resources for better performance
 */
export function prefetchResource(href: string, type: 'style' | 'script' | 'image' | 'fetch') {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type === 'fetch' ? 'fetch' : type;
  link.href = href;

  if (type === 'fetch') {
    link.setAttribute('crossorigin', 'anonymous');
  }

  document.head.appendChild(link);
}

/**
 * Detect slow network conditions
 */
export function isSlowNetwork(): boolean {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection;
  if (!connection) return false;

  // Check for slow connection types
  const slowTypes = ['slow-2g', '2g', '3g'];
  if (slowTypes.includes(connection.effectiveType)) {
    return true;
  }

  // Check for save-data preference
  if (connection.saveData) {
    return true;
  }

  return false;
}

/**
 * Adaptive loading based on device capabilities
 */
export function getDeviceCapabilities() {
  if (typeof window === 'undefined') {
    return {
      canHandleHighQuality: false,
      shouldReduceAnimations: false,
      isSlowNetwork: false,
    };
  }

  // const connection = (navigator as any).connection;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : false;

  return {
    canHandleHighQuality: !isLowEndDevice && !isSlowNetwork(),
    shouldReduceAnimations: prefersReducedMotion || isLowEndDevice,
    isSlowNetwork: isSlowNetwork(),
    deviceMemory: (navigator as any).deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
  };
}
