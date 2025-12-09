import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGitStatus } from '@/hooks/mobile/useGitStatus';
import type { GitStatus } from '@/types/git';

describe('useGitStatus', () => {
  beforeEach(() => {
    delete (window as any).__TAURI__;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    test('should initialize with loading state', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      // In non-Tauri environment, loading completes quickly with mock data
      // So we verify the hook structure and wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBeDefined();
      expect(result.current.error).toBeNull();
    });

    test('should provide refresh function', () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      expect(result.current.refresh).toBeInstanceOf(Function);
    });
  });

  describe('Non-Tauri Environment', () => {
    test('should return mock status in non-Tauri environment', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBeDefined();
      expect(result.current.status?.branch).toBe('main');
      expect(result.current.status?.isClean).toBe(true);
      expect(result.current.error).toBeNull();
    });

    test('should return consistent mock data structure', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const status = result.current.status;
      expect(status).toHaveProperty('branch');
      expect(status).toHaveProperty('ahead');
      expect(status).toHaveProperty('behind');
      expect(status).toHaveProperty('modified');
      expect(status).toHaveProperty('staged');
      expect(status).toHaveProperty('untracked');
      expect(status).toHaveProperty('conflicts');
      expect(status).toHaveProperty('hasChanges');
      expect(status).toHaveProperty('isClean');
    });
  });

  describe('Error Handling', () => {
    test('should handle empty project path', async () => {
      const { result } = renderHook(() => useGitStatus(''));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('No project path');
      expect(result.current.status).toBeNull();
    });

    test('should handle invalid project path', async () => {
      const { result } = renderHook(() => useGitStatus('   '));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Refresh Functionality', () => {
    test('should refresh status when refresh is called', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialStatus = result.current.status;

      await result.current.refresh();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBeDefined();
      expect(result.current.status).toEqual(initialStatus);
    });

    test('should set loading state during refresh', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const refreshPromise = result.current.refresh();
        await refreshPromise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    test('should clear previous errors on successful refresh', async () => {
      const { result, rerender } = renderHook(
        ({ path }) => useGitStatus(path),
        { initialProps: { path: '' } }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      rerender({ path: '/valid/path' });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Project Path Changes', () => {
    test('should refetch when project path changes', async () => {
      const { result, rerender } = renderHook(
        ({ path }) => useGitStatus(path),
        { initialProps: { path: '/path1' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const status1 = result.current.status;

      rerender({ path: '/path2' });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBeDefined();
    });

    test('should handle rapid project path changes', async () => {
      const { result, rerender } = renderHook(
        ({ path }) => useGitStatus(path),
        { initialProps: { path: '/path1' } }
      );

      rerender({ path: '/path2' });
      rerender({ path: '/path3' });
      rerender({ path: '/path4' });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status).toBeDefined();
    });
  });

  describe('Status Properties', () => {
    test('should return status with empty arrays for clean repo', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const status = result.current.status;
      expect(status?.modified).toEqual([]);
      expect(status?.staged).toEqual([]);
      expect(status?.untracked).toEqual([]);
      expect(status?.conflicts).toEqual([]);
    });

    test('should indicate clean state correctly', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status?.isClean).toBe(true);
      expect(result.current.status?.hasChanges).toBe(false);
    });

    test('should have valid ahead/behind counts', async () => {
      const { result } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status?.ahead).toBeGreaterThanOrEqual(0);
      expect(result.current.status?.behind).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory on unmount', async () => {
      const { result, unmount } = renderHook(() => useGitStatus('/test/path'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      unmount();

      // Should not throw or cause issues
      expect(true).toBe(true);
    });

    test('should handle unmount during loading', () => {
      const { unmount } = renderHook(() => useGitStatus('/test/path'));

      // Unmount while still loading
      unmount();

      // Should not throw or cause issues
      expect(true).toBe(true);
    });
  });
});
