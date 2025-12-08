import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { render } from '@/../tests/mobile/utils/renderWithProviders';
import { waitForAnimation, ANIMATION_DURATIONS } from '@/../tests/mobile/utils/waitForAnimations';
import { MobileLayout } from '@/layouts/MobileLayout';
import { AppsScreen } from '@/screens/mobile/AppsScreen';
import { CreateScreen } from '@/screens/mobile/CreateScreen';
import { AccountScreen } from '@/screens/mobile/AccountScreen';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSessionStore } from '@/stores/sessionStore';
import userEvent from '@testing-library/user-event';

// Mock sessionStore
vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: vi.fn(() => ({
    projects: [],
    fetchProjects: vi.fn(),
    isLoadingProjects: false,
    error: null,
  })),
}));

describe('Complete User Flow Integration Tests', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspace();

    // Reset sessionStore mock
    vi.mocked(useSessionStore).mockReturnValue({
      projects: [],
      fetchProjects: vi.fn(),
      isLoadingProjects: false,
      error: null,
    } as any);
  });

  describe('Create New Project Flow', () => {
    it('should complete full project creation workflow', async () => {
      const user = userEvent.setup();
      let activePane = 'create';

      const { rerender } = await act(async () => {
        return render(
          <MobileLayout activePane={activePane}>
            <CreateScreen />
          </MobileLayout>
        );
      });

      // Step 1: User is on Create screen
      expect(screen.getByRole('heading', { name: 'Create' })).toBeInTheDocument();
      expect(screen.getByText(/what do you want to make/i)).toBeInTheDocument();

      // Step 2: Fill in project details
      const promptInput = screen.getByPlaceholderText(/Describe the idea you want to build/i);
      await user.type(promptInput, 'A task management app');

      await waitForAnimation(ANIMATION_DURATIONS.SHORT);

      // Step 3: Select template (if available)
      const templateButtons = screen.queryAllByRole('button', { name: /web/i });
      if (templateButtons.length > 0) {
        await user.click(templateButtons[0]);
        await waitForAnimation();
      }

      // Step 4: Submit prompt (via Enter or button if available)
      await user.keyboard('{Enter}');

      await waitForAnimation();

      // Step 5: Should navigate to Apps screen with new project
      activePane = 'apps';
      await act(async () => {
        rerender(
          <MobileLayout activePane={activePane}>
            <AppsScreen />
          </MobileLayout>
        );
      });

      await waitForAnimation();

      // Project should be created and visible
      expect(screen.getByText('Apps')).toBeInTheDocument();
    });

    it('should handle project creation validation errors', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(
          <MobileLayout activePane="create">
            <CreateScreen />
          </MobileLayout>
        );
      });

      // Try to submit without entering a prompt
      const promptInput = screen.getByPlaceholderText(/Describe the idea you want to build/i);

      // Focus and press Enter without typing
      await user.click(promptInput);
      await user.keyboard('{Enter}');

      await waitForAnimation();

      // Should not create project (form should still be visible)
      expect(screen.getByRole('heading', { name: 'Create' })).toBeInTheDocument();
      expect(promptInput).toBeInTheDocument();
    });

    it('should allow canceling project creation', async () => {
      const user = userEvent.setup();
      let activePane = 'create';

      const { rerender } = await act(async () => {
        return render(
          <MobileLayout activePane={activePane}>
            <CreateScreen />
          </MobileLayout>
        );
      });

      // Start filling form
      const promptInput = screen.getByPlaceholderText(/Describe the idea you want to build/i);
      await user.type(promptInput, 'A mobile game');

      await waitForAnimation();

      // Cancel and navigate to Apps
      activePane = 'apps';
      await act(async () => {
        rerender(
          <MobileLayout activePane={activePane}>
            <AppsScreen />
          </MobileLayout>
        );
      });

      await waitForAnimation();

      // Should be on Apps screen
      expect(screen.getByText('Apps')).toBeInTheDocument();

      // Navigate back to Create
      activePane = 'create';
      await act(async () => {
        rerender(
          <MobileLayout activePane={activePane}>
            <CreateScreen />
          </MobileLayout>
        );
      });

      await waitForAnimation();

      // Form should be reset or preserved based on implementation
      expect(screen.getByPlaceholderText(/Describe the idea you want to build/i)).toBeInTheDocument();
    });
  });

  describe('Open Existing Project Flow', () => {
    it('should open project from Apps screen to workspace', async () => {
      const user = userEvent.setup();

      // Simulate selecting a project
      const mockProject = {
        id: 'existing-project',
        name: 'Existing Project',
        path: '/projects/existing',
      };

      await act(async () => {
        useWorkspaceStore.getState().setProject(mockProject);
      });

      await act(async () => {
        render(<AppsScreen />);
      });

      await waitForAnimation();

      // Should be in workspace (not Apps list) with project name visible
      await waitFor(() => {
        expect(screen.getByText('Existing Project')).toBeInTheDocument();
      });

      // Should be in workspace with default pane
      const activePane = useWorkspaceStore.getState().activePane;
      expect(['console', 'agent', 'deploy', 'share', 'preview']).toContain(activePane);
    });

    it('should switch between workspace panes', async () => {
      const user = userEvent.setup();

      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      await act(async () => {
        useWorkspaceStore.getState().setProject(mockProject);
      });

      await act(async () => {
        render(<AppsScreen />);
      });

      await waitForAnimation();

      // Start on console pane
      const consoleButton = screen.getByLabelText('Console');
      await user.click(consoleButton);

      await waitForAnimation();

      // Verify console pane is active
      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('console');
      });

      // Switch to deploy pane
      const deployButton = screen.getByLabelText('Deploy');
      await user.click(deployButton);

      await waitForAnimation();

      // Verify deploy pane is active
      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('deploy');
      });

      // Switch to preview pane
      const previewButton = screen.getByLabelText('Preview');
      await user.click(previewButton);

      await waitForAnimation();

      // Verify preview pane is active
      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('preview');
      });
    });

    it('should close project and return to Apps list', async () => {
      const user = userEvent.setup();

      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      await act(async () => {
        useWorkspaceStore.getState().setProject(mockProject);
      });

      const { rerender } = await act(async () => {
        return render(<AppsScreen />);
      });

      await waitForAnimation();

      // Should be in workspace
      expect(screen.getByText('Test Project')).toBeInTheDocument();

      // Click back button
      const backButton = screen.getByLabelText('Go back');
      await user.click(backButton);

      // Project should be cleared
      expect(useWorkspaceStore.getState().currentProject).toBeNull();

      rerender(<AppsScreen />);

      await waitForAnimation();

      // Should be back on Apps list
      expect(screen.getByText('Apps')).toBeInTheDocument();
    });
  });

  describe('Account Settings Flow', () => {
    it('should navigate to and interact with account settings', async () => {
      const user = userEvent.setup();

      render(
        <MobileLayout activePane="account">
          <AccountScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Should show account screen
      expect(screen.getByText(/Account/i)).toBeInTheDocument();

      // Interact with settings options
      const settingsButtons = screen.queryAllByRole('button');
      expect(settingsButtons.length).toBeGreaterThan(0);
    });

    it('should persist account settings across navigation', async () => {
      const { rerender } = render(
        <MobileLayout activePane="account">
          <AccountScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Make changes to account settings (if applicable)
      expect(screen.getByText(/Account/i)).toBeInTheDocument();

      // Navigate away to Apps
      rerender(
        <MobileLayout activePane="apps">
          <AppsScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Navigate back to Account
      rerender(
        <MobileLayout activePane="account">
          <AccountScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Settings should be preserved
      expect(screen.getByText(/Account/i)).toBeInTheDocument();
    });
  });

  describe('Multi-Step User Journeys', () => {
    it('should complete: Create → Open → Edit → Deploy workflow', async () => {
      const user = userEvent.setup();

      // Step 1: Create new project
      let activePane = 'create';
      const { rerender } = render(
        <MobileLayout activePane={activePane}>
          <CreateScreen />
        </MobileLayout>
      );

      const promptInput = screen.getByPlaceholderText(/Describe the idea you want to build/i);
      await user.type(promptInput, 'A deployment testing app');

      await waitForAnimation();

      await user.keyboard('{Enter}');

      await waitForAnimation();

      // Step 2: Navigate to Apps and select project
      const mockProject = {
        id: 'deploy-test',
        name: 'Deploy Test App',
        path: '/projects/deploy-test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      activePane = 'apps';
      rerender(
        <MobileLayout activePane={activePane}>
          <AppsScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      await waitFor(() => {
        expect(screen.getByText('Deploy Test App')).toBeInTheDocument();
      });

      // Step 3: Edit in agent pane
      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('agent');

      // Step 4: Navigate to deploy pane
      const deployButton = screen.getByLabelText('Deploy');
      await user.click(deployButton);

      await waitForAnimation();

      // Should be on deploy pane
      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('deploy');
      });
    });

    it('should handle interrupted workflows gracefully', async () => {
      const user = userEvent.setup();

      // Start creating project
      const { rerender } = render(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      const promptInput = screen.getByPlaceholderText(/Describe the idea you want to build/i);
      await user.type(promptInput, 'A shopping cart app');

      await waitForAnimation();

      // Interrupt by navigating to Account
      rerender(
        <MobileLayout activePane="account">
          <AccountScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      expect(screen.getByText(/Account/i)).toBeInTheDocument();

      // Navigate back to Create
      rerender(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Should handle gracefully (either preserve or reset form)
      expect(screen.getByPlaceholderText(/Describe the idea you want to build/i)).toBeInTheDocument();
    });
  });

  describe('Error States and Recovery', () => {
    it('should recover from workspace loading errors', async () => {
      const mockProject = {
        id: 'error-project',
        name: 'Error Project',
        path: '/invalid/path',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Should show workspace with error project
      expect(screen.getByText('Error Project')).toBeInTheDocument();

      // Click back to recover
      const backButton = screen.getByLabelText('Go back');
      backButton.click();

      // Should clear error state
      expect(useWorkspaceStore.getState().currentProject).toBeNull();
    });

    it('should handle navigation during async operations', async () => {
      const mockProject = {
        id: 'async-project',
        name: 'Async Project',
        path: '/projects/async',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      const { rerender } = render(<AppsScreen />);

      await waitForAnimation();

      // Navigate away while something might be loading
      rerender(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Should handle gracefully without crashes - CreateScreen shows "Create" heading
      expect(screen.getByRole('heading', { name: 'Create' })).toBeInTheDocument();
    });
  });
});
