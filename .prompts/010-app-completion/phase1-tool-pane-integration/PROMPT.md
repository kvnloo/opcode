# Phase 1: Tool Pane Navigation Integration

## Objective
Connect ToolsOverlay to render the 9 existing tool pane components, enabling users to access all tools from the workspace.

## Current State
- ToolsOverlay lists 19 tools but `onToolSelect(toolId)` does nothing
- 9 tool pane components exist but are NOT accessible from UI
- WorkspaceScreen only renders 5 toolbar panes (console, agent, deploy, share, preview)

## Target State
- ToolsOverlay selection opens corresponding pane component
- All 9 tool panes accessible via ToolsOverlay
- Back navigation from tool panes to main workspace
- Proper state management for active tool pane

## Files to Modify

### Agent 1: WorkspaceScreen State Management
**File**: `src/screens/mobile/WorkspaceScreen.tsx`
- Expand `WorkspacePane` type to include tool pane IDs
- Add `activeToolPane` state for tool panes
- Create `renderToolPane()` function to render tool pane components
- Handle tool selection from ToolsOverlay callback

### Agent 2: ToolsOverlay Navigation
**File**: `src/components/mobile/workspace/ToolsOverlay.tsx`
- Wire up `onToolSelect` to actually navigate to panes
- Pass tool selection callback from parent
- Add visual feedback for selected tool
- Ensure overlay closes after selection

### Agent 3: Workspace Store Extension
**File**: `src/stores/workspaceStore.ts`
- Add `activeToolPane` state (string | null)
- Add `setActiveToolPane(paneId: string | null)` action
- Add `closeToolPane()` action to return to main workspace
- Ensure tool pane state persists correctly

### Agent 4: Tool Pane Container Components
**Files**:
- `src/components/mobile/workspace/panes/AppStoragePane.tsx`
- `src/components/mobile/workspace/panes/AuthUsersPane.tsx`
- `src/components/mobile/workspace/panes/DevToolsPane.tsx`
- `src/components/mobile/workspace/panes/IntegrationsPane.tsx`
- `src/components/mobile/workspace/panes/KeyValueStorePane.tsx`
- `src/components/mobile/workspace/panes/MultiplayerPane.tsx`
- `src/components/mobile/workspace/panes/SecretsPane.tsx`
- `src/components/mobile/workspace/panes/SecurityScannerPane.tsx`
- `src/components/mobile/workspace/panes/WorkflowsPane.tsx`

Ensure each pane:
- Has consistent header with back button
- Accepts `projectId` prop
- Has `onBack` callback for navigation
- Follows mobile design patterns

### Agent 5: Navigation Type Definitions
**File**: `src/types/workspace.ts` (create if needed)
- Define `ToolPaneId` type for all tool panes
- Define `WorkspacePaneId` type for toolbar panes
- Export navigation-related types
- Ensure type safety across components

### Agent 6: Integration Tests
**Files**:
- `tests/mobile/workspace/ToolsOverlay.test.tsx` (update)
- `tests/mobile/workspace/WorkspaceScreen.test.tsx` (update)
- `tests/mobile/workspace/toolPaneNavigation.test.tsx` (create)

Test:
- Tool selection navigates to correct pane
- Back navigation returns to workspace
- Tool pane renders with project context
- Multiple tool panes can be accessed sequentially

## Tool ID to Component Mapping

```typescript
const TOOL_PANE_MAP: Record<string, React.ComponentType<ToolPaneProps>> = {
  'storage': AppStoragePane,
  'auth': AuthUsersPane,
  'devtools': DevToolsPane,
  'integrations': IntegrationsPane,
  'keyvalue': KeyValueStorePane,
  'multiplayer': MultiplayerPane,
  'secrets': SecretsPane,
  'security': SecurityScannerPane,
  'workflows': WorkflowsPane,
};
```

## Success Criteria
- [ ] All 9 tool panes accessible from ToolsOverlay
- [ ] Back navigation works from each tool pane
- [ ] Tool selection updates store state correctly
- [ ] All existing tests pass
- [ ] New integration tests pass
- [ ] No TypeScript errors
