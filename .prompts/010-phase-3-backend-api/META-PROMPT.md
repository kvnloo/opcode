# Phase 3: Backend API Integration - Meta Prompt

## Context
Building a Tauri 2 mobile application with React/TypeScript frontend. Phase 1 completed tool pane navigation, Phase 2 created 5 new panes with mock data. Now Phase 3 connects these panes to real backend APIs.

## Current State (Phase 2 Complete)
- 1845 tests passing
- 5 new panes created: AssistantPane, DatabasePane, GitPane, ShellPane, UserSettingsPane
- All panes use mock/static data
- Tool pane navigation working with registry pattern

## Existing API Infrastructure
- `src/lib/api.ts` - Comprehensive Tauri invoke wrapper with 50+ API methods
- `src/stores/workspaceStore.ts` - Zustand state management with Tauri integration
- `@tauri-apps/api/core` - invoke() for calling Rust backend
- `@tauri-apps/api/event` - listen() for real-time events
- `src/hooks/useApiCall.ts` - API call hook with loading/error states

## Phase 3 Objectives
Connect Phase 2 panes to real backend APIs, replacing mock data with actual Tauri invocations.

---

## Agent Work Distribution (6 Parallel Agents)

### Agent 1: AssistantPane API Integration
**Files to modify:**
- `src/components/mobile/workspace/panes/AssistantPane.tsx`
- `tests/mobile/workspace/panes/AssistantPane.test.tsx`

**Tasks:**
1. Replace mock AI response with actual Claude API integration
2. Use `api.executeClaudeCode()` or `api.continueClaudeCode()` for AI responses
3. Subscribe to `claude-output` events for streaming responses
4. Add proper loading states and error handling
5. Update tests to mock Tauri invoke/listen

**API Functions to use:**
```typescript
import { api } from '@/lib/api';
import { listen } from '@tauri-apps/api/event';

// Execute Claude Code
await api.executeClaudeCode(projectPath, prompt, model);

// Listen for streaming output
await listen('claude-output', (event) => {
  const { content } = event.payload;
  // Append to messages
});

// Listen for completion
await listen('claude-session-completed', (event) => {
  setIsLoading(false);
});
```

**Test mocking pattern:**
```typescript
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue('mock response'),
}));
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockImplementation((event, handler) => {
    // Simulate event callbacks
    return () => {}; // unlisten function
  }),
}));
```

---

### Agent 2: DatabasePane API Integration
**Files to modify:**
- `src/components/mobile/workspace/panes/DatabasePane.tsx`
- `tests/mobile/workspace/panes/DatabasePane.test.tsx`

**Tasks:**
1. Replace mock tables list with `api.storageListTables()`
2. Replace mock table schema with `api.storageReadTable()`
3. Replace mock query execution with `api.storageExecuteSql()`
4. Add proper loading states for each operation
5. Handle errors gracefully (table not found, SQL errors)
6. Update tests with proper mocks

**API Functions to use:**
```typescript
import { api } from '@/lib/api';

// List all tables
const tables = await api.storageListTables();

// Read table data with pagination
const tableData = await api.storageReadTable(tableName, page, pageSize, searchQuery);

// Execute raw SQL
const queryResult = await api.storageExecuteSql(sqlQuery);

// Insert/Update/Delete rows
await api.storageInsertRow(tableName, values);
await api.storageUpdateRow(tableName, primaryKeyValues, updates);
await api.storageDeleteRow(tableName, primaryKeyValues);
```

**State structure:**
```typescript
interface DatabaseState {
  tables: TableInfo[];
  selectedTable: string | null;
  tableData: any[];
  schema: ColumnInfo[];
  queryResult: any[] | null;
  isLoading: boolean;
  error: string | null;
}
```

---

### Agent 3: GitPane API Integration
**Files to modify:**
- `src/components/mobile/workspace/panes/GitPane.tsx`
- `tests/mobile/workspace/panes/GitPane.test.tsx`
- May need new Tauri commands in backend

**Tasks:**
1. Create git service layer for git operations
2. Implement git status using Tauri invoke
3. Implement branch listing and switching
4. Implement staging/unstaging files
5. Implement commit functionality
6. Implement pull/push operations
7. Update tests with mocks

