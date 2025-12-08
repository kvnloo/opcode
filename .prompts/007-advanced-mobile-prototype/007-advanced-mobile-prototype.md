# 007: Advanced Mobile Prototype - Integration & Pixel-Perfect Validation

## Overview

**Objective**: Continue development of the Opcode mobile companion app with focus on:
1. Pixel-perfect UI refinement matching Replit inspiration images
2. Real Claude Code integration testing (message streaming)
3. Git integration testing for repository access
4. Advanced mock testing and functionality validation
5. Test pass rate improvement from 72% → 95%+

**Duration**: 4-6 hours autonomous execution
**Agent Count**: 15 (sparc:orchestrator with adaptive topology)
**Memory**: Enabled with checkpoint persistence

---

## Context from Previous Session (006)

### Completed Work
- **Phase 1 (Analysis)**: UIED analysis of 8 Replit screenshots, gap analysis, API integration spec, design tokens JSON
- **Phase 2 (API Integration)**: AppsScreen wired to sessionStore, AgentPaneContainer with streaming
- **Phase 3 (UI Refinement)**: Design tokens CSS (443 properties), screen styling started

### Current State
- **Test Pass Rate**: 909/1261 (72%) - target is 95%
- **Commit**: `b36bf68` with 51 files, +11,530 lines
- **Key Files Created**:
  - `src/styles/mobile-tokens.css` - 442 CSS variables
  - `src/stores/connectionStore.ts` - Connection mode management
  - `src/components/mobile/workspace/panes/AgentPaneContainer.tsx` - Live streaming

### Known Issues
- Integration tests failing due to sessionStore mock not providing projects
- ResponsiveLayout tests have vitest mock timing issues
- Some screens showing "No projects yet" instead of test data

---

## Phase 1: Test Infrastructure Repair (Hour 1-2)

### Agent Assignment: test-infrastructure-team (3 agents)

#### Agent 1: Mock Store Specialist
**Focus**: Fix Zustand store mocks for consistent test data

```typescript
// Target: tests/mobile/setup.ts
// Issue: sessionStore mock not properly returning projects in all contexts

// Required changes:
1. Ensure sessionStore.getState().projects returns mock data
2. Make workspaceStore.getState().currentProject work in all test contexts
3. Add proper Zustand mock factory for vitest module hoisting
```

**Files to modify**:
- `tests/mobile/setup.ts`
- `tests/mobile/integration/workspaceNavigation.test.tsx`
- `tests/mobile/integration/navigation.test.tsx`

#### Agent 2: Vitest Configuration Specialist
**Focus**: Fix module hoisting and mock timing issues

```typescript
// Issue: vi.mock calls not hoisting properly before imports
// Solution: Use vi.hoisted() for mock definitions

import { vi, beforeEach } from 'vitest';

const mockSessionStore = vi.hoisted(() => ({
  projects: [
    { id: 'test-1', path: '/test/project-1', sessions: [], created_at: Date.now() }
  ],
  // ... rest of mock
}));

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: () => mockSessionStore
}));
```

**Files to modify**:
- All files in `tests/mobile/integration/`
- `tests/mobile/layouts/ResponsiveLayout.test.tsx`

#### Agent 3: Test Data Consistency
**Focus**: Create shared test fixtures

```typescript
// New file: tests/mobile/fixtures/testData.ts
export const mockProjects = [
  {
    id: 'test-project-1',
    path: '/home/user/projects/test-app',
    sessions: ['session-1', 'session-2'],
    created_at: Date.now() - 86400000,
    most_recent_session: Date.now()
  },
  // ... more projects
];

export const mockWorkspace = {
  currentProject: {
    id: 'test-project-1',
    name: 'Test App',
    path: '/home/user/projects/test-app'
  }
};
```

**Files to create**:
- `tests/mobile/fixtures/testData.ts`
- `tests/mobile/fixtures/mockStores.ts`

---

## Phase 2: Claude Code Integration Testing (Hour 2-3)

### Agent Assignment: integration-test-team (3 agents)

#### Agent 4: Event Streaming Test Designer
**Focus**: Test real Claude Code message streaming

