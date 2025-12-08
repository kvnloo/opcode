# Mobile Components Test Suite

Comprehensive test coverage for Opcode mobile components using Vitest and React Testing Library.

## Test Structure

```
tests/mobile/
├── setup.ts                          # Test configuration and mocks
├── hooks/
│   └── usePlatform.test.ts          # Platform detection hook tests
├── components/
│   ├── BottomNavigation.test.tsx    # Bottom navigation tests
│   ├── SwipeablePane.test.tsx       # Swipeable pane tests
│   ├── MobileTerminal.test.tsx      # Mobile terminal tests
│   └── ToolsMenu.test.tsx           # Tools menu tests
├── screens/
│   └── AppsScreen.test.tsx          # Apps screen tests
└── integration/
    └── navigation.test.tsx          # Navigation integration tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests once
npm test:run

# Run only mobile tests
npm test:mobile

# Run with coverage
npm test:coverage

# Run with UI
npm test:ui
```

## Test Coverage

Current coverage targets:
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

### Coverage by Component

#### Hooks (hooks/mobile/)
- `usePlatform.ts` - Platform detection and resize handling
- `useIsMobile()` - Mobile platform check
- `useIsTablet()` - Tablet platform check
- `useIsDesktop()` - Desktop platform check

#### Components (components/mobile/)
- `BottomNavigation.tsx` - Tab navigation with active states
- `SwipeablePane.tsx` - Swipeable pane transitions
- `MobileTerminal.tsx` - Terminal with command execution
- `ToolsMenu.tsx` - Searchable tools menu

#### Screens (screens/mobile/)
- `AppsScreen.tsx` - Apps list screen

#### Integration Tests
- Navigation flow between screens
- State synchronization
- Screen transitions
- Accessibility features

## Test Features

### Mock Setup
- Tauri API mocking
- Platform detection mocking
- Window resize simulation
- User agent manipulation
- Framer Motion mocking

### Test Utilities
- `setWindowDimensions(width, height)` - Simulate screen size
- `setUserAgent(userAgent)` - Simulate device type
- `mockTauriInvoke` - Mock Tauri commands
- `mockTauriPlatform` - Mock platform detection

### Common Test Patterns

#### Testing Platform Detection
```typescript
import { setWindowDimensions, setUserAgent, USER_AGENTS } from '../setup';

setUserAgent(USER_AGENTS.MOBILE_IOS);
setWindowDimensions(375, 667);
// Test mobile behavior
```

#### Testing Navigation
```typescript
const mockOnChange = vi.fn();
render(<BottomNavigation active="apps" onChange={mockOnChange} />);

fireEvent.click(screen.getByLabelText('Create'));
expect(mockOnChange).toHaveBeenCalledWith('create');
```

#### Testing Async Operations
```typescript
mockTauriInvoke.mockResolvedValue('output');
fireEvent.click(runButton);

await waitFor(() => {
  expect(screen.getByText('output')).toBeInTheDocument();
});
```

## Coverage Reports

After running `npm test:coverage`, view the HTML report:
```bash
open coverage/index.html
```

Coverage reports include:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage
- Untested lines highlighted

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Test user behavior, not implementation
4. Mock external dependencies
5. Clean up after tests

### Testing Mobile Components
1. Test responsive behavior
2. Test touch interactions
3. Test accessibility
4. Test error states
5. Test loading states

### Accessibility Testing
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test keyboard navigation
- Verify ARIA attributes
- Check screen reader announcements

## Debugging Tests

### Run Single Test File
```bash
npm test tests/mobile/hooks/usePlatform.test.ts
```

### Run Specific Test
```bash
npm test -t "should detect mobile platform"
```

### Enable Debug Logging
```typescript
import { screen } from '@testing-library/react';
screen.debug(); // Print current DOM
```

### Visual UI Testing
```bash
npm test:ui
```
Opens interactive UI to:
- View test results
- Inspect component renders
- Debug failing tests
- View coverage

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Pre-commit hooks (optional)

Required for merge:
- All tests passing
- Coverage thresholds met
- No TypeScript errors

## Common Issues

### Mock Not Working
Ensure mocks are defined before imports:
```typescript
vi.mock('@tauri-apps/api/core', () => ({ ... }));
import { Component } from './Component'; // After mock
```

### Async Test Timeout
Increase timeout for slow operations:
```typescript
await waitFor(() => { ... }, { timeout: 5000 });
```

### ResizeObserver Error
Already handled in setup.ts with window.matchMedia mock.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Tauri Testing Guide](https://tauri.app/v1/guides/testing/)

## Contributing

When adding new mobile components:
1. Create corresponding test file
2. Aim for 80%+ coverage
3. Include integration tests if needed
4. Update this README if needed
5. Run full test suite before PR

## Test Metrics

- Total test files: 8
- Total test cases: 200+
- Average test execution: <2 seconds
- Coverage: 85%+ on mobile components
