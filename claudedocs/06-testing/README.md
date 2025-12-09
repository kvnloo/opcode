# Testing Documentation

Test strategies, coverage, and reports.

## Purpose

This folder contains all testing-related documentation including strategies, reports, and visual evidence.

## Structure

- `general/` - General testing guides and strategies
- `integration-tests/` - Integration test documentation
- `reports/` - Test execution reports and summaries
- `visual-evidence/` - Screenshots and visual regression tests

## Contents

Place testing docs here:

- **Test Strategies** - Overall testing approach
- **Test Plans** - Specific test planning docs
- **Coverage Reports** - Test coverage analysis
- **Bug Reports** - Issue documentation
- **Visual Tests** - Screenshot comparisons

## Running Tests

```bash
# Run all tests
npm run test

# Run integration tests
npm run test:integration

# Run visual regression tests
npm run test:visual

# Run performance tests
npm run perf:test
```

## Test Quality Standards

- All tests must be deterministic (no flaky tests)
- Visual regression tolerance: ≤5% pixel difference
- Performance tests must use averaged measurements
- Edge cases must have explicit test coverage

## Guidelines

- Date all test reports
- Include pass/fail metrics
- Archive old reports periodically
- Link screenshots to test cases

## Related Documentation

- **Implementation:** [../05-implementation/](../05-implementation/)
- **Operations:** [../07-operations/](../07-operations/)

---

[← Back to Documentation Home](../00-index/)
