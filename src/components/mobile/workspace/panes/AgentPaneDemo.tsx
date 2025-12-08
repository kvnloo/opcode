import { useState, useEffect } from 'react';
import { AgentPane, Task, Checkpoint, AgentStatus } from './AgentPane';

/**
 * Demo component showing AgentPane usage
 *
 * This demonstrates the agent execution view with:
 * - Task progress tracking
 * - Live status updates
 * - Checkpoint management
 * - Error handling
 * - Quick access tools
 */
export function AgentPaneDemo() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('running');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      description: 'Analyzing project structure',
      status: 'completed',
      startTime: Date.now() - 180000,
      endTime: Date.now() - 150000,
    },
    {
      id: '2',
      description: 'Setting up authentication middleware',
      status: 'completed',
      startTime: Date.now() - 150000,
      endTime: Date.now() - 90000,
    },
    {
      id: '3',
      description: 'Creating API endpoints',
      status: 'in_progress',
      startTime: Date.now() - 90000,
    },
    {
      id: '4',
      description: 'Writing unit tests',
      status: 'pending',
    },
    {
      id: '5',
      description: 'Running tests and validation',
      status: 'pending',
    },
    {
      id: '6',
      description: 'Documenting API endpoints',
      status: 'pending',
    },
    {
      id: '7',
      description: 'Optimizing performance',
      status: 'pending',
    },
    {
      id: '8',
      description: 'Final review and cleanup',
      status: 'pending',
    },
  ]);

  const [checkpoints] = useState<Checkpoint[]>([
    {
      id: 'cp-1',
      timestamp: Date.now() - 180000,
      summary: 'Completed authentication setup with JWT tokens',
      filesChanged: [
        'src/middleware/auth.ts',
        'src/routes/auth.ts',
        'src/lib/jwt.ts',
      ],
    },
  ]);

  const currentTask = tasks.find((t) => t.status === 'in_progress') || null;

  // Simulate task progression
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const currentInProgressIndex = prevTasks.findIndex(
          (t) => t.status === 'in_progress'
        );

        if (currentInProgressIndex === -1) return prevTasks;

        // Complete current task and start next
        return prevTasks.map((task, index) => {
          if (index === currentInProgressIndex) {
            return {
              ...task,
              status: 'completed' as const,
              endTime: Date.now(),
            };
          }
          if (index === currentInProgressIndex + 1) {
            return {
              ...task,
              status: 'in_progress' as const,
              startTime: Date.now(),
            };
          }
          return task;
        });
      });
    }, 5000); // Complete a task every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update agent status when all tasks complete
  useEffect(() => {
    const allComplete = tasks.every((t) => t.status === 'completed');
    if (allComplete && agentStatus === 'running') {
      setAgentStatus('complete');
    }
  }, [tasks, agentStatus]);

  const handleRollback = (checkpointId: string) => {
    console.log('Rolling back to checkpoint:', checkpointId);
    // In a real app, this would restore project state
  };

  const handleViewChanges = () => {
    console.log('Opening changes viewer');
    // In a real app, this would show a diff viewer
  };

  const handleViewPreview = () => {
    console.log('Opening preview');
    // In a real app, this would open the preview pane
  };

  const handleOpenTool = (toolId: string) => {
    console.log('Opening tool:', toolId);
    // In a real app, this would navigate to the tool
  };

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={currentTask}
        agentStatus={agentStatus}
        checkpoints={checkpoints}
        workDuration={3}
        onRollback={handleRollback}
        onViewChanges={handleViewChanges}
        onViewPreview={handleViewPreview}
        onOpenTool={handleOpenTool}
      />
    </div>
  );
}

/**
 * Demo with error state
 */
export function AgentPaneErrorDemo() {
  const tasks: Task[] = [
    {
      id: '1',
      description: 'Analyzing project structure',
      status: 'completed',
      startTime: Date.now() - 180000,
      endTime: Date.now() - 150000,
    },
    {
      id: '2',
      description: 'Setting up authentication',
      status: 'error',
      startTime: Date.now() - 150000,
      endTime: Date.now() - 120000,
      error: 'Failed to install required dependencies',
    },
  ];

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={null}
        agentStatus="error"
        error="Agent encountered an error while running, we are investigating"
        workDuration={2}
        onRollback={() => console.log('Rollback')}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(id) => console.log('Open tool:', id)}
      />
    </div>
  );
}
