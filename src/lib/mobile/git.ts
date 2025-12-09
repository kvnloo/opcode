import { invoke } from '@tauri-apps/api/core';

export interface GitStatus {
  branch: string;
  staged: GitFile[];
  unstaged: GitFile[];
  untracked: GitFile[];
}

export interface GitFile {
  path: string;
  status: 'M' | 'A' | 'D' | '?' | 'R';
}

const mockGitStatus: GitStatus = {
  branch: 'main',
  staged: [{ path: 'src/types/index.ts', status: 'A' }],
  unstaged: [
    { path: 'src/components/Button.tsx', status: 'M' },
    { path: 'src/utils/helpers.ts', status: 'M' },
    { path: 'README.md', status: 'D' },
  ],
  untracked: [],
};

export const gitService = {
  async getStatus(projectPath: string): Promise<GitStatus> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_status', { projectPath });
    }
    return mockGitStatus;
  },

  async getBranches(projectPath: string): Promise<string[]> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_branches', { projectPath });
    }
    return ['main', 'develop', 'feature/auth'];
  },

  async checkout(projectPath: string, branch: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_checkout', { projectPath, branch });
    }
    console.log(`[Mock] Would checkout ${branch}`);
  },

  async stage(projectPath: string, files: string[]): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_stage', { projectPath, files });
    }
    console.log(`[Mock] Would stage ${files.join(', ')}`);
  },

  async unstage(projectPath: string, files: string[]): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_unstage', { projectPath, files });
    }
    console.log(`[Mock] Would unstage ${files.join(', ')}`);
  },

  async commit(projectPath: string, message: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_commit', { projectPath, message });
    }
    console.log(`[Mock] Would commit: ${message}`);
  },

  async pull(projectPath: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_pull', { projectPath });
    }
    console.log('[Mock] Would pull');
  },

  async push(projectPath: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_push', { projectPath });
    }
    console.log('[Mock] Would push');
  },
};
