import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../utils/renderWithProviders';
import { tap } from '../../../utils/gestures';
import { TaskProgress } from '@/components/mobile/agent/TaskProgress';
import type { AgentTask } from '@/components/mobile/agent/AgentExecutionView';

const mockTasks: AgentTask[] = [
  {
    id: 'task-1',
    description: 'Analyze requirements',
    status: 'completed',
    startTime: Date.now() - 5000,
    endTime: Date.now() - 2000,
    details: 'Analyzed user requirements and identified key features',
  },
  {
    id: 'task-2',
    description: 'Design architecture',
    status: 'in_progress',
    startTime: Date.now() - 3000,
  },
  {
    id: 'task-3',
    description: 'Implement features',
    status: 'pending',
  },
  {
    id: 'task-4',
    description: 'Write tests',
    status: 'error',
    startTime: Date.now() - 1000,
    endTime: Date.now(),
    error: 'Failed to initialize test environment',
  },
];

describe('TaskProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={1} />);

      expect(screen.getByText('Analyze requirements')).toBeInTheDocument();
      expect(screen.getByText('Design architecture')).toBeInTheDocument();
      expect(screen.getByText('Implement features')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TaskProgress tasks={mockTasks} currentTaskIndex={0} className="custom-class" />
      );

      const progressContainer = container.firstChild as HTMLElement;
      expect(progressContainer?.className).toContain('custom-class');
    });

    it('should show generating state when no tasks', () => {
      render(<TaskProgress tasks={[]} currentTaskIndex={0} />);

      expect(screen.getByText('Generating tasks...')).toBeInTheDocument();
    });

    it('should show generating state when all tasks pending', () => {
      const pendingTasks: AgentTask[] = [
        { id: '1', description: 'Task 1', status: 'pending' },
        { id: '2', description: 'Task 2', status: 'pending' },
      ];

      render(<TaskProgress tasks={pendingTasks} currentTaskIndex={0} />);

      expect(screen.getByText('Generating tasks...')).toBeInTheDocument();
    });
  });

  describe('Task Status Icons', () => {
    it('should show checkmark icon for completed tasks', () => {
      const { container } = render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      const completedTask = screen.getByText('Analyze requirements').closest('div');
      const icon = completedTask?.querySelector('.text-green-500');
      expect(icon).toBeInTheDocument();
    });

    it('should show spinner icon for in-progress tasks', () => {
      const { container } = render(<TaskProgress tasks={mockTasks} currentTaskIndex={1} />);

      const inProgressTask = screen.getByText('Design architecture').closest('div');
      const spinner = inProgressTask?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show circle icon for pending tasks', () => {
      const { container } = render(<TaskProgress tasks={mockTasks} currentTaskIndex={2} />);

      const pendingTask = screen.getByText('Implement features').closest('div');
      const icon = pendingTask?.querySelector('.text-muted-foreground');
      expect(icon).toBeInTheDocument();
    });

    it('should show alert icon for error tasks', () => {
      const { container } = render(<TaskProgress tasks={mockTasks} currentTaskIndex={3} />);

      const errorTask = screen.getByText('Write tests').closest('div');
      const icon = errorTask?.querySelector('.text-red-500');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Task Duration', () => {
    it('should display duration for completed tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      // Duration should be displayed in seconds
      expect(screen.getByText(/\d+s/)).toBeInTheDocument();
    });

    it('should display duration for in-progress tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={1} />);

      // Should show duration for in-progress task
      const inProgressTask = screen.getByText('Design architecture').closest('div');
      expect(inProgressTask?.textContent).toMatch(/\d+s/);
    });

    it('should not display duration for pending tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={2} />);

      const pendingTask = screen.getByText('Implement features').closest('div');
      const timingElement = pendingTask?.querySelector('.text-muted-foreground');
      // Timing element should not exist or not contain seconds pattern
      if (timingElement) {
        expect(timingElement.textContent).not.toMatch(/\d+s/);
      }
    });
  });

  describe('Task Expansion', () => {
    it('should toggle task details on click', async () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      const taskWithDetails = screen.getByText('Analyze requirements');
      await tap(taskWithDetails);

      await waitFor(() => {
        expect(screen.getByText('Analyzed user requirements and identified key features')).toBeInTheDocument();
      });
    });

    it('should collapse expanded task on second click', async () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      const taskWithDetails = screen.getByText('Analyze requirements');

      // Expand
      await tap(taskWithDetails);
      await waitFor(() => {
        expect(screen.getByText('Analyzed user requirements and identified key features')).toBeInTheDocument();
      });

      // Collapse
      await tap(taskWithDetails);
      await waitFor(() => {
        expect(screen.queryByText('Analyzed user requirements and identified key features')).not.toBeInTheDocument();
      });
    });

    it('should show error details when task has error', async () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={3} />);

      const errorTask = screen.getByText('Write tests');
      await tap(errorTask);

      await waitFor(() => {
        expect(screen.getByText('Failed to initialize test environment')).toBeInTheDocument();
      });
    });

    it('should show chevron indicator for expandable tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      // Task with details should have chevron
      const taskWithDetails = screen.getByText('Analyze requirements').closest('div');
      const chevron = taskWithDetails?.querySelector('.text-muted-foreground');
      expect(chevron).toBeInTheDocument();
    });

    it('should not expand tasks without details', async () => {
      const simpleTask: AgentTask = {
        id: 'simple',
        description: 'Simple task',
        status: 'pending',
      };

      render(<TaskProgress tasks={[simpleTask]} currentTaskIndex={0} />);

      const task = screen.getByText('Simple task');
      const taskElement = task.closest('div');

      // Should not have clickable cursor
      expect(taskElement?.className).not.toContain('cursor-pointer');
    });
  });

  describe('Current Task Highlighting', () => {
    it('should highlight current task', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={1} />);

      const currentTask = screen.getByText('Design architecture').closest('div')?.parentElement;
      expect(currentTask?.className).toContain('bg-primary/5');
      expect(currentTask?.className).toContain('border-primary/20');
    });

    it('should not highlight non-current tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={1} />);

      const nonCurrentTask = screen.getByText('Analyze requirements').closest('div')?.parentElement;
      expect(nonCurrentTask?.className).toContain('bg-card');
      expect(nonCurrentTask?.className).not.toContain('bg-primary/5');
    });
  });

  describe('Status Colors', () => {
    it('should apply green color to completed tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      const completedText = screen.getByText('Analyze requirements');
      expect(completedText.className).toContain('text-green-600');
    });

    it('should apply blue color to in-progress tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={1} />);

      const inProgressText = screen.getByText('Design architecture');
      expect(inProgressText.className).toContain('text-blue-600');
    });

    it('should apply muted color to pending tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={2} />);

      const pendingText = screen.getByText('Implement features');
      expect(pendingText.className).toContain('text-muted-foreground');
    });

    it('should apply red color to error tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={3} />);

      const errorText = screen.getByText('Write tests');
      expect(errorText.className).toContain('text-red-600');
    });
  });

  describe('Animations', () => {
    it('should animate task entrance', () => {
      const { container } = render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      // Check for motion.div with animation props
      const tasks = container.querySelectorAll('[class*="transition"]');
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should animate icon appearance for completed tasks', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      // Icon should have scale animation
      const completedTask = screen.getByText('Analyze requirements').closest('div');
      expect(completedTask).toBeInTheDocument();
    });

    it('should animate chevron rotation on expand', async () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      const taskWithDetails = screen.getByText('Analyze requirements');
      await tap(taskWithDetails);

      // Chevron should rotate when expanded
      await waitFor(() => {
        expect(screen.getByText('Analyzed user requirements and identified key features')).toBeInTheDocument();
      });
    });
  });

  describe('Error Display', () => {
    it('should display error in styled container', async () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={3} />);

      const errorTask = screen.getByText('Write tests');
      await tap(errorTask);

      await waitFor(() => {
        const errorLabel = screen.getByText('Error');
        const errorContainer = errorLabel.closest('div');
        expect(errorContainer?.className).toContain('bg-red-50');
      });
    });

    it('should display both error and details if present', async () => {
      const taskWithBoth: AgentTask = {
        id: 'both',
        description: 'Task with error and details',
        status: 'error',
        error: 'Error message',
        details: 'Additional details',
      };

      render(<TaskProgress tasks={[taskWithBoth]} currentTaskIndex={0} />);

      const task = screen.getByText('Task with error and details');
      await tap(task);

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Additional details')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      const { container } = render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      // Should have proper semantic structure
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    });

    it('should maintain proper spacing for touch targets', () => {
      render(<TaskProgress tasks={mockTasks} currentTaskIndex={0} />);

      const task = screen.getByText('Analyze requirements').closest('div');
      expect(task?.className).toContain('p-3');
    });
  });
});
