# Autonomous Mobile App Full-Stack Implementation

## Objective

Complete the OpCode mobile application to production-ready status through parallel autonomous development. This prompt orchestrates 6 specialized agents working concurrently to implement all missing features, wire UI to backend, add auto-detection capabilities, and write comprehensive tests.

**Target**: Replit-style mobile wrapper for Claude Code with full Tailscale SSH connectivity, automatic session detection, and complete feature parity with reference screenshots.

## Context

### Current State Analysis (from prior investigation)

**Implementation Status**: 65% complete
- Phase 1-3 (Foundation, UI, Screens): ~90% complete
- Phase 4-7 (Integration, Connection, Distribution): ~15% complete

**Critical Gaps Identified**:
1. **Session Auto-Detection**: Manual only, no file watcher or polling
2. **Tailscale SSH**: Pure stubs returning errors
3. **API Integration**: 36 methods defined, 0% wired to UI
4. **Backend Commands**: Connection commands are placeholders

### Key Files Reference

**Frontend Stores**:
- `@src/stores/sessionStore.ts` - Session/project management
- `@src/stores/workspaceStore.ts` - Workspace state
- `@src/stores/connectionStore.ts` - Connection modes (282 lines)

**Backend Commands**:
- `@src-tauri/src/commands/claude.rs` - Session detection (needs file watcher)
- `@src-tauri/src/commands/mobile/connection.rs` - Tailscale stubs

**Reference Designs** (in claudedocs/):
- replit-agent-pane-main-view.png
- replit-apps-home-screen.png
- replit-workflows-pane.png
- replit-publishing-pane.png
- replit-console-terminal-pane.png
- (22 total reference screenshots)

### Test Infrastructure
- 1509 mobile tests exist, 80.5% passing
- Test location: `tests/mobile/`
- Run command: `npm run test:mobile`

## Agent Assignments

Execute with 6 parallel agents. Each agent works independently on their domain.

---

### AGENT 1: Session Auto-Detection (Rust Backend)

**Mission**: Implement automatic Claude Code session detection with real-time updates.

**Tasks**:
1. Add `notify` crate to Cargo.toml for filesystem watching
2. Implement file watcher for `~/.claude/projects/` directory
3. Create background thread that monitors for new sessions
4. Add Tauri event emission for session changes: `claude-session-changed`
5. Implement polling fallback (every 30s) for platforms without inotify
6. Add session discovery on app startup

**Files to Modify**:
- `src-tauri/Cargo.toml` - Add notify = "6.1"
- `src-tauri/src/commands/claude.rs` - Add watcher logic
- `src-tauri/src/lib.rs` - Register session watcher on startup

**Tests to Write** (in `tests/mobile/integration/`):
- `sessionAutoDetection.test.tsx` - Test event handling for session changes
- Test session list updates when new session detected
- Test startup auto-discovery

**Success Criteria**:
- Sessions appear automatically within 5 seconds of creation
- No manual refresh needed
- Works on both macOS and Linux

---

### AGENT 2: Tailscale SSH Implementation (Rust Backend)

**Mission**: Implement full Tailscale SSH connectivity for remote Claude Code access.

**Tasks**:
1. Add `russh` crate for SSH protocol
2. Implement SSH connection establishment
3. Create WebSocket bridge for terminal I/O
4. Add SSH key authentication support
5. Implement connection status events
6. Handle reconnection on network changes

**Files to Modify**:
- `src-tauri/Cargo.toml` - Add russh, tokio-tungstenite
- `src-tauri/src/commands/mobile/connection.rs` - Replace stubs with implementation
- `src-tauri/src/commands/mobile/mod.rs` - Add SSH module

**New Files**:
- `src-tauri/src/commands/mobile/ssh.rs` - SSH client implementation
- `src-tauri/src/commands/mobile/websocket_bridge.rs` - WS terminal bridge

