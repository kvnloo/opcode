# E2E Test Suite - User Workflow Automation

This directory contains Appium/WebdriverIO E2E tests that automate manual testing workflows for the mobile app.

## 🎯 Test Coverage

### 01 - Navigation Flow (`01-navigation.spec.ts`)
Tests basic bottom navigation between screens:
- ✅ Launch on Apps screen (default)
- ✅ Navigate to Create screen
- ✅ Navigate to Account screen
- ✅ Return to Apps screen
- ✅ Rapid tab switching stability
- ✅ Navigation state persistence

### 02 - Create Project Flow (`02-create-project.spec.ts`)
Tests the Demo Project button workaround (temporary):
- ✅ Display Create screen
- ✅ Show Demo Project button (orange warning button)
- ✅ Load demo project on tap
- ✅ Navigate to workspace automatically
- ✅ Verify workspace loaded with project
- ✅ Return to Apps screen

### 03 - Workspace Pane Navigation (`03-workspace-panes.spec.ts`)
Tests all workspace pane navigation:
- ✅ Console pane (default)
- ✅ Agent pane (purple icon)
- ✅ Deploy pane (green icon)
- ✅ Share pane (orange icon)
- ✅ Preview pane (pink icon)
- ✅ Tools overlay (9+ tools visible)
- ✅ Rapid pane switching
- ✅ Pane state persistence

### 04 - Account Features (`04-account.spec.ts`)
Tests Account screen functionality:
- ✅ Display profile information
- ✅ Show account status/tier
- ✅ Theme toggle functionality
- ✅ Theme persistence across navigation
- ✅ Settings sections
- ✅ Account actions
- ✅ Accessibility features

## 🚀 Setup

### Prerequisites

1. **Appium Server** (v2.x)
   ```bash
   npm install -g appium
   appium driver install uiautomator2
   ```

2. **Android Device**
   - Physical device: Pixel 8a (ID: `R5CY93G2WNH`)
   - OR Android emulator
   - USB debugging enabled
   - Device connected: `adb devices`

3. **Build APK**
   ```bash
   npm run tauri android build
   # APK: ./src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
   ```

### Dependencies

Already installed in `package.json`:
- `@wdio/cli` - WebdriverIO test runner
- `@wdio/local-runner` - Local test execution
- `@wdio/mocha-framework` - Mocha test framework
- `@wdio/spec-reporter` - Test output reporter
- `expect-webdriverio` - Assertions library
- `webdriverio` - WebDriver protocol client

## 🎮 Running Tests

### Start Appium Server

Terminal 1:
```bash
appium --allow-insecure chromedriver_autodownload
```

**Important flags:**
- `--allow-insecure chromedriver_autodownload` - Required for Tauri WebView automation

### Run All Tests

Terminal 2:
```bash
npm run wdio
```

### Run Specific Test Suite

```bash
# Navigation only
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/01-navigation.spec.ts

# Create project flow
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/02-create-project.spec.ts

# Workspace panes
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/03-workspace-panes.spec.ts

# Account features
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/04-account.spec.ts
```

### Debug Mode

```bash
# Run with debug logging
npx wdio run wdio.conf.ts --logLevel trace
```

## 📸 Screenshots

Tests automatically capture screenshots:
- ✅ After each major step
- ✅ On test failures
- ✅ Location: `./screenshots/`

Screenshot naming: `{test-name}_{step}_{timestamp}.png`

## 🔧 Configuration

### Device Configuration (`wdio.conf.ts`)

```javascript
capabilities: [{
  platformName: 'Android',
  'appium:deviceName': 'R5CY93G2WNH', // Your device ID
  'appium:app': './path/to/app.apk',
  'appium:automationName': 'UiAutomator2',
  'appium:appPackage': 'claudia.asterisk.so',
  'appium:appActivity': '.MainActivity',
  'appium:chromedriverAutodownload': true, // For WebView
}]
```

### Use Different Device

Edit `wdio.conf.ts`:
```javascript
'appium:deviceName': 'YOUR_DEVICE_ID', // Run: adb devices
```

