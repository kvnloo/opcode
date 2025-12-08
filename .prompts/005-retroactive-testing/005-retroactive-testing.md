# Meta-Prompt: Retroactive Testing Strategy for Opcode Mobile

## Context

The Opcode mobile application was developed without Test-Driven Development (TDD). We now have:
- **89 mobile source files** requiring tests
- **15 existing test files** (many failing)
- **94 TypeScript compilation errors** blocking test execution
- **Target coverage**: 80% lines/functions/statements, 75% branches

## Tech Stack

### Core Framework
- **React**: 18.3.1 (with concurrent features)
- **TypeScript**: 5.6.2 (strict mode)
- **Vite**: 6.0.3 (build tool)
- **Tauri**: 2.x (desktop + mobile runtime)

### Testing Stack
- **Vitest**: 4.0.15 (test runner)
- **@testing-library/react**: 16.3.0
- **@testing-library/jest-dom**: 6.9.1
- **JSDOM**: 27.2.0 (browser environment)
- **c8**: Coverage provider

### UI Libraries Requiring Mocks
- **Framer Motion**: 12.0.0-alpha.1 (animations)
- **Radix UI**: Various primitives (dialog, popover, tabs, etc.)
- **Lucide React**: Icon library
- **Zustand**: 5.0.6 (state management)

### Mobile-Specific APIs
- **@tauri-apps/plugin-os**: Platform detection
- **@tauri-apps/api/core**: Tauri IPC

## Current Test Issues

### Issue 1: Window Mocking Incomplete
```
TypeError: window.dispatchEvent is not a function
```
- Location: `tests/mobile/setup.ts:100`
- Cause: Global window object partially mocked

### Issue 2: Framer Motion Mock Issues
```
TypeError: Right-hand side of 'instanceof' is not an object
```
- Cause: Incomplete motion component mocking

### Issue 3: React Rendering Lifecycle
```
Error: Should not already be working
```
- Cause: Concurrent React rendering issues in tests

### Issue 4: TypeScript Errors (94 total)
- Most: `TS6133` unused imports
- Some: Type mismatches with icon components
- Some: Missing utility function imports

## Files Requiring Tests

### Priority 1: Core Mobile Infrastructure (11 files)
```
src/hooks/mobile/usePlatform.ts
src/hooks/mobile/useOrientation.ts
src/hooks/mobile/useKeyboardHeight.ts
src/hooks/mobile/useSwipeNavigation.ts
src/hooks/mobile/useHaptics.ts
src/hooks/mobile/useIntersectionObserver.ts
src/lib/mobile/platform/detection.ts
src/lib/mobile/haptics.ts
src/lib/mobile/performance.ts
src/lib/mobile/accessibility.ts
src/stores/workspaceStore.ts
```

### Priority 2: Screen Components (4 files)
```
src/screens/mobile/AppsScreen.tsx
src/screens/mobile/CreateScreen.tsx
src/screens/mobile/AccountScreen.tsx
src/screens/mobile/WorkspaceScreen.tsx
```

### Priority 3: Workspace Components (12 files)
```
src/components/mobile/workspace/WorkspaceToolbar.tsx
src/components/mobile/workspace/WorkspaceHeader.tsx
src/components/mobile/workspace/ToolsOverlay.tsx
src/components/mobile/workspace/QuickAccessBar.tsx
src/components/mobile/workspace/SwipeablePane.tsx
src/components/mobile/workspace/PaneContainer.tsx
src/components/mobile/workspace/panes/AgentPane.tsx
src/components/mobile/workspace/panes/ConsolePane.tsx
src/components/mobile/workspace/panes/PreviewPane.tsx
src/components/mobile/workspace/panes/PublishingPane.tsx
src/components/mobile/workspace/panes/SharePane.tsx
src/components/mobile/agent/AgentExecutionView.tsx
```

### Priority 4: Navigation & Layout (6 files)
```
src/components/mobile/navigation/BottomNavigation.tsx
src/components/mobile/layout/TabletLayout.tsx
src/layouts/MobileLayout.tsx
src/layouts/ResponsiveLayout.tsx
src/layouts/DesktopLayout.tsx
src/components/mobile/common/ResponsiveWrapper.tsx
```

### Priority 5: Terminal & Connection (8 files)
```
src/components/mobile/terminal/MobileTerminal.tsx
src/components/mobile/terminal/TerminalInput.tsx
src/components/mobile/terminal/QuickCommands.tsx
src/components/mobile/terminal/CodeKeyboard.tsx
src/components/mobile/connection/ConnectionManager.tsx
src/components/mobile/connection/ConnectionStatus.tsx
src/components/mobile/connection/TailscaleConnect.tsx
src/components/mobile/connection/ClaudeWebConnect.tsx
```

