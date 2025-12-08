# AgentPane Quick Start Guide

## Import

```tsx
import { AgentPane } from '@/components/mobile/workspace/panes';
```

## Minimal Example

```tsx
const tasks = [
  { id: '1', description: 'Setup project', status: 'completed' },
  { id: '2', description: 'Write code', status: 'in_progress', startTime: Date.now() },
  { id: '3', description: 'Run tests', status: 'pending' },
];

<AgentPane
  tasks={tasks}
  currentTask={tasks[1]}
  agentStatus="running"
/>
```

## With All Features

```tsx
const tasks = [...]; // Your tasks
const checkpoints = [
  {
    id: 'cp-1',
    timestamp: Date.now() - 180000,
    summary: 'Completed auth setup',
    filesChanged: ['src/auth.ts'],
  },
];

<AgentPane
  tasks={tasks}
  currentTask={currentTask}
  agentStatus="running"
  checkpoints={checkpoints}
  workDuration={3}
  error={errorMessage} // If any
  onRollback={(id) => rollbackToCheckpoint(id)}
  onViewChanges={() => openDiffViewer()}
  onViewPreview={() => openPreview()}
  onOpenTool={(tool) => navigateToTool(tool)}
/>
```

## Task Statuses

- `pending` - Not started (gray, hollow circle)
- `in_progress` - Currently running (blue, spinner)
- `completed` - Finished (green, checkmark)
- `error` - Failed (red, alert icon)

## Agent Statuses

- `idle` - Not running
- `running` - Actively executing (shows spinner)
- `error` - Failed (shows error banner)
- `complete` - All tasks done

## Event Handlers

| Handler | When Called | Typical Action |
|---------|-------------|----------------|
| `onRollback(id)` | Rollback button clicked | Restore project to checkpoint |
| `onViewChanges()` | Changes button clicked | Open diff viewer |
| `onViewPreview()` | Preview button clicked | Open preview pane |
| `onOpenTool(toolId)` | Quick tool button clicked | Navigate to tool |

## Quick Tools IDs

- `secrets` - Secrets manager
- `database` - Database viewer
- `auth` - Authentication settings
- `new-tab` - Create new tab

## Styling

Component supports all Tailwind classes via `className` prop:

```tsx
<AgentPane className="bg-slate-900" {...props} />
```

## Dark Mode

Automatically adapts to dark mode when parent has `dark` class.

## Running the Demo

```tsx
import { AgentPaneDemo } from './AgentPaneDemo';

<AgentPaneDemo />
```

## Viewing All States

```tsx
import Stories from './AgentPane.stories';

// Then use any story:
<Stories.MidProgress />
<Stories.ErrorState />
<Stories.Completed />
// etc.
```

## Common Patterns

### Auto-updating tasks

```tsx
const [tasks, setTasks] = useState(initialTasks);

useEffect(() => {
  const unsubscribe = agentStore.subscribe((state) => {
    setTasks(state.tasks);
  });
  return unsubscribe;
}, []);
```

### Handling errors

```tsx
const [error, setError] = useState<string>();

useEffect(() => {
  if (agentStatus === 'error') {
    setError('Agent encountered an error...');
  }
}, [agentStatus]);
```

### Time-based duration

```tsx
const [duration, setDuration] = useState(0);

useEffect(() => {
  if (agentStatus !== 'running') return;
  
  const interval = setInterval(() => {
    setDuration(d => d + 1);
  }, 60000); // Every minute
  
  return () => clearInterval(interval);
}, [agentStatus]);
```

## TypeScript

Full type definitions in `AgentPane.tsx`:
- `Task`
- `Checkpoint`
- `AgentStatus`
- `AgentPaneProps`

## Accessibility

- All buttons have haptic feedback
- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader friendly
- 44x44px touch targets

## Performance

- Handles 100+ tasks smoothly
- GPU-accelerated animations
- Minimal re-renders
- Optimized scroll performance
