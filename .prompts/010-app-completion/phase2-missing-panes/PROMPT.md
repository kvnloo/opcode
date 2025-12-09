# Phase 2: Missing Panes Creation

## Objective
Create the 5 missing tool pane components to achieve 100% pane coverage.

## Current State
- 9/14 tool panes exist and integrated via Phase 1
- 5 panes referenced in ToolsOverlay but NOT created
- toolPaneRegistry has 9 registered panes

## Missing Panes (5 total)

| Tool ID | Component | Screenshot Reference | Description |
|---------|-----------|---------------------|-------------|
| `assistant` | AssistantPane.tsx | replit-assistant-chat-pane.png | AI chat interface with message history |
| `shell` | ShellPane.tsx | replit-shell-terminal-pane.png | Interactive shell/terminal |
| `settings` | UserSettingsPane.tsx | replit-user-settings-pane.png | User preferences and editor settings |
| `git` | GitPane.tsx | - | Git operations (commit, push, branches) |
| `database` | DatabasePane.tsx | - | Database management interface |

## Files to Create/Modify

### Agent 1: AssistantPane Component
**Create**: `src/components/mobile/workspace/panes/AssistantPane.tsx`
- Chat interface with message bubbles (user/assistant)
- Input field with send button
- Message history display with timestamps
- Loading indicator for AI responses
- Clear conversation button
- Props: `projectId: string`, `onBack: () => void`, `className?: string`

Reference existing `AgentPane.tsx` for streaming patterns.

### Agent 2: ShellPane Component
**Create**: `src/components/mobile/workspace/panes/ShellPane.tsx`
- Terminal-like interface with monospace font
- Command input field at bottom
- Output display with scrolling
- Clear terminal button
- Basic command history (up arrow)
- Props: `projectId: string`, `onBack: () => void`, `className?: string`

Reference `ConsolePane.tsx` for terminal styling patterns.

### Agent 3: UserSettingsPane Component
**Create**: `src/components/mobile/workspace/panes/UserSettingsPane.tsx`
- Editor theme toggle (light/dark)
- Font size selection
- Tab size selection
- Line wrapping toggle
- Auto-save toggle
- Keyboard shortcuts reference
- Props: `projectId: string`, `onBack: () => void`, `className?: string`

Reference `AccountScreen.tsx` for settings patterns.

### Agent 4: GitPane Component
**Create**: `src/components/mobile/workspace/panes/GitPane.tsx`
- Current branch display
- Changed files list (staged/unstaged)
- Commit message input
- Commit button
- Push/pull buttons
- Branch selector dropdown
- Props: `projectId: string`, `onBack: () => void`, `className?: string`

### Agent 5: DatabasePane Component
**Create**: `src/components/mobile/workspace/panes/DatabasePane.tsx`
- Database connection status
- Tables list
- Table schema viewer
- Simple query input
- Query results display
- Props: `projectId: string`, `onBack: () => void`, `className?: string`

### Agent 6: Registry & Tests Update
**Modify**: `src/components/mobile/workspace/toolPaneRegistry.ts`
- Import all 5 new pane components
- Add to TOOL_PANE_REGISTRY

**Create**: `tests/mobile/workspace/panes/*.test.tsx`
- AssistantPane.test.tsx
- ShellPane.test.tsx
- UserSettingsPane.test.tsx
- GitPane.test.tsx
- DatabasePane.test.tsx

Each test should cover:
- Renders header with back button
- Shows main functionality
- Handles user interactions
- Accepts onBack callback

## Component Pattern

All panes should follow this pattern (from SecretsPane):

```tsx
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface XxxPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function XxxPane({ projectId, onBack, className }: XxxPaneProps) {
  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-lg font-semibold">Pane Title</h2>
      </header>
      <div className="flex-1 overflow-auto p-4">
        {/* Content here */}
      </div>
    </div>
  );
}

export default XxxPane;
```

## Icons to Use

Import from `lucide-react`:
- AssistantPane: `MessageSquare`, `Send`, `Trash2`
- ShellPane: `Terminal`, `Play`, `Trash2`
- UserSettingsPane: `Settings`, `Moon`, `Sun`, `Type`
- GitPane: `GitBranch`, `GitCommit`, `GitPullRequest`, `Upload`, `Download`
- DatabasePane: `Database`, `Table2`, `Play`, `RefreshCw`

## Updated Registry After Phase 2

```typescript
export const TOOL_PANE_REGISTRY: Record<string, ComponentType<ToolPaneProps>> = {
  // Existing (9)
  'storage': AppStoragePane,
  'auth': AuthUsersPane,
  'developer': DevToolsPane,
  'integrations': IntegrationsPane,
  'kv-store': KeyValueStorePane,
  'multiplayer': MultiplayerPane,
  'secrets': SecretsPane,
  'security': SecurityScannerPane,
  'workflows': WorkflowsPane,
  // New (5)
  'assistant': AssistantPane,
  'shell': ShellPane,
  'settings': UserSettingsPane,
  'git': GitPane,
  'database': DatabasePane,
};
```

## Success Criteria
- [ ] All 5 new pane components created
- [ ] All panes follow consistent pattern (header with back button)
- [ ] All panes registered in toolPaneRegistry
- [ ] All panes accessible via ToolsOverlay
- [ ] All tests pass (existing + new)
- [ ] No TypeScript errors
