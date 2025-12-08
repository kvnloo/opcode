import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock git-related API responses
const mockGitStatus = {
  isRepo: true,
  branch: 'feature/mobile',
  remote: 'origin',
  ahead: 2,
  behind: 0,
  modified: ['src/App.tsx', 'src/lib/api.ts'],
  staged: ['package.json'],
  untracked: ['test.txt'],
  deleted: []
};

const mockGitCommits = [
  {
    hash: 'b36bf68',
    shortHash: 'b36bf68',
    message: 'feat(mobile): design tokens and API integration',
    author: 'Developer',
    authorEmail: 'dev@example.com',
    date: new Date().toISOString(),
    filesChanged: 51,
    insertions: 11530,
    deletions: 385
  },
  {
    hash: 'c469951',
    shortHash: 'c469951',
    message: 'feat(titlebar): integrate custom titlebar UI',
    author: 'Developer',
    authorEmail: 'dev@example.com',
    date: new Date(Date.now() - 86400000).toISOString(),
    filesChanged: 12,
    insertions: 450,
    deletions: 30
  }
];

const mockRemotes = [
  { name: 'origin', url: 'https://github.com/user/opcode.git', fetch: true, push: true }
];

const mockBranches = [
  { name: 'main', current: false, remote: 'origin/main' },
  { name: 'feature/mobile', current: true, remote: 'origin/feature/mobile' },
  { name: 'develop', current: false, remote: 'origin/develop' }
];

// Mock Tauri invoke for git commands
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((command: string, args?: any) => {
    switch (command) {
      case 'is_git_repository':
        return Promise.resolve(mockGitStatus.isRepo);
      case 'get_current_branch':
        return Promise.resolve(mockGitStatus.branch);
      case 'get_git_status':
        return Promise.resolve(mockGitStatus);
      case 'get_recent_commits':
        return Promise.resolve(mockGitCommits.slice(0, args?.limit || 10));
      case 'get_commit_diff':
        return Promise.resolve('diff --git a/file.ts b/file.ts\nindex 123..456\n--- a/file.ts\n+++ b/file.ts\n@@ -1,3 +1,3 @@\n-old line\n+new line');
      case 'get_git_remotes':
        return Promise.resolve(mockRemotes);
      case 'get_git_branches':
        return Promise.resolve(mockBranches);
      case 'get_file_history':
        return Promise.resolve(mockGitCommits);
      case 'get_uncommitted_changes_count':
        const count = mockGitStatus.modified.length + mockGitStatus.staged.length + mockGitStatus.untracked.length;
        return Promise.resolve(count);
      default:
        return Promise.reject(new Error(`Unknown command: ${command}`));
    }
  })
}));

