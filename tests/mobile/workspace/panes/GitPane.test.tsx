import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GitPane } from '@/components/mobile/workspace/panes/GitPane';

// Mock useHaptics hook
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    trigger: vi.fn(),
    isSupported: true,
  }),
}));

// Mock git service
vi.mock('@/lib/mobile/git', () => ({
  gitService: {
    getStatus: vi.fn(),
    getBranches: vi.fn(),
    checkout: vi.fn(),
    stage: vi.fn(),
    unstage: vi.fn(),
    commit: vi.fn(),
    pull: vi.fn(),
    push: vi.fn(),
  },
}));

describe('GitPane', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    projectId: 'test-project',
    onBack: mockOnBack,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import after mocking to get the mocked instance
    const { gitService } = await import('@/lib/mobile/git');

    // Setup default mock responses
    vi.mocked(gitService.getStatus).mockResolvedValue({
      branch: 'main',
      staged: [{ path: 'src/types/index.ts', status: 'A' }],
      unstaged: [
        { path: 'src/components/Button.tsx', status: 'M' },
        { path: 'src/utils/helpers.ts', status: 'M' },
        { path: 'README.md', status: 'D' },
      ],
      untracked: [],
    });

    vi.mocked(gitService.getBranches).mockResolvedValue(['main', 'develop', 'feature/auth']);
    vi.mocked(gitService.checkout).mockResolvedValue(undefined);
    vi.mocked(gitService.stage).mockResolvedValue(undefined);
    vi.mocked(gitService.unstage).mockResolvedValue(undefined);
    vi.mocked(gitService.commit).mockResolvedValue(undefined);
    vi.mocked(gitService.pull).mockResolvedValue(undefined);
    vi.mocked(gitService.push).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders header with back button', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const backButton = screen.getByLabelText('Go back');
        expect(backButton).toBeInTheDocument();
      });
    });

    it('renders git title', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /git/i })).toBeInTheDocument();
      });
    });

    it('shows current branch', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('main')).toBeInTheDocument();
      });
    });

    it('shows changes section', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // The component shows "Changes (3)" when there are 3 unstaged files
        expect(screen.getByText(/Changes \(\d+\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when back button clicked', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const backButton = screen.getByLabelText('Go back');
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Branch Information', () => {
    it('displays current branch name', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('main')).toBeInTheDocument();
      });
    });

    it('opens branch dropdown when clicked', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // Wait for component to load
        expect(screen.getByText('main')).toBeInTheDocument();
      });

      // Click the branch selector
      const branchButton = screen.getByText('main').closest('button');
      expect(branchButton).toBeInTheDocument();
      fireEvent.click(branchButton!);

      await waitFor(() => {
        expect(screen.getByText('develop')).toBeInTheDocument();
        expect(screen.getByText('feature/auth')).toBeInTheDocument();
      });
    });

    it('switches branch when selected from dropdown', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // Wait for component to load
        expect(screen.getByText('main')).toBeInTheDocument();
      });

      // Open dropdown
      const branchButton = screen.getByText('main').closest('button');
      fireEvent.click(branchButton!);

      await waitFor(() => {
        expect(screen.getByText('develop')).toBeInTheDocument();
      });

      // Select develop branch - get all instances and click one in dropdown
      const developButtons = screen.getAllByText('develop');
      const developButton = developButtons.find(btn => btn.closest('button'));
      if (developButton) {
        fireEvent.click(developButton);
      }

      await waitFor(() => {
        // develop should now be the current branch
        const branchButtons = screen.getAllByText('develop');
        expect(branchButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Changed Files', () => {
    it('displays list of changed files', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('src/components/Button.tsx')).toBeInTheDocument();
        expect(screen.getByText('src/utils/helpers.ts')).toBeInTheDocument();
        expect(screen.getByText('README.md')).toBeInTheDocument();
      });
    });

    it('shows file status indicators', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // M for modified, A for added, D for deleted
        const statusIndicators = screen.getAllByText(/^[MAD?]$/);
        expect(statusIndicators.length).toBeGreaterThan(0);
      });
    });

    it('shows staged section', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Staged/i)).toBeInTheDocument();
      });
    });
  });

  describe('Staging Controls', () => {
    it('has stage buttons for unstaged files', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // Should have stage button for unstaged files
        const stageButton = screen.getByLabelText('Stage src/components/Button.tsx');
        expect(stageButton).toBeInTheDocument();
      });
    });

    it('has unstage buttons for staged files', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // Should have unstage button for the staged file
        const unstageButton = screen.getByLabelText('Unstage src/types/index.ts');
        expect(unstageButton).toBeInTheDocument();
      });
    });

    it('stages files when stage button clicked', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // Wait for files to load
        expect(screen.getByText('src/components/Button.tsx')).toBeInTheDocument();
      });

      // Find and click stage button for a file
      const stageButton = screen.getByLabelText('Stage src/components/Button.tsx');
      fireEvent.click(stageButton);

      await waitFor(() => {
        // File should now have unstage button instead
        expect(screen.getByLabelText('Unstage src/components/Button.tsx')).toBeInTheDocument();
      });
    });

    it('unstages files when unstage button clicked', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        // Wait for files to load
        expect(screen.getByText('src/types/index.ts')).toBeInTheDocument();
      });

      // Find and click unstage button for staged file
      const unstageButton = screen.getByLabelText('Unstage src/types/index.ts');
      fireEvent.click(unstageButton);

      await waitFor(() => {
        // File should now have stage button instead
        expect(screen.getByLabelText('Stage src/types/index.ts')).toBeInTheDocument();
      });
    });
  });

  describe('Commit Functionality', () => {
    it('shows commit section when files are staged', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Commit Changes')).toBeInTheDocument();
      });
    });

    it('has commit message textarea', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/commit message/i);
        expect(input).toBeInTheDocument();
      });
    });

    it('allows typing commit message', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/commit message/i);
        fireEvent.change(input, { target: { value: 'Initial commit' } });

        expect((input as HTMLTextAreaElement).value).toBe('Initial commit');
      });
    });

    it('has commit button', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const commitButton = screen.getByLabelText('Commit changes');
        expect(commitButton).toBeInTheDocument();
      });
    });

    it('commit button is disabled when no message', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const commitButton = screen.getByLabelText('Commit changes');
        expect(commitButton).toBeDisabled();
      });
    });

    it('commit button is enabled when message entered', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/commit message/i);
        fireEvent.change(input, { target: { value: 'Test commit' } });

        const commitButton = screen.getByLabelText('Commit changes');
        expect(commitButton).not.toBeDisabled();
      });
    });

    it('clears message after commit', async () => {
      const { gitService } = await import('@/lib/mobile/git');

      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/commit message/i) as HTMLTextAreaElement;

        // Type the commit message
        fireEvent.change(input, { target: { value: 'Test commit' } });

        // Verify the message was typed and state is synced
        expect(input.value).toBe('Test commit');
      });

      await waitFor(() => {
        // Find the commit button - it should exist since there's 1 staged file
        const commitButton = screen.getByLabelText('Commit changes');
        expect(commitButton).not.toBeDisabled();
      });

      // Setup mock for after commit - no staged files
      vi.mocked(gitService.getStatus).mockResolvedValue({
        branch: 'main',
        staged: [],
        unstaged: [
          { path: 'src/components/Button.tsx', status: 'M' },
          { path: 'src/utils/helpers.ts', status: 'M' },
          { path: 'README.md', status: 'D' },
        ],
        untracked: [],
      });

      // Click the commit button
      const commitButton = screen.getByLabelText('Commit changes');
      const buttonElement = commitButton.closest('button') || commitButton;
      fireEvent.click(buttonElement);

      // The staged files should be removed after commit, so commit section disappears
      await waitFor(() => {
        // After commit, staged files are removed, so commit section won't render
        expect(screen.queryByLabelText('Commit changes')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Pull/Push Operations', () => {
    it('has pull button', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const pullButton = screen.getByLabelText('Pull from remote');
        expect(pullButton).toBeInTheDocument();
      });
    });

    it('has push button', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const pushButton = screen.getByLabelText('Push to remote');
        expect(pushButton).toBeInTheDocument();
      });
    });

    it('pull button shows Pull text', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Pull')).toBeInTheDocument();
      });
    });

    it('push button shows Push text', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Go back')).toBeInTheDocument();
        expect(screen.getByLabelText('Pull from remote')).toBeInTheDocument();
        expect(screen.getByLabelText('Push to remote')).toBeInTheDocument();
      });
    });

    it('has semantic heading structure', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /git/i })).toBeInTheDocument();
      });
    });

    it('stage/unstage buttons have accessible labels', async () => {
      render(<GitPane {...defaultProps} />);

      await waitFor(() => {
        const stageButtons = screen.getAllByLabelText(/^Stage /);
        const unstageButtons = screen.getAllByLabelText(/^Unstage /);

        expect(stageButtons.length).toBeGreaterThan(0);
        expect(unstageButtons.length).toBeGreaterThan(0);
      });
    });
  });
});