```typescript
// New file: tests/mobile/integration/claudeStreaming.test.tsx
import { listen, emit } from '@tauri-apps/api/event';
import { AgentPaneContainer } from '@/components/mobile/workspace/panes/AgentPaneContainer';

describe('Claude Code Streaming Integration', () => {
  it('receives and displays streaming output', async () => {
    // Mock Tauri event system
    const mockListen = vi.fn().mockImplementation((event, callback) => {
      // Simulate streaming events
      setTimeout(() => {
        callback({ payload: { session_id: 'test-session', content: 'Hello' } });
      }, 100);
      return () => {};
    });

    // Render and verify streaming works
    render(<AgentPaneContainer projectId="test" />);

    // Execute prompt
    fireEvent.change(screen.getByPlaceholderText(/ask claude/i), {
      target: { value: 'Test prompt' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Verify streaming output appears
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('handles session lifecycle events', async () => {
    // Test claude-session-started, claude-session-completed, claude-session-error
  });

  it('properly cleans up event listeners', async () => {
    // Test unmounting cleans up listeners
  });
});
```

**Test Scenarios**:
1. Message streaming from `claude-output` events
2. Session start/complete/error lifecycle
3. Multiple concurrent sessions
4. Large output handling (scrolling, performance)
5. Stop/cancel functionality

#### Agent 5: API Integration Test Designer
**Focus**: Test API calls to Claude Code backend

```typescript
// New file: tests/mobile/integration/apiIntegration.test.tsx
import { api } from '@/lib/api';

describe('Claude Code API Integration', () => {
  describe('Project Management', () => {
    it('fetches projects from Claude Code', async () => {
      const projects = await api.getProjects();
      expect(projects).toBeInstanceOf(Array);
    });

    it('gets project sessions', async () => {
      const sessions = await api.getSessions('test-project-id');
      expect(sessions).toBeInstanceOf(Array);
    });
  });

  describe('Session Execution', () => {
    it('starts a new Claude session', async () => {
      const result = await api.startClaudeSession({
        projectPath: '/test/path',
        prompt: 'Test prompt'
      });
      expect(result.sessionId).toBeDefined();
    });

    it('continues existing conversation', async () => {
      const result = await api.continueClaudeSession({
        sessionId: 'existing-session',
        prompt: 'Follow-up prompt'
      });
      expect(result).toBeDefined();
    });
  });
});
```

#### Agent 6: Connection Mode Test Designer
**Focus**: Test local/tailscale/web connection modes

```typescript
// New file: tests/mobile/integration/connectionModes.test.tsx
import { useConnectionStore } from '@/stores/connectionStore';

describe('Connection Mode Integration', () => {
  describe('Local Mode', () => {
    it('connects to local Claude Code instance', async () => {
      const { setConnectionMode, connect } = useConnectionStore.getState();
      setConnectionMode('local');
      await connect();
      expect(useConnectionStore.getState().isConnected).toBe(true);
    });
  });

  describe('Tailscale Mode', () => {
    it('establishes SSH tunnel connection', async () => {
      // Test tailscale/SSH tunnel setup
    });
  });

  describe('Web Mode', () => {
    it('connects via web API', async () => {
      // Test web-based connection
    });
  });

  describe('Auto-Reconnection', () => {
    it('automatically reconnects on connection loss', async () => {
      // Test reconnection logic
    });
  });
});
```

---

## Phase 3: Git Integration Testing (Hour 3-4)

### Agent Assignment: git-integration-team (3 agents)

#### Agent 7: Git Status Test Designer
**Focus**: Test git repository information access

```typescript
// New file: tests/mobile/integration/gitIntegration.test.tsx
import { api } from '@/lib/api';

describe('Git Integration', () => {
  describe('Repository Detection', () => {
    it('detects git repository in project path', async () => {
      const isRepo = await api.isGitRepository('/test/project');
      expect(typeof isRepo).toBe('boolean');
    });

    it('gets current branch name', async () => {
      const branch = await api.getCurrentBranch('/test/project');
      expect(typeof branch).toBe('string');
    });
  });

  describe('Git Status', () => {
    it('retrieves modified files', async () => {
      const status = await api.getGitStatus('/test/project');
      expect(status).toHaveProperty('modified');
      expect(status).toHaveProperty('staged');
      expect(status).toHaveProperty('untracked');
    });

    it('shows uncommitted changes count', async () => {
      const changes = await api.getUncommittedChangesCount('/test/project');
      expect(typeof changes).toBe('number');
    });
  });

  describe('Git History', () => {
    it('fetches recent commits', async () => {
      const commits = await api.getRecentCommits('/test/project', 10);
      expect(commits).toBeInstanceOf(Array);
      commits.forEach(commit => {
        expect(commit).toHaveProperty('hash');
        expect(commit).toHaveProperty('message');
        expect(commit).toHaveProperty('author');
        expect(commit).toHaveProperty('date');
      });
    });

    it('gets diff for specific commit', async () => {
      const diff = await api.getCommitDiff('/test/project', 'abc123');
      expect(typeof diff).toBe('string');
    });
  });
});
```

