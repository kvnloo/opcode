# Mobile Implementation Execution - Autonomous Multi-Agent Development

## Objective
Execute the mobile implementation plan using 15 parallel agents with maximum autonomy. This prompt orchestrates the full implementation of Opcode mobile extension following the detailed plan.

## Context

### Reference Documents (MUST READ FIRST)
- Implementation plan: @.prompts/002-mobile-implementation-plan/mobile-implementation-plan.md
- Research findings: @.prompts/001-mobile-architecture-research/mobile-architecture-research.md
- Original adaptation plan: @claudedocs/claude-code-mobile-opcode-adaptation.md
- Feature mapping: @claudedocs/feature-mapping.md
- Existing codebase: @src/App.tsx, @src-tauri/tauri.conf.json

### Replit Mobile UX Reference (Screenshots Analyzed)
**Main Navigation (3 tabs):**
1. **Apps** - Project cards with preview, "All Apps", public/private
2. **Create** - AI build/design, templates (Web/Mobile/Data/3D), voice input
3. **Account** - Profile, usage, theme, settings

**Workspace Features:**
- Agent execution with progress (0/8 style)
- File edits with timestamps
- Rollback, Changes, View Preview buttons
- Live preview with browser controls
- Comprehensive tools menu
- Publishing workflow

## Execution Mode

### Autonomous Operation Protocol
This implementation runs **fully autonomously** without user intervention.

**Decision-Making Guidelines:**
1. **When uncertain**: Use `/sc:research` for SOTA best practices
2. **Architecture decisions**: Follow research findings, prefer simpler solutions
3. **Component design**: Match Replit mobile patterns from screenshots
4. **File placement**: Follow the folder structure defined in the plan
5. **Error handling**: Implement graceful degradation, log for debugging
6. **Testing**: Write tests alongside implementation

### Agent Coordination Protocol

**Before Each Task:**
```bash
npx claude-flow@alpha hooks pre-task --description "[task description]"
```

**After File Changes:**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "mobile/[component]/[step]"
```

**After Task Completion:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task-id]"
```

## Requirements

### Execution Phases (From Plan)

#### Phase 1: Foundation (5 Parallel Agents)
Execute these tasks in a single parallel batch:

<parallel_batch id="1A">
<agent type="researcher">
**Task**: Research Tauri 2 mobile production readiness (2025)
**Action**: Use /sc:research to gather current status
**Output**: Create `docs/mobile/tauri-mobile-research.md`
**Checklist**:
  - [ ] Tauri 2 mobile beta status
  - [ ] Known limitations and workarounds
  - [ ] iOS vs Android differences
  - [ ] Performance benchmarks
</agent>

<agent type="system-architect">
**Task**: Design mobile architecture
**Action**: Analyze existing components, create mobile architecture
**Output**: Create `docs/mobile/architecture.md`
**Checklist**:
  - [ ] Component mapping (desktop → mobile)
  - [ ] State management strategy
  - [ ] Navigation architecture
  - [ ] Connection mode design
</agent>

<agent type="backend-dev">
**Task**: Initialize Tauri mobile targets
**Action**: Run Tauri mobile init commands
**Commands**:
  ```bash
  cd /home/kvn/workspace/evolve/repos/opcode
  cargo tauri android init
  cargo tauri ios init
  ```
**Output**: `src-tauri/gen/android/`, `src-tauri/gen/apple/`
**Note**: If on Linux without Android Studio, document setup requirements
</agent>

<agent type="coder">
**Task**: Create platform detection system
**Files to Create**:
  - `src/hooks/mobile/usePlatform.ts`
  - `src/hooks/mobile/useOrientation.ts`
  - `src/hooks/mobile/useKeyboardHeight.ts`
  - `src/lib/mobile/platform/detection.ts`
**Implementation**:
  ```typescript
  // src/hooks/mobile/usePlatform.ts
  export type Platform = 'desktop' | 'mobile' | 'tablet';
  export function usePlatform(): Platform
  export function useIsMobile(): boolean
  ```
</agent>

<agent type="technical-writer">
**Task**: Create mobile development documentation
**Files to Create**:
  - `docs/mobile/SETUP.md` - Development environment setup
  - `docs/mobile/CONTRIBUTING.md` - Mobile contribution guidelines
  - `MOBILE_README.md` - Quick start for mobile development
</agent>
</parallel_batch>

#### Phase 2: Mobile UI Foundation (6 Parallel Agents)
Depends on Phase 1 completion.

<parallel_batch id="2A">
<agent type="frontend-architect">
**Task**: Create mobile layout system
**Files to Create**:
  - `src/layouts/MobileLayout.tsx`
  - `src/layouts/DesktopLayout.tsx` (extract from App.tsx)
  - `src/layouts/ResponsiveLayout.tsx` (wrapper)
