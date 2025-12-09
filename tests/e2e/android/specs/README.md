# E2E Test Specifications - Android

Comprehensive Appium test specifications for the Tauri mobile app on Android.

## Test Structure

All tests use:
- **Mocha** test framework (describe/it)
- **expect-webdriverio** for assertions
- **WebdriverIO** driver for automation
- Page objects from `../pageobjects/` (to be implemented)

## Test Files

### 01-launch.spec.ts
**App Launch Tests** - Verifies basic app startup and initial screen

Tests:
- ✅ should launch without crash
- ✅ should display home screen
- ✅ should show create button
- ✅ should have bottom navigation visible

### 02-navigation.spec.ts
**Navigation Tests** - Validates tab navigation and state management

Tests:
- ✅ should navigate to all bottom tabs
- ✅ should show active state on current tab
- ✅ should maintain state when switching tabs

### 03-create-screen.spec.ts
**Project Creation Flow** - Tests new project creation workflow

Tests:
- ✅ should open create screen from home
- ✅ should show project name input
- ✅ should show template options
- ✅ should validate empty project name
- ✅ should create new project successfully

### 04-workspace.spec.ts
**Workspace Screen Tests** - Validates workspace layout and navigation

Tests:
- ✅ should display workspace header
- ✅ should show 5 bottom tabs (Agent, Console, Preview, Git, Shell)
- ✅ should switch between workspace tabs
- ✅ should display tools button

### 05-tools-overlay.spec.ts
**Tools Overlay Tests** - Tests tools/panes selection overlay

Tests:
- ✅ should open tools overlay on button tap
- ✅ should display all tool pane options
- ✅ should close overlay on backdrop tap
- ✅ should navigate to selected tool pane
- ✅ should support scrolling through tool options

### 06-connection.spec.ts
**Connection Manager Tests** - Validates connection mode switching

Tests:
- ✅ should display connection status
- ✅ should show Tailscale option
- ✅ should show Claude Web Connect option
- ✅ should allow switching between connection modes
- ✅ should display connection quality indicator
- ✅ should show reconnect option when disconnected
- ✅ should persist connection settings

### 07-account.spec.ts
**Account Screen Tests** - Tests user account and settings

Tests:
- ✅ should display user profile area
- ✅ should show settings option
- ✅ should show logout option
- ✅ should navigate to settings when tapped
- ✅ should show logout confirmation dialog
- ✅ should display account info sections
- ✅ should show app version information
- ✅ should allow navigation back to other tabs
- ✅ should display theme/appearance settings

## Element Locators

Tests use accessibility identifiers with the `~` prefix:

### Main Navigation
- `~bottom-navigation` - Bottom navigation bar
- `~nav-apps` - Apps tab
- `~nav-create` - Create tab
- `~nav-account` - Account tab

### Screens
- `~apps-screen` - Apps/home screen
- `~create-screen` - Project creation screen
- `~workspace-screen` - Workspace screen
- `~account-screen` - Account screen

### Workspace
- `~workspace-header` - Workspace header
- `~workspace-bottom-nav` - Workspace tab navigation
- `~workspace-tab-agent` - Agent pane tab
- `~workspace-tab-console` - Console pane tab
- `~workspace-tab-preview` - Preview pane tab
- `~workspace-tab-git` - Git pane tab
- `~workspace-tab-shell` - Shell pane tab

### Tools Overlay
- `~tools-button` - Tools overlay button
- `~tools-overlay` - Tools overlay container
- `~tools-overlay-backdrop` - Backdrop for dismissing
- `~tool-option-{name}` - Individual tool options

### Connection
- `~connection-button` - Connection settings button
- `~connection-status` - Connection status indicator
- `~connection-tailscale` - Tailscale option
- `~connection-claude-web` - Claude Web Connect option

### Account
- `~account-profile` - User profile section
- `~account-settings` - Settings option
- `~account-logout` - Logout option

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e:android

# Run specific spec file
npx wdio run wdio.conf.js --spec tests/e2e/android/specs/01-launch.spec.ts

# Run with specific device
npx wdio run wdio.conf.js --device "Pixel 7"
```

## Test Requirements

1. **Android Device/Emulator**
   - Android 10+ recommended
   - ARM64 or x86_64 architecture
   - Minimum 4GB RAM

2. **Appium Server**
   - Appium 2.0+
   - UiAutomator2 driver installed
   - Running on port 4723

3. **App Build**
   - Debug APK installed on device
   - Accessibility identifiers enabled

## Best Practices

1. **Wait Times**: Use explicit waits with `driver.pause()` after actions
2. **Element Selection**: Prefer accessibility identifiers over XPath
3. **Test Independence**: Each test should be runnable independently
4. **Cleanup**: Tests should not leave app in unexpected state
5. **Assertions**: Use expect-webdriverio matchers for better error messages

## Next Steps

1. Create page object models in `../pageobjects/`
2. Implement helper utilities in `../helpers/`
3. Add WebdriverIO configuration file (`wdio.conf.ts`)
4. Set up CI/CD pipeline for automated test execution
5. Add screenshot capture on test failure
6. Implement test retry logic for flaky tests

## Notes

- Tests assume English locale
- Some tests require existing projects or will create test projects
- Connection tests may require network connectivity
- Logout tests cancel the action to preserve session