**Service layer to create:**
```typescript
// src/lib/mobile/git.ts
import { invoke } from '@tauri-apps/api/core';

export interface GitStatus {
  branch: string;
  staged: GitFile[];
  unstaged: GitFile[];
  untracked: GitFile[];
}

export interface GitFile {
  path: string;
  status: 'M' | 'A' | 'D' | '?' | 'R';
}

export const gitService = {
  async getStatus(projectPath: string): Promise<GitStatus> {
    // Check if command exists, fallback to mock for web/dev
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return invoke('git_status', { projectPath });
    }
    return mockGitStatus;
  },

  async getBranches(projectPath: string): Promise<string[]> {
    return invoke('git_branches', { projectPath });
  },

  async checkout(projectPath: string, branch: string): Promise<void> {
    return invoke('git_checkout', { projectPath, branch });
  },

  async stage(projectPath: string, files: string[]): Promise<void> {
    return invoke('git_stage', { projectPath, files });
  },

  async unstage(projectPath: string, files: string[]): Promise<void> {
    return invoke('git_unstage', { projectPath, files });
  },

  async commit(projectPath: string, message: string): Promise<void> {
    return invoke('git_commit', { projectPath, message });
  },

  async pull(projectPath: string): Promise<void> {
    return invoke('git_pull', { projectPath });
  },

  async push(projectPath: string): Promise<void> {
    return invoke('git_push', { projectPath });
  },
};
```

**Note:** If Tauri commands don't exist, implement mock fallback and document required backend commands.

---

### Agent 4: ShellPane API Integration
**Files to modify:**
- `src/components/mobile/workspace/panes/ShellPane.tsx`
- `tests/mobile/workspace/panes/ShellPane.test.tsx`

**Tasks:**
1. Connect to `execute_terminal_command` Tauri invoke (already used in ConsolePane)
2. Reference implementation in `src/components/mobile/workspace/panes/ConsolePane.tsx`
3. Handle command execution with proper loading states
4. Support command history
5. Stream output for long-running commands
6. Update tests with proper mocks

**API Functions (from ConsolePane pattern):**
```typescript
import { invoke } from '@tauri-apps/api/core';

// Execute command in project context
if (typeof window !== 'undefined' && (window as any).__TAURI__) {
  const result = await invoke<string>('execute_terminal_command', {
    command,
    cwd: projectPath,
    projectId,
  });
  addLine(result, 'output');
} else {
  // Fallback for web/development
  addLine(`[Mock] Would execute in ${projectPath}: ${command}`, 'output');
}
```

**Enhancements over ShellPane mock:**
- Real command execution
- Working directory support
- Environment variable pass-through
- Command timeout handling
- Error output capturing

---

### Agent 5: UserSettingsPane API Integration
**Files to modify:**
- `src/components/mobile/workspace/panes/UserSettingsPane.tsx`
- `tests/mobile/workspace/panes/UserSettingsPane.test.tsx`

**Tasks:**
1. Connect to `api.getClaudeSettings()` for loading settings
2. Connect to `api.saveClaudeSettings()` for saving changes
3. Connect to `api.getSetting()` / `api.saveSetting()` for app settings
4. Persist theme preference using app_settings table
5. Load initial settings on mount
6. Auto-save settings on change
7. Update tests with proper mocks

**API Functions to use:**
```typescript
import { api } from '@/lib/api';

// Load Claude settings
const settings = await api.getClaudeSettings();

// Save Claude settings
await api.saveClaudeSettings(updatedSettings);

// App-specific settings (theme, font size, etc.)
const theme = await api.getSetting('theme');
await api.saveSetting('theme', 'dark');
await api.saveSetting('fontSize', '14');
await api.saveSetting('tabSize', '2');
await api.saveSetting('lineWrapping', 'true');
await api.saveSetting('autoSave', 'true');
```

**Settings state structure:**
```typescript
interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  lineWrapping: boolean;
  autoSave: boolean;
  // Claude-specific settings from getClaudeSettings
  claudeSettings: Record<string, any>;
}
```

---

### Agent 6: API Service Hooks & Error Handling
**Files to create/modify:**
- `src/hooks/mobile/useGitStatus.ts` (new)
- `src/hooks/mobile/useDatabaseQuery.ts` (new)
- `src/hooks/mobile/useSettings.ts` (new)
- `src/lib/mobile/apiErrorHandler.ts` (new)
- Update `src/hooks/mobile/index.ts`
- Create tests for new hooks

