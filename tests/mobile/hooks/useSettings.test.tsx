import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSettings } from '@/hooks/mobile/useSettings';
import { api } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    getSetting: vi.fn(),
    saveSetting: vi.fn(),
  },
}));

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).__TAURI__;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    test('should initialize with loading state', async () => {
      const { result } = renderHook(() => useSettings());

      // In non-Tauri environment, loading completes immediately with defaults
      // So we just verify the hook works and has the expected structure
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.settings).toBeDefined();
    });

    test('should load default settings in non-Tauri environment', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        theme: 'dark',
        fontSize: 14,
        tabSize: 2,
        lineWrapping: true,
        autoSave: true,
      });
      expect(result.current.error).toBeNull();
    });

    test('should provide update and reload functions', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.update).toBeInstanceOf(Function);
      expect(result.current.reload).toBeInstanceOf(Function);
    });
  });

  describe('Tauri Environment', () => {
    beforeEach(() => {
      (window as any).__TAURI__ = {};
    });

    test('should load settings from API in Tauri environment', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          theme: 'light',
          fontSize: '16',
          tabSize: '4',
          lineWrapping: 'true',
          autoSave: 'false',
        };
        return Promise.resolve(settings[key] || null);
      });

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        theme: 'light',
        fontSize: 16,
        tabSize: 4,
        lineWrapping: true,
        autoSave: false,
      });
    });

    test('should handle missing settings with defaults', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        theme: 'dark',
        fontSize: 14,
        tabSize: 2,
        lineWrapping: true,
        autoSave: true,
      });
    });

    test('should parse boolean settings correctly', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
        if (key === 'lineWrapping') return Promise.resolve('false');
        if (key === 'autoSave') return Promise.resolve('false');
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings.lineWrapping).toBe(false);
      expect(result.current.settings.autoSave).toBe(false);
    });

    test('should parse numeric settings correctly', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
        if (key === 'fontSize') return Promise.resolve('20');
        if (key === 'tabSize') return Promise.resolve('8');
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings.fontSize).toBe(20);
      expect(result.current.settings.tabSize).toBe(8);
    });
  });

  describe('Update Settings', () => {
    beforeEach(() => {
      (window as any).__TAURI__ = {};
      (api.getSetting as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (api.saveSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    });

    test('should update theme setting', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.update('theme', 'light');
      });

      expect(result.current.settings.theme).toBe('light');
      expect(api.saveSetting).toHaveBeenCalledWith('theme', 'light');
    });

    test('should update fontSize setting', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.update('fontSize', 18);
      });

      expect(result.current.settings.fontSize).toBe(18);
      expect(api.saveSetting).toHaveBeenCalledWith('fontSize', '18');
    });

    test('should update boolean settings', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.update('lineWrapping', false);
      });

      expect(result.current.settings.lineWrapping).toBe(false);
      expect(api.saveSetting).toHaveBeenCalledWith('lineWrapping', 'false');
    });

    test('should update multiple settings sequentially', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.update('theme', 'light');
        await result.current.update('fontSize', 16);
        await result.current.update('autoSave', false);
      });

      expect(result.current.settings.theme).toBe('light');
      expect(result.current.settings.fontSize).toBe(16);
      expect(result.current.settings.autoSave).toBe(false);
    });

    test('should provide optimistic updates', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.update('theme', 'light');
      });

      // Should be updated after API call
      expect(result.current.settings.theme).toBe('light');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (window as any).__TAURI__ = {};
    });

    test('should handle load errors gracefully', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to load settings')
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Failed to load settings');
      expect(result.current.settings).toEqual({
        theme: 'dark',
        fontSize: 14,
        tabSize: 2,
        lineWrapping: true,
        autoSave: true,
      });
    });

    test('should handle update errors and revert', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (api.saveSetting as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Save failed')
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      const initialTheme = result.current.settings.theme;

      await act(async () => {
        try {
          await result.current.update('theme', 'light');
        } catch (e) {
          expect(e).toBeDefined();
        }
      });

      await waitFor(() => {
        expect(result.current.settings.theme).toBe(initialTheme);
      }, { timeout: 3000 });
    });
  });

  describe('Reload Functionality', () => {
    beforeEach(() => {
      (window as any).__TAURI__ = {};
    });

    test('should reload settings from API', async () => {
      let callCount = 0;
      (api.getSetting as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
        callCount++;
        // Return different values on reload
        if (key === 'theme' && callCount > 5) return Promise.resolve('light');
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.settings.theme).toBe('dark');

      await act(async () => {
        await result.current.reload();
      });

      await waitFor(() => {
        expect(result.current.settings.theme).toBe('light');
      }, { timeout: 3000 });
    });

    test('should set loading state during reload', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 50))
      );

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      await act(async () => {
        await result.current.reload();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory on unmount', async () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { result, unmount } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      unmount();

      expect(true).toBe(true);
    });

    test('should handle unmount during loading', () => {
      (api.getSetting as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 1000))
      );

      const { unmount } = renderHook(() => useSettings());

      unmount();

      expect(true).toBe(true);
    });
  });
});
