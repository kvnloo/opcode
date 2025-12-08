# 008: Fix Mobile Test Suite Failures

## Objective

Fix 375 failing tests in the mobile test suite to achieve 95%+ pass rate. The tests are failing due to infrastructure issues in the test setup, not actual bugs in the application code.

**Current State**: 926 passing / 375 failing (71%)
**Target State**: 95%+ pass rate (1235+ passing)

## Context

The mobile test suite has these systematic failure patterns:

### Root Cause Analysis

1. **Navigator clipboard undefined** (Critical - affects many tests)
   - Error: `Cannot read properties of undefined (reading 'clipboard')`
   - The `navigator.clipboard` mock exists in window mock but tests access `navigator.clipboard` directly
   - Fix: Ensure `global.navigator` properly exposes clipboard

2. **IntersectionObserver spy errors** (Critical - 207+ errors)
   - Error: `TypeError: undefined is not a spy or a call to a spy!`
   - Tests try to assert on IntersectionObserver.observe as a spy
   - The class mock doesn't expose methods as spies
   - Fix: Add spy wrappers to IntersectionObserver methods

3. **React Promise children errors** (Many tests)
   - Error: `Objects are not valid as a React child (found: [object Promise])`
   - Lazy-loaded components returning promises instead of resolved components
   - Fix: Mock lazy components properly or wrap tests in Suspense

4. **Missing store data in specific tests**
   - Some tests expect specific data structures not provided by global mock
   - Fix: Ensure test-specific setup overrides work correctly

## Requirements

### Phase 1: Fix Test Infrastructure (tests/mobile/setup.ts)

**1.1 Fix Navigator/Clipboard Mock**

```typescript
// The current window mock has navigator inside it, but we also need global.navigator
// Add this BEFORE the vi.mock calls:

// Ensure navigator is available globally with clipboard
if (typeof global.navigator === 'undefined') {
  (global as any).navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Win32',
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    share: undefined,
  };
} else {
  // Add clipboard to existing navigator
  (global.navigator as any).clipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  };
}
```

**1.2 Fix IntersectionObserver Mock for Spy Testing**

```typescript
// Create exported spy functions that tests can import and assert on
export const mockIntersectionObserve = vi.fn();
export const mockIntersectionUnobserve = vi.fn();
export const mockIntersectionDisconnect = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  private callback: IntersectionObserverCallback;
  private elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    if (options) {
      this.root = options.root ?? null;
      this.rootMargin = options.rootMargin ?? '0px';
      this.thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold ?? 0];
    }
  }

  observe = mockIntersectionObserve.mockImplementation((target: Element) => {
    this.elements.add(target);
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    };
    this.callback([entry], this);
  });

  unobserve = mockIntersectionUnobserve.mockImplementation((target: Element) => {
    this.elements.delete(target);
  });

  disconnect = mockIntersectionDisconnect.mockImplementation(() => {
    this.elements.clear();
  });

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
```

**1.3 Add Lazy Component Mock**

```typescript
// Mock React.lazy to return synchronous components
const originalLazy = React.lazy;
(React as any).lazy = (factory: () => Promise<any>) => {
  // For test environment, we want synchronous loading
  const LazyComponent = (props: any) => {
    const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      let mounted = true;
      factory()
        .then((module) => {
          if (mounted) {
            setComponent(() => module.default || module);
          }
        })
        .catch((err) => {
          if (mounted) {
            setError(err);
            console.error('LazyComponent Error:', err);
          }
        });
      return () => { mounted = false; };
    }, []);

    if (error) return null;
    if (!Component) return null;
    return React.createElement(Component, props);
  };

  return LazyComponent;
};
```

### Phase 2: Fix Specific Test Files

**2.1 Fix useIntersectionObserver.test.tsx**

Update tests to use the exported spy functions:

```typescript
import { mockIntersectionObserve, mockIntersectionUnobserve, mockIntersectionDisconnect } from '../setup';

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should observe element when ref is set', () => {
    // ... render hook
    expect(mockIntersectionObserve).toHaveBeenCalled();
  });
});
```

**2.2 Fix Tests Using navigator.clipboard**

Tests in these files need clipboard mock access:
- `tests/mobile/workspace/panes/ConsolePane.test.tsx`
- `tests/mobile/workspace/panes/SharePane.test.tsx`

Ensure they don't need to import clipboard mock - it should work automatically.

**2.3 Fix BottomNavigation Keyboard Test**

```typescript
// The keyboard navigation test is checking for focus management
// Ensure the component has proper tabIndex and aria attributes for the test
it('should be keyboard navigable', async () => {
  render(<BottomNavigation />);

  const navItems = screen.getAllByRole('button');
  expect(navItems.length).toBeGreaterThan(0);

  // Focus first item
  navItems[0].focus();
  expect(document.activeElement).toBe(navItems[0]);

  // Test keyboard navigation with userEvent
  await userEvent.keyboard('{ArrowRight}');
  // ... rest of test
});
```

**2.4 Fix MobileTerminal Tests**

```typescript
// Terminal tests need proper mock for scrollIntoView
// Already mocked in setup.ts, but tests may need adjustment
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.scrollTo = vi.fn();
```

**2.5 Fix ToolsMenu Tests**

The ToolsMenu tests look for specific DOM elements. Ensure:
- Clear button visibility tests check correct state
- Category organization uses correct test IDs
- Scroll area has proper role attributes

### Phase 3: Improve Test Quality

**3.1 Remove Flaky Tests**

If tests are genuinely flaky and testing implementation details:
- Add `.skip` with comment explaining why
- Or refactor to test behavior, not implementation

**3.2 Add Missing Test Utilities**

Create `tests/mobile/utils/testHelpers.ts`:

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Wrapper that provides all necessary context
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Output Specification

**Output File**: `.prompts/008-test-fixes-do/test-fixes.md`

Create a report documenting:
1. All changes made to `tests/mobile/setup.ts`
2. Individual test files modified
3. Tests that were skipped and why
4. Final test results summary

**SUMMARY.md**: Create executive summary with:
- One-liner: Test pass rate improvement achieved
- Files modified count
- Tests fixed count
- Any remaining issues
- Next steps if any tests still fail

## Success Criteria

1. **Test Pass Rate**: ≥95% (currently 71%)
2. **No TypeScript Errors**: `npx tsc --noEmit` passes
3. **No New Warnings**: Existing warning count should not increase
4. **Documented Skips**: Any skipped tests have clear reasoning
5. **Clean CI**: Tests run reliably without flaky failures

## Execution Notes

1. Start by fixing `tests/mobile/setup.ts` - this will fix most failures
2. Run tests after each major change to measure progress
3. Group similar failures and fix together
4. Document any tests that are testing implementation details (bad tests)
5. Focus on fixing infrastructure, not changing component code

## Commands for Validation

```bash
# Run full test suite
npm test -- tests/mobile/ --run

# Run specific failing file
npm test -- tests/mobile/hooks/useIntersectionObserver.test.tsx --run

# Check TypeScript
npx tsc --noEmit

# Get test summary
npm test -- tests/mobile/ --run 2>&1 | grep -E "Test Files|Tests "
```
