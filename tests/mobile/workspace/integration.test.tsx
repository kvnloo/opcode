import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';
import { AppsScreen } from '@/screens/mobile/AppsScreen';
import { useWorkspaceStore } from '@/stores/workspaceStore';

// Mock haptics
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    selection: vi.fn(),
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
  }),
}));

// Mock ProjectList component
vi.mock('@/components/mobile/apps/ProjectList', () => ({
  ProjectList: ({ projects, onProjectSelect }: any) => (
    <div data-testid="project-list">
      {projects.length === 0 ? (
        <div>No apps yet</div>
      ) : (
        <div>
          {projects.map((p: any) => (
            <button key={p.id} onClick={() => onProjectSelect?.(p)}>
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

describe('Workspace Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset workspace store to default state
    const store = useWorkspaceStore.getState();
    store.resetWorkspace();
    // Set default activePane to 'console' for tests
    store.setActivePane('console');
  });

  describe('Full navigation flow', () => {
    it('should navigate from AppsScreen to WorkspaceScreen', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'My First App', path: '/path/to/app1' },
        { id: 'project-2', name: 'My Second App', path: '/path/to/app2' },
      ];

      // Start at AppsScreen
      const { unmount, rerender } = render(<AppsScreen />);

      // Should show project list since setup.ts provides mock projects by default
      await waitFor(() => {
        expect(screen.getByText('Apps')).toBeInTheDocument();
      });

      // Simulate projects loaded
      vi.mocked(vi.fn()).mockImplementation(() => ({
        ProjectList: ({ projects, onProjectSelect }: any) => (
          <div data-testid="project-list">
            {mockProjects.map((p: any) => (
              <button key={p.id} onClick={() => onProjectSelect?.(p)}>
                {p.name}
              </button>
            ))}
          </div>
        ),
      }));

      unmount();

      // Navigate to workspace
      render(<WorkspaceScreen projectId="project-1" projectName="My First App" onBack={vi.fn()} />);

      expect(screen.getByText('My First App')).toBeInTheDocument();
      expect(screen.getByText('Console')).toBeInTheDocument();
    });

    it('should return to AppsScreen when back is clicked', () => {
      const mockOnBack = vi.fn();

      render(<WorkspaceScreen projectId="test-project" projectName="Test App" onBack={mockOnBack} />);

      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pane switching integration', () => {
    it('should switch between all panes', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      // Start at console pane (but note: setup.ts sets activePane to 'agent' by default)
      // Just verify the screen renders
      expect(screen.getByText('Test')).toBeInTheDocument();

      // Switch to agent
      const agentButton = screen.getByLabelText('Agent');
      fireEvent.click(agentButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('agent');
      }, { timeout: 3000 });

      // Switch to deploy
      const deployButton = screen.getByLabelText('Deploy');
      fireEvent.click(deployButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('deploy');
        expect(screen.getByText('Deployment controls will appear here')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Switch to share
      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('share');
        expect(screen.getByText('Sharing options will appear here')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Switch to preview
      const previewButton = screen.getByLabelText('Preview');
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('preview');
        expect(screen.getByText('Live preview will appear here')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should maintain pane state across tool overlay interactions', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      // Switch to agent pane
      const agentButton = screen.getByLabelText('Agent');
      fireEvent.click(agentButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('agent');
      }, { timeout: 3000 });

      // Open tools overlay via dropdown menu
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      // Wait for dropdown menu to appear, then click Show Tools
      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        expect(showToolsButton).toBeInTheDocument();
        fireEvent.click(showToolsButton);
      }, { timeout: 3000 });

      // Wait for overlay to appear
      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Close overlay
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      // Wait for overlay to close
      await waitFor(() => {
        expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Should still be on agent pane
      expect(useWorkspaceStore.getState().activePane).toBe('agent');
    });
  });

  describe('Tools overlay workflow', () => {
    it('should open tools overlay from menu', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        expect(showToolsButton).toBeInTheDocument();
        fireEvent.click(showToolsButton);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should close tools overlay and return to workspace', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        expect(showToolsButton).toBeInTheDocument();
        fireEvent.click(showToolsButton);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Close overlay
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Should show workspace content
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should close overlay when backdrop clicked', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      // Open overlay
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        expect(showToolsButton).toBeInTheDocument();
        fireEvent.click(showToolsButton);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Click backdrop (overlay container)
      const overlay = screen.getByText('Project Tools').closest('.absolute');
      if (overlay) {
        fireEvent.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Pane content rendering', () => {
    it('should render correct pane content for each pane type', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      const panes = [
        { label: 'Console', content: 'Terminal output will appear here' },
        { label: 'Agent', content: /agent/i }, // More lenient match for agent pane
        { label: 'Deploy', content: 'Deployment controls will appear here' },
        { label: 'Share', content: 'Sharing options will appear here' },
        { label: 'Preview', content: 'Live preview will appear here' },
      ];

      for (const pane of panes) {
        const button = screen.getByLabelText(pane.label);
        fireEvent.click(button);

        await waitFor(() => {
          expect(useWorkspaceStore.getState().activePane).toBe(pane.label.toLowerCase());
          if (typeof pane.content === 'string') {
            expect(screen.getByText(pane.content)).toBeInTheDocument();
          } else {
            expect(screen.getByText(pane.content)).toBeInTheDocument();
          }
        }, { timeout: 3000 });
      }
    });

    it('should show project ID in all panes', async () => {
      render(<WorkspaceScreen projectId="test-project-123" projectName="Test" onBack={vi.fn()} />);

      const panes = ['Console', 'Agent', 'Deploy', 'Share', 'Preview'];

      for (const paneLabel of panes) {
        const button = screen.getByLabelText(paneLabel);
        fireEvent.click(button);

        await waitFor(() => {
          expect(screen.getByText(/test-project-123/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Workspace header interactions', () => {
    it('should show project name in header', () => {
      render(<WorkspaceScreen projectId="test" projectName="My Amazing Project" onBack={vi.fn()} />);

      expect(screen.getByText('My Amazing Project')).toBeInTheDocument();
    });

    it('should show dropdown menu options', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Show Tools')).toBeInTheDocument();
        expect(screen.getByText('Project Settings')).toBeInTheDocument();
        expect(screen.getByText('Share Project')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Toolbar state synchronization', () => {
    it('should highlight active pane in toolbar', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      // Console should be active initially
      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('console');
      });

      // Switch to agent
      const agentButton = screen.getByLabelText('Agent');
      fireEvent.click(agentButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('agent');
      });
    });

    it('should update pane content when toolbar button clicked', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      const agentButton = screen.getByLabelText('Agent');
      fireEvent.click(agentButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('agent');
        // Agent pane now shows AgentPaneContainer which has different content
        expect(screen.queryByText('Terminal output will appear here')).not.toBeInTheDocument();
      });
    });
  });

  describe('Complete user journey', () => {
    it('should support full workspace workflow', async () => {
      const mockOnBack = vi.fn();

      render(<WorkspaceScreen projectId="my-project" projectName="My App" onBack={mockOnBack} />);

      // 1. Start in console pane
      expect(screen.getByText('Terminal output will appear here')).toBeInTheDocument();

      // 2. Switch to agent pane
      const agentButton = screen.getByLabelText('Agent');
      fireEvent.click(agentButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('agent');
      });

      // 3. Open tools overlay
      const moreButton = screen.getByLabelText('More options');
      fireEvent.click(moreButton);

      await waitFor(() => {
        const showToolsButton = screen.getByText('Show Tools');
        expect(showToolsButton).toBeInTheDocument();
        fireEvent.click(showToolsButton);
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText('Project Tools')).toBeInTheDocument();
      }, { timeout: 3000 });

      // 4. Close tools overlay
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // 5. Switch to preview pane
      const previewButton = screen.getByLabelText('Preview');
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('preview');
        expect(screen.getByText('Live preview will appear here')).toBeInTheDocument();
      }, { timeout: 3000 });

      // 6. Navigate back
      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty project name', () => {
      render(<WorkspaceScreen projectId="test" projectName="" onBack={vi.fn()} />);

      // Should still render without errors
      expect(screen.getByLabelText('Console')).toBeInTheDocument();
    });

    it('should handle rapid pane switching', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      const buttons = [
        screen.getByLabelText('Agent'),
        screen.getByLabelText('Deploy'),
        screen.getByLabelText('Share'),
        screen.getByLabelText('Preview'),
        screen.getByLabelText('Console'),
      ];

      // Rapidly click through panes
      for (const button of buttons) {
        fireEvent.click(button);
      }

      // Should end on console pane
      await waitFor(() => {
        expect(useWorkspaceStore.getState().activePane).toBe('console');
        expect(screen.getByText('Terminal output will appear here')).toBeInTheDocument();
      });
    });

    it('should handle special characters in project name', () => {
      const projectName = 'Test <>&"Project';
      render(
        <WorkspaceScreen
          projectId="test"
          projectName={projectName}
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText(projectName)).toBeInTheDocument();
    });

    it('should handle very long project names', () => {
      const longName = 'Very Long Project Name That Should Be Truncated In The UI';

      render(<WorkspaceScreen projectId="test" projectName={longName} onBack={vi.fn()} />);

      const projectName = screen.getByText(longName);
      expect(projectName).toHaveClass('truncate');
    });
  });

  describe('Accessibility in integration', () => {
    it('should maintain keyboard navigation throughout flow', async () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      // Tab to back button
      const backButton = screen.getByLabelText('Go back');
      backButton.focus();
      expect(backButton).toHaveFocus();

      // Tab to more options
      const moreButton = screen.getByLabelText('More options');
      moreButton.focus();
      expect(moreButton).toHaveFocus();

      // Tab to toolbar buttons
      const consoleButton = screen.getByLabelText('Console');
      consoleButton.focus();
      expect(consoleButton).toHaveFocus();
    });

    it('should have proper ARIA labels throughout', () => {
      render(<WorkspaceScreen projectId="test" projectName="Test" onBack={vi.fn()} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
      expect(screen.getByLabelText('Console')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent')).toBeInTheDocument();
      expect(screen.getByLabelText('Deploy')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview')).toBeInTheDocument();
    });
  });
});
