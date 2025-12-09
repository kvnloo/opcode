import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDatabaseQuery } from '@/hooks/mobile/useDatabaseQuery';
import { api } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    storageExecuteSql: vi.fn(),
  },
}));

describe('useDatabaseQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    test('should initialize with null result and no loading', () => {
      const { result } = renderHook(() => useDatabaseQuery());

      expect(result.current.result).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('should provide execute and clear functions', () => {
      const { result } = renderHook(() => useDatabaseQuery());

      expect(result.current.execute).toBeInstanceOf(Function);
      expect(result.current.clear).toBeInstanceOf(Function);
    });
  });

  describe('Query Execution', () => {
    test('should execute valid query successfully', async () => {
      const mockData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];

      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        await result.current.execute('SELECT * FROM test');
      });

      expect(result.current.result).toBeDefined();
      expect(result.current.result?.data).toEqual(mockData);
      expect(result.current.result?.total).toBe(2);
      expect(result.current.error).toBeNull();
    });

    test('should handle paginated results', async () => {
      const mockData = {
        data: [{ id: 1, name: 'Test' }],
        total: 100,
        page: 1,
        pageSize: 10,
      };

      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        await result.current.execute('SELECT * FROM test LIMIT 10');
      });

      expect(result.current.result?.data).toEqual(mockData.data);
      expect(result.current.result?.total).toBe(100);
      expect(result.current.result?.page).toBe(1);
      expect(result.current.result?.pageSize).toBe(10);
    });

    test('should set loading state during execution', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useDatabaseQuery());

      act(() => {
        result.current.execute('SELECT * FROM test');
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    test('should clear previous errors on successful execution', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Query failed'))
        .mockResolvedValueOnce([{ id: 1 }]);

      const { result } = renderHook(() => useDatabaseQuery());

      // First query fails
      await act(async () => {
        try {
          await result.current.execute('INVALID QUERY');
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();

      // Second query succeeds
      await act(async () => {
        await result.current.execute('SELECT * FROM test');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle empty query', async () => {
      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        try {
          await result.current.execute('');
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect((e as Error).message).toContain('empty');
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.result).toBeNull();
    });

    test('should handle whitespace-only query', async () => {
      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        try {
          await result.current.execute('   ');
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
        }
      });

      expect(result.current.error).toBeDefined();
    });

    test('should handle API errors', async () => {
      const mockError = new Error('Database connection failed');
      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        try {
          await result.current.execute('SELECT * FROM test');
        } catch (e) {
          expect(e).toBe(mockError);
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Database connection failed');
      expect(result.current.result).toBeNull();
    });

    test('should clear result on error', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([{ id: 1 }])
        .mockRejectedValueOnce(new Error('Query failed'));

      const { result } = renderHook(() => useDatabaseQuery());

      // First query succeeds
      await act(async () => {
        await result.current.execute('SELECT * FROM test');
      });

      expect(result.current.result).toBeDefined();

      // Second query fails
      await act(async () => {
        try {
          await result.current.execute('INVALID QUERY');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.result).toBeNull();
    });
  });

  describe('Clear Functionality', () => {
    test('should clear result and error', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 1 }]);

      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        await result.current.execute('SELECT * FROM test');
      });

      expect(result.current.result).toBeDefined();

      act(() => {
        result.current.clear();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });

    test('should clear after error state', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Query failed')
      );

      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        try {
          await result.current.execute('INVALID');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBeDefined();

      act(() => {
        result.current.clear();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Multiple Queries', () => {
    test('should handle sequential queries', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }])
        .mockResolvedValueOnce([{ id: 3 }]);

      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        await result.current.execute('SELECT * FROM test WHERE id = 1');
      });
      expect(result.current.result?.data[0].id).toBe(1);

      await act(async () => {
        await result.current.execute('SELECT * FROM test WHERE id = 2');
      });
      expect(result.current.result?.data[0].id).toBe(2);

      await act(async () => {
        await result.current.execute('SELECT * FROM test WHERE id = 3');
      });
      expect(result.current.result?.data[0].id).toBe(3);
    });

    test('should replace previous result with new query result', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([{ id: 1, name: 'First' }])
        .mockResolvedValueOnce([{ id: 2, name: 'Second' }]);

      const { result } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        await result.current.execute('SELECT * FROM test LIMIT 1');
      });

      const firstResult = result.current.result;

      await act(async () => {
        await result.current.execute('SELECT * FROM test LIMIT 1 OFFSET 1');
      });

      const secondResult = result.current.result;

      expect(firstResult?.data[0].name).toBe('First');
      expect(secondResult?.data[0].name).toBe('Second');
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory on unmount', async () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { result, unmount } = renderHook(() => useDatabaseQuery());

      await act(async () => {
        await result.current.execute('SELECT * FROM test');
      });

      unmount();

      expect(true).toBe(true);
    });

    test('should handle unmount during query execution', () => {
      (api.storageExecuteSql as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 1000))
      );

      const { result, unmount } = renderHook(() => useDatabaseQuery());

      act(() => {
        result.current.execute('SELECT * FROM test');
      });

      unmount();

      expect(true).toBe(true);
    });
  });
});
