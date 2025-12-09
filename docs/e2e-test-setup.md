# E2E Test Setup - Samsung Device Configuration

## Device Information
- **Model**: Samsung SM-S938U
- **UDID**: R5CY93G2WNH
- **Connection**: USB (usb:1-5)

## APK Information
- **Package**: `claudia.asterisk.so`
- **Activity**: `claudia.asterisk.so.MainActivity`
- **Version**: 0.1.0 (versionCode: 1000)
- **APK Path**: `/home/kvn/workspace/evolve/repos/opcode/src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`
- **APK Size**: 353MB
- **Target SDK**: 36 (Android 16)
- **Min SDK**: 24 (Android 7.0)

## Appium Server Status
✅ **Running** on `http://localhost:4723`
- Version: 3.1.2
- Status: Ready to accept connections

## WebdriverIO Configuration Status

### Current Configuration (wdio.conf.ts)
✅ **CORRECT** - All settings match the device and APK:

```typescript
capabilities: [{
  platformName: 'Android',
  'appium:deviceName': 'R5CY93G2WNH', // ✅ Matches connected device
  'appium:app': './src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk', // ✅ Correct path
  'appium:automationName': 'UiAutomator2', // ✅ Standard for Android
  'appium:appPackage': 'claudia.asterisk.so', // ✅ Matches APK package name
  'appium:appActivity': '.MainActivity', // ✅ Matches launchable activity
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 240,
  'appium:autoGrantPermissions': true,
  'appium:chromedriverAutodownload': true, // ✅ For WebView support
}]
```

### Test Specifications Found
✅ **40 test spec files** in `/tests/e2e/android/`:
- Launch and navigation tests
- Workspace functionality tests
- 33 pane-specific tests (Files, Database, API Tester, Logs, etc.)

## Quick Start Guide

### 1. Verify Setup
```bash
# Check device connection
export ANDROID_HOME=/home/kvn/android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
adb devices -l

# Check Appium server
curl -s http://localhost:4723/status
```

### 2. Run Tests
```bash
# Run all E2E tests
npm run wdio

# Run specific test file
npm run wdio -- --spec tests/e2e/android/specs/01-launch.spec.ts
```

### 3. If Appium Needs Restart
```bash
# Stop Appium (if running)
pkill -f appium

# Start Appium with correct Android SDK
export ANDROID_HOME=/home/kvn/android/sdk
appium &
```

## Environment Variables

Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=/home/kvn/android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0
```

## Troubleshooting

### Device Not Found
```bash
# Reconnect device
adb kill-server
adb start-server
adb devices -l
```

### App Not Installing
```bash
# Manually install APK
adb -s R5CY93G2WNH install -r /home/kvn/workspace/evolve/repos/opcode/src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

### Appium Connection Issues
```bash
# Check if port 4723 is in use
lsof -i :4723

# Restart Appium
pkill -f appium
export ANDROID_HOME=/home/kvn/android/sdk && appium &
```

### Test Failures
- Screenshots automatically saved to `./screenshots/` on test failure
- Check Appium logs for detailed error messages
- Verify app is in correct state before test runs

## Test Suite Overview

### Core Tests
1. **01-launch.spec.ts** - App launch and initial state
2. **02-navigation.spec.ts** - Navigation between screens
3. **03-create-screen.spec.ts** - Project creation flow
4. **04-workspace.spec.ts** - Workspace functionality

### Pane Tests (33 tests)
Tests for each workspace pane:
- Files, Database, API Tester, Logs Viewer
- Performance, Extensions, Environment Variables
- Agent, Console, Preview, Git, Shell
- Publishing, Security Scanner, Workflows
- User Settings, Assistant, Share, Analytics
- Metrics, Templates, Secrets, Environment
- Audit Log, Backup

## Configuration Summary

✅ **No changes needed** - Configuration is correct for:
- Device: Samsung SM-S938U (R5CY93G2WNH)
- APK: claudia.asterisk.so (v0.1.0)
- Appium: Running on port 4723
- Tests: 40 spec files ready to run

**Next Step**: Run `npm run wdio` to start testing!
