# Phase 5: Type Safety & Build Fix - Meta Prompt

## Context
Building a Tauri 2 mobile application with React/TypeScript frontend. Phases 1-4 completed:
- Phase 1: Tool pane navigation integration
- Phase 2: Created 5 new panes
- Phase 3: Backend API integration
- Phase 4: Polish, error handling, test coverage (2015 tests passing)

**Critical Issue**: TypeScript compilation fails with multiple type errors. The app does not build.

## Current TypeScript Errors

Run `npx tsc --noEmit` to reproduce. Current errors:

### 1. toolPaneRegistry.ts - Type mismatches (5 errors)
```
src/components/mobile/workspace/toolPaneRegistry.ts(42,3): error TS2322
src/components/mobile/workspace/toolPaneRegistry.ts(43,3): error TS2322
src/components/mobile/workspace/toolPaneRegistry.ts(44,3): error TS2322
src/components/mobile/workspace/toolPaneRegistry.ts(45,3): error TS2322
src/components/mobile/workspace/toolPaneRegistry.ts(46,3): error TS2322

Problem: ToolPaneProps missing projectId, projectPath, onBack
```

### 2. apiErrorHandler.ts - Variable and unused code issues (3 errors)
```
src/lib/mobile/apiErrorHandler.ts(136,18): error TS2454: Variable 'timeoutId' used before assigned
src/lib/mobile/apiErrorHandler.ts(377,9): error TS6133: 'apiError' declared but never read
src/lib/mobile/apiErrorHandler.ts(378,9): error TS6133: 'category' declared but never read
```

### 3. AppsScreen.tsx - Missing prop (1 error)
```
src/screens/mobile/AppsScreen.tsx(79,8): error TS2741
Property 'projectPath' missing in WorkspaceScreenProps
```

### 4. CreateScreen.tsx - HapticButton variant prop (4 errors)
```
src/screens/mobile/CreateScreen.tsx(185,15): error TS2322
src/screens/mobile/CreateScreen.tsx(228,19): error TS2322
src/screens/mobile/CreateScreen.tsx(282,19): error TS2322
src/screens/mobile/CreateScreen.tsx(340,15): error TS2322

Problem: 'variant' prop doesn't exist on HapticButton
```

---

## Agent Work Distribution (6 Parallel Agents)

### Agent 1: ToolPaneRegistry Type Fixes
**Files to modify:**
- `src/components/mobile/workspace/toolPaneRegistry.ts`
- Related pane type definitions

**Tasks:**
1. Read current ToolPaneProps interface
2. Extend ToolPaneProps to include: projectId, projectPath, onBack
3. Or create a union type that handles both base and extended props
4. Ensure all registered panes conform to the new type
5. Run `npx tsc --noEmit` to verify fixes

**Approach:**
```typescript
// Option A: Extend ToolPaneProps
interface ToolPaneProps {
  className?: string;
  projectId?: string;
  projectPath?: string;
  onBack?: () => void;
}

// Option B: Use generic with intersection
type PaneComponent<T extends ToolPaneProps = ToolPaneProps> = ComponentType<T>;
```

---

### Agent 2: apiErrorHandler.ts Fixes
**Files to modify:**
- `src/lib/mobile/apiErrorHandler.ts`

**Tasks:**
1. Fix timeoutId initialization issue at line 136
2. Remove or use apiError variable at line 377
3. Remove or use category variable at line 378
4. Ensure error handler logic is complete
5. Run `npx tsc --noEmit` to verify

**Approach:**
```typescript
// Fix 1: Initialize timeoutId before use
let timeoutId: NodeJS.Timeout | undefined;
// or
let timeoutId: NodeJS.Timeout = undefined as unknown as NodeJS.Timeout;

// Fix 2 & 3: Either use the variables or remove them
// If not needed:
const { /* apiError, category, */ ...rest } = error;
// If needed, use them in logging or processing
```

---

### Agent 3: AppsScreen.tsx Prop Fix
**Files to modify:**
- `src/screens/mobile/AppsScreen.tsx`
- `src/screens/mobile/WorkspaceScreen.tsx` (check interface)

**Tasks:**
1. Read WorkspaceScreenProps interface definition
2. Add missing projectPath prop at line 79
3. Determine how to get projectPath from context/state
4. Pass projectPath correctly to WorkspaceScreen
5. Run `npx tsc --noEmit` to verify

**Approach:**
```typescript
// In AppsScreen where WorkspaceScreen is rendered:
<WorkspaceScreen
  projectId={projectId}
  projectName={projectName}
  projectPath={project.path || `/projects/${projectId}`}
  onBack={() => setSelectedProject(null)}
/>
```

---

### Agent 4: HapticButton Variant Prop
**Files to modify:**
- `src/components/mobile/common/HapticButton.tsx`
- Or `src/screens/mobile/CreateScreen.tsx`

**Tasks:**
1. Read HapticButton props interface
2. Option A: Add 'variant' prop to HapticButton if needed
3. Option B: Remove variant usage from CreateScreen if not supported
4. Ensure consistent button styling approach
5. Run `npx tsc --noEmit` to verify

**Approach:**
```typescript
// Option A: Add variant to HapticButton
interface HapticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hapticType?: 'light' | 'medium' | 'heavy';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  // ... other props
}

// Option B: Replace variant with className styling
<HapticButton
  className="bg-primary text-white" // instead of variant="primary"
  {...otherProps}
/>
```

---

### Agent 5: Type Definition Audit
**Files to review:**
- `src/types/*.ts`
- `src/components/mobile/**/*.tsx` (prop interfaces)

**Tasks:**
1. Audit all mobile component prop interfaces
2. Find any other type mismatches or missing props
3. Ensure consistent typing patterns across components
4. Create shared type definitions where patterns repeat
5. Document typing patterns in code comments

**Patterns to check:**
```typescript
// Ensure all panes have consistent props
interface BasePaneProps {
  className?: string;
}

interface ProjectPaneProps extends BasePaneProps {
  projectId: string;
  projectPath?: string;
  onBack: () => void;
}
```

---

### Agent 6: Build Verification & Integration
**Files to check:**
- All modified files from other agents
- `tsconfig.json` settings

**Tasks:**
1. Run full TypeScript check: `npx tsc --noEmit`
2. If errors remain, identify and document them
3. Run test suite: `npm run test:mobile -- --run`
4. Verify no tests broken by type fixes
5. Run build if available: `npm run build`

**Verification steps:**
```bash
# Step 1: Full type check
npx tsc --noEmit

# Step 2: Run tests
npm run test:mobile -- --run

# Step 3: Build check
npm run build

# Step 4: Count remaining errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

---

## Acceptance Criteria

### Per Agent:
- [ ] Assigned TypeScript errors fixed
- [ ] No new errors introduced
- [ ] Related tests still pass
- [ ] Code follows existing patterns

### Overall Phase 5:
- [ ] `npx tsc --noEmit` reports 0 errors
- [ ] All 2015+ tests still pass
- [ ] `npm run build` succeeds
- [ ] No runtime regressions
- [ ] Code properly typed with no `any` escapes

---

## Build Commands

```bash
# Type check
npx tsc --noEmit

# Test suite
npm run test:mobile -- --run

# Full build
npm run build

# Quick build check
tsc && vite build
```

---

## Expected Outcome

After Phase 5:
- TypeScript compilation succeeds with 0 errors
- All 2015+ tests passing
- App builds successfully
- Ready for deployment/testing