### Priority 6: Supporting Components (12 files)
```
src/components/mobile/apps/ProjectCard.tsx
src/components/mobile/apps/ProjectList.tsx
src/components/mobile/create/BuildDesignToggle.tsx
src/components/mobile/create/TemplateSelector.tsx
src/components/mobile/create/PromptInput.tsx
src/components/mobile/account/ProfileCard.tsx
src/components/mobile/account/SettingsList.tsx
src/components/mobile/tools/ToolsMenu.tsx
src/components/mobile/tools/ToolItem.tsx
src/components/mobile/tools/SearchBar.tsx
src/components/mobile/agent/TaskProgress.tsx
src/components/mobile/agent/ActionBar.tsx
```

### Priority 7: Common/Utility Components (8 files)
```
src/components/mobile/common/HapticButton.tsx
src/components/mobile/common/LazyComponent.tsx
src/components/mobile/common/AccessibleText.tsx
src/components/mobile/common/VirtualList.tsx
src/components/mobile/preview/PreviewWebView.tsx
src/components/mobile/agent/FileDiffViewer.tsx
src/lib/mobile/optimization/bundleAnalyzer.ts
src/lib/mobile/optimization/memoryManager.ts
```

---

## Orchestration Strategy: 15 Parallel Agents

### Phase 1: Foundation (4 agents) - MUST COMPLETE FIRST

**Agent 1: TypeScript Fixer**
- Fix all 94 TypeScript errors
- Remove unused imports (TS6133)
- Fix type mismatches
- Add missing utility imports
- Run: `npx tsc --noEmit` until 0 errors

**Agent 2: Test Setup Fixer**
- Fix window mocking in `tests/mobile/setup.ts`
- Fix Framer Motion mocks to handle all motion components
- Add proper React Testing Library setup
- Fix JSDOM configuration
- Create reusable mock utilities

**Agent 3: Mock Factory Creator**
- Create `tests/mobile/mocks/tauri.ts` - Tauri API mocks
- Create `tests/mobile/mocks/framer-motion.ts` - Complete motion mocks
- Create `tests/mobile/mocks/radix-ui.ts` - Radix component mocks
- Create `tests/mobile/mocks/zustand.ts` - Store mocks
- Create `tests/mobile/mocks/lucide.ts` - Icon mocks

**Agent 4: Test Utilities Creator**
- Create `tests/mobile/utils/renderWithProviders.tsx` - Provider wrapper
- Create `tests/mobile/utils/userEventSetup.ts` - User event helpers
- Create `tests/mobile/utils/waitForAnimations.ts` - Animation helpers
- Create `tests/mobile/utils/platformSimulator.ts` - Platform simulation
- Create `tests/mobile/utils/gestures.ts` - Touch gesture simulation

### Phase 2: Core Testing (5 agents) - After Phase 1 passes

**Agent 5: Hooks Tester**
- Test all 7 hooks in `src/hooks/mobile/`
- Focus on: state changes, side effects, cleanup
- Target: 90% coverage per hook
- Files: usePlatform, useOrientation, useKeyboardHeight, useSwipeNavigation, useHaptics, useIntersectionObserver

**Agent 6: Store & State Tester**
- Test workspaceStore with Zustand
- Test all actions and selectors
- Test persistence/hydration
- Target: 95% coverage for state logic

**Agent 7: Screen Tester**
- Test AppsScreen, CreateScreen, AccountScreen, WorkspaceScreen
- Focus on: routing, navigation, conditional rendering
- Test tablet vs phone layouts
- Target: 85% coverage per screen

**Agent 8: Workspace Panes Tester**
- Test all 5 panes: Agent, Console, Preview, Publishing, Share
- Test swipe gestures between panes
- Test toolbar interactions
- Target: 80% coverage per pane

**Agent 9: Navigation Tester**
- Test BottomNavigation, WorkspaceToolbar, WorkspaceHeader
- Test responsive layout switching
- Test gesture-based navigation
- Target: 85% coverage

### Phase 3: Component Testing (4 agents) - After Phase 2 starts

**Agent 10: Terminal Components Tester**
- Test MobileTerminal, TerminalInput, QuickCommands, CodeKeyboard
- Mock xterm.js
- Test keyboard interactions
- Target: 80% coverage

**Agent 11: Connection Components Tester**
- Test ConnectionManager, ConnectionStatus, TailscaleConnect, ClaudeWebConnect
- Mock Tauri IPC calls
- Test connection state flows
- Target: 80% coverage

