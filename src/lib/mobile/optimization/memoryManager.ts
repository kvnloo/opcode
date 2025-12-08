/**
 * Memory Management Utilities
 *
 * Provides component cleanup, cache limits, memory pressure detection,
 * and garbage collection hints for optimal mobile performance.
 */

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryPressure {
  level: 'normal' | 'moderate' | 'critical';
  usage: number;
  available: number;
  timestamp: number;
}

interface CacheConfig {
  maxSize: number;
  maxAge: number;
  onEvict?: (key: string, value: any) => void;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  size: number;
  hits: number;
}

/**
 * LRU Cache with memory limits
 */
export class MemoryAwareCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private currentSize = 0;

  constructor(private config: CacheConfig) {}

  /**
   * Sets a value in cache
   */
  set(key: string, value: T, size = 1): void {
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Evict entries if needed
    while (
      this.currentSize + size > this.config.maxSize &&
      this.cache.size > 0
    ) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      size,
      hits: 0,
    };

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  /**
   * Gets a value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check expiration
    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.delete(key);
      return undefined;
    }

    // Update LRU
    entry.timestamp = Date.now();
    entry.hits++;

    return entry.value;
  }

  /**
   * Deletes a value from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.config.onEvict) {
      this.config.onEvict(key, entry.value);
    }

    this.currentSize -= entry.size;
    return this.cache.delete(key);
  }

  /**
   * Evicts least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < lruTimestamp) {
        lruTimestamp = entry.timestamp;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  /**
   * Clears entire cache
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Gets current cache size
   */
  getSize(): number {
    return this.currentSize;
  }

  /**
   * Gets cache stats
   */
  getStats() {
    return {
      entries: this.cache.size,
      size: this.currentSize,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  private calculateHitRate(): number {
    let totalHits = 0;
    let totalAccesses = 0;

    this.cache.forEach((entry) => {
      totalHits += entry.hits;
      totalAccesses += entry.hits + 1; // +1 for initial set
    });

    return totalAccesses > 0 ? totalHits / totalAccesses : 0;
  }
}

/**
 * Memory Manager for mobile optimization
 */
export class MemoryManager {
  private cleanupCallbacks = new Set<() => void>();
  private memoryCheckInterval?: number;
  // private _lastMemoryCheck = 0; // Currently unused
  private readonly CHECK_INTERVAL = 5000; // 5 seconds

  /**
   * Gets current memory info (if available)
   */
  getMemoryInfo(): MemoryInfo | null {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  /**
   * Detects current memory pressure level
   */
  detectMemoryPressure(): MemoryPressure {
    const info = this.getMemoryInfo();

    if (!info) {
      return {
        level: 'normal',
        usage: 0,
        available: 0,
        timestamp: Date.now(),
      };
    }

    const usage = info.usedJSHeapSize / info.jsHeapSizeLimit;
    const available = info.jsHeapSizeLimit - info.usedJSHeapSize;

    let level: 'normal' | 'moderate' | 'critical';
    if (usage > 0.9) {
      level = 'critical';
    } else if (usage > 0.7) {
      level = 'moderate';
    } else {
      level = 'normal';
    }

    return {
      level,
      usage,
      available,
      timestamp: Date.now(),
    };
  }

  /**
   * Registers a cleanup callback
   */
  registerCleanup(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback);
    return () => this.cleanupCallbacks.delete(callback);
  }

  /**
   * Triggers all registered cleanup callbacks
   */
  cleanup(): void {
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Cleanup callback failed:', error);
      }
    });
  }

  /**
   * Hints garbage collector (if supported)
   */
  requestGarbageCollection(): void {
    // Hint to browser that GC would be appropriate
    // This doesn't force GC but may help in some browsers
    if (typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (error) {
        // GC may not be available in production
      }
    }

    // Create and release objects to hint GC
    let temp: any[] = [];
    for (let i = 0; i < 1000; i++) {
      temp.push({ data: new Array(100) });
    }
    temp = [];
  }

  /**
   * Starts automatic memory monitoring
   */
  startMonitoring(
    onPressure?: (pressure: MemoryPressure) => void
  ): () => void {
    this.memoryCheckInterval = window.setInterval(() => {
      const pressure = this.detectMemoryPressure();

      if (pressure.level !== 'normal') {
        console.warn(`Memory pressure detected: ${pressure.level}`, {
          usage: `${(pressure.usage * 100).toFixed(1)}%`,
          available: `${(pressure.available / 1024 / 1024).toFixed(2)}MB`,
        });

        if (onPressure) {
          onPressure(pressure);
        }

        // Auto-cleanup on moderate pressure
        if (pressure.level === 'moderate') {
          this.cleanup();
        }

        // Aggressive cleanup on critical pressure
        if (pressure.level === 'critical') {
          this.cleanup();
          this.requestGarbageCollection();
        }
      }

      // this._lastMemoryCheck = Date.now(); // Currently unused
    }, this.CHECK_INTERVAL);

    return () => {
      if (this.memoryCheckInterval) {
        clearInterval(this.memoryCheckInterval);
        this.memoryCheckInterval = undefined;
      }
    };
  }

  /**
   * Component cleanup helper
   */
  createComponentCleanup(): {
    register: (cleanup: () => void) => void;
    cleanup: () => void;
  } {
    const cleanups: Array<() => void> = [];

    return {
      register: (cleanup: () => void) => cleanups.push(cleanup),
      cleanup: () => {
        cleanups.forEach((fn) => {
          try {
            fn();
          } catch (error) {
            console.error('Component cleanup failed:', error);
          }
        });
        cleanups.length = 0;
      },
    };
  }

  /**
   * Debounced function with automatic cleanup
   */
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): T & { cancel: () => void } {
    let timeoutId: number | undefined;

    const debounced = ((...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), delay);
    }) as T & { cancel: () => void };

    debounced.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    this.registerCleanup(() => debounced.cancel());

    return debounced;
  }

  /**
   * Throttled function with automatic cleanup
   */
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): T & { cancel: () => void } {
    let timeoutId: number | undefined;
    let lastRun = 0;

    const throttled = ((...args: any[]) => {
      const now = Date.now();

      if (now - lastRun >= delay) {
        fn(...args);
        lastRun = now;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          fn(...args);
          lastRun = Date.now();
        }, delay - (now - lastRun));
      }
    }) as T & { cancel: () => void };

    throttled.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    this.registerCleanup(() => throttled.cancel());

    return throttled;
  }

  /**
   * Creates an AbortController with cleanup
   */
  createAbortController(): AbortController {
    const controller = new AbortController();
    this.registerCleanup(() => controller.abort());
    return controller;
  }

  /**
   * Logs current memory stats
   */
  logMemoryStats(): void {
    const info = this.getMemoryInfo();
    const pressure = this.detectMemoryPressure();

    console.group('💾 Memory Stats');

    if (info) {
      console.log(`Used: ${(info.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Total: ${(info.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Limit: ${(info.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Usage: ${(pressure.usage * 100).toFixed(1)}%`);
    } else {
      console.log('Memory info not available');
    }

    console.log(`Pressure Level: ${pressure.level}`);
    console.log(`Cleanup Callbacks: ${this.cleanupCallbacks.size}`);

    console.groupEnd();
  }
}

/**
 * Global memory manager instance
 */
export const memoryManager = new MemoryManager();

/**
 * React hook for component cleanup
 */
export function useComponentCleanup() {
  const cleanup = memoryManager.createComponentCleanup();

  if (typeof window !== 'undefined') {
    // Cleanup on unmount
    window.addEventListener('beforeunload', cleanup.cleanup);
    return () => {
      cleanup.cleanup();
      window.removeEventListener('beforeunload', cleanup.cleanup);
    };
  }

  return cleanup.cleanup;
}
