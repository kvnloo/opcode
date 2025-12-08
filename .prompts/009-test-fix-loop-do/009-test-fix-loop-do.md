# Autonomous Test Fix Loop

**Achieve 100% mobile test pass rate through iterative parallel agent execution**

## Objective

Run an autonomous development loop that continuously fixes failing tests until 100% pass rate is achieved. The loop should:
1. Analyze test failures in parallel using maximum agent concurrency
2. Fix both test infrastructure AND update bad/outdated tests as needed
3. Use SPARC orchestration at every iteration step
4. Commit progress incrementally
5. Continue until all 1509 tests pass

## Current State

- **Tests Passing**: 1215/1509 (80.5%)
- **Tests Failing**: 292 (19.4%)
- **Test Files**: 26/55 passing
- **Known Issues**:
  - IntersectionObserver mock needs constructor pattern
  - Component-specific assertion failures
  - 1 intermittent worker crash

## Execution Loop

```
WHILE pass_rate < 100%:
    1. RUN_TESTS → capture failing test files
    2. CATEGORIZE failures into parallel workstreams
    3. SPAWN max agents (one per failing test file or category)
    4. AGENTS analyze and fix in parallel
    5. VALIDATE fixes with targeted test runs
    6. COMMIT successful fixes
    7. REPORT progress and loop
```

## Phase 1: Analyze and Categorize (Every Iteration)

Run the test suite and categorize failures:

```bash
npm run test:mobile -- --run 2>&1 | tee /tmp/test-results.txt
```

Parse results to identify:
- **Total passing/failing counts**
- **List of failing test files**
- **Error categories** (group similar failures)

### Failure Categories to Detect

| Category | Pattern | Fix Strategy |
|----------|---------|--------------|
| Mock missing | `is not a function`, `undefined` | Update setup.ts or add local mock |
| Assertion mismatch | `Expected X, received Y` | Fix test assertion OR fix component |
| Timeout | `exceeded timeout` | Add waitFor or increase timeout |
| Store state | `store is undefined` | Add store mock to setup.ts |
| Component crash | `Cannot read property` | Fix component rendering setup |
| Bad test logic | Test expectations don't match component behavior | UPDATE THE TEST |

## Phase 2: Parallel Agent Spawning

**CRITICAL**: Spawn ALL agents in a SINGLE message for true parallelism.

For each failing test file (or category), spawn a dedicated agent:

```javascript
// IN A SINGLE MESSAGE, spawn up to 10 agents:
Task("Fix tests/mobile/components/X.test.tsx", "...", "tester")
Task("Fix tests/mobile/hooks/Y.test.tsx", "...", "tester")
Task("Fix tests/mobile/screens/Z.test.tsx", "...", "tester")
// ... up to 10 concurrent agents
```

### Agent Instructions Template

Each agent receives:

```markdown
## Task: Fix {test_file}

### Context
- This test file has {N} failing tests
- Error pattern: {category}
- Related component: {component_path}

### Instructions

1. **Read the test file** to understand what's being tested
2. **Read the component** to understand actual behavior
3. **Analyze the failure**:
   - Is the test wrong? (outdated, incorrect assertions, bad mocks)
   - Is the component wrong? (bug in implementation)
   - Is the test infrastructure wrong? (missing mocks in setup.ts)

4. **Fix appropriately**:
   - If test is bad → UPDATE THE TEST to match component behavior
   - If mock is missing → Add to setup.ts or locally
   - If component has bug → Fix the component (rare for test-only work)

5. **Verify fix**: Run just this test file
   ```bash
   npm run test:mobile -- --run {test_file}
   ```

6. **Report results**: Pass/fail count, what was changed

### Rules
- PREFER fixing tests over components (tests may be outdated)
- DO NOT skip or remove tests unless truly invalid
- DO NOT modify component behavior unless it's clearly broken
- ALWAYS verify your fix before reporting success
```

## Phase 3: Validation and Commit

After agents complete:

1. **Run full test suite** to verify no regressions
2. **If improved**: Commit with message format:
   ```
   fix(tests): improve pass rate to X% (N/1509)

   - Fixed: [list of fixed test files]
   - Changes: [brief description]
   ```
3. **If regression**: Revert and re-analyze

## Phase 4: Loop Control

### Continue Condition
```python
while pass_rate < 100%:
    iteration += 1
    execute_fix_cycle()
```

### Exit Conditions
- **Success**: 100% pass rate achieved (1509/1509)
- **Stall**: 3 consecutive iterations with no improvement
- **Error**: Critical infrastructure failure

### Progress Tracking

Maintain in `.prompts/009-test-fix-loop-do/progress.md`:

```markdown
# Test Fix Progress

| Iteration | Pass Rate | Tests Fixed | Files Changed |
|-----------|-----------|-------------|---------------|
| 1         | 80.5%     | 0           | (baseline)    |
| 2         | 85%       | +68         | 5 files       |
| ...       | ...       | ...         | ...           |
```

## Agent Configuration

### Maximum Concurrency
- Spawn up to **10 agents** per iteration
- Group small test files together if > 10 failing files
- Prioritize files with most failures first

### Agent Types to Use
- `tester` - Primary agent for test analysis and fixes
- `code-analyzer` - For complex component analysis
- `reviewer` - For validating fix quality

## Test Fix Strategies

### Strategy 1: Update Assertions
When test expects wrong value:
```typescript
// Before (wrong expectation)
expect(screen.getByText('Old Text')).toBeInTheDocument();

// After (matches actual component)
expect(screen.getByText('New Text')).toBeInTheDocument();
```

### Strategy 2: Add Missing Mocks
When mock is incomplete:
```typescript
// Add to test file or setup.ts
vi.mock('@/stores/someStore', () => ({
  useSomeStore: vi.fn(() => ({ value: 'test' }))
}));
```

### Strategy 3: Fix Async Handling
When timing issues occur:
```typescript
// Before
expect(element).toBeInTheDocument();

// After
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

### Strategy 4: Skip Unskippable Tests
When test is fundamentally broken (LAST RESORT):
```typescript
it.skip('test that cannot work in JSDOM', () => {
  // Document why skipped
});
```

## Output

Create SUMMARY.md at `.prompts/009-test-fix-loop-do/SUMMARY.md` after each iteration with:

- Current pass rate
- Tests fixed this iteration
- Remaining failures by category
- Next iteration plan

## Success Criteria

- [ ] 100% pass rate (1509/1509 tests)
- [ ] All changes committed
- [ ] No test skips (unless documented and justified)
- [ ] TypeScript still passing
- [ ] SUMMARY.md updated with final stats

## Execution Command

```bash
/run-prompt 009
```

## Notes

- This is an AUTONOMOUS LOOP - it will keep running until success or stall
- Maximum 20 iterations before requiring human intervention
- Each iteration should improve by at least 1% to avoid stall detection
- Commit after each successful iteration for safety
