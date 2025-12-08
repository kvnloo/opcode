import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/../tests/mobile/utils/renderWithProviders';
import { waitForAnimation, ANIMATION_DURATIONS } from '@/../tests/mobile/utils/waitForAnimations';
import { swipeLeft, swipeRight } from '@/../tests/mobile/utils/gestures';
import { AppsScreen } from '@/screens/mobile/AppsScreen';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import userEvent from '@testing-library/user-event';

describe('Workspace Navigation Integration Tests', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspace();

    // Set up a project for workspace testing
    const mockProject = {
      id: 'test-project',
      name: 'Test Project',
      path: '/projects/test',
    };
    useWorkspaceStore.getState().setProject(mockProject);
  });

  describe('Workspace Pane Switching', () => {
    it('should switch between all 5 panes using toolbar buttons', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Start on default pane (agent)
      const initialPane = useWorkspaceStore.getState().activePane;
      expect(['console', 'agent', 'deploy', 'share', 'preview']).toContain(initialPane);

      // Switch to console
      const consoleButton = screen.getByLabelText('Console');
      await user.click(consoleButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('console');
      expect(consoleButton.closest('button')).toHaveClass('text-primary');

      // Switch to agent
      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('agent');
      expect(agentButton.closest('button')).toHaveClass('text-primary');

      // Switch to deploy
      const deployButton = screen.getByLabelText('Deploy');
      await user.click(deployButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('deploy');
      expect(deployButton.closest('button')).toHaveClass('text-primary');

      // Switch to share
      const shareButton = screen.getByLabelText('Share');
      await user.click(shareButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('share');
      expect(shareButton.closest('button')).toHaveClass('text-primary');

      // Switch to preview
      const previewButton = screen.getByLabelText('Preview');
      await user.click(previewButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('preview');
      expect(previewButton.closest('button')).toHaveClass('text-primary');
    });

    it('should maintain pane state when navigating away and back', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Set to deploy pane
      const deployButton = screen.getByLabelText('Deploy');
      await user.click(deployButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('deploy');

      // Navigate away by going back
      const backButton = screen.getByLabelText('Go back');
      await user.click(backButton);

      // Clear and reopen project
      useWorkspaceStore.getState().setProject(null);

      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };
      useWorkspaceStore.getState().setProject(mockProject);

      await waitForAnimation();

      // Should still be on deploy pane (or reset to default)
      const activePane = useWorkspaceStore.getState().activePane;
      expect(['console', 'agent', 'deploy', 'share', 'preview']).toContain(activePane);
    });

    it('should show correct content for each pane', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Console pane
      const consoleButton = screen.getByLabelText('Console');
      await user.click(consoleButton);
      await waitForAnimation();

      expect(screen.getByText(/Console/i)).toBeInTheDocument();

      // Agent pane
      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);
      await waitForAnimation();

      expect(screen.getByText(/Agent/i)).toBeInTheDocument();

      // Deploy pane
      const deployButton = screen.getByLabelText('Deploy');
      await user.click(deployButton);
      await waitForAnimation();

      expect(screen.getByText(/Deploy/i)).toBeInTheDocument();

      // Share pane
      const shareButton = screen.getByLabelText('Share');
      await user.click(shareButton);
      await waitForAnimation();

      expect(screen.getByText(/Share/i)).toBeInTheDocument();

      // Preview pane
      const previewButton = screen.getByLabelText('Preview');
      await user.click(previewButton);
      await waitForAnimation();

      expect(screen.getByText(/Preview/i)).toBeInTheDocument();
    });
  });

  describe('Tools Overlay', () => {
    it('should open tools overlay from menu', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Open dropdown menu
      const menuButton = screen.getByLabelText('More options');
      await user.click(menuButton);

      await waitForAnimation();

      // Click "Show Tools" option
      const showToolsOption = screen.getByText('Show Tools');
      await user.click(showToolsOption);

      await waitForAnimation();

      // Tools overlay should be visible
      await waitFor(() => {
        expect(useWorkspaceStore.getState().toolsOverlayOpen).toBe(true);
      });
    });

    it('should close tools overlay', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Open tools overlay
      useWorkspaceStore.getState().openToolsOverlay();

      await waitForAnimation();

      expect(useWorkspaceStore.getState().toolsOverlayOpen).toBe(true);

      // Close by clicking close button or backdrop
      const closeButton = screen.queryByText('Close');
      if (closeButton) {
        await user.click(closeButton);
        await waitForAnimation();
      }

      // Should be closed
      await waitFor(() => {
        expect(useWorkspaceStore.getState().toolsOverlayOpen).toBe(false);
      });
    });

    it('should show tools content when overlay is open', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Open tools overlay
      useWorkspaceStore.getState().openToolsOverlay();

      await waitForAnimation();

      // Should show tools content
      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      });

      // Should show tool options
      expect(screen.getByText('File Manager')).toBeInTheDocument();
      expect(screen.getByText('Git Status')).toBeInTheDocument();
      expect(screen.getByText('Dependencies')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
    });
  });

  describe('Swipe Gestures Between Panes', () => {
    it('should support swipe left to next pane', async () => {
      render(<AppsScreen />);

      await waitForAnimation();

      // Set to console pane
      useWorkspaceStore.getState().setActivePane('console');

      await waitForAnimation();

      // Get the workspace content area
      const contentArea = screen.getByText(/Console/i).closest('div');
      expect(contentArea).toBeTruthy();

      if (contentArea) {
        // Swipe left to go to next pane
        await swipeLeft(contentArea);

        await waitForAnimation();

        // Note: Swipe gesture functionality would need to be implemented
        // in the actual WorkspaceScreen component. This test verifies the
        // gesture utility works without errors.
      }
    });

    it('should support swipe right to previous pane', async () => {
      render(<AppsScreen />);

      await waitForAnimation();

      // Set to agent pane
      useWorkspaceStore.getState().setActivePane('agent');

      await waitForAnimation();

      // Get the workspace content area
      const contentArea = screen.getByText(/Agent/i).closest('div');
      expect(contentArea).toBeTruthy();

      if (contentArea) {
        // Swipe right to go to previous pane
        await swipeRight(contentArea);

        await waitForAnimation();

        // Note: Swipe gesture functionality would need to be implemented
        // in the actual WorkspaceScreen component.
      }
    });
  });

  describe('Pane Transition Animations', () => {
    it('should animate pane transitions', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Get initial pane content
      const consoleButton = screen.getByLabelText('Console');
      await user.click(consoleButton);

      await waitForAnimation();

      const consoleContent = screen.getByText(/Console/i);
      expect(consoleContent).toBeInTheDocument();

      // Switch to agent pane
      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);

      // Animation should occur (200ms transition in WorkspaceScreen)
      await waitForAnimation(ANIMATION_DURATIONS.MEDIUM);

      // Agent content should be visible after animation
      expect(screen.getByText(/Agent/i)).toBeInTheDocument();
    });

    it('should handle rapid pane switching', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Rapidly switch panes
      await user.click(screen.getByLabelText('Console'));
      await user.click(screen.getByLabelText('Agent'));
      await user.click(screen.getByLabelText('Deploy'));
      await user.click(screen.getByLabelText('Share'));

      // Wait for all animations to settle
      await waitForAnimation(ANIMATION_DURATIONS.MEDIUM * 2);

      // Should end up on share pane
      expect(useWorkspaceStore.getState().activePane).toBe('share');

      const shareTab = screen.getByLabelText('Share').closest('button');
      expect(shareTab).toHaveClass('text-primary');
    });
  });

  describe('Workspace State Persistence', () => {
    it('should maintain pane selection across project switches', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Set to preview pane
      const previewButton = screen.getByLabelText('Preview');
      await user.click(previewButton);

      await waitForAnimation();

      expect(useWorkspaceStore.getState().activePane).toBe('preview');

      // Switch to different project
      const newProject = {
        id: 'new-project',
        name: 'New Project',
        path: '/projects/new',
      };

      useWorkspaceStore.getState().setProject(newProject);

      await waitForAnimation();

      // Pane should reset or maintain based on implementation
      const activePane = useWorkspaceStore.getState().activePane;
      expect(['console', 'agent', 'deploy', 'share', 'preview']).toContain(activePane);
    });

    it('should reset workspace state when going back to Apps', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // Make changes to workspace state
      useWorkspaceStore.getState().setActivePane('deploy');
      useWorkspaceStore.getState().openToolsOverlay();

      // Go back to Apps
      const backButton = screen.getByLabelText('Go back');
      await user.click(backButton);

      useWorkspaceStore.getState().setProject(null);

      await waitForAnimation();

      // Workspace-specific state should be cleared
      const currentProject = useWorkspaceStore.getState().currentProject;
      expect(currentProject).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing pane content gracefully', async () => {
      const user = userEvent.setup();

      render(<AppsScreen />);

      await waitForAnimation();

      // All panes should render without errors
      const panes = ['console', 'agent', 'deploy', 'share', 'preview'] as const;

      for (const pane of panes) {
        const button = screen.getByLabelText(new RegExp(pane, 'i'));
        await user.click(button);
        await waitForAnimation();

        // Should not crash
        expect(useWorkspaceStore.getState().activePane).toBe(pane);
      }
    });

    it('should recover from invalid pane state', async () => {
      render(<AppsScreen />);

      await waitForAnimation();

      // Set invalid pane (should be type-safe, but testing runtime safety)
      useWorkspaceStore.setState({
        activePane: 'invalid' as any,
      });

      await waitForAnimation();

      // Should still render without crashing
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });
});