**Tasks:**
1. Create custom hooks for each pane's data fetching
2. Implement consistent error handling pattern
3. Add retry logic for transient failures
4. Create loading state helpers
5. Add TypeScript types for all API responses
6. Implement offline/fallback handling

**useGitStatus hook:**
```typescript
// src/hooks/mobile/useGitStatus.ts
import { useState, useEffect, useCallback } from 'react';
import { gitService, GitStatus } from '@/lib/mobile/git';

export function useGitStatus(projectPath: string) {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gitService.getStatus(projectPath);
      setStatus(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [projectPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, isLoading, error, refresh };
}
```

**useDatabaseQuery hook:**
```typescript
// src/hooks/mobile/useDatabaseQuery.ts
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export function useDatabaseQuery() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.storageExecuteSql(query);
      setResult(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { result, isLoading, error, execute };
}
```

**Error handler utility:**
```typescript
// src/lib/mobile/apiErrorHandler.ts
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export function isCommandNotFoundError(error: unknown): boolean {
  const errorStr = String(error);
  return errorStr.includes('Command') && errorStr.includes('not found');
}

export function handleApiError(error: unknown): ApiError {
  if (isCommandNotFoundError(error)) {
    return {
      code: 'COMMAND_NOT_FOUND',
      message: 'This feature is not available on this platform',
    };
  }

  if (error instanceof Error) {
    return {
      code: 'API_ERROR',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  };
}
```

---

## Testing Guidelines

### Mock Setup Pattern
```typescript
// tests/setup/tauriMocks.ts
import { vi } from 'vitest';

export function setupTauriMocks() {
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn(),
  }));

  vi.mock('@tauri-apps/api/event', () => ({
    listen: vi.fn().mockResolvedValue(() => {}),
  }));
}

export function mockInvokeResponse(command: string, response: any) {
  const { invoke } = require('@tauri-apps/api/core');
  invoke.mockImplementation((cmd: string) => {
    if (cmd === command) return Promise.resolve(response);
    return Promise.reject(new Error(`Unknown command: ${cmd}`));
  });
}
```

### Test structure
```typescript
describe('PaneWithAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupTauriMocks();
  });

  describe('Loading State', () => {
    it('shows loading indicator while fetching data', async () => {
      // Arrange - delay mock response
      mockInvokeResponse('api_command', new Promise(resolve =>
        setTimeout(() => resolve(mockData), 100)
      ));

      // Act
      render(<Pane />);

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when API fails', async () => {
      // Arrange
      vi.mocked(invoke).mockRejectedValue(new Error('API Error'));

      // Act
      render(<Pane />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('displays data when API succeeds', async () => {
      // Arrange
      mockInvokeResponse('api_command', mockData);

      // Act
      render(<Pane />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });
  });
});
```

---

## Acceptance Criteria

### Per Agent:
- [ ] All existing tests still pass
- [ ] New API integration tests pass
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Fallback for web/dev environment works
- [ ] TypeScript types are complete
- [ ] No console errors in browser

### Overall Phase 3:
- [ ] All 6 agents' work integrates cleanly
- [ ] Full test suite passes (npm run test:mobile)
- [ ] Components work in both Tauri and web environments
- [ ] Consistent error handling across all panes
- [ ] Performance is acceptable (no visible lag)

---

## Files Summary

### Created by Agents:
- `src/lib/mobile/git.ts` - Git service layer
- `src/lib/mobile/apiErrorHandler.ts` - Error handling utilities
- `src/hooks/mobile/useGitStatus.ts` - Git status hook
- `src/hooks/mobile/useDatabaseQuery.ts` - Database query hook
- `src/hooks/mobile/useSettings.ts` - Settings hook

### Modified by Agents:
- `src/components/mobile/workspace/panes/AssistantPane.tsx`
- `src/components/mobile/workspace/panes/DatabasePane.tsx`
- `src/components/mobile/workspace/panes/GitPane.tsx`
- `src/components/mobile/workspace/panes/ShellPane.tsx`
- `src/components/mobile/workspace/panes/UserSettingsPane.tsx`
- `src/hooks/mobile/index.ts`
- All corresponding test files

---

## Command to Run
```bash
npm run test:mobile -- --run
```

Expected: All tests pass, including new API integration tests.
