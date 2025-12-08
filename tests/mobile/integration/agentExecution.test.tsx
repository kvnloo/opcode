import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/../tests/mobile/utils/renderWithProviders';
import { waitForAnimation, ANIMATION_DURATIONS } from '@/../tests/mobile/utils/waitForAnimations';
import { AppsScreen } from '@/screens/mobile/AppsScreen';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import userEvent from '@testing-library/user-event';

describe('Agent Execution Flow Integration Tests', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspace();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Start Agent Task', () => {
    it('should start agent task and show running status', async () => {
      const user = userEvent.setup({ delay: null });

      // Set up project
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Navigate to agent pane
      const agentButton = screen.getByLabelText('Agent');
      await user.click(agentButton);

      await waitForAnimation();

      // Start a task
      const taskDescription = 'Build a login form';
      useWorkspaceStore.getState().startAgent(taskDescription);

      // Verify agent status is running
      await waitFor(() => {
        expect(useWorkspaceStore.getState().agentStatus).toBe('running');
      });

      // Verify task was created
      const tasks = useWorkspaceStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe(taskDescription);
      expect(tasks[0].status).toBe('running');
    });

    it('should show task progress updates', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start task
      useWorkspaceStore.getState().startAgent('Create API endpoints');

      const taskId = useWorkspaceStore.getState().currentTaskId!;

      // Update task progress
      useWorkspaceStore.getState().updateTask(taskId, {
        progress: { current: 25, total: 100 },
      });

      await waitFor(() => {
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.progress.current).toBe(25);
      });

      // Update to 50%
      useWorkspaceStore.getState().updateTask(taskId, {
        progress: { current: 50, total: 100 },
      });

      await waitFor(() => {
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.progress.current).toBe(50);
      });

      // Complete task
      useWorkspaceStore.getState().updateTask(taskId, {
        status: 'completed',
        progress: { current: 100, total: 100 },
        completedAt: new Date(),
      });

      await waitFor(() => {
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.status).toBe('completed');
        expect(useWorkspaceStore.getState().agentStatus).toBe('complete');
      });
    });

    it('should track work duration during task execution', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start task
      useWorkspaceStore.getState().startAgent('Build feature');

      // Verify initial duration is 0
      expect(useWorkspaceStore.getState().workDurationSeconds).toBe(0);

      // Simulate time passing
      useWorkspaceStore.getState().incrementWorkDuration();
      useWorkspaceStore.getState().incrementWorkDuration();
      useWorkspaceStore.getState().incrementWorkDuration();

      await waitFor(() => {
        expect(useWorkspaceStore.getState().workDurationSeconds).toBe(3);
      });
    });
  });

  describe('Track Task Changes', () => {
    it('should track file edits during task execution', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start task
      useWorkspaceStore.getState().startAgent('Update components');

      const taskId = useWorkspaceStore.getState().currentTaskId!;

      // Add file edits
      const fileEdits = [
        { path: '/src/components/Button.tsx', action: 'edited' as const },
        { path: '/src/components/Form.tsx', action: 'created' as const },
        { path: '/src/old/Legacy.tsx', action: 'deleted' as const },
      ];

      useWorkspaceStore.getState().updateTask(taskId, {
        fileEdits,
      });

      await waitFor(() => {
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.fileEdits).toHaveLength(3);
        expect(task.fileEdits[0].path).toBe('/src/components/Button.tsx');
        expect(task.fileEdits[0].action).toBe('edited');
      });
    });

    it('should show task completion status', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start and complete task
      useWorkspaceStore.getState().startAgent('Test task');

      const taskId = useWorkspaceStore.getState().currentTaskId!;

      useWorkspaceStore.getState().updateTask(taskId, {
        status: 'completed',
        progress: { current: 100, total: 100 },
        completedAt: new Date(),
      });

      await waitFor(() => {
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.status).toBe('completed');
        expect(task.completedAt).toBeTruthy();
      });
    });

    it('should handle task errors gracefully', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start task
      useWorkspaceStore.getState().startAgent('Error prone task');

      const taskId = useWorkspaceStore.getState().currentTaskId!;

      // Simulate error
      const errorMessage = 'Failed to compile code';
      useWorkspaceStore.getState().updateTask(taskId, {
        status: 'error',
        error: errorMessage,
        completedAt: new Date(),
      });

      await waitFor(() => {
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.status).toBe('error');
        expect(task.error).toBe(errorMessage);
        expect(useWorkspaceStore.getState().agentStatus).toBe('error');
      });
    });
  });

  describe('Checkpoint Management', () => {
    it('should create checkpoints during task execution', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start task
      useWorkspaceStore.getState().startAgent('Complex feature');

      const taskId = useWorkspaceStore.getState().currentTaskId!;

      // Create checkpoint
      const checkpoint = {
        id: 'checkpoint-1',
        taskId,
        description: 'Completed step 1',
        timestamp: new Date(),
        canRollback: true,
      };

      useWorkspaceStore.getState().addCheckpoint(checkpoint);

      await waitFor(() => {
        const checkpoints = useWorkspaceStore.getState().checkpoints;
        expect(checkpoints).toHaveLength(1);
        expect(checkpoints[0].description).toBe('Completed step 1');
      });
    });

    it('should rollback to checkpoint when requested', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start task
      useWorkspaceStore.getState().startAgent('Feature with rollback');

      const taskId = useWorkspaceStore.getState().currentTaskId!;

      // Create checkpoint
      const checkpoint = {
        id: 'checkpoint-1',
        taskId,
        description: 'Before breaking change',
        timestamp: new Date(),
        canRollback: true,
      };

      useWorkspaceStore.getState().addCheckpoint(checkpoint);

      // Continue with more work
      useWorkspaceStore.getState().updateTask(taskId, {
        progress: { current: 75, total: 100 },
      });

      // Rollback
      useWorkspaceStore.getState().rollbackToCheckpoint(checkpoint.id);

      await waitFor(() => {
        // Task should be marked as rolled back
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.status).toBe('error');
        expect(task.error).toBe('Rolled back');
      });
    });

    it('should prevent rollback to non-rollbackable checkpoints', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      useWorkspaceStore.getState().startAgent('Test task');

      const taskId = useWorkspaceStore.getState().currentTaskId!;

      // Create non-rollbackable checkpoint
      const checkpoint = {
        id: 'checkpoint-1',
        taskId,
        description: 'Final commit',
        timestamp: new Date(),
        canRollback: false,
      };

      useWorkspaceStore.getState().addCheckpoint(checkpoint);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Try to rollback
      useWorkspaceStore.getState().rollbackToCheckpoint(checkpoint.id);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Cannot rollback to checkpoint:',
          checkpoint.id
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Stop Agent Execution', () => {
    it('should stop running agent task', async () => {
      const user = userEvent.setup({ delay: null });

      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start task
      useWorkspaceStore.getState().startAgent('Long running task');

      // Verify running
      expect(useWorkspaceStore.getState().agentStatus).toBe('running');

      // Stop agent
      useWorkspaceStore.getState().stopAgent();

      await waitFor(() => {
        expect(useWorkspaceStore.getState().agentStatus).toBe('idle');
        const task = useWorkspaceStore.getState().tasks[0];
        expect(task.status).toBe('error');
        expect(task.error).toBe('Cancelled by user');
      });
    });

    it('should handle multiple tasks correctly', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Start first task
      useWorkspaceStore.getState().startAgent('Task 1');

      const task1Id = useWorkspaceStore.getState().currentTaskId!;

      // Complete first task
      useWorkspaceStore.getState().updateTask(task1Id, {
        status: 'completed',
        completedAt: new Date(),
      });

      // Start second task
      useWorkspaceStore.getState().startAgent('Task 2');

      const task2Id = useWorkspaceStore.getState().currentTaskId!;

      expect(task1Id).not.toBe(task2Id);

      // Should have 2 tasks
      expect(useWorkspaceStore.getState().tasks).toHaveLength(2);

      // Stop current task
      useWorkspaceStore.getState().stopAgent();

      await waitFor(() => {
        const tasks = useWorkspaceStore.getState().tasks;
        expect(tasks[0].status).toBe('error'); // Task 2 (most recent)
        expect(tasks[1].status).toBe('completed'); // Task 1
      });
    });
  });

  describe('Clear Tasks', () => {
    it('should clear all tasks and reset state', async () => {
      const mockProject = {
        id: 'test-project',
        name: 'Test Project',
        path: '/projects/test',
      };

      useWorkspaceStore.getState().setProject(mockProject);

      render(<AppsScreen />);

      await waitForAnimation();

      // Create multiple tasks
      useWorkspaceStore.getState().startAgent('Task 1');
      const task1Id = useWorkspaceStore.getState().currentTaskId!;
      useWorkspaceStore.getState().updateTask(task1Id, { status: 'completed' });

      useWorkspaceStore.getState().startAgent('Task 2');

      // Add checkpoints
      useWorkspaceStore.getState().addCheckpoint({
        id: 'cp-1',
        taskId: task1Id,
        description: 'Checkpoint 1',
        timestamp: new Date(),
        canRollback: true,
      });

      // Increment work duration
      useWorkspaceStore.getState().incrementWorkDuration();
      useWorkspaceStore.getState().incrementWorkDuration();

      // Clear all
      useWorkspaceStore.getState().clearTasks();

      await waitFor(() => {
        expect(useWorkspaceStore.getState().tasks).toHaveLength(0);
        expect(useWorkspaceStore.getState().currentTaskId).toBeNull();
        expect(useWorkspaceStore.getState().checkpoints).toHaveLength(0);
        expect(useWorkspaceStore.getState().workDurationSeconds).toBe(0);
      });
    });
  });
});
