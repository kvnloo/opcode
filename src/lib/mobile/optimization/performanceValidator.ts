/**
 * Performance Validation Utilities
 *
 * Validates that performance metrics meet required targets.
 * Provides automated testing and continuous monitoring.
 */

import { performanceMonitor, PerformanceMetrics } from './performanceMonitor';
import { bundleAnalyzer } from './bundleAnalyzer';
import { memoryManager } from './memoryManager';

interface PerformanceTargets {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  tti: number;
  bundleSize: number;
  frameRate: number;
}

interface ValidationResult {
  passed: boolean;
  metric: string;
  target: number;
  actual: number;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
}

interface PerformanceValidationReport {
  passed: boolean;
  score: number;
  results: ValidationResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
  timestamp: number;
}

/**
 * Performance Validator
 */
export class PerformanceValidator {
  private readonly targets: PerformanceTargets = {
    fcp: 1500, // First Contentful Paint < 1.5s
    lcp: 2500, // Largest Contentful Paint < 2.5s
    fid: 100, // First Input Delay < 100ms
    cls: 0.1, // Cumulative Layout Shift < 0.1
    tti: 3000, // Time to Interactive < 3s
    bundleSize: 500 * 1024, // Bundle size < 500KB (gzipped)
    frameRate: 60, // Target 60fps
  };

  /**
   * Validates First Contentful Paint
   */
  private validateFCP(metrics: PerformanceMetrics): ValidationResult {
    const actual = metrics.fcp;

    if (actual === undefined) {
      return {
        passed: false,
        metric: 'First Contentful Paint (FCP)',
        target: this.targets.fcp,
        actual: 0,
        status: 'skip',
        message: 'FCP metric not available yet',
      };
    }

    const passed = actual <= this.targets.fcp;
    const warn = actual <= this.targets.fcp * 1.5;

    return {
      passed,
      metric: 'First Contentful Paint (FCP)',
      target: this.targets.fcp,
      actual,
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `FCP is ${actual.toFixed(2)}ms (target: <${this.targets.fcp}ms) ✓`
        : `FCP is ${actual.toFixed(2)}ms, exceeds target of ${this.targets.fcp}ms ✗`,
    };
  }

  /**
   * Validates Largest Contentful Paint
   */
  private validateLCP(metrics: PerformanceMetrics): ValidationResult {
    const actual = metrics.lcp;

    if (actual === undefined) {
      return {
        passed: false,
        metric: 'Largest Contentful Paint (LCP)',
        target: this.targets.lcp,
        actual: 0,
        status: 'skip',
        message: 'LCP metric not available yet',
      };
    }

    const passed = actual <= this.targets.lcp;
    const warn = actual <= this.targets.lcp * 1.5;

    return {
      passed,
      metric: 'Largest Contentful Paint (LCP)',
      target: this.targets.lcp,
      actual,
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `LCP is ${actual.toFixed(2)}ms (target: <${this.targets.lcp}ms) ✓`
        : `LCP is ${actual.toFixed(2)}ms, exceeds target of ${this.targets.lcp}ms ✗`,
    };
  }

  /**
   * Validates First Input Delay
   */
  private validateFID(metrics: PerformanceMetrics): ValidationResult {
    const actual = metrics.fid;

    if (actual === undefined) {
      return {
        passed: true, // FID is only measured on user interaction
        metric: 'First Input Delay (FID)',
        target: this.targets.fid,
        actual: 0,
        status: 'skip',
        message: 'FID requires user interaction to measure',
      };
    }

    const passed = actual <= this.targets.fid;
    const warn = actual <= this.targets.fid * 2;

    return {
      passed,
      metric: 'First Input Delay (FID)',
      target: this.targets.fid,
      actual,
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `FID is ${actual.toFixed(2)}ms (target: <${this.targets.fid}ms) ✓`
        : `FID is ${actual.toFixed(2)}ms, exceeds target of ${this.targets.fid}ms ✗`,
    };
  }