**Implementation Pattern**:
  ```tsx
  // MobileLayout.tsx
  export function MobileLayout({ children }: { children: React.ReactNode }) {
    const [activePane, setActivePane] = useState<Pane>('apps');
    // Swipeable pane container
    // Bottom navigation
    // Safe area handling
  }
  ```
</agent>

<agent type="mobile-dev">
**Task**: Implement bottom navigation (Replit-style)
**Files to Create**:
  - `src/components/mobile/navigation/BottomNavigation.tsx`
  - `src/components/mobile/navigation/TabBar.tsx`
  - `src/components/mobile/navigation/types.ts`
**Reference**: Screenshot analysis - Apps, Create, Account tabs
**Features**:
  - Haptic feedback on tap
  - Active state indicator
  - Safe area padding (pb-safe)
</agent>

<agent type="coder">
**Task**: Create swipeable pane system
**Files to Create**:
  - `src/components/mobile/workspace/SwipeablePane.tsx`
  - `src/components/mobile/workspace/PaneContainer.tsx`
  - `src/hooks/mobile/useSwipeNavigation.ts`
**Dependencies**: framer-motion (already in package.json)
**Implementation**: Use framer-motion drag + AnimatePresence
</agent>

<agent type="researcher">
**Task**: Research mobile gesture patterns
**Action**: Use /sc:research for SOTA mobile gestures
**Output**: `docs/mobile/gesture-patterns.md`
**Topics**:
  - Swipe navigation patterns
  - Pull-to-refresh
  - Long-press actions
  - Pinch-to-zoom for code
</agent>

<agent type="tester">
**Task**: Set up mobile testing framework
**Files to Create**:
  - `tests/mobile/setup.ts`
  - `tests/mobile/navigation.test.ts`
  - `tests/mobile/layout.test.ts`
**Implementation**: Configure viewport testing, touch event mocking
</agent>

<agent type="reviewer">
**Task**: Audit existing components for mobile compatibility
**Action**: Review all components in `src/components/`
**Output**: `docs/mobile/component-audit.md`
**Checklist**:
  - [ ] Touch target sizes (min 44px)
  - [ ] Responsive breakpoints
  - [ ] Scroll behavior
  - [ ] Font sizes for mobile
</agent>
</parallel_batch>

#### Phase 3: Mobile Screens (7 Parallel Agents)
Depends on Phase 2 completion.

<parallel_batch id="3A">
<agent type="frontend-architect">
**Task**: Create Apps screen (home)
**Files to Create**:
  - `src/screens/mobile/AppsScreen.tsx`
  - `src/components/mobile/apps/ProjectCard.tsx`
  - `src/components/mobile/apps/ProjectList.tsx`
**Reference**: Replit Apps tab - project cards with preview
</agent>

<agent type="mobile-dev">
**Task**: Create Create screen
**Files to Create**:
  - `src/screens/mobile/CreateScreen.tsx`
  - `src/components/mobile/create/BuildDesignToggle.tsx`
  - `src/components/mobile/create/TemplateSelector.tsx`
  - `src/components/mobile/create/PromptInput.tsx`
**Reference**: Replit Create tab - Build/Design, templates, voice input
</agent>

<agent type="coder">
**Task**: Create Account screen
**Files to Create**:
  - `src/screens/mobile/AccountScreen.tsx`
  - `src/components/mobile/account/ProfileCard.tsx`
  - `src/components/mobile/account/SettingsList.tsx`
**Reference**: Replit Account tab - profile, usage, theme, settings
</agent>

<agent type="frontend-architect">
**Task**: Create workspace view
**Files to Create**:
  - `src/screens/mobile/WorkspaceScreen.tsx`
  - `src/components/mobile/workspace/WorkspaceHeader.tsx`
  - `src/components/mobile/workspace/WorkspaceToolbar.tsx`
**Features**: Tab-based workspace (Files, Editor, Terminal, Claude)
</agent>

<agent type="mobile-dev">
**Task**: Create mobile file browser
**Files to Create**:
  - `src/components/mobile/files/MobileFileBrowser.tsx`
  - `src/components/mobile/files/FileItem.tsx`
  - `src/components/mobile/files/FolderTree.tsx`
**Features**: Swipe actions, touch targets, breadcrumb nav
</agent>

<agent type="coder">
**Task**: Create tools menu (Replit-style)
**Files to Create**:
  - `src/components/mobile/tools/ToolsMenu.tsx`
  - `src/components/mobile/tools/ToolItem.tsx`
  - `src/components/mobile/tools/SearchBar.tsx`
