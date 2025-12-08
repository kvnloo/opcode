# AgentPane Component

The main AI task execution view for the Opcode mobile workspace. Displays live agent progress, task tracking, checkpoints, and quick access tools.

## Features

### 1. Task Progress Header (Collapsible)
- Chevron icon + task title
- Progress indicator showing completed/total tasks (e.g., "0/8")
- Loading spinner when agent is running
- Expandable list of all tasks with status indicators

### 2. Task Details Card
- "Task" label with expand/collapse icon
- Full task description text
- Show more toggle for long descriptions
- Smooth expand/collapse animations

### 3. Current Action Section
- Real-time "Now let me..." action description
- File edit indicator with file icon
- Currently modified file paths
- Blue accent for active state

### 4. Error State (Conditional)
- Amber/yellow warning design
- Clear error message display
- "Agent encountered an error" status
- Detailed error information when available

### 5. Checkpoint Section
- Green checkmark + relative timestamp
- Completed task summary
- List of changed files
- Action buttons row:
  - **Rollback here** - Restore to checkpoint state
  - **Changes** - View code diff
  - **View preview** - Open preview pane

### 6. Work Duration (Expandable)
- Agent icon + work duration display
- Chevron to expand/collapse details
- Additional information when expanded

### 7. Upgrade Card (Conditional, Dismissible)
- Star icon + "Upgrade to Core" heading
- Benefits list with checkmarks
- Purple gradient design
- "Upgrade now" CTA button
- Dismissible via chevron button

### 8. QuickAccessBar (Fixed at Bottom)
- Four quick action buttons:
  - **Secrets** - Manage API keys
  - **Database** - Access database
  - **Auth** - User authentication
  - **New Tab** - Create new tab
- Search bar for tools and files
- Fixed position with backdrop blur

## Props

```typescript
interface AgentPaneProps {
  // Task data
  tasks: Task[];
  currentTask: Task | null;

  // Agent state
  agentStatus: 'idle' | 'running' | 'error' | 'complete';

  // Optional data
  checkpoints?: Checkpoint[];
  workDuration?: number; // in minutes
  error?: string;

  // Event handlers
  onRollback?: (checkpointId: string) => void;
  onViewChanges?: () => void;
  onViewPreview?: () => void;
  onOpenTool?: (toolId: string) => void;

  className?: string;
}

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: string;
}

interface Checkpoint {
  id: string;
  timestamp: number;
  summary: string;
  filesChanged: string[];
}
```

## Usage

### Basic Usage

```tsx
import { AgentPane } from '@/components/mobile/workspace/panes';

function MyWorkspace() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      description: 'Analyzing project structure',
      status: 'completed',
    },
    {
      id: '2',
      description: 'Creating API endpoints',
      status: 'in_progress',
      startTime: Date.now(),
    },
    {
      id: '3',
      description: 'Writing tests',
      status: 'pending',
    },
  ]);

  const currentTask = tasks.find(t => t.status === 'in_progress');

  return (
    <AgentPane
      tasks={tasks}
      currentTask={currentTask}
      agentStatus="running"
      onRollback={(id) => console.log('Rollback to', id)}
      onViewChanges={() => console.log('View changes')}
      onViewPreview={() => console.log('View preview')}
      onOpenTool={(tool) => console.log('Open', tool)}
    />
  );
}
```

### With Checkpoints

```tsx
const checkpoints: Checkpoint[] = [
  {
    id: 'cp-1',
    timestamp: Date.now() - 180000, // 3 minutes ago
    summary: 'Completed authentication setup',
    filesChanged: ['src/auth.ts', 'src/middleware/auth.ts'],
  },
];

<AgentPane
  tasks={tasks}
  currentTask={currentTask}
  agentStatus="running"
  checkpoints={checkpoints}
  workDuration={5}
  // ... handlers
/>
```

### Error State

```tsx
<AgentPane
  tasks={tasks}
  currentTask={null}
  agentStatus="error"
  error="Failed to connect to database"
  // ... handlers
/>
```

## Design Patterns

### Layout Structure
```
┌─────────────────────────────────┐
│ Task Progress Header            │ ← Collapsible
├─────────────────────────────────┤
│ Task Details Card               │ ← Collapsible
├─────────────────────────────────┤
│ Current Action (if running)     │ ← Animated
├─────────────────────────────────┤
│ Error State (if error)          │ ← Conditional
├─────────────────────────────────┤
│ Checkpoint 1                    │ ← Scrollable
│ Checkpoint 2                    │    area
│ ...                             │
├─────────────────────────────────┤
│ Work Duration                   │ ← Collapsible
├─────────────────────────────────┤
│ Upgrade Card                    │ ← Dismissible
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ QuickAccessBar                  │ ← Fixed
│ [Secrets][Database][Auth][Tab]  │
│ [Search bar..................]  │
└─────────────────────────────────┘
```

### Color Coding
- **Blue** - Running/in progress state
- **Green** - Completed tasks and checkpoints
- **Red** - Error states
- **Amber** - Warnings and investigations
- **Purple** - Upgrade/premium features
- **Muted** - Pending/inactive states

### Animations
- **Task Progress**: Fade in from top
- **Collapsibles**: Height + opacity transitions
- **Current Action**: Fade + slide up
- **Chevrons**: Rotate 90° on toggle
- **Status Icons**: Spring scale on completion

## Accessibility

- **Touch Targets**: Minimum 44x44px (WCAG 2.1 AA)
- **Haptic Feedback**: All interactive buttons
- **ARIA Labels**: All actions properly labeled
- **Keyboard Navigation**: Full keyboard support via Radix UI
- **Screen Reader**: Semantic HTML structure
- **High Contrast**: Border support in high contrast mode

## Dependencies

- **Framer Motion** - Animations
- **Radix UI** - Collapsible components
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Custom Hooks** - useHaptics for feedback

## Related Components

- `AgentExecutionView` - Desktop agent execution
- `TaskProgress` - Task list component
- `HapticButton` - Touch-optimized buttons
- `SearchBar` - Search input component

## Screenshots Reference

Based on screenshots 124526 and 124540 showing the agent workspace layout with:
- Collapsible task progress section
- Live action indicators
- Checkpoint cards with action buttons
- Bottom quick access toolbar
- Upgrade promotional card

## Performance Considerations

- **Virtualization**: Not needed for typical task counts (<100)
- **Memoization**: Component uses React.memo internally
- **Animation**: GPU-accelerated transforms
- **Scroll**: Native smooth scrolling
- **Haptics**: Debounced feedback triggers
