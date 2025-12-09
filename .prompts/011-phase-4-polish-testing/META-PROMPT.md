# Phase 4: Polish & Testing - Meta Prompt

## Context
Building a Tauri 2 mobile application with React/TypeScript frontend. Phase 1 completed tool pane navigation, Phase 2 created 5 new panes, Phase 3 connected panes to backend APIs. Now Phase 4 polishes the app and achieves comprehensive test coverage.

## Current State (Phase 3 Complete)
- 1959 tests passing (17 skipped)
- 82 test files, 1 skipped (apiIntegration.test.tsx)
- 5 API-integrated panes: AssistantPane, DatabasePane, GitPane, ShellPane, UserSettingsPane
- Git service layer, custom hooks, error handling utilities in place

## Phase 4 Objectives
Polish the mobile app, fix skipped tests, improve test coverage, enhance accessibility, and optimize performance.

---

## Agent Work Distribution (6 Parallel Agents)

### Agent 1: Skipped Tests Recovery
**Files to modify:**
- `tests/mobile/integration/apiIntegration.test.tsx` (17 skipped tests)
- Any other skipped test files discovered

**Tasks:**
1. Investigate why tests are skipped
2. Fix underlying issues causing skips
3. Enable all 17 skipped API integration tests
4. Ensure tests pass with proper mocks
5. Add missing mock configurations
6. Update test setup if needed

**Approach:**
```typescript
// Check if tests are marked with .skip or .todo
// Look for conditional skips like:
describe.skip('API Integration', () => {...})
it.skip('should handle API errors', () => {...})

// Fix by providing proper mocks:
beforeEach(() => {
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn().mockResolvedValue(mockResponse),
  }));
});
```

---

### Agent 2: Test Coverage Improvements
**Files to create/modify:**
- `tests/mobile/workspace/panes/ConsolePane.test.tsx` - add more coverage
- `tests/mobile/workspace/panes/AgentPane.test.tsx` - add more coverage
- `tests/mobile/workspace/panes/SharePane.test.tsx` - add more coverage
- `tests/mobile/workspace/panes/LogsPane.test.tsx` - add more coverage

**Tasks:**
1. Audit existing pane tests for missing coverage
2. Add edge case tests for error states
3. Add loading state tests
4. Add accessibility tests (ARIA labels, keyboard navigation)
5. Add responsive layout tests
6. Target 90%+ coverage per component

**Test patterns to add:**
```typescript
describe('Edge Cases', () => {
  it('handles empty data gracefully', async () => {...});
  it('handles network timeout', async () => {...});
  it('handles malformed API response', async () => {...});
});

describe('Loading States', () => {
  it('shows skeleton loader during fetch', async () => {...});
  it('shows spinner during action', async () => {...});
});

describe('Accessibility', () => {
  it('has correct ARIA labels', () => {...});
  it('supports keyboard navigation', () => {...});
  it('announces changes to screen readers', () => {...});
});
```

---

### Agent 3: Accessibility Polish
**Files to modify:**
- `src/components/mobile/workspace/panes/AssistantPane.tsx`
- `src/components/mobile/workspace/panes/DatabasePane.tsx`
- `src/components/mobile/workspace/panes/GitPane.tsx`
- `src/components/mobile/workspace/panes/ShellPane.tsx`
- `src/components/mobile/workspace/panes/UserSettingsPane.tsx`

**Tasks:**
1. Audit all components for WCAG 2.1 AA compliance
2. Add missing aria-label attributes
3. Add aria-live regions for dynamic content
4. Ensure proper focus management
5. Add keyboard shortcuts where appropriate
6. Add screen reader announcements for state changes
7. Update tests to verify accessibility

**Patterns to implement:**
```typescript
// ARIA labels for interactive elements
<button aria-label="Stage file: config.ts" onClick={handleStage}>
  <Plus className="h-4 w-4" />
</button>

// Live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {queryResult && `${queryResult.length} rows returned`}
</div>

// Focus management after async operations
useEffect(() => {
  if (!isLoading && inputRef.current) {
    inputRef.current.focus();
  }
}, [isLoading]);

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && e.metaKey) {
    handleExecute();
  }
};
```

---

### Agent 4: Performance Optimization
**Files to modify:**
- `src/components/mobile/workspace/panes/*.tsx` (all panes)
- `src/hooks/mobile/*.ts` (all hooks)
- `src/screens/mobile/WorkspaceScreen.tsx`

**Tasks:**
1. Add React.memo() to prevent unnecessary re-renders
2. Implement useMemo/useCallback for expensive computations
3. Add debouncing for rapid user inputs
4. Implement virtual scrolling for large lists
5. Optimize re-render patterns with proper dependencies
6. Add performance tests

**Optimization patterns:**
```typescript
// Memoize components
export const GitFileItem = React.memo(({ file, onStage, onUnstage }) => {
  return (...);
});

// Memoize callbacks
const handleQueryChange = useCallback((value: string) => {
  setQuery(value);
}, []);

// Memoize computed values
const filteredTables = useMemo(() => {
  return tables.filter(t => !t.name.startsWith('sqlite_'));
}, [tables]);

// Debounce rapid inputs
const debouncedSearch = useDebouncedCallback((value: string) => {
  executeSearch(value);
}, 300);

// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual';
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 35,
});
```