**Reference**: Replit tools menu - searchable list of Agent, Console, Database, etc.
</agent>

<agent type="researcher">
**Task**: Research mobile code editor implementations
**Action**: Use /sc:research for mobile code editor best practices
**Output**: `docs/mobile/code-editor-research.md`
**Topics**:
  - Monaco on mobile WebView
  - CodeMirror 6 mobile support
  - Custom keyboard toolbar patterns
</agent>
</parallel_batch>

#### Phase 4: Terminal & Connection (6 Parallel Agents)
Can run parallel with Phase 3.

<parallel_batch id="4A">
<agent type="backend-dev">
**Task**: Implement SSH bridge (Rust)
**Files to Create**:
  - `src-tauri/src/commands/mobile/mod.rs`
  - `src-tauri/src/commands/mobile/ssh_bridge.rs`
  - `src-tauri/src/commands/mobile/connection.rs`
**Implementation**: WebSocket-based SSH proxy
</agent>

<agent type="mobile-dev">
**Task**: Create mobile terminal component
**Files to Create**:
  - `src/components/mobile/terminal/MobileTerminal.tsx`
  - `src/components/mobile/terminal/TerminalInput.tsx`
  - `src/components/mobile/terminal/CodeKeyboard.tsx`
  - `src/components/mobile/terminal/QuickCommands.tsx`
**Reference**: Touch-optimized terminal with code keyboard toolbar
</agent>

<agent type="coder">
**Task**: Create connection manager UI
**Files to Create**:
  - `src/components/mobile/connection/ConnectionManager.tsx`
  - `src/components/mobile/connection/TailscaleConnect.tsx`
  - `src/components/mobile/connection/ClaudeWebConnect.tsx`
  - `src/lib/mobile/connection/types.ts`
**Modes**: Local, Tailscale SSH, Claude Web API
</agent>

<agent type="researcher">
**Task**: Research Tailscale mobile integration
**Action**: Use /sc:research for Tailscale mobile SDK
**Output**: `docs/mobile/tailscale-integration.md`
</agent>

<agent type="security-engineer">
**Task**: Security review for connection modes
**Action**: Review SSH, WebSocket, API security
**Output**: `docs/mobile/security-review.md`
**Checklist**:
  - [ ] Credential storage (secure keychain)
  - [ ] Certificate validation
  - [ ] Token handling
</agent>

<agent type="tester">
**Task**: Create connection tests
**Files to Create**:
  - `tests/mobile/connection.test.ts`
  - `tests/mobile/terminal.test.ts`
</agent>
</parallel_batch>

#### Phase 5: Agent Execution View (5 Parallel Agents)
Depends on Phases 3 & 4.

<parallel_batch id="5A">
<agent type="frontend-architect">
**Task**: Create agent execution UI
**Files to Create**:
  - `src/components/mobile/agent/AgentExecutionView.tsx`
  - `src/components/mobile/agent/TaskProgress.tsx`
  - `src/components/mobile/agent/TaskItem.tsx`
**Reference**: Replit agent view - progress (0/8), task list, actions
</agent>

<agent type="mobile-dev">
**Task**: Create agent action buttons
**Files to Create**:
  - `src/components/mobile/agent/ActionBar.tsx`
  - `src/components/mobile/agent/RollbackButton.tsx`
  - `src/components/mobile/agent/ChangesButton.tsx`
  - `src/components/mobile/agent/PreviewButton.tsx`
**Reference**: Rollback here, Changes, View preview buttons
</agent>

<agent type="coder">
**Task**: Create file diff viewer
**Files to Create**:
  - `src/components/mobile/agent/FileDiffViewer.tsx`
  - `src/components/mobile/agent/EditedFileItem.tsx`
**Features**: Show edited files with syntax highlighting
</agent>

<agent type="mobile-dev">
**Task**: Create preview mode
**Files to Create**:
  - `src/components/mobile/preview/PreviewWebView.tsx`
  - `src/components/mobile/preview/PreviewControls.tsx`
**Reference**: Replit preview with browser controls
</agent>

<agent type="tester">
**Task**: Create agent execution tests
**Files to Create**:
  - `tests/mobile/agent-execution.test.ts`
  - `tests/mobile/preview.test.ts`
</agent>
</parallel_batch>

#### Phase 6: Polish & Performance (8 Parallel Agents)
Depends on Phase 5.

<parallel_batch id="6A">
<agent type="mobile-dev">
**Task**: Implement haptic feedback
**Files to Create**:
  - `src/lib/mobile/haptics.ts`
  - `src-tauri/src/commands/mobile/haptics.rs`
**Usage**: Navigation, button presses, actions
</agent>

