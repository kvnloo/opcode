/**
 * Mock data for git-related tests
 */

export interface GitStatus {
  isRepo: boolean;
  branch: string;
  remote: string;
  ahead: number;
  behind: number;
  modified: string[];
  staged: string[];
  untracked: string[];
  deleted: string[];
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  authorEmail: string;
  date: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

export interface GitRemote {
  name: string;
  url: string;
  fetch: boolean;
  push: boolean;
}

export interface GitBranch {
  name: string;
  current: boolean;
  remote: string;
}

export const mockGitRepository: GitStatus = {
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

export const mockGitCommits: GitCommit[] = [
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
  },
  {
    hash: '600d1e3',
    shortHash: '600d1e3',
    message: 'feat(titlebar): macOS-style traffic light controls',
    author: 'Developer',
    authorEmail: 'dev@example.com',
    date: new Date(Date.now() - 172800000).toISOString(),
    filesChanged: 8,
    insertions: 320,
    deletions: 15
  }
];

export const mockGitRemotes: GitRemote[] = [
  {
    name: 'origin',
    url: 'https://github.com/user/opcode.git',
    fetch: true,
    push: true
  }
];

export const mockGitBranches: GitBranch[] = [
  { name: 'main', current: false, remote: 'origin/main' },
  { name: 'feature/mobile', current: true, remote: 'origin/feature/mobile' },
  { name: 'develop', current: false, remote: 'origin/develop' }
];

export const mockNonGitRepository: GitStatus = {
  isRepo: false,
  branch: '',
  remote: '',
  ahead: 0,
  behind: 0,
  modified: [],
  staged: [],
  untracked: [],
  deleted: []
};

export const mockCleanRepository: GitStatus = {
  isRepo: true,
  branch: 'main',
  remote: 'origin',
  ahead: 0,
  behind: 0,
  modified: [],
  staged: [],
  untracked: [],
  deleted: []
};

export const mockDirtyRepository: GitStatus = {
  isRepo: true,
  branch: 'feature/test',
  remote: 'origin',
  ahead: 5,
  behind: 2,
  modified: ['src/file1.ts', 'src/file2.ts', 'tests/test1.test.ts'],
  staged: ['package.json', 'README.md'],
  untracked: ['new-feature.ts', 'temp.log'],
  deleted: ['old-file.ts']
};

export const mockCommitDiff = `diff --git a/src/App.tsx b/src/App.tsx
index 123abc..456def 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,10 +1,12 @@
 import React from 'react';
+import { GitStatus } from './components/GitStatus';

 function App() {
   return (
     <div className="app">
       <h1>Opcode Mobile</h1>
+      <GitStatus />
     </div>
   );
 }`;

/**
 * Creates a git mock with custom overrides
 */
export const createGitMock = (overrides: Partial<GitStatus> = {}): GitStatus => ({
  ...mockGitRepository,
  ...overrides
});

/**
 * Creates a commit mock with custom overrides
 */
export const createCommitMock = (overrides: Partial<GitCommit> = {}): GitCommit => ({
  hash: 'abc123',
  shortHash: 'abc123',
  message: 'feat: test commit',
  author: 'Test Author',
  authorEmail: 'test@example.com',
  date: new Date().toISOString(),
  filesChanged: 1,
  insertions: 10,
  deletions: 5,
  ...overrides
});

/**
 * Creates a remote mock with custom overrides
 */
export const createRemoteMock = (overrides: Partial<GitRemote> = {}): GitRemote => ({
  name: 'origin',
  url: 'https://github.com/user/repo.git',
  fetch: true,
  push: true,
  ...overrides
});

/**
 * Creates a branch mock with custom overrides
 */
export const createBranchMock = (overrides: Partial<GitBranch> = {}): GitBranch => ({
  name: 'feature/test',
  current: false,
  remote: 'origin/feature/test',
  ...overrides
});

/**
 * Simulates git status changes over time
 */
export class GitStatusSimulator {
  private status: GitStatus;

  constructor(initialStatus: GitStatus = mockGitRepository) {
    this.status = { ...initialStatus };
  }

  modifyFile(filePath: string): GitStatus {
    if (!this.status.modified.includes(filePath)) {
      this.status.modified.push(filePath);
    }
    return { ...this.status };
  }

  stageFile(filePath: string): GitStatus {
    const modifiedIndex = this.status.modified.indexOf(filePath);
    if (modifiedIndex > -1) {
      this.status.modified.splice(modifiedIndex, 1);
    }
    if (!this.status.staged.includes(filePath)) {
      this.status.staged.push(filePath);
    }
    return { ...this.status };
  }

  unstageFile(filePath: string): GitStatus {
    const stagedIndex = this.status.staged.indexOf(filePath);
    if (stagedIndex > -1) {
      this.status.staged.splice(stagedIndex, 1);
      if (!this.status.modified.includes(filePath)) {
        this.status.modified.push(filePath);
      }
    }
    return { ...this.status };
  }

  addUntracked(filePath: string): GitStatus {
    if (!this.status.untracked.includes(filePath)) {
      this.status.untracked.push(filePath);
    }
    return { ...this.status };
  }

  commit(): GitStatus {
    this.status.staged = [];
    this.status.ahead++;
    return { ...this.status };
  }

  pull(behindCount: number = 0): GitStatus {
    this.status.behind = behindCount;
    return { ...this.status };
  }

  push(): GitStatus {
    this.status.ahead = 0;
    return { ...this.status };
  }

  switchBranch(branchName: string): GitStatus {
    this.status.branch = branchName;
    return { ...this.status };
  }

  getStatus(): GitStatus {
    return { ...this.status };
  }

  reset(): void {
    this.status = { ...mockGitRepository };
  }
}

export default {
  mockGitRepository,
  mockGitCommits,
  mockGitRemotes,
  mockGitBranches,
  mockNonGitRepository,
  mockCleanRepository,
  mockDirtyRepository,
  mockCommitDiff,
  createGitMock,
  createCommitMock,
  createRemoteMock,
  createBranchMock,
  GitStatusSimulator
};
