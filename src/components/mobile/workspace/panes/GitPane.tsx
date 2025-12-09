import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  GitBranch,
  GitCommit,
  Plus,
  Minus,
  Upload,
  Download,
  ChevronLeft,
  Check,
  Circle,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';
import { gitService, type GitFile } from '@/lib/mobile/git';

interface ChangedFile {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked';
  staged: boolean;
}

interface GitPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

const STATUS_ICONS = {
  modified: { icon: Circle, color: 'text-yellow-500', label: 'M' },
  added: { icon: Plus, color: 'text-green-500', label: 'A' },
  deleted: { icon: Minus, color: 'text-red-500', label: 'D' },
  untracked: { icon: Circle, color: 'text-gray-500', label: '?' },
};

const STATUS_MAP: Record<GitFile['status'], ChangedFile['status']> = {
  M: 'modified',
  A: 'added',
  D: 'deleted',
  '?': 'untracked',
  R: 'modified',
};

export function GitPane({ projectId, onBack, className }: GitPaneProps) {
  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches, setBranches] = useState<string[]>(['main', 'develop', 'feature/auth']);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [files, setFiles] = useState<ChangedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unstagedFiles = files.filter(f => !f.staged);
  const stagedFiles = files.filter(f => f.staged);

  useEffect(() => {
    loadGitStatus();
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadGitStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await gitService.getStatus(projectId);

      const changedFiles: ChangedFile[] = [
        ...status.staged.map(f => ({
          path: f.path,
          status: STATUS_MAP[f.status],
          staged: true,
        })),
        ...status.unstaged.map(f => ({
          path: f.path,
          status: STATUS_MAP[f.status],
          staged: false,
        })),
        ...status.untracked.map(f => ({
          path: f.path,
          status: STATUS_MAP[f.status],
          staged: false,
        })),
      ];

      setFiles(changedFiles);
      setCurrentBranch(status.branch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load git status');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const branchList = await gitService.getBranches(projectId);
      setBranches(branchList);
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const stageFile = async (path: string) => {
    try {
      setOperationLoading(`stage-${path}`);
      await gitService.stage(projectId, [path]);
      setFiles(files.map(f =>
        f.path === path ? { ...f, staged: true } : f
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage file');
    } finally {
      setOperationLoading(null);
    }
  };

  const unstageFile = async (path: string) => {
    try {
      setOperationLoading(`unstage-${path}`);
      await gitService.unstage(projectId, [path]);
      setFiles(files.map(f =>
        f.path === path ? { ...f, staged: false } : f
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unstage file');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage || stagedFiles.length === 0) return;

    try {
      setOperationLoading('commit');
      await gitService.commit(projectId, commitMessage);
      setCommitMessage('');
      setFiles(files.filter(f => !f.staged));
      await loadGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit');
    } finally {
      setOperationLoading(null);
    }
  };

  const handlePush = async () => {
    try {
      setOperationLoading('push');
      await gitService.push(projectId);
      await loadGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push');
    } finally {
      setOperationLoading(null);
    }
  };

  const handlePull = async () => {
    try {
      setOperationLoading('pull');
      await gitService.pull(projectId);
      await loadGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull');
    } finally {
      setOperationLoading(null);
    }
  };

  const switchBranch = async (branch: string) => {
    try {
      setOperationLoading(`checkout-${branch}`);
      await gitService.checkout(projectId, branch);
      setCurrentBranch(branch);
      setShowBranchDropdown(false);
      await loadGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch branch');
    } finally {
      setOperationLoading(null);
    }
  };

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <GitBranch className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Git</h2>
        {loading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
      </header>

      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted border border-border hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm">{currentBranch}</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              showBranchDropdown && "rotate-180"
            )} />
          </button>

          {showBranchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10">
              {branches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => switchBranch(branch)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2",
                    branch === currentBranch && "bg-muted"
                  )}
                >
                  <GitBranch className="w-3 h-3" />
                  <span className="font-mono">{branch}</span>
                  {branch === currentBranch && (
                    <Check className="w-3 h-3 ml-auto text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Unstaged Changes */}
        {unstagedFiles.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
              Changes ({unstagedFiles.length})
            </h3>
            <div className="space-y-1">
              {unstagedFiles.map((file) => {
                const StatusIcon = STATUS_ICONS[file.status].icon;
                return (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 p-2 rounded-md bg-card border border-border group hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("flex-shrink-0", STATUS_ICONS[file.status].color)}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 font-mono text-sm truncate">
                      {file.path}
                    </span>
                    <span className={cn(
                      "text-xs font-semibold flex-shrink-0 w-4",
                      STATUS_ICONS[file.status].color
                    )}>
                      {STATUS_ICONS[file.status].label}
                    </span>
                    <HapticButton
                      className="p-1 hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => stageFile(file.path)}
                      disabled={operationLoading === `stage-${file.path}`}
                      aria-label={`Stage ${file.path}`}
                    >
                      {operationLoading === `stage-${file.path}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </HapticButton>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Staged Changes */}
        {stagedFiles.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Staged ({stagedFiles.length})
            </h3>
            <div className="space-y-1">
              {stagedFiles.map((file) => {
                const StatusIcon = STATUS_ICONS[file.status].icon;
                return (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 p-2 rounded-md bg-card border border-border group hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("flex-shrink-0", STATUS_ICONS[file.status].color)}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 font-mono text-sm truncate">
                      {file.path}
                    </span>
                    <span className={cn(
                      "text-xs font-semibold flex-shrink-0 w-4",
                      STATUS_ICONS[file.status].color
                    )}>
                      {STATUS_ICONS[file.status].label}
                    </span>
                    <HapticButton
                      className="p-1 hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => unstageFile(file.path)}
                      disabled={operationLoading === `unstage-${file.path}`}
                      aria-label={`Unstage ${file.path}`}
                    >
                      {operationLoading === `unstage-${file.path}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </HapticButton>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* No Changes State */}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GitCommit className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No changes</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your working tree is clean
            </p>
          </div>
        )}

        {/* Commit Section */}
        {stagedFiles.length > 0 && (
          <section className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <GitCommit className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Commit Changes</h3>
            </div>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message..."
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              rows={3}
            />
            <HapticButton
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCommit}
              disabled={!commitMessage.trim() || operationLoading === 'commit'}
              aria-label="Commit changes"
            >
              {operationLoading === 'commit' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <GitCommit className="w-4 h-4 mr-2" />
              )}
              Commit {stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'}
            </HapticButton>
          </section>
        )}

        {/* Sync Section */}
        <section className="grid grid-cols-2 gap-2">
          <HapticButton
            className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted"
            onClick={handlePull}
            disabled={operationLoading === 'pull'}
            aria-label="Pull from remote"
          >
            {operationLoading === 'pull' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="text-sm">Pull</span>
          </HapticButton>
          <HapticButton
            className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted"
            onClick={handlePush}
            disabled={operationLoading === 'push'}
            aria-label="Push to remote"
          >
            {operationLoading === 'push' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="text-sm">Push</span>
          </HapticButton>
        </section>
      </div>
    </div>
  );
}

export default GitPane;
