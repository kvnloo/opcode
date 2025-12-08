# Git API Requirements for Mobile App

## Summary

The mobile app needs git repository information to display project status. This document outlines the required API methods that need to be implemented in both the Rust backend (Tauri commands) and TypeScript frontend (api.ts).

## Current Status

### ✅ Existing in codebase
- No git-specific Tauri commands found
- No git API methods in `src/lib/api.ts`
- Git functionality needs to be added from scratch

### ❌ Missing - Required Implementation

## Required Rust Backend Commands (Tauri)

Add these commands to `src-tauri/src/commands/git.rs` (new file):

```rust
use tauri::command;
use std::process::Command;

#[command]
pub async fn is_git_repository(path: String) -> Result<bool, String> {
    // Check if .git directory exists
    let git_dir = format!("{}/.git", path);
    Ok(std::path::Path::new(&git_dir).exists())
}

#[command]
pub async fn get_current_branch(path: String) -> Result<String, String> {
    // Execute: git -C <path> rev-parse --abbrev-ref HEAD
    let output = Command::new("git")
        .args(&["-C", &path, "rev-parse", "--abbrev-ref", "HEAD"])
        .output()
        .map_err(|e| format!("Failed to execute git: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
pub async fn get_git_status(path: String) -> Result<GitStatus, String> {
    // Execute multiple git commands to build status
    // git status --porcelain
    // git rev-list --count @{u}..HEAD (ahead)
    // git rev-list --count HEAD..@{u} (behind)
}

#[command]
pub async fn get_recent_commits(path: String, limit: usize) -> Result<Vec<GitCommit>, String> {
    // Execute: git log -n <limit> --pretty=format:'%H|%h|%s|%an|%ae|%aI' --numstat
}

#[command]
pub async fn get_commit_diff(path: String, hash: String) -> Result<String, String> {
    // Execute: git -C <path> show <hash>
}

#[command]
pub async fn get_git_remotes(path: String) -> Result<Vec<GitRemote>, String> {
    // Execute: git remote -v
}

#[command]
pub async fn get_git_branches(path: String) -> Result<Vec<GitBranch>, String> {
    // Execute: git branch -a --format='%(refname:short)|%(upstream:short)|%(HEAD)'
}

#[command]
pub async fn get_file_history(path: String, file_path: String) -> Result<Vec<GitCommit>, String> {
    // Execute: git log --follow -- <file_path>
}

#[command]
pub async fn get_uncommitted_changes_count(path: String) -> Result<usize, String> {
    // Count modified + staged + untracked files
}
```

## Required TypeScript Types

Add to `src/lib/api.ts`:

```typescript
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
```

## Required API Methods

Add to the `api` object in `src/lib/api.ts`:

```typescript
/**
 * Check if a directory is a git repository
 * @param path - The directory path to check
 * @returns Promise resolving to boolean
 */
async isGitRepository(path: string): Promise<boolean> {
  try {
    return await invoke<boolean>("is_git_repository", { path });
  } catch (error) {
    console.error("Failed to check git repository:", error);
    return false;
  }
},

/**
 * Get the current git branch name
 * @param path - The project path
 * @returns Promise resolving to branch name
 */
async getCurrentBranch(path: string): Promise<string> {
  try {
    return await invoke<string>("get_current_branch", { path });
  } catch (error) {
    console.error("Failed to get current branch:", error);
    throw error;
  }
},

/**
 * Get full git status for a repository
 * @param path - The project path
 * @returns Promise resolving to git status
 */
async getGitStatus(path: string): Promise<GitStatus> {
  try {
    return await invoke<GitStatus>("get_git_status", { path });
  } catch (error) {
    console.error("Failed to get git status:", error);
    throw error;
  }
},

/**
 * Get recent git commits
 * @param path - The project path
 * @param limit - Number of commits to retrieve (default: 10)
 * @returns Promise resolving to array of commits
 */
async getRecentCommits(path: string, limit: number = 10): Promise<GitCommit[]> {
  try {
    return await invoke<GitCommit[]>("get_recent_commits", { path, limit });
  } catch (error) {
    console.error("Failed to get recent commits:", error);
    throw error;
  }
},

/**
 * Get diff for a specific commit
 * @param path - The project path
 * @param hash - The commit hash
 * @returns Promise resolving to diff string
 */
async getCommitDiff(path: string, hash: string): Promise<string> {
  try {
    return await invoke<string>("get_commit_diff", { path, hash });
  } catch (error) {
    console.error("Failed to get commit diff:", error);
    throw error;
  }
},

/**
 * Get git remotes
 * @param path - The project path
 * @returns Promise resolving to array of remotes
 */
async getGitRemotes(path: string): Promise<GitRemote[]> {
  try {
    return await invoke<GitRemote[]>("get_git_remotes", { path });
  } catch (error) {
    console.error("Failed to get git remotes:", error);
    throw error;
  }
},

/**
 * Get all git branches
 * @param path - The project path
 * @returns Promise resolving to array of branches
 */
async getGitBranches(path: string): Promise<GitBranch[]> {
  try {
    return await invoke<GitBranch[]>("get_git_branches", { path });
  } catch (error) {
    console.error("Failed to get git branches:", error);
    throw error;
  }
},

/**
 * Get file history
 * @param path - The project path
 * @param filePath - The file path relative to project root
 * @returns Promise resolving to array of commits affecting the file
 */
async getFileHistory(path: string, filePath: string): Promise<GitCommit[]> {
  try {
    return await invoke<GitCommit[]>("get_file_history", { path, filePath });
  } catch (error) {
    console.error("Failed to get file history:", error);
    throw error;
  }
},

/**
 * Get count of uncommitted changes
 * @param path - The project path
 * @returns Promise resolving to count of changes
 */
async getUncommittedChangesCount(path: string): Promise<number> {
  try {
    return await invoke<number>("get_uncommitted_changes_count", { path });
  } catch (error) {
    console.error("Failed to get uncommitted changes count:", error);
    return 0;
  }
}
```

## Implementation Steps

1. **Create Rust module**: `src-tauri/src/commands/git.rs`
2. **Add Git types**: Define GitStatus, GitCommit, GitRemote, GitBranch structs
3. **Implement commands**: Create each Tauri command function
4. **Register commands**: Add to `tauri::Builder` in `main.rs` or `lib.rs`
5. **Update TypeScript**: Add types and API methods to `src/lib/api.ts`
6. **Run tests**: Execute `npm test -- tests/mobile/integration/gitIntegration.test.tsx`

## UI Integration

Once API is ready, create components:

- `GitStatus.tsx` - Display current branch and uncommitted changes
- `GitCommitHistory.tsx` - Show recent commits list
- `GitBranchSelector.tsx` - Branch switcher dropdown
- `GitFileHistory.tsx` - File-specific commit history

## Dependencies

- Git must be installed on the system
- `git` command must be in PATH
- Repository must be initialized (`.git` directory exists)

## Error Handling

All commands should gracefully handle:
- Git not installed
- Directory not a git repository
- Permission errors
- Network errors (for remote operations)
- Corrupted git repositories

## Performance Considerations

- Cache git status results (invalidate on file changes)
- Limit commit history to reasonable defaults (10-50 commits)
- Consider pagination for large histories
- Use git command flags for faster responses (`--no-pager`, `--no-color`)

## Security

- Sanitize all path inputs to prevent command injection
- Never execute user-provided git commands directly
- Validate repository paths exist before operations
- Handle sensitive data in commit messages carefully
