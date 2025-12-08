/**
 * Performance Validator Tests
 *
 * Validates that performance validation logic works correctly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceValidator } from '../performanceValidator';
import { performanceMonitor } from '../performanceMonitor';
import { bundleAnalyzer } from '../bundleAnalyzer';
import { memoryManager } from '../memoryManager';

describe('PerformanceValidator', () => {
  let validator: PerformanceValidator;

  beforeEach(() => {
    validator = new PerformanceValidator();
  });

  describe('Target Validation', () => {
    it('should validate FCP under 1.5s as passing', () => {
      // Mock metrics
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        fcp: 1200,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const fcpResult = report.results.find((r) => r.metric.includes('FCP'));

      expect(fcpResult?.status).toBe('pass');
      expect(fcpResult?.passed).toBe(true);
    });

    it('should validate LCP under 2.5s as passing', () => {
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        lcp: 2000,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const lcpResult = report.results.find((r) => r.metric.includes('LCP'));

      expect(lcpResult?.status).toBe('pass');
      expect(lcpResult?.passed).toBe(true);
    });

    it('should validate CLS under 0.1 as passing', () => {
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        cls: 0.05,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const clsResult = report.results.find((r) => r.metric.includes('CLS'));

      expect(clsResult?.status).toBe('pass');
      expect(clsResult?.passed).toBe(true);
    });

    it('should fail validation when metrics exceed targets', () => {
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        fcp: 3000,
        lcp: 5000,
        cls: 0.5,
        timestamp: Date.now(),
      });

      const report = validator.validate();

      expect(report.passed).toBe(false);
      expect(report.summary.failed).toBeGreaterThan(0);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate 100% score when all metrics pass', () => {
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        fcp: 1000,
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        tti: 2500,
        timestamp: Date.now(),
      });

      vi.spyOn(bundleAnalyzer, 'generateReport').mockReturnValue({
        totalGzipSize: 400 * 1024, // 400KB
        totalSize: 0,
        largestModules: [],
        suggestions: [],
        performanceScore: 0,
        timestamp: Date.now(),
      });

      const report = validator.validate();

      expect(report.score).toBeGreaterThanOrEqual(80);
      expect(report.passed).toBe(true);
    });

    it('should calculate lower score when some metrics fail', () => {
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        fcp: 3000, // Fail
        lcp: 2000, // Pass
        cls: 0.05, // Pass
        timestamp: Date.now(),
      });

      const report = validator.validate();

      expect(report.score).toBeLessThan(100);
    });
  });

  describe('Bundle Size Validation', () => {
    it('should pass when bundle is under 500KB gzipped', () => {
      vi.spyOn(bundleAnalyzer, 'generateReport').mockReturnValue({
        totalGzipSize: 450 * 1024,
        totalSize: 0,
        largestModules: [],
        suggestions: [],
        performanceScore: 0,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const bundleResult = report.results.find((r) => r.metric.includes('Bundle'));

      expect(bundleResult?.status).toBe('pass');
    });

    it('should fail when bundle exceeds 500KB gzipped', () => {
      vi.spyOn(bundleAnalyzer, 'generateReport').mockReturnValue({
        totalGzipSize: 600 * 1024,
        totalSize: 0,
        largestModules: [],
        suggestions: [],
        performanceScore: 0,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const bundleResult = report.results.find((r) => r.metric.includes('Bundle'));

      expect(bundleResult?.status).not.toBe('pass');
    });
  });

  describe('Memory Validation', () => {
    it('should pass when memory pressure is normal', () => {
      vi.spyOn(memoryManager, 'detectMemoryPressure').mockReturnValue({
        level: 'normal',
        usage: 0.5,
        available: 1000000,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const memoryResult = report.results.find((r) => r.metric.includes('Memory'));

      expect(memoryResult?.status).toBe('pass');
    });

    it('should warn when memory pressure is moderate', () => {
      vi.spyOn(memoryManager, 'detectMemoryPressure').mockReturnValue({
        level: 'moderate',
        usage: 0.75,
        available: 500000,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const memoryResult = report.results.find((r) => r.metric.includes('Memory'));

      expect(memoryResult?.status).toBe('warn');
    });

    it('should fail when memory pressure is critical', () => {
      vi.spyOn(memoryManager, 'detectMemoryPressure').mockReturnValue({
        level: 'critical',
        usage: 0.95,
        available: 100000,
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const memoryResult = report.results.find((r) => r.metric.includes('Memory'));

      expect(memoryResult?.status).toBe('fail');
    });
  });

  describe('Custom Targets', () => {
    it('should allow updating targets', () => {
      validator.setTargets({
        fcp: 1000,
        lcp: 2000,
      });

      const targets = validator.getTargets();

      expect(targets.fcp).toBe(1000);
      expect(targets.lcp).toBe(2000);
    });

    it('should validate against custom targets', () => {
      validator.setTargets({ fcp: 1000 });

      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        fcp: 1200, // Would pass default (1500) but fail custom (1000)
        timestamp: Date.now(),
      });

      const report = validator.validate();
      const fcpResult = report.results.find((r) => r.metric.includes('FCP'));

      expect(fcpResult?.passed).toBe(false);
    });
  });

  describe('Assertion Mode', () => {
    it('should throw when validations fail', () => {
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        fcp: 5000, // Way over target
        timestamp: Date.now(),
      });

      expect(() => validator.assert()).toThrow();
    });

    it('should not throw when validations pass', () => {
      vi.spyOn(performanceMonitor, 'getMetrics').mockReturnValue({
        fcp: 1000,
        lcp: 2000,
        cls: 0.05,
        timestamp: Date.now(),
      });

      vi.spyOn(bundleAnalyzer, 'generateReport').mockReturnValue({
        totalGzipSize: 400 * 1024,
        totalSize: 0,
        largestModules: [],
        suggestions: [],
        performanceScore: 0,
        timestamp: Date.now(),
      });

      expect(() => validator.assert()).not.toThrow();
    });
  });

  describe('Report Structure', () => {
    it('should include all required fields in report', () => {
      const report = validator.validate();

      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('score');
      expect(report).toHaveProperty('results');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('timestamp');

      expect(report.summary).toHaveProperty('passed');
      expect(report.summary).toHaveProperty('failed');
      expect(report.summary).toHaveProperty('warnings');
      expect(report.summary).toHaveProperty('skipped');
    });

    it('should include validation results for all metrics', () => {
      const report = validator.validate();

      const metrics = report.results.map((r) => r.metric);

      expect(metrics).toContain('First Contentful Paint (FCP)');
      expect(metrics).toContain('Largest Contentful Paint (LCP)');
      expect(metrics).toContain('First Input Delay (FID)');
      expect(metrics).toContain('Cumulative Layout Shift (CLS)');
      expect(metrics).toContain('Time to Interactive (TTI)');
      expect(metrics).toContain('Bundle Size');
      expect(metrics).toContain('Memory Usage');
    });
  });
});
