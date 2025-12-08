import { AgentPane, Task, Checkpoint } from './AgentPane';

/**
 * AgentPane Component Stories
 *
 * Demonstrates all possible states and configurations
 */

// Sample data generators
const createTasks = (count: number, currentIndex: number): Task[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    description: [
      'Analyzing project structure',
      'Setting up authentication middleware',
      'Creating API endpoints',
      'Writing unit tests',
      'Running tests and validation',
      'Documenting API endpoints',
      'Optimizing performance',
      'Final review and cleanup',
    ][i] || `Task ${i + 1}`,
    status:
      i < currentIndex ? 'completed' :
      i === currentIndex ? 'in_progress' :
      'pending',
    startTime: i <= currentIndex ? Date.now() - (count - i) * 30000 : undefined,
    endTime: i < currentIndex ? Date.now() - (count - i - 1) * 30000 : undefined,
  })) as Task[];
};

const createCheckpoints = (): Checkpoint[] => [
  {
    id: 'cp-1',
    timestamp: Date.now() - 180000,
    summary: 'Completed authentication setup with JWT tokens and refresh token rotation',
    filesChanged: [
      'src/middleware/auth.ts',
      'src/routes/auth.ts',
      'src/lib/jwt.ts',
      'src/types/auth.d.ts',
    ],
  },
  {
    id: 'cp-2',
    timestamp: Date.now() - 90000,
    summary: 'Added user profile endpoints with role-based access control',
    filesChanged: [
      'src/routes/users.ts',
      'src/middleware/rbac.ts',
      'src/models/User.ts',
    ],
  },
];

// Story 1: Initial State
export function InitialState() {
  const tasks = createTasks(8, 0);

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={tasks[0]}
        agentStatus="running"
        workDuration={0}
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 2: Mid-Progress
export function MidProgress() {
  const tasks = createTasks(8, 3);
  const checkpoints = createCheckpoints();

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={tasks[3]}
        agentStatus="running"
        checkpoints={checkpoints}
        workDuration={3}
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 3: Completed
export function Completed() {
  const tasks = createTasks(8, 8);
  const checkpoints = createCheckpoints();

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={null}
        agentStatus="complete"
        checkpoints={checkpoints}
        workDuration={8}
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 4: Error State
export function ErrorState() {
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
      description: 'Setting up authentication middleware',
      status: 'error',
      startTime: Date.now() - 150000,
      endTime: Date.now() - 120000,
      error: 'Failed to install required dependencies. Package @types/jsonwebtoken not found.',
    },
    {
      id: '3',
      description: 'Creating API endpoints',
      status: 'pending',
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
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 5: Single Task
export function SingleTask() {
  const tasks: Task[] = [
    {
      id: '1',
      description: 'Refactor authentication logic to use async/await patterns',
      status: 'in_progress',
      startTime: Date.now() - 60000,
    },
  ];

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={tasks[0]}
        agentStatus="running"
        workDuration={1}
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 6: Many Checkpoints
export function ManyCheckpoints() {
  const tasks = createTasks(8, 5);
  const checkpoints: Checkpoint[] = [
    {
      id: 'cp-1',
      timestamp: Date.now() - 300000,
      summary: 'Initial project setup with TypeScript configuration',
      filesChanged: ['tsconfig.json', 'package.json'],
    },
    {
      id: 'cp-2',
      timestamp: Date.now() - 240000,
      summary: 'Added Express server with basic middleware',
      filesChanged: ['src/server.ts', 'src/middleware/index.ts'],
    },
    {
      id: 'cp-3',
      timestamp: Date.now() - 180000,
      summary: 'Implemented JWT authentication system',
      filesChanged: [
        'src/middleware/auth.ts',
        'src/routes/auth.ts',
        'src/lib/jwt.ts',
      ],
    },
    {
      id: 'cp-4',
      timestamp: Date.now() - 120000,
      summary: 'Created user management endpoints',
      filesChanged: ['src/routes/users.ts', 'src/models/User.ts'],
    },
    {
      id: 'cp-5',
      timestamp: Date.now() - 60000,
      summary: 'Added comprehensive error handling',
      filesChanged: ['src/middleware/errorHandler.ts', 'src/lib/errors.ts'],
    },
  ];

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={tasks[5]}
        agentStatus="running"
        checkpoints={checkpoints}
        workDuration={5}
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 7: Idle State
export function IdleState() {
  const tasks: Task[] = [];

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={null}
        agentStatus="idle"
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 8: Long Running Task
export function LongRunningTask() {
  const tasks = createTasks(3, 1);
  const checkpoints: Checkpoint[] = [
    {
      id: 'cp-1',
      timestamp: Date.now() - 900000, // 15 minutes ago
      summary: 'Completed initial analysis and planning',
      filesChanged: ['PLAN.md', 'ARCHITECTURE.md'],
    },
  ];

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={tasks[1]}
        agentStatus="running"
        checkpoints={checkpoints}
        workDuration={15}
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 9: Multiple Errors
export function MultipleErrors() {
  const tasks: Task[] = [
    {
      id: '1',
      description: 'Install dependencies',
      status: 'error',
      startTime: Date.now() - 300000,
      endTime: Date.now() - 270000,
      error: 'npm install failed: EACCES permission denied',
    },
    {
      id: '2',
      description: 'Setup database connection',
      status: 'error',
      startTime: Date.now() - 270000,
      endTime: Date.now() - 240000,
      error: 'Connection refused: ECONNREFUSED 127.0.0.1:5432',
    },
    {
      id: '3',
      description: 'Run migrations',
      status: 'pending',
    },
  ];

  return (
    <div className="h-screen">
      <AgentPane
        tasks={tasks}
        currentTask={null}
        agentStatus="error"
        error="Multiple errors detected. Please check the task list for details."
        workDuration={5}
        onRollback={(id) => console.log('Rollback:', id)}
        onViewChanges={() => console.log('View changes')}
        onViewPreview={() => console.log('View preview')}
        onOpenTool={(tool) => console.log('Open tool:', tool)}
      />
    </div>
  );
}

// Story 10: Dark Mode (same as MidProgress but in dark mode)
export function DarkMode() {
  return (
    <div className="dark h-screen bg-black">
      <MidProgress />
    </div>
  );
}

// Export all stories
export default {
  InitialState,
  MidProgress,
  Completed,
  ErrorState,
  SingleTask,
  ManyCheckpoints,
  IdleState,
  LongRunningTask,
  MultipleErrors,
  DarkMode,
};
