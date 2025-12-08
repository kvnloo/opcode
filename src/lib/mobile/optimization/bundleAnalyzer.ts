/**
 * Bundle Analysis Utilities
 *
 * Tracks component sizes, identifies large dependencies,
 * suggests code splitting points, and generates optimization reports.
 */

interface BundleMetrics {
  size: number;
  gzipSize: number;
  modules: ModuleInfo[];
  chunks: ChunkInfo[];
  timestamp: number;
}

interface ModuleInfo {
  name: string;
  size: number;
  gzipSize: number;
  importedBy: string[];
  imports: string[];
}

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  isEntry: boolean;
  isDynamic: boolean;
}

interface OptimizationSuggestion {
  type: 'code-split' | 'tree-shake' | 'replace' | 'lazy-load';
  module: string;
  reason: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
}

interface BundleReport {
  totalSize: number;
  totalGzipSize: number;
  largestModules: ModuleInfo[];
  suggestions: OptimizationSuggestion[];
  performanceScore: number;
  timestamp: number;
}

/**
 * Analyzes bundle composition and identifies optimization opportunities
 */
export class BundleAnalyzer {
  private metrics: BundleMetrics | null = null;
  private readonly SIZE_THRESHOLDS = {
    module: 50 * 1024, // 50KB
    chunk: 200 * 1024, // 200KB
    total: 500 * 1024, // 500KB (gzipped)
  };

  /**
   * Records current bundle metrics
   */
  recordMetrics(metrics: Partial<BundleMetrics>): void {
    this.metrics = {
      size: metrics.size || 0,
      gzipSize: metrics.gzipSize || 0,
      modules: metrics.modules || [],
      chunks: metrics.chunks || [],
      timestamp: Date.now(),
    };
  }

  /**
   * Analyzes a module's size and impact
   */
  analyzeModule(modulePath: string): ModuleInfo | null {
    if (!this.metrics) return null;

    return this.metrics.modules.find((m) => m.name === modulePath) || null;
  }

  /**
   * Identifies large dependencies that should be code-split
   */
  identifyLargeDependencies(): ModuleInfo[] {
    if (!this.metrics) return [];

    return this.metrics.modules
      .filter((m) => m.size > this.SIZE_THRESHOLDS.module)
      .sort((a, b) => b.size - a.size);
  }

  /**
   * Suggests code splitting points based on bundle analysis
   */
  suggestCodeSplitting(): OptimizationSuggestion[] {
    if (!this.metrics) return [];

    const suggestions: OptimizationSuggestion[] = [];
    const largeModules = this.identifyLargeDependencies();

    largeModules.forEach((module) => {
      // Suggest code splitting for large UI components
      if (module.name.includes('/components/') && module.size > 30 * 1024) {
        suggestions.push({
          type: 'code-split',
          module: module.name,
          reason: 'Large UI component that can be lazy-loaded',
          potentialSavings: module.gzipSize,
          priority: module.size > 100 * 1024 ? 'high' : 'medium',
        });
      }

      // Suggest splitting for vendor libraries
      if (module.name.includes('node_modules') && module.size > 50 * 1024) {
        suggestions.push({
          type: 'code-split',
          module: module.name,
          reason: 'Large third-party library',
          potentialSavings: module.gzipSize,
          priority: 'high',
        });
      }

      // Check for redundant dependencies
      if (module.importedBy.length > 5) {
        suggestions.push({
          type: 'tree-shake',
          module: module.name,
          reason: `Widely imported (${module.importedBy.length} files) - ensure tree-shaking`,
          potentialSavings: Math.floor(module.gzipSize * 0.3),
          priority: 'medium',
        });
      }
    });

    return suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  /**
   * Analyzes chunk distribution and identifies optimization opportunities
   */
  analyzeChunks(): ChunkInfo[] {
    if (!this.metrics) return [];

    return this.metrics.chunks
      .filter((chunk) => chunk.size > this.SIZE_THRESHOLDS.chunk)
      .sort((a, b) => b.size - a.size);
  }

  /**
   * Generates a comprehensive optimization report
   */
  generateReport(): BundleReport {
    if (!this.metrics) {
      return {
        totalSize: 0,
        totalGzipSize: 0,
        largestModules: [],
        suggestions: [],
        performanceScore: 0,
        timestamp: Date.now(),
      };
    }

    const largestModules = this.identifyLargeDependencies().slice(0, 10);
    const suggestions = this.suggestCodeSplitting();
    const performanceScore = this.calculatePerformanceScore();

    return {
      totalSize: this.metrics.size,
      totalGzipSize: this.metrics.gzipSize,
      largestModules,
      suggestions,
      performanceScore,
      timestamp: this.metrics.timestamp,
    };
  }

  /**
   * Calculates a performance score (0-100) based on bundle metrics
   */
  private calculatePerformanceScore(): number {
    if (!this.metrics) return 0;

    let score = 100;

    // Penalize total bundle size
    if (this.metrics.gzipSize > this.SIZE_THRESHOLDS.total) {
      const excess = this.metrics.gzipSize - this.SIZE_THRESHOLDS.total;
      score -= Math.min(40, (excess / this.SIZE_THRESHOLDS.total) * 40);
    }

    // Penalize large modules
    const largeModules = this.identifyLargeDependencies();
    score -= Math.min(30, largeModules.length * 3);

    // Penalize large chunks
    const largeChunks = this.analyzeChunks();
    score -= Math.min(20, largeChunks.length * 5);

    // Bonus for good chunk splitting
    const dynamicChunks = this.metrics.chunks.filter((c) => c.isDynamic).length;
    score += Math.min(10, dynamicChunks * 2);

    return Math.max(0, Math.round(score));
  }

  /**
   * Tracks bundle size over time for regression detection
   */
  trackSizeHistory(key: string): void {
    if (!this.metrics) return;

    const history = this.getSizeHistory(key);
    history.push({
      timestamp: this.metrics.timestamp,
      size: this.metrics.size,
      gzipSize: this.metrics.gzipSize,
    });

    // Keep only last 30 entries
    if (history.length > 30) {
      history.shift();
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        `bundle-history-${key}`,
        JSON.stringify(history)
      );
    }
  }

