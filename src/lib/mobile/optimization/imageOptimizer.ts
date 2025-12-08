/**
 * Image Optimization Utilities
 *
 * Provides lazy loading, responsive sizing, format detection,
 * placeholder generation, and cache management for images.
 */

export interface ImageConfig {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  lazy?: boolean;
  placeholder?: 'blur' | 'shimmer' | 'none';
}

export interface OptimizedImage {
  src: string;
  srcSet: string;
  placeholder?: string;
  width?: number;
  height?: number;
}

export interface CacheConfig {
  maxSize?: number;
  maxAge?: number;
}

export interface CacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

export interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
}

export interface MemoryPressure {
  level: 'low' | 'medium' | 'high' | 'critical';
  shouldOptimize: boolean;
}

export interface PerformanceMetrics {
  fps?: number;
  memory?: MemoryInfo;
  loadTime?: number;
  renderTime?: number;
}

export interface PerformanceThresholds {
  fps: { good: number; needsImprovement: number };
  memory: { good: number; needsImprovement: number };
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  score: number;
  recommendations: string[];
}

/**
 * Manages image optimization and caching
 */
export class ImageOptimizer {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;
  private intersectionObserver?: IntersectionObserver;
  private loadingImages = new Set<string>();

  /**
   * Detects if browser supports WebP format
   */
  supportsWebP(): boolean {
    if (typeof document === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Detects if browser supports AVIF format
   */
  supportsAVIF(): boolean {
    if (typeof document === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  /**
   * Determines optimal image format based on browser support
   */
  getOptimalFormat(requestedFormat?: 'webp' | 'jpeg' | 'png' | 'auto'): string {
    if (requestedFormat && requestedFormat !== 'auto') {
      return requestedFormat;
    }

    if (this.supportsAVIF()) return 'avif';
    if (this.supportsWebP()) return 'webp';
    return 'jpeg';
  }

  /**
   * Generates responsive image srcSet
   */
  generateSrcSet(src: string, widths: number[] = [320, 640, 1024, 1920]): string {
    const format = this.getOptimalFormat();
    return widths
      .map((width) => `${this.getOptimizedUrl(src, width, format)} ${width}w`)
      .join(', ');
  }

  /**
   * Constructs optimized image URL with query parameters
   */
  private getOptimizedUrl(src: string, width?: number, format?: string): string {
    const url = new URL(src, window.location.origin);

    if (width) {
      url.searchParams.set('w', width.toString());
    }

    if (format) {
      url.searchParams.set('fm', format);
    }

    // Default quality for mobile
    if (!url.searchParams.has('q')) {
      url.searchParams.set('q', '85');
    }

    return url.toString();
  }

  /**
   * Generates blur placeholder data URL
   */
  async generateBlurPlaceholder(src: string, width = 40, height = 40): Promise<string> {
    if (typeof document === 'undefined') return '';

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.drawImage(img, 0, 0, width, height);
      ctx.filter = 'blur(10px)';
      ctx.drawImage(canvas, 0, 0);

      return canvas.toDataURL('image/jpeg', 0.1);
    } catch (error) {
      console.warn('Failed to generate blur placeholder:', error);
      return '';
    }
  }

  /**
   * Generates shimmer placeholder SVG
   */
  generateShimmerPlaceholder(width: number, height: number): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shimmer" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0%" stop-color="#f0f0f0">
              <animate attributeName="stop-color" values="#f0f0f0;#e0e0e0;#f0f0f0" dur="2s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" stop-color="#e0e0e0">
              <animate attributeName="stop-color" values="#e0e0e0;#d0d0d0;#e0e0e0" dur="2s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stop-color="#f0f0f0">
              <animate attributeName="stop-color" values="#f0f0f0;#e0e0e0;#f0f0f0" dur="2s" repeatCount="indefinite"/>
            </stop>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#shimmer)"/>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Optimizes image configuration
   */
  async optimizeImage(config: ImageConfig): Promise<OptimizedImage> {
    const format = this.getOptimalFormat(config.format);
    const src = this.getOptimizedUrl(config.src, config.width, format);
    const srcSet = this.generateSrcSet(config.src);

    let placeholder: string | undefined;

    if (config.placeholder === 'blur') {
      placeholder = await this.generateBlurPlaceholder(config.src);
    } else if (config.placeholder === 'shimmer' && config.width && config.height) {
      placeholder = this.generateShimmerPlaceholder(config.width, config.height);
    }

    return {
      src,
      srcSet,
      placeholder,
      width: config.width,
      height: config.height,
    };
  }

  /**
   * Lazy loads an image using Intersection Observer
   */
  lazyLoad(
    img: HTMLImageElement,
    options: IntersectionObserverInit = { rootMargin: '50px' }
  ): () => void {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: load immediately
      this.loadImage(img);
      return () => {};
    }

    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            this.loadImage(target);
            this.intersectionObserver?.unobserve(target);
          }
        });
      }, options);
    }

    this.intersectionObserver.observe(img);

    return () => {
      this.intersectionObserver?.unobserve(img);
    };
  }

  /**
   * Loads image and updates src
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    const srcSet = img.dataset.srcset;

    if (!src) return;

    // Prevent duplicate loading
    if (this.loadingImages.has(src)) return;
    this.loadingImages.add(src);

    const tempImg = new Image();

    tempImg.onload = () => {
      img.src = src;
      if (srcSet) img.srcset = srcSet;
      img.classList.add('loaded');
      this.loadingImages.delete(src);
    };

    tempImg.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      this.loadingImages.delete(src);
    };

    tempImg.src = src;
    if (srcSet) tempImg.srcset = srcSet;
  }

  /**
   * Adds image to cache
   */
  async cacheImage(url: string): Promise<void> {
    if (this.cache.has(url)) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Evict old entries if cache is full
      while (this.currentCacheSize + blob.size > this.MAX_CACHE_SIZE) {
        this.evictOldestEntry();
      }

      const entry: CacheEntry = {
        url,
        blob,
        timestamp: Date.now(),
        size: blob.size,
      };

      this.cache.set(url, entry);
      this.currentCacheSize += blob.size;
    } catch (error) {
      console.warn(`Failed to cache image: ${url}`, error);
    }
  }

  /**
   * Retrieves image from cache
   */
  getCachedImage(url: string): Blob | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Update timestamp for LRU
    entry.timestamp = Date.now();
    return entry.blob;
  }

  /**
   * Evicts oldest cache entry (LRU)
   */
  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.currentCacheSize -= entry.size;
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Clears entire image cache
   */
  clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  /**
   * Gets current cache size in bytes
   */
  getCacheSize(): number {
    return this.currentCacheSize;
  }

  /**
   * Preloads critical images
   */
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't fail on error
          img.src = url;
        });
      })
    );
  }

  /**
   * Cleans up resources
   */
  destroy(): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
    this.clearCache();
    this.loadingImages.clear();
  }
}

/**
 * Global image optimizer instance
 */
export const imageOptimizer = new ImageOptimizer();