**Agent 12: Create & Apps Tester**
- Test ProjectCard, ProjectList, BuildDesignToggle, TemplateSelector, PromptInput
- Test form interactions
- Test list virtualization
- Target: 80% coverage

**Agent 13: Common Components Tester**
- Test HapticButton, LazyComponent, AccessibleText, VirtualList
- Test accessibility attributes
- Test lazy loading behavior
- Target: 85% coverage

### Phase 4: Integration & Coverage (2 agents) - Final phase

**Agent 14: Integration Tester**
- Test complete user flows
- Test navigation between all screens
- Test workspace pane switching
- Test agent execution flow
- Create E2E-like integration tests

**Agent 15: Coverage Auditor & Reporter**
- Run full test suite: `npm run test:coverage`
- Generate coverage report
- Identify gaps below 80% threshold
- Create summary report with recommendations
- Document any skipped tests with reasons

---

## Execution Commands

### For Each Agent, Start With:
```bash
# Check TypeScript first
npx tsc --noEmit

# Run specific test file
npm run test:run -- tests/mobile/[path]

# Run with coverage
npm run test:coverage -- tests/mobile/[path]
```

### Validation Gates

**Phase 1 Complete When:**
- `npx tsc --noEmit` returns 0 errors
- `npm run test:run -- tests/mobile/setup.ts` passes
- All mock files created and importable

**Phase 2 Complete When:**
- All hook tests pass
- All screen tests pass
- All workspace tests pass
- Coverage > 75% for tested files

**Phase 3 Complete When:**
- All component tests pass
- No flaky tests
- Coverage > 80% for tested files

**Phase 4 Complete When:**
- Full suite passes: `npm run test:mobile`
- Coverage report shows 80%+ overall
- All critical paths have integration tests

---

## Test File Naming Convention

```
tests/mobile/
├── setup.ts                          # Global setup
├── mocks/
│   ├── tauri.ts                      # Tauri API mocks
│   ├── framer-motion.ts              # Motion mocks
│   ├── radix-ui.ts                   # Radix mocks
│   ├── zustand.ts                    # Store mocks
│   └── lucide.ts                     # Icon mocks
├── utils/
│   ├── renderWithProviders.tsx       # Test wrapper
│   ├── userEventSetup.ts             # User event helpers
│   ├── waitForAnimations.ts          # Animation waits
│   ├── platformSimulator.ts          # Platform helpers
│   └── gestures.ts                   # Touch gestures
├── hooks/
│   ├── usePlatform.test.ts
│   ├── useOrientation.test.ts
│   ├── useKeyboardHeight.test.ts
│   ├── useSwipeNavigation.test.ts
│   ├── useHaptics.test.ts
│   └── useIntersectionObserver.test.ts
├── stores/
│   └── workspaceStore.test.ts
├── screens/
│   ├── AppsScreen.test.tsx
│   ├── CreateScreen.test.tsx
│   ├── AccountScreen.test.tsx
│   └── WorkspaceScreen.test.tsx
├── components/
│   ├── BottomNavigation.test.tsx
│   ├── SwipeablePane.test.tsx
│   ├── MobileTerminal.test.tsx
│   └── ToolsMenu.test.tsx
├── workspace/
│   ├── WorkspaceScreen.test.tsx
│   ├── WorkspaceToolbar.test.tsx
│   ├── WorkspaceHeader.test.tsx
│   ├── ToolsOverlay.test.tsx
│   ├── QuickAccessBar.test.tsx
│   ├── panes/
│   │   ├── AgentPane.test.tsx
│   │   ├── ConsolePane.test.tsx
│   │   ├── PreviewPane.test.tsx
│   │   ├── PublishingPane.test.tsx
│   │   └── SharePane.test.tsx
│   └── integration.test.tsx
└── integration/
    ├── navigation.test.tsx
    ├── userFlows.test.tsx
    └── agentExecution.test.tsx
```

---

## Success Criteria

1. **TypeScript**: 0 compilation errors
2. **Test Pass Rate**: 100% (no failing tests)
3. **Coverage**:
   - Lines: >= 80%
   - Functions: >= 80%
   - Branches: >= 75%
   - Statements: >= 80%
4. **No Flaky Tests**: All tests deterministic
5. **Documentation**: Each test file has purpose comments

## Output Artifacts

After orchestration completes:
1. All test files in `tests/mobile/`
2. Coverage report in `coverage/`
3. `docs/mobile/TESTING.md` - Testing documentation
4. Summary of coverage gaps and recommendations