<agent type="performance-engineer">
**Task**: Performance optimization
**Action**: Profile and optimize bundle size, memory
**Output**: `docs/mobile/performance-optimization.md`
**Tasks**:
  - [ ] Bundle analysis
  - [ ] Lazy loading implementation
  - [ ] Memory leak detection
</agent>

<agent type="coder">
**Task**: Implement offline mode
**Files to Create**:
  - `src/lib/mobile/offline/queue.ts`
  - `src/lib/mobile/offline/sync.ts`
  - `src/hooks/mobile/useOfflineQueue.ts`
</agent>

<agent type="mobile-dev">
**Task**: Tablet layout (split view)
**Files to Create**:
  - `src/layouts/TabletLayout.tsx`
  - `src/components/mobile/tablet/SplitPane.tsx`
**Feature**: iPad-style split view workspace
</agent>

<agent type="frontend-architect">
**Task**: Accessibility implementation
**Action**: Add ARIA labels, screen reader support
**Files Modified**: All mobile components
**Output**: `docs/mobile/accessibility.md`
</agent>

<agent type="coder">
**Task**: Dark/light theme for mobile
**Files to Create**:
  - `src/lib/mobile/theme.ts`
  - `src/components/mobile/settings/ThemeToggle.tsx`
</agent>

<agent type="tester">
**Task**: Comprehensive mobile test suite
**Files to Create**:
  - `tests/mobile/e2e/` (end-to-end tests)
  - `tests/mobile/performance/`
</agent>

<agent type="reviewer">
**Task**: Final code review
**Action**: Review all new mobile code
**Output**: `docs/mobile/code-review-report.md`
</agent>
</parallel_batch>

#### Phase 7: CI/CD & Distribution (4 Parallel Agents)
Depends on Phase 6.

<parallel_batch id="7A">
<agent type="cicd-engineer">
**Task**: GitHub Actions for mobile
**Files to Create**:
  - `.github/workflows/mobile-build.yml`
  - `.github/workflows/mobile-test.yml`
**Features**: Android APK, iOS IPA builds
</agent>

<agent type="devops-architect">
**Task**: App store preparation
**Files to Create**:
  - `mobile/android/store-listing.md`
  - `mobile/ios/app-store-listing.md`
  - `mobile/assets/screenshots/`
</agent>

<agent type="technical-writer">
**Task**: User documentation
**Files to Create**:
  - `docs/mobile/USER_GUIDE.md`
  - `docs/mobile/FAQ.md`
  - `docs/mobile/TROUBLESHOOTING.md`
</agent>

<agent type="coder">
**Task**: Community setup
**Files to Create**:
  - `CONTRIBUTING.md` (update for mobile)
  - `.github/ISSUE_TEMPLATE/mobile-bug.md`
  - `.github/ISSUE_TEMPLATE/mobile-feature.md`
</agent>
</parallel_batch>

## Output Specification

### Implementation Artifacts
All files created according to the folder structure in the plan.

### Progress Tracking
After each phase, create/update:
- `.prompts/003-mobile-implementation-do/progress.md`

### SUMMARY.md Creation
Create `.prompts/003-mobile-implementation-do/SUMMARY.md`:

```markdown
# Implementation Summary: Opcode Mobile

**[One-liner: Status of implementation]**

**Version**: v1
**Date**: YYYY-MM-DD

## Implementation Status
- **Phase 1**: [COMPLETE|IN_PROGRESS|BLOCKED]
- **Phase 2**: [Status]
- **Phase 3**: [Status]
- **Phase 4**: [Status]
- **Phase 5**: [Status]
- **Phase 6**: [Status]
- **Phase 7**: [Status]

## Files Created
- Total: N files
- Components: X
- Tests: Y
- Documentation: Z

## Key Accomplishments
- [Accomplishment 1]
- [Accomplishment 2]

## Decisions Made
- [Autonomous decision 1 with rationale]
- [Autonomous decision 2 with rationale]

## Issues Encountered
- [Issue and resolution]

## Blockers
- [Any external blockers]

## Next Steps
- [If incomplete, what remains]
- [If complete, verification steps]
```

## Verification Criteria

### Per-Phase Verification
Each phase must verify:
- [ ] All specified files created
- [ ] Tests passing
- [ ] No TypeScript errors
- [ ] Components render correctly
- [ ] Hooks called with coordination protocol

### Final Verification
- [ ] `bun run build` succeeds
- [ ] `bun run check` (TypeScript) passes
- [ ] All tests pass
- [ ] Mobile layouts render on mobile viewport
- [ ] Navigation works on all screen sizes

## Success Criteria
- All 7 phases completed
- 15 agents utilized with maximum parallelization
- Mobile app builds for Android and iOS (or documented setup)
- All tests passing
- Documentation complete
- Ready for community contributions
