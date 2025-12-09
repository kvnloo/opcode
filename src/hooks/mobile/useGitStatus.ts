import { useState, useEffect, useCallback } from 'react';
import type { GitStatus } from '@/types/git';

interface GitStatusHookResult {
  status: GitStatus | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing git status
 * Provides automatic refreshing and error handling
 */
export function useGitStatus(projectPath: string): GitStatusHookResult {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!projectPath) {
      setError(new Error('No project path provided'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation for non-Tauri environments
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        const mockStatus: GitStatus = {
          branch: 'main',
          ahead: 0,
          behind: 0,
          modified: [],
          staged: [],
          untracked: [],
          conflicts: [],
          hasChanges: false,
          isClean: true,
        };
        setStatus(mockStatus);
        setIsLoading(false);
        return;
      }

      // In real implementation, call Tauri backend
      // const result = await api.getGitStatus(projectPath);
      // setStatus(result);

      // For now, return mock data
      const mockStatus: GitStatus = {
        branch: 'main',
        ahead: 0,
        behind: 0,
        modified: [],
        staged: [],
        untracked: [],
        conflicts: [],
        hasChanges: false,
        isClean: true,
      };
      setStatus(mockStatus);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch git status');
      setError(error);
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, isLoading, error, refresh };
}
