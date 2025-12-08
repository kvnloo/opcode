# Quick Start Guide - Agent Execution Components

## Installation

Components are already integrated into the Opcode mobile app. No additional installation needed.

## Basic Usage

### 1. Import Components

```tsx
import {
  AgentExecutionView,
  type AgentExecutionState,
  type AgentTask
} from '@/components/mobile/agent';

import { PreviewWebView } from '@/components/mobile/preview';
```

### 2. Create Execution State

```tsx
const [execution, setExecution] = useState<AgentExecutionState>({
  agentId: 'agent-123',
  agentName: 'React Developer',
  agentAvatar: '/avatars/react-dev.png', // Optional
  taskDescription: 'Build a responsive dashboard',
  status: 'running',
  tasks: [
    {
      id: '1',
      description: 'Analyzing requirements',
      status: 'completed',
      startTime: Date.now() - 5000,
      endTime: Date.now() - 3000
    },
    {
      id: '2',
      description: 'Creating components',
      status: 'in_progress',
      startTime: Date.now() - 2000
    },
    {
      id: '3',
      description: 'Adding tests',
      status: 'pending'
    }
  ],
  currentTaskIndex: 1,
  changedFiles: [
    {
      path: 'src/Dashboard.tsx',
      oldContent: '// Old code',
      newContent: '// New code',
      language: 'typescript'
    }
  ]
});
```

### 3. Render Component

```tsx
<AgentExecutionView
  execution={execution}
  onCancel={() => {
    // Stop the agent execution
    setExecution(prev => ({ ...prev, status: 'cancelled' }));
  }}
  onRollback={() => {
    // Revert all changes
    console.log('Rolling back changes...');
  }}
  onViewChanges={() => {
    // Opens FileDiffViewer automatically
    console.log('Viewing changes...');
  }}
  onPreview={() => {
    // Show preview (you can use PreviewWebView)
    setShowPreview(true);
  }}
/>
```

## Common Patterns

### Update Task Progress

```tsx
// Mark task as completed
setExecution(prev => {
  const updatedTasks = [...prev.tasks];
  updatedTasks[currentIndex] = {
    ...updatedTasks[currentIndex],
    status: 'completed',
    endTime: Date.now()
  };
  return { ...prev, tasks: updatedTasks };
});
```

### Handle Errors

```tsx
// Mark task as failed
setExecution(prev => {
  const updatedTasks = [...prev.tasks];
  updatedTasks[currentIndex] = {
    ...updatedTasks[currentIndex],
    status: 'error',
    error: 'Failed to create component: File already exists',
    endTime: Date.now()
  };
  return { ...prev, tasks: updatedTasks, status: 'error' };
});
```

### Show Preview

```tsx
const [showPreview, setShowPreview] = useState(false);

// In your component
{showPreview && (
  <PreviewWebView
    url="http://localhost:3000"
    onClose={() => setShowPreview(false)}
  />
)}
```

## Complete Example

```tsx
import React, { useState, useEffect } from 'react';
import { AgentExecutionView } from '@/components/mobile/agent';
import { PreviewWebView } from '@/components/mobile/preview';

export function MyAgentView() {
  const [execution, setExecution] = useState({
    agentId: 'my-agent',
    agentName: 'Full Stack Developer',
    taskDescription: 'Create a blog application',
    status: 'running',
    tasks: [],
    currentTaskIndex: 0,
    changedFiles: []
  });
  const [showPreview, setShowPreview] = useState(false);

  // Simulate task execution
  useEffect(() => {
    // Your agent execution logic here
    // Update execution state as tasks complete
  }, []);

  return (
    <>
      <AgentExecutionView
        execution={execution}
        onCancel={() => setExecution(prev => ({ ...prev, status: 'cancelled' }))}
        onRollback={() => console.log('Rollback')}
        onViewChanges={() => console.log('View changes')}
        onPreview={() => setShowPreview(true)}
      />

      {showPreview && (
        <PreviewWebView
          url="http://localhost:3000"
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
```

## Tips

1. **Real-time Updates**: Update execution state frequently for smooth progress display
2. **Task Details**: Add `details` field to tasks for expandable information
3. **Error Handling**: Always set `error` field when status is 'error'
4. **Timing**: Track `startTime` and `endTime` for accurate duration display
5. **Haptic Feedback**: Already implemented in ActionBar buttons
6. **File Changes**: Provide syntax-highlighted diffs by setting correct `language` field

## Troubleshooting

**Tasks not showing?**
- Ensure tasks array is not empty
- Check that tasks have unique `id` fields

**Animations not working?**
- Verify Framer Motion is installed
- Check for CSS conflicts

**Diff viewer not opening?**
- Ensure `changedFiles` array has valid entries
- Verify FileDiffViewer is rendered conditionally

**Preview not loading?**
- Check URL is valid and accessible
- Verify iframe sandbox permissions

## Demo

Run the included demo for a working example:

```tsx
import { AgentExecutionDemo } from '@/components/mobile/agent';

function App() {
  return <AgentExecutionDemo />;
}
```

The demo will simulate a complete agent execution with realistic timing.