---

### Agent 5: Error Handling Enhancement
**Files to modify:**
- `src/lib/mobile/apiErrorHandler.ts`
- `src/components/mobile/workspace/panes/*.tsx` (all panes)
- Create `src/components/mobile/common/ErrorBoundary.tsx`

**Tasks:**
1. Create reusable ErrorBoundary component
2. Add user-friendly error messages
3. Implement error recovery mechanisms
4. Add retry functionality for transient failures
5. Create error toast notifications
6. Log errors for debugging
7. Add tests for error scenarios

**Error handling patterns:**
```typescript
// Error boundary wrapper
class PaneErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Pane error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}

// Retry mechanism
const executeWithRetry = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
};

// Toast notifications
import { useToast } from '@/hooks/useToast';
const { toast } = useToast();
toast({
  variant: 'destructive',
  title: 'Query Failed',
  description: 'Unable to execute SQL query. Please try again.',
});
```

---

### Agent 6: Integration Tests & E2E Coverage
**Files to create/modify:**
- `tests/mobile/integration/paneIntegration.test.tsx` (new)
- `tests/mobile/e2e/fullUserJourney.test.tsx` (new)
- `tests/mobile/integration/userFlows.test.tsx` (enhance)

**Tasks:**
1. Create comprehensive integration tests for all panes
2. Test data flow between components
3. Test navigation flows
4. Test API call sequences
5. Create end-to-end user journey tests
6. Test offline/error recovery scenarios

**Integration test patterns:**
```typescript
describe('Complete User Journey', () => {
  it('user can navigate to Database pane and execute query', async () => {
    render(<WorkspaceScreen projectId="test" />);

    // Navigate to database
    fireEvent.click(screen.getByLabelText('Database'));
    await waitFor(() => {
      expect(screen.getByText('Tables')).toBeInTheDocument();
    });

    // Select table
    fireEvent.click(screen.getByText('users'));
    await waitFor(() => {
      expect(screen.getByText('id')).toBeInTheDocument();
    });

    // Execute query
    const queryInput = screen.getByPlaceholderText(/SELECT/);
    fireEvent.change(queryInput, { target: { value: 'SELECT * FROM users' } });
    fireEvent.click(screen.getByText('Run Query'));

    await waitFor(() => {
      expect(screen.getByText(/Results/)).toBeInTheDocument();
    });
  });

  it('user can use Git pane to commit changes', async () => {
    render(<WorkspaceScreen projectId="test" />);

    // Navigate to Git
    fireEvent.click(screen.getByLabelText('Git'));
    await waitFor(() => {
      expect(screen.getByText(/Changes/)).toBeInTheDocument();
    });

    // Stage file
    fireEvent.click(screen.getByLabelText(/Stage/));

    // Enter commit message
    const messageInput = screen.getByPlaceholderText(/commit message/i);
    fireEvent.change(messageInput, { target: { value: 'feat: add feature' } });

    // Commit
    fireEvent.click(screen.getByLabelText('Commit changes'));
    await waitFor(() => {
      expect(mockGitService.commit).toHaveBeenCalled();
    });
  });
});

describe('Error Recovery', () => {
  it('recovers from API failure with retry', async () => {
    // First call fails, second succeeds
    mockApi.storageListTables
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([{ name: 'users' }]);

    render(<DatabasePane {...defaultProps} />);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Click retry
    fireEvent.click(screen.getByText('Retry'));

    // Should recover
    await waitFor(() => {
      expect(screen.getByText('users')).toBeInTheDocument();
    });
  });
});
```

---

## Testing Guidelines

### Test Run Commands
```bash
# Run all mobile tests
npm run test:mobile -- --run

# Run with coverage
npm run test:mobile -- --run --coverage

# Run specific test file
npm run test:mobile -- --run tests/mobile/workspace/panes/DatabasePane.test.tsx

# Run in watch mode
npm run test:mobile -- --watch
```

### Coverage Targets
- Components: 90%+ line coverage
- Hooks: 95%+ line coverage
- Utils: 100% line coverage
- Integration: All user flows covered

---

## Acceptance Criteria

### Per Agent:
- [ ] All existing tests still pass
- [ ] New tests added and passing
- [ ] No regressions introduced
- [ ] TypeScript types complete
- [ ] No console errors

### Overall Phase 4:
- [ ] All 17 skipped tests enabled and passing
- [ ] 90%+ test coverage achieved
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Performance optimizations implemented
- [ ] Error boundaries in place
- [ ] Integration tests covering all user flows
- [ ] Full test suite passes (npm run test:mobile)

---

## Files Summary

### Created by Agents:
- `src/components/mobile/common/ErrorBoundary.tsx`
- `tests/mobile/integration/paneIntegration.test.tsx`
- `tests/mobile/e2e/fullUserJourney.test.tsx`

### Modified by Agents:
- All pane components (accessibility, performance, error handling)
- All pane test files (coverage improvements)
- Hook files (performance optimizations)
- `tests/mobile/integration/apiIntegration.test.tsx` (enable skipped tests)
- `src/lib/mobile/apiErrorHandler.ts` (enhanced error handling)

---

## Command to Verify
```bash
npm run test:mobile -- --run --coverage
```

Expected: All tests pass, 0 skipped, 90%+ coverage.