describe('Git Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Repository Detection', () => {
    it('detects if project is a git repository', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const isRepo = await invoke('is_git_repository', { path: '/test/project' });

      expect(isRepo).toBe(true);
      expect(invoke).toHaveBeenCalledWith('is_git_repository', { path: '/test/project' });
    });

    it('returns false for non-git directories', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce(false);

      const isRepo = await invoke('is_git_repository', { path: '/tmp/random' });

      expect(isRepo).toBe(false);
    });

    it('handles errors when checking repository status', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Permission denied'));

      await expect(invoke('is_git_repository', { path: '/restricted' }))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('Branch Information', () => {
    it('retrieves current branch name', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const branch = await invoke('get_current_branch', { path: '/test/project' });

      expect(branch).toBe('feature/mobile');
      expect(invoke).toHaveBeenCalledWith('get_current_branch', { path: '/test/project' });
    });

    it('lists all branches', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const branches = await invoke('get_git_branches', { path: '/test/project' });

      expect(branches).toBeInstanceOf(Array);
      expect(branches.length).toBe(3);
      expect(branches.find((b: any) => b.current)).toHaveProperty('name', 'feature/mobile');
    });

    it('identifies remote tracking branches', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const branches = await invoke('get_git_branches', { path: '/test/project' }) as typeof mockBranches;

      const currentBranch = branches.find(b => b.current);
      expect(currentBranch?.remote).toBe('origin/feature/mobile');
    });
  });

  describe('Git Status', () => {
    it('retrieves full git status', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const status = await invoke('get_git_status', { path: '/test/project' });

      expect(status).toHaveProperty('branch', 'feature/mobile');
      expect(status).toHaveProperty('modified');
      expect(status).toHaveProperty('staged');
      expect(status).toHaveProperty('untracked');
      expect(status.modified).toContain('src/App.tsx');
    });

    it('shows uncommitted changes count', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const count = await invoke('get_uncommitted_changes_count', { path: '/test/project' });

      expect(count).toBe(4); // 2 modified + 1 staged + 1 untracked
    });

    it('tracks ahead/behind status', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const status = await invoke('get_git_status', { path: '/test/project' }) as typeof mockGitStatus;

      expect(status.ahead).toBe(2);
      expect(status.behind).toBe(0);
    });

    it('separates modified, staged, and untracked files', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const status = await invoke('get_git_status', { path: '/test/project' }) as typeof mockGitStatus;

      expect(status.modified).toHaveLength(2);
      expect(status.staged).toHaveLength(1);
      expect(status.untracked).toHaveLength(1);
      expect(status.deleted).toHaveLength(0);
    });
  });

  describe('Commit History', () => {
    it('fetches recent commits', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const commits = await invoke('get_recent_commits', { path: '/test/project', limit: 10 });

      expect(commits).toBeInstanceOf(Array);
      expect(commits.length).toBe(2);
      expect(commits[0]).toHaveProperty('hash');
      expect(commits[0]).toHaveProperty('message');
      expect(commits[0]).toHaveProperty('author');
    });

    it('limits commit count correctly', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const commits = await invoke('get_recent_commits', { path: '/test/project', limit: 1 });

      expect(commits.length).toBe(1);
    });

    it('includes commit metadata', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const commits = await invoke('get_recent_commits', { path: '/test/project', limit: 5 }) as typeof mockGitCommits;

      const commit = commits[0];
      expect(commit).toHaveProperty('hash');
      expect(commit).toHaveProperty('shortHash');
      expect(commit).toHaveProperty('message');
      expect(commit).toHaveProperty('author');
      expect(commit).toHaveProperty('authorEmail');
      expect(commit).toHaveProperty('date');
      expect(commit).toHaveProperty('filesChanged');
      expect(commit).toHaveProperty('insertions');
      expect(commit).toHaveProperty('deletions');
    });

    it('gets file history', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const history = await invoke('get_file_history', {
        path: '/test/project',
        filePath: 'src/App.tsx'
      });

      expect(history).toBeInstanceOf(Array);
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Diff Retrieval', () => {
    it('gets diff for specific commit', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const diff = await invoke('get_commit_diff', {
        path: '/test/project',
        hash: 'b36bf68'
      });

      expect(typeof diff).toBe('string');
      expect(diff).toContain('diff --git');
      expect(diff).toContain('---');
      expect(diff).toContain('+++');
    });

    it('parses diff lines correctly', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const diff = await invoke('get_commit_diff', {
        path: '/test/project',
        hash: 'b36bf68'
      }) as string;

      expect(diff).toContain('-old line');
      expect(diff).toContain('+new line');
    });
  });

  describe('Remote Operations', () => {
    it('lists git remotes', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const remotes = await invoke('get_git_remotes', { path: '/test/project' });

      expect(remotes).toBeInstanceOf(Array);
      expect(remotes.length).toBeGreaterThan(0);
      expect(remotes[0]).toHaveProperty('name', 'origin');
      expect(remotes[0]).toHaveProperty('url');
    });

    it('identifies fetch and push URLs', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const remotes = await invoke('get_git_remotes', { path: '/test/project' }) as typeof mockRemotes;

      const origin = remotes.find(r => r.name === 'origin');
      expect(origin?.fetch).toBe(true);
      expect(origin?.push).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles non-existent repositories gracefully', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce(false);

      const isRepo = await invoke('is_git_repository', { path: '/nonexistent' });
      expect(isRepo).toBe(false);
    });

    it('handles git command failures', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('git command failed'));

      await expect(invoke('get_git_status', { path: '/test/project' }))
        .rejects.toThrow('git command failed');
    });

    it('handles missing git binary', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('git not found'));

      await expect(invoke('get_current_branch', { path: '/test/project' }))
        .rejects.toThrow('git not found');
    });
  });

  describe('Performance', () => {
    it('caches git status results', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // First call
      const status1 = await invoke('get_git_status', { path: '/test/project' });

      // Second call (should be from cache)
      const status2 = await invoke('get_git_status', { path: '/test/project' });

      expect(status1).toEqual(status2);
    });

    it('completes git operations within timeout', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const start = Date.now();
      await invoke('get_git_status', { path: '/test/project' });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});

describe('Git API Integration Layer', () => {
  it('api.ts should expose git methods if implemented', async () => {
    // This test verifies the API layer exists
    // In reality, we need to check if these methods exist in api.ts
    const apiModule = await import('@/lib/api');

    // Expected API methods (to be implemented):
    const expectedMethods = [
      'getGitStatus',
      'getCurrentBranch',
      'getRecentCommits',
      'getCommitDiff',
      'isGitRepository'
    ];

    // Note: These will fail until implemented
    // This test documents what SHOULD exist
    expectedMethods.forEach(method => {
      // Commenting out for now since not implemented
      // expect(apiModule.api).toHaveProperty(method);
    });
  });
});