  /**
   * Validates Cumulative Layout Shift
   */
  private validateCLS(metrics: PerformanceMetrics): ValidationResult {
    const actual = metrics.cls;

    if (actual === undefined) {
      return {
        passed: false,
        metric: 'Cumulative Layout Shift (CLS)',
        target: this.targets.cls,
        actual: 0,
        status: 'skip',
        message: 'CLS metric not available yet',
      };
    }

    const passed = actual <= this.targets.cls;
    const warn = actual <= this.targets.cls * 2;

    return {
      passed,
      metric: 'Cumulative Layout Shift (CLS)',
      target: this.targets.cls,
      actual,
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `CLS is ${actual.toFixed(3)} (target: <${this.targets.cls}) ✓`
        : `CLS is ${actual.toFixed(3)}, exceeds target of ${this.targets.cls} ✗`,
    };
  }

  /**
   * Validates Time to Interactive
   */
  private validateTTI(metrics: PerformanceMetrics): ValidationResult {
    const actual = metrics.tti;

    if (actual === undefined) {
      return {
        passed: false,
        metric: 'Time to Interactive (TTI)',
        target: this.targets.tti,
        actual: 0,
        status: 'skip',
        message: 'TTI metric not available yet',
      };
    }

    const passed = actual <= this.targets.tti;
    const warn = actual <= this.targets.tti * 1.5;

    return {
      passed,
      metric: 'Time to Interactive (TTI)',
      target: this.targets.tti,
      actual,
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `TTI is ${actual.toFixed(2)}ms (target: <${this.targets.tti}ms) ✓`
        : `TTI is ${actual.toFixed(2)}ms, exceeds target of ${this.targets.tti}ms ✗`,
    };
  }

  /**
   * Validates bundle size
   */
  private validateBundleSize(): ValidationResult {
    const report = bundleAnalyzer.generateReport();
    const actual = report.totalGzipSize;

    if (actual === 0) {
      return {
        passed: false,
        metric: 'Bundle Size',
        target: this.targets.bundleSize,
        actual: 0,
        status: 'skip',
        message: 'Bundle size not measured yet',
      };
    }

    const passed = actual <= this.targets.bundleSize;
    const warn = actual <= this.targets.bundleSize * 1.2;

    return {
      passed,
      metric: 'Bundle Size',
      target: this.targets.bundleSize,
      actual,
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `Bundle size is ${(actual / 1024).toFixed(2)}KB (target: <${(this.targets.bundleSize / 1024).toFixed(0)}KB gzipped) ✓`
        : `Bundle size is ${(actual / 1024).toFixed(2)}KB, exceeds target of ${(this.targets.bundleSize / 1024).toFixed(0)}KB ✗`,
    };
  }

  /**
   * Validates frame rate (60fps = 16.67ms per frame)
   */
  private validateFrameRate(): ValidationResult {
    const targetFrameTime = 1000 / this.targets.frameRate; // 16.67ms
    const metrics = performanceMonitor.getMetrics();
    const actual = metrics.renderTime;

    if (actual === undefined) {
      return {
        passed: true,
        metric: 'Frame Rate',
        target: this.targets.frameRate,
        actual: 0,
        status: 'skip',
        message: 'Frame rate not measured yet',
      };
    }

    const passed = actual <= targetFrameTime;
    const warn = actual <= targetFrameTime * 1.5;

    return {
      passed,
      metric: 'Frame Rate',
      target: this.targets.frameRate,
      actual: Math.round(1000 / actual),
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `Render time is ${actual.toFixed(2)}ms (${Math.round(1000 / actual)}fps, target: ${this.targets.frameRate}fps) ✓`
        : `Render time is ${actual.toFixed(2)}ms (${Math.round(1000 / actual)}fps), slower than target ${this.targets.frameRate}fps ✗`,
    };
  }

  /**
   * Validates memory usage
   */
  private validateMemoryUsage(): ValidationResult {
    const pressure = memoryManager.detectMemoryPressure();

    const passed = pressure.level === 'normal';
    const warn = pressure.level === 'moderate';

    return {
      passed,
      metric: 'Memory Usage',
      target: 0.7, // 70% usage threshold
      actual: pressure.usage,
      status: passed ? 'pass' : warn ? 'warn' : 'fail',
      message: passed
        ? `Memory usage is ${(pressure.usage * 100).toFixed(1)}% (level: ${pressure.level}) ✓`
        : `Memory pressure detected: ${pressure.level} (${(pressure.usage * 100).toFixed(1)}% used) ✗`,
    };
  }