#### Agent 8: Git UI Component Test Designer
**Focus**: Test git-related UI components

```typescript
// Test git status display in workspace
describe('Git Status Display', () => {
  it('shows branch name in workspace header', async () => {
    render(<WorkspaceScreen projectId="test" />);
    await waitFor(() => {
      expect(screen.getByText(/main|master|feature/i)).toBeInTheDocument();
    });
  });

  it('displays uncommitted changes indicator', async () => {
    // Test that uncommitted changes show a visual indicator
  });

  it('shows recent commit history', async () => {
    // Test commit history display
  });
});
```

#### Agent 9: Git Mock Service
**Focus**: Create comprehensive git mocks for testing

```typescript
// New file: tests/mobile/mocks/gitMocks.ts
export const mockGitRepository = {
  isRepo: true,
  branch: 'feature/mobile',
  remote: 'origin',
  status: {
    modified: ['src/App.tsx', 'src/lib/api.ts'],
    staged: ['package.json'],
    untracked: ['test.txt'],
    deleted: []
  },
  commits: [
    {
      hash: 'b36bf68',
      message: 'feat(mobile): design tokens and API integration',
      author: 'Developer',
      date: new Date().toISOString(),
      filesChanged: 51
    }
  ]
};

export const createGitMock = (overrides = {}) => ({
  ...mockGitRepository,
  ...overrides
});
```

---

## Phase 4: Pixel-Perfect UI Refinement (Hour 4-5)

### Agent Assignment: pixel-perfect-team (4 agents)

#### Agent 10: AppsScreen Refinement
**Focus**: Match Replit Apps screen exactly

**Reference**: `.prompts/006-overnight-pixel-perfect-mobile/analysis/01-apps-screen-analysis.md`

**Checklist**:
- [ ] Header height: 56px with proper font (24px bold)
- [ ] Filter bar: 16px padding, proper dropdown styling
- [ ] Project cards: 12px border-radius, 1px border
- [ ] Loading spinner: Proper animation and color
- [ ] Empty state: Centered with proper spacing

#### Agent 11: CreateScreen Refinement
**Focus**: Match Replit Create screen exactly

**Reference**: `.prompts/006-overnight-pixel-perfect-mobile/analysis/02-create-screen-analysis.md`

**Checklist**:
- [ ] Build/Design toggle: Proper styling
- [ ] Template grid: Responsive layout
- [ ] Prompt input: Floating at bottom
- [ ] Background gradient: If applicable

#### Agent 12: WorkspaceScreen Refinement
**Focus**: Match workspace panes exactly

**References**:
- `.prompts/006-overnight-pixel-perfect-mobile/analysis/04-agent-pane-analysis.md`
- `.prompts/006-overnight-pixel-perfect-mobile/analysis/05-console-pane-analysis.md`
- `.prompts/006-overnight-pixel-perfect-mobile/analysis/06-preview-pane-analysis.md`

**Pane Checklist**:
- [ ] Agent pane: Prompt input, output area, task list
- [ ] Console pane: ANSI colors, scrolling
- [ ] Preview pane: Iframe or webview
- [ ] Share pane: QR code, links
- [ ] Publishing pane: Steps, progress

#### Agent 13: AccountScreen Refinement
**Focus**: Match Replit Account screen exactly

**Reference**: `.prompts/006-overnight-pixel-perfect-mobile/analysis/03-account-screen-analysis.md`

**Checklist**:
- [ ] Large avatar: 96px
- [ ] Settings list: Proper grouping
- [ ] Storage indicator: Progress bar
- [ ] Logout button: Proper styling

---

## Phase 5: Final Validation & Documentation (Hour 5-6)

### Agent Assignment: validation-team (2 agents)

#### Agent 14: Test Runner & Validator
**Focus**: Run all tests and validate pass rate