Or use emulator:
```javascript
'appium:deviceName': 'emulator-5554',
'appium:avd': 'Pixel_8a_API_34', // Your AVD name
```

## 📊 Test Architecture

### Page Object Model

Tests use the Page Object pattern for maintainability:

**`pageobjects/home.page.ts`**
- Bottom navigation selectors
- Apps screen elements
- Navigation methods

**`pageobjects/workspace.page.ts`**
- Workspace toolbar
- Pane navigation
- Tools overlay
- Pane state verification

**`pageobjects/create.page.ts`**
- Template selection
- Project creation flow
- Demo Project button

**`pageobjects/common.page.ts`**
- Loading states
- Error handling
- Modals

### Helper Functions

**`helpers/assertions.ts`**
- `waitForWebViewReady()` - Switch to Tauri WebView context
- `expectVisible()` - Wait for element and verify visibility
- `expectScreenshot()` - Capture screenshot with timestamp
- Custom assertions for common patterns

## 🐛 Troubleshooting

### WebView Not Found

**Error:** "WebView context not available"

**Solution:**
1. Ensure Appium started with `--allow-insecure chromedriver_autodownload`
2. Check WebView is enabled in app
3. Wait longer: increase timeout in `waitForWebViewReady(60000)`

### Element Not Found

**Error:** "Element not found" or "Cannot read selector"

**Solutions:**
1. Check element exists in current context (WebView vs Native)
2. Increase wait timeout
3. Verify selector using Appium Inspector
4. Check if element is in viewport (scroll may be needed)

### App Crashes

1. Check device logs: `adb logcat`
2. Clear app data: `adb shell pm clear claudia.asterisk.so`
3. Reinstall APK: `npm run tauri android build`
4. Check for memory issues on device

### Slow Tests

1. Reduce `browser.pause()` durations
2. Use `waitForDisplayed()` instead of fixed pauses
3. Enable parallel execution (careful with state)
4. Use faster device/emulator

### Screenshots Not Saving

1. Create screenshots directory: `mkdir -p screenshots`
2. Check write permissions
3. Verify path in `wdio.conf.ts` afterTest hook

## 📈 Test Metrics

Current test suite:
- **4 test files**
- **~50 test cases**
- **Full workflow coverage**
- **Execution time:** ~5-8 minutes (full suite)

Individual test times:
- Navigation: ~1-2 minutes
- Create Project: ~1-2 minutes
- Workspace Panes: ~2-3 minutes
- Account: ~1-2 minutes

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Start Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          target: google_apis
          arch: x86_64
          script: |
            npm run tauri android build
            npm run wdio
```

## 🎯 Future Improvements

### Planned Tests
- [ ] Full project creation flow (when fixed)
- [ ] File operations in workspace
- [ ] Git operations
- [ ] Deploy workflows
- [ ] Search functionality
- [ ] Settings modifications

### Optimizations
- [ ] Parallel test execution
- [ ] Visual regression testing
- [ ] Performance benchmarks
- [ ] Network condition testing
- [ ] Deep link testing

## 📚 Resources

- [WebdriverIO Docs](https://webdriver.io/docs/gettingstarted)
- [Appium Docs](https://appium.io/docs/en/latest/)
- [Tauri Mobile](https://tauri.app/v1/guides/building/android)
- [Page Object Pattern](https://webdriver.io/docs/pageobjects)

## 🤝 Contributing

When adding new tests:

1. **Create page object** if needed
2. **Add test file** in `specs/` directory
3. **Use naming convention:** `NN-description.spec.ts`
4. **Add screenshots** at key steps
5. **Update this README** with test coverage
6. **Verify tests pass** before committing

### Test Structure

```typescript
describe('Test Suite Name', () => {
  before(async () => {
    // Setup: navigate to test starting point
  });

  describe('Feature Section', () => {
    it('should verify specific behavior', async () => {
      // Arrange
      // Act
      // Assert
      await expectScreenshot('step-name');
    });
  });

  after(async () => {
    // Cleanup
  });
});
```

---

**Last Updated:** 2025-12-09
**Maintainer:** Development Team
**Status:** ✅ Active
