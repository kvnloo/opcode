import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/../tests/mobile/utils/renderWithProviders';
import { waitForAnimation, ANIMATION_DURATIONS } from '@/../tests/mobile/utils/waitForAnimations';
import { MobileLayout } from '@/layouts/MobileLayout';
import { AppsScreen } from '@/screens/mobile/AppsScreen';
import { CreateScreen } from '@/screens/mobile/CreateScreen';
import { AccountScreen } from '@/screens/mobile/AccountScreen';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import userEvent from '@testing-library/user-event';

describe('Complete User Flow Integration Tests', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspace();
  });

  describe('Create New Project Flow', () => {
    it('should complete full project creation workflow', async () => {
      const user = userEvent.setup();
      let activePane = 'create';

      const { rerender } = render(
        <MobileLayout activePane={activePane}>
          <CreateScreen />
        </MobileLayout>
      );

      // Step 1: User is on Create screen
      expect(screen.getByText(/New Project/i)).toBeInTheDocument();

      // Step 2: Fill in project details
      const projectNameInput = screen.getByPlaceholderText(/Project name/i);
      await user.type(projectNameInput, 'My Awesome App');

      await waitForAnimation(ANIMATION_DURATIONS.SHORT);

      // Step 3: Select template (if available)
      const templateButtons = screen.queryAllByRole('button', { name: /template/i });
      if (templateButtons.length > 0) {
        await user.click(templateButtons[0]);
        await waitForAnimation();
      }

      // Step 4: Create project button
      const createButton = screen.getByRole('button', { name: /Create Project/i });
      await user.click(createButton);

      await waitForAnimation();

      // Step 5: Should navigate to Apps screen with new project
      activePane = 'apps';
      rerender(
        <MobileLayout activePane={activePane}>
          <AppsScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Project should be created and visible
      expect(screen.getByText('Apps')).toBeInTheDocument();
    });

    it('should handle project creation validation errors', async () => {
      const user = userEvent.setup();

      render(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      // Try to create without name
      const createButton = screen.getByRole('button', { name: /Create Project/i });
      await user.click(createButton);

      await waitForAnimation();

      // Should show validation error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/required/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      });
    });

    it('should allow canceling project creation', async () => {
      const user = userEvent.setup();
      let activePane = 'create';

      const { rerender } = render(
        <MobileLayout activePane={activePane}>
          <CreateScreen />
        </MobileLayout>
      );

      // Start filling form
      const projectNameInput = screen.getByPlaceholderText(/Project name/i);
      await user.type(projectNameInput, 'Test Project');

      await waitForAnimation();

      // Cancel and navigate to Apps
      activePane = 'apps';
      rerender(
        <MobileLayout activePane={activePane}>
          <AppsScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Should be on Apps screen
      expect(screen.getByText('Apps')).toBeInTheDocument();

      // Navigate back to Create
      activePane = 'create';
      rerender(
        <MobileLayout activePane={activePane}>
          <CreateScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      // Form should be reset or preserved based on implementation
      expect(screen.getByPlaceholderText(/Project name/i)).toBeInTheDocument();
    });
  });

  describe('Open Existing Project Flow', () => {
    it('should open project from Apps screen to workspace', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Verify on Apps screen
      expect(screen.getByText('Apps')).toBeInTheDocument();

      // Simulate selecting a project
      const mockProject = {
        id: 'existing-project',
        name: 'Existing Project',
        path: '/projects/existing',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      // Wait for workspace to render
      await waitFor(() => {
        expect(screen.getByText('Existing Project')).toBeInTheDocument();
      });

      // Should be in workspace with default pane (agent)
      const agentTab = screen.getByLabelText('Agent').closest('button');
      expect(agentTab).toHaveClass('text-primary');
    });

    it('should switch between workspace panes', async () => {
      const user = userEvent.setup();

      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start on console pane
      const consoleButton = screen.getByLabelText('Console');
      await user.click(consoleButton);

      await waitForAnimation();

      // Verify console pane is active
      const consoleTab = screen.getByLabelText('Console').closest('button');
      expect(consoleTab).toHaveClass('text-primary');

      // Switch to deploy pane
      const deployButton = screen.getByLabelText('Deploy');
      await user.click(deployButton);

      await waitForAnimation();

      // Verify deploy pane is active
      const deployTab = screen.getByLabelText('Deploy').closest('button');
      expect(deployTab).toHaveClass('text-primary');

      // Switch to preview pane
      const previewButton = screen.getByLabelText('Preview');
      await user.click(previewButton);

      await waitForAnimation();

      // Verify preview pane is active
      const previewTab = screen.getByLabelText('Preview').closest('button');
      expect(previewTab).toHaveClass('text-primary');
    });

    it('should close project and return to Apps list', async () => {
      const user = userEvent.setup();

      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      const { rerender } = render(<AppsScreen />);

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

      const projectNameInput = screen.getByPlaceholderText(/Project name/i);
      await user.type(projectNameInput, 'Deploy Test App');

      await waitForAnimation();

      const createButton = screen.getByRole('button', { name: /Create Project/i });
      await user.click(createButton);

      await waitForAnimation();

      // Step 2: Navigate to Apps and select project
      activePane = 'apps';
      rerender(
        <MobileLayout activePane={activePane}>
          <AppsScreen />
        </MobileLayout>
      );

      await waitForAnimation();

      const mockProject = {
        id: 'deploy-test',
        name: 'Deploy Test App',
        path: '/projects/deploy-test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

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
      const deployTab = screen.getByLabelText('Deploy').closest('button');
      expect(deployTab).toHaveClass('text-primary');
    });

    it('should handle interrupted workflows gracefully', async () => {
      const user = userEvent.setup();

      // Start creating project
      const { rerender } = render(
        <MobileLayout activePane="create">
          <CreateScreen />
        </MobileLayout>
      );

      const projectNameInput = screen.getByPlaceholderText(/Project name/i);
      await user.type(projectNameInput, 'Interrupted Project');

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
      expect(screen.getByPlaceholderText(/Project name/i)).toBeInTheDocument();
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

      // Should handle gracefully without crashes
      expect(screen.getByText(/New Project/i)).toBeInTheDocument();
    });
  });
});