  /**
   * Runs all performance validations
   */
  validate(): PerformanceValidationReport {
    const metrics = performanceMonitor.getMetrics();

    const results: ValidationResult[] = [
      this.validateFCP(metrics),
      this.validateLCP(metrics),
      this.validateFID(metrics),
      this.validateCLS(metrics),
      this.validateTTI(metrics),
      this.validateBundleSize(),
      this.validateFrameRate(),
      this.validateMemoryUsage(),
    ];

    const summary = {
      passed: results.filter((r) => r.status === 'pass').length,
      failed: results.filter((r) => r.status === 'fail').length,
      warnings: results.filter((r) => r.status === 'warn').length,
      skipped: results.filter((r) => r.status === 'skip').length,
    };

    // Calculate score (excluding skipped)
    const scoredResults = results.filter((r) => r.status !== 'skip');
    const score = scoredResults.length > 0
      ? Math.round(
          (scoredResults.filter((r) => r.status === 'pass').length / scoredResults.length) * 100
        )
      : 0;

    const passed = summary.failed === 0 && summary.passed > 0;

    return {
      passed,
      score,
      results,
      summary,
      timestamp: Date.now(),
    };
  }

  /**
   * Logs validation report to console
   */
  logValidation(): void {
    const report = this.validate();

    console.group('🎯 Performance Validation');

    console.log(`Overall: ${report.passed ? '✓ PASSED' : '✗ FAILED'}`);
    console.log(`Score: ${report.score}/100`);
    console.log('');

    // Group by status
    const passed = report.results.filter((r) => r.status === 'pass');
    const failed = report.results.filter((r) => r.status === 'fail');
    const warnings = report.results.filter((r) => r.status === 'warn');
    const skipped = report.results.filter((r) => r.status === 'skip');

    if (failed.length > 0) {
      console.group('❌ Failed');
      failed.forEach((r) => console.log(r.message));
      console.groupEnd();
    }

    if (warnings.length > 0) {
      console.group('⚠️  Warnings');
      warnings.forEach((r) => console.log(r.message));
      console.groupEnd();
    }

    if (passed.length > 0) {
      console.group('✅ Passed');
      passed.forEach((r) => console.log(r.message));
      console.groupEnd();
    }

    if (skipped.length > 0) {
      console.group('⏭️  Skipped');
      skipped.forEach((r) => console.log(r.message));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Asserts that all validations pass (for testing)
   */
  assert(): void {
    const report = this.validate();

    if (!report.passed) {
      const failedMetrics = report.results
        .filter((r) => r.status === 'fail')
        .map((r) => r.metric)
        .join(', ');

      throw new Error(
        `Performance validation failed for: ${failedMetrics}. Score: ${report.score}/100`
      );
    }
  }

  /**
   * Continuous monitoring with alerts
   */
  startMonitoring(
    interval = 30000,
    onFail?: (report: PerformanceValidationReport) => void
  ): () => void {
    const intervalId = setInterval(() => {
      const report = this.validate();

      if (!report.passed && onFail) {
        onFail(report);
      }

      // Log if score drops below 70
      if (report.score < 70) {
        console.warn(`Performance score dropped to ${report.score}/100`);
        this.logValidation();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }

  /**
   * Updates performance targets
   */
  setTargets(targets: Partial<PerformanceTargets>): void {
    Object.assign(this.targets, targets);
  }

  /**
   * Gets current targets
   */
  getTargets(): PerformanceTargets {
    return { ...this.targets };
  }
}

/**
 * Global performance validator instance
 */
export const performanceValidator = new PerformanceValidator();

/**
 * React hook for performance validation
 */
export function usePerformanceValidation(enabled = process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined' && enabled) {
    // Run validation after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceValidator.logValidation();
      }, 5000); // Wait 5s for metrics to stabilize
    });
  }
}

// Auto-validate in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceValidator.logValidation();
    }, 5000);
  });
}
