# Pending Registry Update for New Tool Panes

## Status: WAITING FOR COMPONENT CREATION

This document tracks the pending update to `toolPaneRegistry.ts` after the 5 new pane components are created.

## Background

Test files have been created for 5 new tool pane components:
1. AssistantPane
2. ShellPane
3. UserSettingsPane
4. GitPane
5. DatabasePane

However, the actual component files need to be created by other agents before the registry can be updated.

## Required Component Files

The following files need to be created in `src/components/mobile/workspace/panes/`:

- [ ] `AssistantPane.tsx` - AI assistant chat interface
- [ ] `ShellPane.tsx` - Terminal/shell command interface
- [ ] `UserSettingsPane.tsx` - User preferences and settings
- [ ] `GitPane.tsx` - Git version control interface
- [ ] `DatabasePane.tsx` - Database query and management interface

## Registry Update Required

Once all 5 component files exist, update `src/components/mobile/workspace/toolPaneRegistry.ts`:

### Add Imports

```typescript
// Add these imports after the existing ones (line 11)
import { AssistantPane } from './panes/AssistantPane';
import { ShellPane } from './panes/ShellPane';
import { UserSettingsPane } from './panes/UserSettingsPane';
import { GitPane } from './panes/GitPane';
import { DatabasePane } from './panes/DatabasePane';
```

### Update Registry

```typescript
// Update TOOL_PANE_REGISTRY (starting at line 24)
export const TOOL_PANE_REGISTRY: Record<string, ComponentType<ToolPaneProps>> = {
  // Existing (9 panes)
  'storage': AppStoragePane,
  'auth': AuthUsersPane,
  'developer': DevToolsPane,
  'integrations': IntegrationsPane,
  'kv-store': KeyValueStorePane,
  'multiplayer': MultiplayerPane,
  'secrets': SecretsPane,
  'security': SecurityScannerPane,
  'workflows': WorkflowsPane,

  // New (5 panes) - ADD THESE
  'assistant': AssistantPane,
  'shell': ShellPane,
  'settings': UserSettingsPane,
  'git': GitPane,
  'database': DatabasePane,
};
```

## Test Files Created

All test files have been created and are ready:

- ✅ `tests/mobile/workspace/panes/AssistantPane.test.tsx`
- ✅ `tests/mobile/workspace/panes/ShellPane.test.tsx`
- ✅ `tests/mobile/workspace/panes/UserSettingsPane.test.tsx`
- ✅ `tests/mobile/workspace/panes/GitPane.test.tsx`
- ✅ `tests/mobile/workspace/panes/DatabasePane.test.tsx`

Each test file includes:
- Rendering tests (header, title, main UI elements)
- Back navigation tests
- Core functionality tests
- Accessibility tests
- User interaction tests

## Expected Props Interface

All pane components should accept these props (defined in `toolPaneRegistry.ts`):

```typescript
interface ToolPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}
```

## Verification Steps

After updating the registry:

1. Run type check: `npm run typecheck`
2. Run tests: `npm test -- panes/`
3. Verify all 14 panes are registered (9 existing + 5 new)
4. Test in WorkspaceScreen that panes route correctly

## Notes

- The test files use flexible selectors to accommodate different implementation approaches
- Tests include fallback queries to handle variations in component structure
- All tests follow the same pattern as existing pane tests (e.g., SharePane.test.tsx)
- Tests mock the `useHaptics` hook for mobile interactions

## When to Update

**DO NOT** update the registry until ALL 5 component files exist. The TypeScript compiler will fail if imports reference non-existent files.

Update this checklist as components are created:
- [ ] AssistantPane.tsx exists
- [ ] ShellPane.tsx exists
- [ ] UserSettingsPane.tsx exists
- [ ] GitPane.tsx exists
- [ ] DatabasePane.tsx exists
- [ ] All 5 exist - **READY TO UPDATE REGISTRY**

---

**Created:** 2025-12-08
**Status:** Waiting for component creation
**Test Files:** Complete and ready
