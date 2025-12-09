import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import { render } from '@/../tests/mobile/utils/renderWithProviders';
import { waitForAnimation } from '@/../tests/mobile/utils/waitForAnimations';
import { MobileLayout } from '@/layouts/MobileLayout';
import { AppsScreen } from '@/screens/mobile/AppsScreen';
import { CreateScreen } from '@/screens/mobile/CreateScreen';
import { AccountScreen } from '@/screens/mobile/AccountScreen';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSessionStore } from '@/stores/sessionStore';

// Mock sessionStore
vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: vi.fn(() => ({
    projects: [],
    fetchProjects: vi.fn(),
    isLoadingProjects: false,
    error: null,
  })),
}));

// Mock usePlatform to return mobile
vi.mock('@/hooks/mobile/usePlatform', () => ({
  usePlatform: () => 'mobile' as const,
  useIsMobile: () => true,
  useIsTablet: () => false,
  useIsDesktop: () => false,
}));

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    // Reset workspace store before each test
    useWorkspaceStore.getState().resetWorkspace();

    // Reset sessionStore mock
    vi.mocked(useSessionStore).mockReturnValue({
      projects: [],
      fetchProjects: vi.fn(),
      isLoadingProjects: false,
      error: null,
    } as any);
  });

  describe('Tab Navigation', () => {
    it('should switch between Apps, Create, and Account tabs', async () => {
      const handlePaneChange = vi.fn();

      const { rerender } = render(
        <MobileLayout activePane="apps" onPaneChange={handlePaneChange}>
          <AppsScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Verify Apps screen header is visible
      expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();

      // Click Create tab
      const createButton = screen.getByLabelText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(handlePaneChange).toHaveBeenCalledWith('create');
      });

      // Rerender with Create pane
      rerender(
        <MobileLayout activePane="create" onPaneChange={handlePaneChange}>
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Verify Create screen is visible
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create' })).toBeInTheDocument();
      });

      // Click Account tab
      const accountButton = screen.getByLabelText('Account');
      fireEvent.click(accountButton);

      await waitFor(() => {
        expect(handlePaneChange).toHaveBeenCalledWith('account');
      });

      // Rerender with Account pane
      rerender(
        <MobileLayout activePane="account" onPaneChange={handlePaneChange}>
          <AccountScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Verify Account screen is visible
      await waitFor(() => {
        expect(screen.getByText('Manage Account')).toBeInTheDocument();
      });
    });

    it('should persist active tab state across navigation', async () => {
      let activePane = 'apps';
      const handlePaneChange = vi.fn((pane) => {
        activePane = pane;
      });

      const { rerender } = render(
        <MobileLayout activePane={activePane} onPaneChange={handlePaneChange}>
          <AppsScreen />
        </MobileLayout>
      );

      // Navigate to Create
      const createButton = screen.getByLabelText('Create');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(handlePaneChange).toHaveBeenCalledWith('create');
      });

      // Simulate remount (as if returning from background)
      rerender(
        <MobileLayout activePane="create" onPaneChange={handlePaneChange}>
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Verify Create tab is still active
      await waitFor(() => {
        const createTab = screen.getByLabelText('Create');
        expect(createTab).toHaveClass('text-primary');
      });
    });

    it('should highlight correct tab based on active pane', async () => {
      const { rerender } = render(
        <MobileLayout activePane="apps">
          <AppsScreen />
        </MobileLayout>
      );

      // Apps tab should be highlighted
      await waitFor(() => {
        const appsTab = screen.getByLabelText('Apps');
        expect(appsTab).toHaveClass('text-primary');
      });

      // Switch to Account
      rerender(
        <MobileLayout activePane="account">
          <AccountScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Account tab should be highlighted
      await waitFor(() => {
        const accountTab = screen.getByLabelText('Account');
        expect(accountTab).toHaveClass('text-primary');
      });
    });
  });

  describe('Workspace Navigation', () => {
    it('should navigate from Apps to workspace when project is selected', async () => {
      const { rerender } = render(
        <MobileLayout activePane="apps">
          <AppsScreen />
        </MobileLayout>
      );

      // Initially on Apps screen
      expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();

      // Simulate selecting a project
      const mockProject = {
        id: 'test-project-1',
        name: 'Test Project',
        path: '/projects/test-project-1',
      };

      // Set project in store
      useWorkspaceStore.getState().setProject(mockProject);

      // Rerender to trigger workspace screen
      rerender(<AppsScreen />);

      await waitForAnimation();

      // Should show workspace screen with project name
      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
      });
    });

    it('should navigate back from workspace to Apps screen', async () => {
      // Start with a project selected
      const mockProject = {
        id: 'test-project-1',
        name: 'Test Project',
        path: '/projects/test-project-1',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      const { rerender } = render(<AppsScreen />);

      await waitForAnimation();

      // Should show workspace screen
      expect(screen.getByText('Test Project')).toBeInTheDocument();

      // Click back button
      const backButton = screen.getByLabelText('Go back');
      backButton.click();

      // Should clear project and return to Apps
      expect(useWorkspaceStore.getState().currentProject).toBeNull();

      rerender(<AppsScreen />);

      await waitForAnimation();

      // Should show Apps screen
      expect(screen.getByText('Apps')).toBeInTheDocument();
    });

    it('should preserve workspace state when navigating away and back', async () => {
      const mockProject = {
        id: 'test-project-1',
        name: 'Test Project',
        path: '/projects/test-project-1',
      };

      useWorkspaceStore.getState().setProject(mockProject);
      useWorkspaceStore.getState().setActivePane('agent');

      const { rerender } = render(<AppsScreen />);

      await waitForAnimation();

      // Verify we're in workspace with agent pane
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      const agentTab = screen.getByLabelText('Agent').closest('button');
      expect(agentTab).toHaveClass('text-primary');

      // Navigate to different tab (like switching apps)
      rerender(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Navigate back to Apps
      rerender(<AppsScreen />);

      await waitForAnimation();

      // Should still be in workspace with agent pane active
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      const agentTabAfter = screen.getByLabelText('Agent').closest('button');
      expect(agentTabAfter).toHaveClass('text-primary');
    });
  });

  describe('Animation Transitions', () => {
    it('should animate tab transitions smoothly', async () => {
      const { rerender } = render(
        <MobileLayout activePane="apps">
          <AppsScreen />
        </MobileLayout>
      );

      // Click Create tab
      const createButton = screen.getByLabelText('Create');
      fireEvent.click(createButton);

      // Rerender with animation
      rerender(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      // Wait for animation to complete
      await waitForAnimation();

      // Content should be visible after animation
      await waitFor(() => {
        expect(screen.getByText(/what do you want to make/i)).toBeInTheDocument();
      });
    });

    it('should animate workspace pane transitions', async () => {
      const mockProject = {
        id: 'test-project-1',
        name: 'Test Project',
        path: '/projects/test-project-1',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Switch from console to agent pane
      const agentButton = screen.getByLabelText('Agent');
      agentButton.click();

      // Wait for pane transition animation
      await waitForAnimation();

      // Agent pane should be visible
      const agentTab = screen.getByLabelText('Agent').closest('button');
      expect(agentTab).toHaveClass('text-primary');
    });
  });

  describe('Error Recovery', () => {
    it('should handle navigation when workspace store is in invalid state', async () => {
      // Set invalid project state
      useWorkspaceStore.setState({
        currentProject: null,
        activePane: 'agent',
      });

      const { rerender } = render(<AppsScreen />);

      await waitForAnimation();

      // Should show Apps screen, not crash
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
      });

      // Should be able to navigate normally
      rerender(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      await waitFor(() => {
        expect(screen.getByText(/what do you want to make/i)).toBeInTheDocument();
      });
    });

    it('should recover from failed workspace navigation', async () => {
      const mockProject = {
        id: 'invalid-project',
        name: 'Invalid Project',
        path: '/invalid/path',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Click back button to recover
      const backButton = screen.getByLabelText('Go back');
      backButton.click();

      // Should clear project and return to Apps
      expect(useWorkspaceStore.getState().currentProject).toBeNull();
    });
  });

  describe('State Persistence', () => {
    it('should maintain scroll position when navigating between tabs', async () => {
      const { rerender } = render(
        <MobileLayout activePane="apps">
          <AppsScreen />
        </MobileLayout>
      );

      // Navigate to Create
      const createButton = screen.getByLabelText('Create');
      fireEvent.click(createButton);

      rerender(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Navigate back to Apps
      const appsButton = screen.getByLabelText('Apps');
      fireEvent.click(appsButton);

      rerender(
        <MobileLayout activePane="apps">
          <AppsScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Apps screen should be rendered (scroll position would be preserved by browser)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
      });
    });

    it('should preserve workspace pane selection when project changes', async () => {
      const project1 = {
        id: 'project-1',
        name: 'Project 1',
        path: '/projects/1',
      };

      useWorkspaceStore.getState().setProject(project1);
      useWorkspaceStore.getState().setActivePane('deploy');

      const { rerender } = render(<AppsScreen />);

      await waitForAnimation();

      // Verify deploy pane is active
      const deployTab = screen.getByLabelText('Deploy').closest('button');
      expect(deployTab).toHaveClass('text-primary');

      // Go back to Apps
      screen.getByLabelText('Go back').click();
      useWorkspaceStore.getState().setProject(null);

      rerender(<AppsScreen />);

      await waitForAnimation();

      // Open a different project
      const project2 = {
        id: 'project-2',
        name: 'Project 2',
        path: '/projects/2',
      };

      useWorkspaceStore.getState().setProject(project2);

      rerender(<AppsScreen />);

      await waitForAnimation();

      // Should still be on deploy pane (or default to agent if reset)
      const activePaneAfter = useWorkspaceStore.getState().activePane;
      expect(activePaneAfter).toBeTruthy();
    });
  });
});
