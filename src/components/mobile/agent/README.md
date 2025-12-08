# Agent Execution Components

Mobile-optimized React components for displaying agent execution progress and managing code changes in the Opcode mobile app.

## Components

### AgentExecutionView

Full-screen view displaying agent execution with real-time progress tracking.

**Features:**
- Agent status header with avatar and status badge
- Task description area
- Scrollable task progress list
- Action buttons (Rollback, Changes, Preview)
- Cancel/Stop functionality
- Smooth transitions with Framer Motion

**Usage:**
```tsx
import { AgentExecutionView } from '@/components/mobile/agent';

function MyComponent() {
  const execution = {
    agentId: 'agent-1',
    agentName: 'React Developer',
    taskDescription: 'Build landing page',
    status: 'running',
    tasks: [...],
    currentTaskIndex: 0,
    changedFiles: [...]
  };

  return (
    <AgentExecutionView
      execution={execution}
      onCancel={() => console.log('Cancelled')}
      onRollback={() => console.log('Rollback')}
      onViewChanges={() => console.log('View changes')}
      onPreview={() => console.log('Preview')}
    />
  );
}
```

### TaskProgress

Displays a list of tasks with animated status indicators and expandable details.

**Features:**
- Animated checkmarks for completed tasks
- Loading spinners for in-progress tasks
- Error states with retry option
- Expandable task details
- Task timing display

**Usage:**
```tsx
import { TaskProgress } from '@/components/mobile/agent';

const tasks = [
  {
    id: 'task-1',
    description: 'Analyzing requirements',
    status: 'completed',
    startTime: Date.now() - 5000,
    endTime: Date.now()
  },
  {
    id: 'task-2',
    description: 'Creating files',
    status: 'in_progress',
    startTime: Date.now()
  }
];

<TaskProgress tasks={tasks} currentTaskIndex={1} />
```

### ActionBar

Bottom action bar with primary agent execution controls.

**Features:**
- Rollback button (undo changes)
- View Changes button (open diff viewer)
- Preview button (live preview)
- Haptic feedback on tap
- Disabled states based on execution status

**Usage:**
```tsx
import { ActionBar } from '@/components/mobile/agent';

<ActionBar
  onRollback={() => {}}
  onViewChanges={() => {}}
  onPreview={() => {}}
  status="completed"
  hasChanges={true}
/>
```

### FileDiffViewer

Modal component for viewing file changes with syntax highlighting.

**Features:**
- Split or unified diff view
- Syntax highlighting with Prism
- Line numbers
- Swipe gesture to navigate between files
- Accept/Reject changes
- Mobile-optimized interface

**Usage:**
```tsx
import { FileDiffViewer } from '@/components/mobile/agent';

const files = [
  {
    path: 'src/App.tsx',
    oldContent: 'const App = () => {...}',
    newContent: 'const App = () => {...}',
    language: 'typescript'
  }
];

<FileDiffViewer
  files={files}
  selectedIndex={0}
  onSelectFile={(index) => console.log(index)}
  onClose={() => console.log('Close')}
  onAcceptChange={(index) => console.log('Accept', index)}
  onRejectChange={(index) => console.log('Reject', index)}
/>
```

### PreviewWebView

Live preview component with device frame selection and console viewer.

**Features:**
- WebView container for app preview
- URL bar with navigation
- Device frame selector (iPhone, Android, Tablet, Desktop)
- Console log viewer
- Screenshot functionality
- Refresh and external link support

**Usage:**
```tsx
import { PreviewWebView } from '@/components/mobile/preview';

<PreviewWebView
  url="http://localhost:3000"
  onClose={() => console.log('Close preview')}
/>
```

## Types

### AgentExecutionState

```typescript
interface AgentExecutionState {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  taskDescription: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
  tasks: AgentTask[];
  currentTaskIndex: number;
  changedFiles?: Array<{
    path: string;
    oldContent: string;
    newContent: string;
    language: string;
  }>;
}
```

### AgentTask

```typescript
interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: string;
  details?: string;
}
```

## Demo

See `AgentExecutionDemo.tsx` for a complete working example that simulates agent execution with realistic timing and state management.

## Styling

All components use:
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI for accessible primitives
- Mobile-first responsive design
- Dark mode support

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatible
- Reduced motion support (respects prefers-reduced-motion)

## Mobile Optimizations

- Touch-optimized tap targets (44x44px minimum)
- Swipe gestures for navigation
- Haptic feedback on interactions
- Safe area insets for notched devices
- Optimized for one-handed use
