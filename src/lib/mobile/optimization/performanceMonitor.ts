/**
 * Performance Monitoring Utilities
 *
 * Tracks Core Web Vitals, bundle metrics, rendering performance,
 * and provides real-time performance insights.
 */

import React from 'react';

export interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive

  // Custom metrics
  componentLoadTime?: number;
  apiResponseTime?: number;
  renderTime?: number;
  bundleSize?: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  fcp: { good: number; needsImprovement: number };
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
  tti: { good: number; needsImprovement: number };
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  scores: {
    fcp: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    lcp: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    fid: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    cls: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    ttfb: 'good' | 'needs-improvement' | 'poor' | 'unknown';
    tti: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  };
  overallScore: number;
  recommendations: string[];
  timestamp: number;
}

/**
 * Performance Monitor for tracking web vitals and custom metrics
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = { timestamp: Date.now() };
  private observers: PerformanceObserver[] = [];
  private readonly thresholds: PerformanceThresholds = {
    fcp: { good: 1500, needsImprovement: 2500 }, // ms
    lcp: { good: 2500, needsImprovement: 4000 }, // ms
    fid: { good: 100, needsImprovement: 300 }, // ms
    cls: { good: 0.1, needsImprovement: 0.25 }, // score
    ttfb: { good: 600, needsImprovement: 1200 }, // ms
    tti: { good: 3000, needsImprovement: 5000 }, // ms
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.measureNavigationTiming();
    }
  }

  /**
   * Initializes performance observers for Web Vitals
   */
  private initializeObservers(): void {
    try {
      // First Contentful Paint
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
          }
        });

        try {
          fcpObserver.observe({ type: 'paint', buffered: true });
          this.observers.push(fcpObserver);
        } catch (e) {
          // Paint timing not supported
        }

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.metrics.lcp = lastEntry.startTime;
          }
        });

        try {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          this.observers.push(lcpObserver);
        } catch (e) {
          // LCP not supported
        }

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              this.metrics.fid = entry.processingStart - entry.startTime;
            }
          });
        });

        try {
          fidObserver.observe({ type: 'first-input', buffered: true });
          this.observers.push(fidObserver);
        } catch (e) {
          // FID not supported
        }

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.cls = clsValue;
            }
          });
        });

        try {
          clsObserver.observe({ type: 'layout-shift', buffered: true });
          this.observers.push(clsObserver);
        } catch (e) {
          // CLS not supported
        }
      }
    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  /**
   * Measures navigation timing metrics
   */
  private measureNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    const loadHandler = () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;

          // Estimate TTI (when main thread is idle)
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            requestIdleCallback(() => {
              this.metrics.tti = performance.now();
            });
          }
        }
      }, 0);
    };

    if (document.readyState === 'complete') {
      loadHandler();
    } else {
      window.addEventListener('load', loadHandler);
    }
  }

  /**
   * Measures component load time
   */
  measureComponentLoad(componentName: string, startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.metrics.componentLoadTime = loadTime;

    if (loadTime > 1000) {
      console.warn(`Slow component load: ${componentName} took ${loadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Measures API response time
   */
  measureApiCall(endpoint: string, startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.metrics.apiResponseTime = responseTime;

    if (responseTime > 2000) {
      console.warn(`Slow API call: ${endpoint} took ${responseTime.toFixed(2)}ms`);
    }
  }

  /**
   * Measures render time
   */
  measureRender(callback: () => void): void {
    const startTime = performance.now();
    callback();
    const renderTime = performance.now() - startTime;
    this.metrics.renderTime = renderTime;

    if (renderTime > 16.67) {
      // More than one frame at 60fps
      console.warn(`Slow render: ${renderTime.toFixed(2)}ms (target: <16.67ms for 60fps)`);
    }
  }

  /**
   * Evaluates metric score
   */
  private evaluateMetric(
    value: number | undefined,
    threshold: { good: number; needsImprovement: number }
  ): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
    if (value === undefined) return 'unknown';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Generates performance report
   */
  generateReport(): PerformanceReport {
    const scores = {
      fcp: this.evaluateMetric(this.metrics.fcp, this.thresholds.fcp),
      lcp: this.evaluateMetric(this.metrics.lcp, this.thresholds.lcp),
      fid: this.evaluateMetric(this.metrics.fid, this.thresholds.fid),
      cls: this.evaluateMetric(this.metrics.cls, this.thresholds.cls),
      ttfb: this.evaluateMetric(this.metrics.ttfb, this.thresholds.ttfb),
      tti: this.evaluateMetric(this.metrics.tti, this.thresholds.tti),
    };

    const recommendations = this.generateRecommendations(scores);
    const overallScore = this.calculateOverallScore(scores);

    return {
      metrics: this.metrics,
      scores,
      overallScore,
      recommendations,
      timestamp: Date.now(),
    };
  }

  /**
   * Generates recommendations based on scores
   */
  private generateRecommendations(scores: PerformanceReport['scores']): string[] {
    const recommendations: string[] = [];

    if (scores.fcp === 'poor' || scores.fcp === 'needs-improvement') {
      recommendations.push(
        'Improve First Contentful Paint by optimizing critical rendering path and reducing render-blocking resources'
      );
    }

    if (scores.lcp === 'poor' || scores.lcp === 'needs-improvement') {
      recommendations.push(
        'Optimize Largest Contentful Paint by lazy loading images, using CDN, and optimizing server response times'
      );
    }

    if (scores.fid === 'poor' || scores.fid === 'needs-improvement') {
      recommendations.push(
        'Reduce First Input Delay by breaking up long tasks, using web workers, and deferring non-critical JavaScript'
      );
    }

    if (scores.cls === 'poor' || scores.cls === 'needs-improvement') {
      recommendations.push(
        'Minimize Cumulative Layout Shift by setting dimensions for images/videos and avoiding dynamic content injection'
      );
    }

    if (scores.ttfb === 'poor' || scores.ttfb === 'needs-improvement') {
      recommendations.push(
        'Improve Time to First Byte by optimizing server response, using edge caching, and reducing redirects'
      );
    }

    if (scores.tti === 'poor' || scores.tti === 'needs-improvement') {
      recommendations.push(
        'Improve Time to Interactive by code splitting, reducing JavaScript bundle size, and optimizing third-party scripts'
      );
    }

    return recommendations;
  }

  /**
   * Calculates overall performance score (0-100)
   */
  private calculateOverallScore(scores: PerformanceReport['scores']): number {
    const scoreValues = Object.values(scores).map((score) => {
      if (score === 'good') return 100;
      if (score === 'needs-improvement') return 50;
      if (score === 'poor') return 0;
      return 50; // unknown
    });

    return Math.round(scoreValues.reduce((a: number, b: number) => a + b, 0) / scoreValues.length);
  }

  /**
   * Logs performance report to console
   */
  logReport(): void {
    const report = this.generateReport();

    console.group('⚡ Performance Report');

    console.group('📊 Core Web Vitals');
    if (this.metrics.fcp) {
      console.log(`FCP: ${this.metrics.fcp.toFixed(2)}ms (${report.scores.fcp})`);
    }
    if (this.metrics.lcp) {
      console.log(`LCP: ${this.metrics.lcp.toFixed(2)}ms (${report.scores.lcp})`);
    }
    if (this.metrics.fid !== undefined) {
      console.log(`FID: ${this.metrics.fid.toFixed(2)}ms (${report.scores.fid})`);
    }
    if (this.metrics.cls !== undefined) {
      console.log(`CLS: ${this.metrics.cls.toFixed(3)} (${report.scores.cls})`);
    }
    if (this.metrics.ttfb) {
      console.log(`TTFB: ${this.metrics.ttfb.toFixed(2)}ms (${report.scores.ttfb})`);
    }
    if (this.metrics.tti) {
      console.log(`TTI: ${this.metrics.tti.toFixed(2)}ms (${report.scores.tti})`);
    }
    console.groupEnd();

    console.log(`Overall Score: ${report.overallScore}/100`);

    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations');
      report.recommendations.forEach((rec, idx) => {
        console.log(`${idx + 1}. ${rec}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Gets current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Sends metrics to analytics endpoint
   */
  async sendToAnalytics(endpoint: string): Promise<void> {
    const report = this.generateReport();

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * Cleans up observers
   */
  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName?: string) {
  if (typeof window !== 'undefined' && componentName) {
    const startTime = performance.now();

    return () => {
      performanceMonitor.measureComponentLoad(componentName, startTime);
    };
  }

  return () => {};
}

/**
 * Higher-order component for performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const cleanup = usePerformanceMonitor(componentName);

    React.useEffect(() => {
      return cleanup;
    }, [cleanup]);

    return React.createElement(Component, props);
  };
}

/**
 * Utility to mark performance milestones
 */
export function markPerformance(name: string): void {
  if (typeof window !== 'undefined' && typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Utility to measure between performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string): number {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      return measure ? measure.duration : 0;
    } catch (error) {
      console.warn(`Failed to measure performance: ${name}`, error);
      return 0;
    }
  }
  return 0;
}

// Auto-log report in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logReport();
    }, 3000);
  });
}
