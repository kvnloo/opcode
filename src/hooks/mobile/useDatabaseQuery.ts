import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface QueryResult {
  data: any[];
  total: number;
  page?: number;
  pageSize?: number;
}

interface DatabaseQueryHookResult {
  result: QueryResult | null;
  isLoading: boolean;
  error: Error | null;
  execute: (query: string) => Promise<QueryResult>;
  clear: () => void;
}

/**
 * Hook for executing database queries
 * Provides loading state, error handling, and result management
 */
export function useDatabaseQuery(): DatabaseQueryHookResult {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (query: string): Promise<QueryResult> => {
    if (!query || !query.trim()) {
      const error = new Error('Query cannot be empty');
      setError(error);
      throw error;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.storageExecuteSql(query);

      // Normalize the result to always have QueryResult shape
      const normalizedResult: QueryResult = {
        data: Array.isArray(data) ? data : data?.data || [],
        total: data?.total || (Array.isArray(data) ? data.length : 0),
        page: data?.page,
        pageSize: data?.pageSize,
      };

      setResult(normalizedResult);
      return normalizedResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query execution failed');
      setError(error);
      setResult(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, execute, clear };
}