**Tests to Write**:
- `tests/mobile/integration/tailscaleConnection.test.tsx`
- Test connection establishment
- Test terminal I/O through SSH
- Test reconnection handling
- Test error states

**Success Criteria**:
- Can connect to Tailscale node by hostname
- Terminal commands execute remotely
- Connection survives network blips

---

### AGENT 3: API Integration Layer (Frontend)

**Mission**: Wire all 36 defined API methods to UI components.

**Tasks**:
1. Audit all API methods in stores vs actual Tauri commands
2. Connect sessionStore to claude.rs commands
3. Connect workspaceStore to workspace commands
4. Connect connectionStore to connection commands
5. Add loading states and error handling
6. Implement optimistic updates where appropriate

**Files to Modify**:
- `src/stores/sessionStore.ts` - Wire to Tauri invoke calls
- `src/stores/workspaceStore.ts` - Wire task/agent methods
- `src/stores/connectionStore.ts` - Wire connection methods
- `src/lib/api/claude.ts` - Ensure all methods invoke correctly

**Components to Update**:
- `src/screens/mobile/AppsScreen.tsx` - Real project list
- `src/components/mobile/workspace/WorkspaceScreen.tsx` - Real agent data
- `src/components/mobile/connection/*` - Real connection status

**Tests to Write**:
- `tests/mobile/integration/apiIntegration.test.tsx`
- Test store → Tauri command flow
- Test error handling propagation
- Test loading states

**Success Criteria**:
- All UI reflects real backend data
- No hardcoded mock data in production paths
- Proper loading/error states throughout

---

### AGENT 4: Missing Screens Implementation (Frontend)

**Mission**: Implement all missing pane screens from Replit reference designs.

**Reference Screenshots**:
- replit-workflows-pane.png → WorkflowsPane
- replit-publishing-pane.png → PublishingPane (enhance existing)
- replit-integrations-pane.png → IntegrationsPane
- replit-secrets-env-vars-pane.png → SecretsPane
- replit-key-value-store-pane.png → KeyValueStorePane
- replit-auth-users-pane.png → AuthUsersPane
- replit-app-storage-pane.png → AppStoragePane
- replit-developer-tools-pane.png → DevToolsPane
- replit-security-scanner-pane.png → SecurityScannerPane
- replit-multiplayer-pane.png → MultiplayerPane

**Tasks**:
1. Create each missing pane component
2. Match Replit UI patterns pixel-perfect
3. Add to workspace pane navigation
4. Wire to appropriate stores/commands
5. Add proper loading skeletons

**Files to Create** (in `src/components/mobile/workspace/panes/`):
- `WorkflowsPane.tsx`
- `IntegrationsPane.tsx`
- `SecretsPane.tsx`
- `KeyValueStorePane.tsx`
- `AuthUsersPane.tsx`
- `AppStoragePane.tsx`
- `DevToolsPane.tsx`
- `SecurityScannerPane.tsx`
- `MultiplayerPane.tsx`

**Tests to Write** (in `tests/mobile/workspace/panes/`):
- One test file per new pane
- Test rendering, interactions, accessibility

**Success Criteria**:
- All Replit pane types have equivalent implementations
- Consistent styling with existing panes
- Full accessibility compliance

---

### AGENT 5: CreateScreen AI Integration (Frontend + Backend)

**Mission**: Implement the AI-powered project creation flow.

**Reference**: replit-create-screen.png

**Tasks**:
1. Implement natural language project description input
2. Add AI-powered template suggestion based on description
3. Create project generation flow with Claude Code
4. Add project type selection (web app, API, mobile, etc.)
5. Implement project scaffolding with templates
6. Add progress indicator during generation

**Files to Modify**:
- `src/screens/mobile/CreateScreen.tsx` - Full implementation
- `src/stores/sessionStore.ts` - Add createProject method

**Backend Commands Needed**:
- `create_project` - Initialize new Claude Code project
- `generate_scaffold` - Create initial files from template