```bash
# Run full test suite
npm test -- --run --reporter=verbose

# Expected outcome: 95%+ pass rate
# Current: 72% (909/1261)
# Target: 95%+ (1197+/1261)
```

**Validation Checklist**:
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build completes successfully

#### Agent 15: Documentation & Commit
**Focus**: Document changes and create commit

**Documentation Tasks**:
1. Update `CHANGELOG.md` with changes
2. Create test coverage report
3. Document any new API patterns
4. Update mobile README if needed

**Commit Format**:
```
feat(mobile): advanced integration tests and pixel-perfect refinement

- Add Claude Code streaming integration tests
- Add git integration tests
- Fix Zustand store mocks for consistent test data
- Refine all screens to match Replit designs
- Improve test pass rate from 72% to 95%+

Tests: npm test
Build: npm run build
```

---

## Execution Strategy

### Parallel Execution Groups

**Group 1 (Parallel)**: Agents 1, 2, 3 - Test infrastructure
**Group 2 (Parallel)**: Agents 4, 5, 6 - Claude integration tests
**Group 3 (Parallel)**: Agents 7, 8, 9 - Git integration tests
**Group 4 (Parallel)**: Agents 10, 11, 12, 13 - UI refinement
**Group 5 (Sequential)**: Agent 14 then 15 - Validation and commit

### Checkpoints

1. **Checkpoint 1** (Hour 1): Test infrastructure repaired
2. **Checkpoint 2** (Hour 2): Claude integration tests written
3. **Checkpoint 3** (Hour 3): Git integration tests written
4. **Checkpoint 4** (Hour 4): UI refinement complete
5. **Checkpoint 5** (Hour 5): All tests passing at 95%+
6. **Checkpoint 6** (Hour 6): Documentation and commit complete

### Memory Keys

```
swarm/007/checkpoint-1: Test infrastructure status
swarm/007/checkpoint-2: Claude tests status
swarm/007/checkpoint-3: Git tests status
swarm/007/checkpoint-4: UI refinement status
swarm/007/checkpoint-5: Test results
swarm/007/checkpoint-6: Final status
swarm/007/test-results: { passed: n, failed: n, total: n }
swarm/007/files-modified: [list of files]
```

---

## Success Criteria

1. **Test Pass Rate**: ≥95% (currently 72%)
2. **TypeScript**: Zero errors
3. **ESLint**: Zero errors
4. **Build**: Successful completion
5. **Claude Integration**: Streaming tests pass
6. **Git Integration**: Repository access tests pass
7. **UI Fidelity**: Visually matches Replit screenshots

---

## Risk Mitigation

### Potential Blockers

1. **Vitest mock timing**: Use `vi.hoisted()` pattern
2. **Tauri API mocking**: Create comprehensive `@tauri-apps/api` mock
3. **Store state isolation**: Use `beforeEach` to reset stores
4. **Async timing**: Use `waitFor` with appropriate timeouts

### Fallback Strategies

1. If tests remain flaky → skip and document for manual verification
2. If API mocking fails → create integration test environment
3. If UI matching difficult → document differences for iteration

---

## Orchestration Command

```bash
# Full execution with 15 agents
/sparc:orchestrator --agents 15 --topology adaptive --memory-enabled --checkpoints

# Or manual execution
npx claude-flow sparc run orchestrator "Execute prompt 007 for advanced mobile prototype"
```

---

## Files to Create/Modify

### New Files
- `tests/mobile/fixtures/testData.ts`
- `tests/mobile/fixtures/mockStores.ts`
- `tests/mobile/integration/claudeStreaming.test.tsx`
- `tests/mobile/integration/apiIntegration.test.tsx`
- `tests/mobile/integration/connectionModes.test.tsx`
- `tests/mobile/integration/gitIntegration.test.tsx`
- `tests/mobile/mocks/gitMocks.ts`
- `tests/mobile/mocks/tauriMocks.ts`

### Modified Files
- `tests/mobile/setup.ts`
- `tests/mobile/integration/*.test.tsx`
- `src/screens/mobile/AppsScreen.tsx`
- `src/screens/mobile/CreateScreen.tsx`
- `src/screens/mobile/AccountScreen.tsx`
- `src/screens/mobile/WorkspaceScreen.tsx`
- `src/components/mobile/workspace/panes/*.tsx`
