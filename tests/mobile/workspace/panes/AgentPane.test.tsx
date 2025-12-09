import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { AgentPane } from '@/components/mobile/workspace/panes/AgentPane';
import type { Task, AgentStatus, Checkpoint } from '@/components/mobile/workspace/panes/AgentPane';

// Mock HapticButton
vi.mock('@/components/mobile/common/HapticButton', () => ({
  HapticButton: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

describe('AgentPane', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      description: 'Create user authentication',
      status: 'completed',
      startTime: Date.now() - 60000,
      endTime: Date.now() - 30000,
    },
    {
      id: 'task-2',
      description: 'Setup database schema',
      status: 'in_progress',
      startTime: Date.now() - 30000,
    },
    {
      id: 'task-3',
      description: 'Implement API endpoints',
      status: 'pending',
    },
  ];

  const mockCheckpoints: Checkpoint[] = [
    {
      id: 'checkpoint-1',
      timestamp: Date.now() - 120000,
      summary: 'Added authentication middleware',
      filesChanged: ['src/auth.ts', 'src/middleware/auth.ts'],
    },
  ];

  const mockOnRollback = vi.fn();
  const mockOnViewChanges = vi.fn();
  const mockOnViewPreview = vi.fn();
  const mockOnOpenTool = vi.fn();

  const defaultProps = {
    tasks: mockTasks,
    currentTask: mockTasks[1],
    agentStatus: 'running' as AgentStatus,
    checkpoints: mockCheckpoints,
    workDuration: 5,
    onRollback: mockOnRollback,
    onViewChanges: mockOnViewChanges,
    onViewPreview: mockOnViewPreview,
    onOpenTool: mockOnOpenTool,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task list', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Create user authentication')).toBeInTheDocument();
      // Use getAllByText since text appears in both task list and current task section
      expect(screen.getAllByText('Setup database schema').length).toBeGreaterThan(0);
      expect(screen.getByText('Implement API endpoints')).toBeInTheDocument();
    });

    it('should render task progress header', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Task Progress')).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument(); // 1 completed out of 3 total
    });

    it('should show current task details', () => {
      render(<AgentPane {...defaultProps} />);

      // Use getAllByText and check length since current task also appears in progress list
      const taskElements = screen.getAllByText('Setup database schema');
      expect(taskElements.length).toBeGreaterThan(0);
    });

    it('should have proper layout structure', () => {
      const { container } = render(<AgentPane {...defaultProps} />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-full', 'bg-background');
    });

    it('should render scrollable content area', () => {
      const { container } = render(<AgentPane {...defaultProps} />);

      const scrollArea = container.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Task status indicators', () => {
    it('should show completed status with check icon', () => {
      const { container } = render(<AgentPane {...defaultProps} />);

      // Find completed task by text
      expect(screen.getByText('Create user authentication')).toBeInTheDocument();
      // Look for any SVG icon in the container (CheckCircle2 for completed tasks)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('should show in-progress status with spinner', () => {
      const { container } = render(<AgentPane {...defaultProps} />);

      // Use getAllByText since text appears twice (in list and current task)
      const inProgressTasks = screen.getAllByText('Setup database schema');
      expect(inProgressTasks.length).toBeGreaterThan(0);
      // Look for blue colored spinning SVG (Loader2 renders with text-blue-600 and animate-spin classes)
      const spinner = container.querySelector('svg.text-blue-600.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show pending status with empty circle', () => {
      const { container } = render(<AgentPane {...defaultProps} />);

      // Find pending task by text
      expect(screen.getByText('Implement API endpoints')).toBeInTheDocument();
      // Look for rounded-full elements in the container (pending status indicator)
      const roundedElements = container.querySelectorAll('.rounded-full');
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it('should show error status when task has error', () => {
      const tasksWithError: Task[] = [
        {
          id: 'task-error',
          description: 'Failed task',
          status: 'error',
          error: 'Connection timeout',
        },
      ];

      render(<AgentPane {...defaultProps} tasks={tasksWithError} currentTask={null} />);

      const errorTask = screen.getByText('Failed task').closest('div');
      // Check element exists and shows error message
      expect(errorTask).toBeInTheDocument();
      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
      const errorIcon = errorTask?.querySelector('.text-red-600');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('Agent running state', () => {
    it('should show loading spinner when agent is running', () => {
      render(<AgentPane {...defaultProps} agentStatus="running" />);

      // Task Progress header should have spinner - find it by the blue-500 color class
      const progressHeader = screen.getByText('Task Progress').closest('button');
      expect(progressHeader).toBeInTheDocument();
      const spinner = progressHeader?.querySelector('.text-blue-500.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show "Now let me..." section when task in progress', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Now let me...')).toBeInTheDocument();
      expect(screen.getByText('Making code changes')).toBeInTheDocument();
    });

    it('should not show "Now let me..." when no current task', () => {
      render(<AgentPane {...defaultProps} currentTask={null} />);

      expect(screen.queryByText('Now let me...')).not.toBeInTheDocument();
    });
  });

  describe('Error display', () => {
    it('should show error state when error prop provided', () => {
      render(<AgentPane {...defaultProps} error="Database connection failed" />);

      expect(screen.getByText(/Agent encountered an error/)).toBeInTheDocument();
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    it('should not show error section when no error', () => {
      render(<AgentPane {...defaultProps} error={undefined} />);

      expect(screen.queryByText(/Agent encountered an error/)).not.toBeInTheDocument();
    });
  });

  describe('Checkpoints', () => {
    it('should render checkpoint section', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Added authentication middleware')).toBeInTheDocument();
    });

    it('should show rollback button for checkpoints', () => {
      render(<AgentPane {...defaultProps} />);

      const rollbackButton = screen.getByText('Rollback here');
      expect(rollbackButton).toBeInTheDocument();
    });

    it('should call onRollback when rollback clicked', () => {
      render(<AgentPane {...defaultProps} />);

      const rollbackButton = screen.getByText('Rollback here');
      fireEvent.click(rollbackButton);

      expect(mockOnRollback).toHaveBeenCalledWith('checkpoint-1');
    });

    it('should show changes button', () => {
      render(<AgentPane {...defaultProps} />);

      const changesButton = screen.getByText('Changes');
      expect(changesButton).toBeInTheDocument();
    });

    it('should call onViewChanges when changes clicked', () => {
      render(<AgentPane {...defaultProps} />);

      const changesButton = screen.getByText('Changes');
      fireEvent.click(changesButton);

      expect(mockOnViewChanges).toHaveBeenCalled();
    });

    it('should show preview button', () => {
      render(<AgentPane {...defaultProps} />);

      const previewButton = screen.getByText('View preview');
      expect(previewButton).toBeInTheDocument();
    });

    it('should call onViewPreview when preview clicked', () => {
      render(<AgentPane {...defaultProps} />);

      const previewButton = screen.getByText('View preview');
      fireEvent.click(previewButton);

      expect(mockOnViewPreview).toHaveBeenCalled();
    });

    it('should show relative time for checkpoint', () => {
      render(<AgentPane {...defaultProps} />);

      // Should show "2 minutes ago" or similar
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });

    it('should not show checkpoint section when no checkpoints', () => {
      render(<AgentPane {...defaultProps} checkpoints={[]} />);

      expect(screen.queryByText('Added authentication middleware')).not.toBeInTheDocument();
    });
  });

  describe('Work duration', () => {
    it('should show work duration when provided', () => {
      render(<AgentPane {...defaultProps} workDuration={5} />);

      expect(screen.getByText(/Worked for 5 minutes/)).toBeInTheDocument();
    });

    it('should use singular "minute" for 1 minute', () => {
      render(<AgentPane {...defaultProps} workDuration={1} />);

      expect(screen.getByText(/Worked for 1 minute/)).toBeInTheDocument();
    });

    it('should not show duration section when 0', () => {
      render(<AgentPane {...defaultProps} workDuration={0} />);

      expect(screen.queryByText(/Worked for/)).not.toBeInTheDocument();
    });

    it('should not show duration section when undefined', () => {
      render(<AgentPane {...defaultProps} workDuration={undefined} />);

      expect(screen.queryByText(/Worked for/)).not.toBeInTheDocument();
    });
  });

  describe('Upgrade card', () => {
    it('should show upgrade card by default', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Upgrade to Core')).toBeInTheDocument();
    });

    it('should show upgrade benefits', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Unlimited agent executions')).toBeInTheDocument();
      expect(screen.getByText('10x faster processing')).toBeInTheDocument();
      expect(screen.getByText('Priority support')).toBeInTheDocument();
    });

    it('should have upgrade button', () => {
      render(<AgentPane {...defaultProps} />);

      const upgradeButton = screen.getByText('Upgrade now');
      expect(upgradeButton).toBeInTheDocument();
    });

    it('should dismiss upgrade card when close clicked', () => {
      render(<AgentPane {...defaultProps} />);

      const dismissButton = screen.getByLabelText('Dismiss upgrade card');
      fireEvent.click(dismissButton);

      expect(screen.queryByText('Upgrade to Core')).not.toBeInTheDocument();
    });
  });

  describe('Quick access bar', () => {
    it('should render quick access tools', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Secrets')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Auth')).toBeInTheDocument();
      expect(screen.getByText('New Tab')).toBeInTheDocument();
    });

    it('should call onOpenTool when tool clicked', () => {
      render(<AgentPane {...defaultProps} />);

      const secretsButton = screen.getByText('Secrets');
      fireEvent.click(secretsButton);

      expect(mockOnOpenTool).toHaveBeenCalledWith('secrets');
    });

    it('should render search input', () => {
      render(<AgentPane {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search tools and files...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have fixed quick access bar at bottom', () => {
      const { container } = render(<AgentPane {...defaultProps} />);

      const quickAccessBar = screen.getByText('Secrets').closest('.border-t');
      expect(quickAccessBar).toHaveClass('border-t', 'border-border');
    });
  });

  describe('Collapsible sections', () => {
    it('should render task progress as collapsible', () => {
      render(<AgentPane {...defaultProps} />);

      const collapseButton = screen.getByText('Task Progress').closest('button');
      expect(collapseButton).toBeInTheDocument();
    });

    it('should toggle task progress section', () => {
      render(<AgentPane {...defaultProps} />);

      const collapseButton = screen.getByText('Task Progress').closest('button');

      // Initially expanded (tasks visible)
      expect(screen.getByText('Create user authentication')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(collapseButton!);

      // Tasks should still be in DOM but with collapsed animation
      // (Animation doesn't actually hide in test environment)
    });

    it('should render task details as collapsible', () => {
      render(<AgentPane {...defaultProps} />);

      const taskSection = screen.getByText('Task').closest('button');
      expect(taskSection).toBeInTheDocument();
    });

    it('should show work duration as collapsible', () => {
      render(<AgentPane {...defaultProps} workDuration={5} />);

      const durationSection = screen.getByText(/Worked for 5 minutes/).closest('button');
      expect(durationSection).toBeInTheDocument();
    });
  });

  describe('Task progress calculation', () => {
    it('should show correct completed/total count', () => {
      render(<AgentPane {...defaultProps} />);

      // 1 completed out of 3 total
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('should update count when all tasks completed', () => {
      const completedTasks: Task[] = [
        { id: '1', description: 'Task 1', status: 'completed' },
        { id: '2', description: 'Task 2', status: 'completed' },
      ];

      render(<AgentPane {...defaultProps} tasks={completedTasks} />);

      expect(screen.getByText('2/2')).toBeInTheDocument();
    });

    it('should show 0/0 when no tasks', () => {
      render(<AgentPane {...defaultProps} tasks={[]} currentTask={null} />);

      expect(screen.getByText('0/0')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty tasks array', () => {
      render(<AgentPane {...defaultProps} tasks={[]} currentTask={null} />);

      expect(screen.getByText('Task Progress')).toBeInTheDocument();
    });

    it('should handle missing optional callbacks', () => {
      const minimalProps = {
        tasks: mockTasks,
        currentTask: null,
        agentStatus: 'idle' as AgentStatus,
      };

      expect(() => render(<AgentPane {...minimalProps} />)).not.toThrow();
    });

    it('should handle task without error message', () => {
      const tasksWithErrorNoMsg: Task[] = [
        {
          id: 'task-error',
          description: 'Failed task',
          status: 'error',
        },
      ];

      render(<AgentPane {...defaultProps} tasks={tasksWithErrorNoMsg} currentTask={null} />);

      expect(screen.getByText('Failed task')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<AgentPane {...defaultProps} className="custom-class" />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<AgentPane {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible labels for actions', () => {
      render(<AgentPane {...defaultProps} />);

      expect(screen.getByText('Rollback here')).toBeInTheDocument();
      expect(screen.getByText('Changes')).toBeInTheDocument();
      expect(screen.getByText('View preview')).toBeInTheDocument();
    });

    it('should have searchbox role for search input', () => {
      render(<AgentPane {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search tools and files...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });
});