  /**
   * Retrieves bundle size history
   */
  getSizeHistory(key: string): Array<{ timestamp: number; size: number; gzipSize: number }> {
    if (typeof localStorage === 'undefined') return [];

    const data = localStorage.getItem(`bundle-history-${key}`);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Detects bundle size regressions
   */
  detectRegressions(key: string, threshold = 0.1): boolean {
    const history = this.getSizeHistory(key);
    if (history.length < 2 || !this.metrics) return false;

    const previousSize = history[history.length - 1].gzipSize;
    const currentSize = this.metrics.gzipSize;
    const increase = (currentSize - previousSize) / previousSize;

    return increase > threshold;
  }

  /**
   * Exports report as JSON
   */
  exportReport(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  /**
   * Logs optimization suggestions to console
   */
  logSuggestions(): void {
    const report = this.generateReport();

    console.group('📦 Bundle Analysis Report');
    console.log(`Total Size: ${(report.totalSize / 1024).toFixed(2)}KB`);
    console.log(`Gzipped: ${(report.totalGzipSize / 1024).toFixed(2)}KB`);
    console.log(`Performance Score: ${report.performanceScore}/100`);

    if (report.suggestions.length > 0) {
      console.group('💡 Optimization Suggestions');
      report.suggestions.forEach((suggestion, idx) => {
        console.log(
          `${idx + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.type}: ${suggestion.module}`
        );
        console.log(`   Reason: ${suggestion.reason}`);
        console.log(
          `   Potential Savings: ${(suggestion.potentialSavings / 1024).toFixed(2)}KB`
        );
      });
      console.groupEnd();
    }

    if (report.largestModules.length > 0) {
      console.group('📊 Largest Modules');
      report.largestModules.forEach((module, idx) => {
        console.log(
          `${idx + 1}. ${module.name}: ${(module.size / 1024).toFixed(2)}KB (${(module.gzipSize / 1024).toFixed(2)}KB gzipped)`
        );
      });
      console.groupEnd();
    }

    console.groupEnd();
  }
}

/**
 * Global bundle analyzer instance
 */
export const bundleAnalyzer = new BundleAnalyzer();

/**
 * Hook for development mode bundle analysis
 */
export function useBundleAnalysis(enabled = process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined' && enabled) {
    // Expose analyzer to window for debugging
    (window as any).__bundleAnalyzer = bundleAnalyzer;

    // Log report on mount
    setTimeout(() => {
      bundleAnalyzer.logSuggestions();
    }, 2000);
  }
}
