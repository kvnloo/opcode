import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isCommandNotFoundError,
  isTauriEnvironment,
  handleApiError,
  withRetry,
  withTimeout,
  withFallback,
  isFeatureUnavailable,
  getUserMessage,
} from '@/lib/mobile/apiErrorHandler';

describe('apiErrorHandler', () => {
  describe('isCommandNotFoundError', () => {
    test('should detect command not found errors', () => {
      const error = new Error('Command "test_command" not found');
      expect(isCommandNotFoundError(error)).toBe(true);
    });

    test('should detect command not found in string', () => {
      const error = 'Error: Command not found in registry';
      expect(isCommandNotFoundError(error)).toBe(true);
    });

    test('should return false for other errors', () => {
      const error = new Error('Network connection failed');
      expect(isCommandNotFoundError(error)).toBe(false);
    });

    test('should handle non-error values', () => {
      expect(isCommandNotFoundError('some string')).toBe(false);
      expect(isCommandNotFoundError(null)).toBe(false);
      expect(isCommandNotFoundError(undefined)).toBe(false);
    });
  });

  describe('isTauriEnvironment', () => {
    beforeEach(() => {
      delete (window as any).__TAURI__;
    });

    test('should return true when __TAURI__ is defined', () => {
      (window as any).__TAURI__ = {};
      expect(isTauriEnvironment()).toBe(true);
    });

    test('should return false when __TAURI__ is undefined', () => {
      expect(isTauriEnvironment()).toBe(false);
    });

    test('should return false in non-browser environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      expect(isTauriEnvironment()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('handleApiError', () => {
    test('should handle command not found errors', () => {
      const error = new Error('Command "test" not found');
      const result = handleApiError(error);

      expect(result.code).toBe('COMMAND_NOT_FOUND');
      expect(result.message).toContain('not available');
      expect(result.details).toBeDefined();
    });

    test('should handle network errors', () => {
      const error = new TypeError('fetch failed');
      const result = handleApiError(error);

      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.message).toContain('Network');
      expect(result.details).toBe(error.message);
    });

    test('should handle standard errors', () => {
      const error = new Error('Something went wrong');
      const result = handleApiError(error);

      expect(result.code).toBe('API_ERROR');
      expect(result.message).toBe('Something went wrong');
      expect(result.details).toBeDefined();
    });

    test('should handle unknown error types', () => {
      const error = 'string error';
      const result = handleApiError(error);

      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toContain('unexpected');
      expect(result.details).toBe('string error');
    });

    test('should handle null errors', () => {
      const result = handleApiError(null);

      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toContain('unexpected');
    });
  });

  describe('withRetry', () => {
    test('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 3, delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        withRetry(fn, { retries: 3, delay: 10 })
      ).rejects.toThrow('Always fails');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should not retry command not found errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Command not found'));

      await expect(
        withRetry(fn, { retries: 3, delay: 10 })
      ).rejects.toThrow('Command not found');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should call onRetry callback', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      await withRetry(fn, { retries: 2, delay: 10, onRetry });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    test('should use exponential backoff', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      await withRetry(fn, { retries: 3, delay: 100, backoff: 2 });
      const duration = Date.now() - startTime;

      // Should have waited ~100ms + ~200ms = ~300ms
      expect(duration).toBeGreaterThanOrEqual(250);
    });
  });

  describe('withTimeout', () => {
    test('should resolve if promise completes in time', async () => {
      const promise = Promise.resolve('success');

      const result = await withTimeout(promise, 1000);

      expect(result).toBe('success');
    });

    test('should reject if promise takes too long', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 200));

      await expect(
        withTimeout(promise, 50)
      ).rejects.toThrow('Operation timed out');
    });

    test('should use custom timeout message', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 200));

      await expect(
        withTimeout(promise, 50, 'Custom timeout message')
      ).rejects.toThrow('Custom timeout message');
    });

    test('should clear timeout on success', async () => {
      const promise = Promise.resolve('success');

      const result = await withTimeout(promise, 1000);

      expect(result).toBe('success');
      // Should not throw or cause issues
    });
  });

  describe('withFallback', () => {
    test('should return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withFallback(fn, 'fallback');

      expect(result).toBe('success');
    });

    test('should return fallback on error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Failed'));

      const result = await withFallback(fn, 'fallback');

      expect(result).toBe('fallback');
    });

    test('should log error by default', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const fn = vi.fn().mockRejectedValue(new Error('Failed'));

      await withFallback(fn, 'fallback');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should not log error when logError is false', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const fn = vi.fn().mockRejectedValue(new Error('Failed'));

      await withFallback(fn, 'fallback', { logError: false });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should call onError callback', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Failed'));
      const onError = vi.fn();

      await withFallback(fn, 'fallback', { onError });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('isFeatureUnavailable', () => {
    test('should detect command not found errors', () => {
      const error = new Error('Command "test" not found');
      expect(isFeatureUnavailable(error)).toBe(true);
    });

    test('should detect not available errors', () => {
      const error = new Error('This feature is not available');
      expect(isFeatureUnavailable(error)).toBe(true);
    });

    test('should return false for other errors', () => {
      const error = new Error('Network connection failed');
      expect(isFeatureUnavailable(error)).toBe(false);
    });
  });

  describe('getUserMessage', () => {
    test('should return message for command not found', () => {
      const error = new Error('Command "test" not found');
      const message = getUserMessage(error);

      expect(message).toContain('not available');
    });

    test('should return message for network errors', () => {
      const error = new TypeError('fetch failed');
      const message = getUserMessage(error);

      expect(message).toContain('Connection failed');
    });

    test('should return error message for API errors', () => {
      const error = new Error('Custom error message');
      const message = getUserMessage(error);

      expect(message).toBe('Custom error message');
    });

    test('should return generic message for unknown errors', () => {
      const error = 'string error';
      const message = getUserMessage(error);

      expect(message).toContain('Something went wrong');
    });
  });
});