**Tests to Write**:
- `tests/mobile/screens/CreateScreen.test.tsx`
- Test project description flow
- Test template selection
- Test project creation success/failure

**Success Criteria**:
- User can describe project in natural language
- AI suggests appropriate templates
- New project appears in Apps list after creation

---

### AGENT 6: Comprehensive Test Suite (Testing)

**Mission**: Write integration tests ensuring frontend-backend connectivity works end-to-end.

**Tasks**:
1. Create E2E test scenarios for core user flows
2. Test all connection modes (local, tailscale, web)
3. Test session lifecycle (create, run, stop, resume)
4. Test real-time updates (agent progress, logs, files)
5. Test error recovery scenarios
6. Ensure 95%+ test coverage on new code

**Test Files to Create**:
- `tests/mobile/e2e/connectionModes.test.tsx`
- `tests/mobile/e2e/sessionLifecycle.test.tsx`
- `tests/mobile/e2e/realTimeUpdates.test.tsx`
- `tests/mobile/e2e/errorRecovery.test.tsx`
- `tests/mobile/e2e/projectCreation.test.tsx`

**Test Patterns**:
```typescript
// Test actual Tauri command invocation
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd, args) => {
    // Return realistic mock data based on command
  })
}));

// Test event subscriptions
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event, handler) => {
    // Simulate event emissions
  })
}));
```

**Success Criteria**:
- All new features have corresponding tests
- Integration tests verify UI-backend connection
- Test suite passes with 95%+ coverage on new code
- No regressions in existing tests

---

## Execution Protocol

### Phase 1: Parallel Implementation (All Agents)
All 6 agents work concurrently on their assigned tasks.

**Coordination Rules**:
- Agents 1 & 2 (Backend): Can work independently, different modules
- Agents 3 & 4 (Frontend): Agent 3 updates stores, Agent 4 creates components
- Agent 5: Depends on Agent 3's store updates
- Agent 6: Writes tests alongside implementations

### Phase 2: Integration Verification
After implementation:
1. Run full test suite: `npm run test:mobile`
2. Run type check: `npm run typecheck`
3. Run lint: `npm run lint`
4. Build verification: `npm run build`

### Phase 3: Fix & Iterate
For any failures:
1. Identify failing tests/builds
2. Route to appropriate agent for fixes
3. Re-verify after fixes

## Output Specification

Each agent must:
1. Create/modify files as specified
2. Write tests for all new functionality
3. Update any related documentation
4. Log completion status

**Final Output Location**: `.prompts/009-mobile-fullstack-do/SUMMARY.md`

## Success Criteria

**Quantitative**:
- [ ] 100% of Tauri commands have real implementations (no stubs)
- [ ] 100% of stores wired to backend commands
- [ ] 100% of reference panes implemented
- [ ] Test coverage ≥ 95% on new code
- [ ] All tests pass (target: 1800+ tests)
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors

**Qualitative**:
- [ ] Sessions auto-detect without manual refresh
- [ ] Tailscale SSH connects and maintains terminal session
- [ ] Create screen generates real projects
- [ ] All panes match Replit reference quality
- [ ] App feels production-ready

## SUMMARY.md Template

After completion, create `.prompts/009-mobile-fullstack-do/SUMMARY.md`:

```markdown
# Mobile Full-Stack Implementation Summary

**{One-liner describing outcome}**

## Version
v1 - Initial autonomous implementation

## Key Accomplishments
- {List major features completed}

## Files Created
- {List all new files}

## Files Modified
- {List all modified files with brief description}

## Test Results
- Total tests: {number}
- Passing: {number}
- Coverage: {percentage}

## Decisions Made
- {Any architectural decisions made during implementation}

## Blockers Encountered
- {Any blockers and how they were resolved}

## Next Steps
- {What should be done next}
```

---

**IMPORTANT**: This prompt is designed for fully autonomous overnight execution. All agents should proceed without human intervention, making reasonable decisions when facing ambiguity. Log decisions in SUMMARY.md for human review.
