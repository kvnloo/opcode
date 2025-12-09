# E2E Tests - Quick Start Guide

## 🚀 Run Tests in 3 Steps

### 1. Start Appium Server

```bash
appium --allow-insecure chromedriver_autodownload
```

Leave this terminal running.

### 2. Connect Device & Build APK

```bash
# Check device connected
adb devices
# Should show: R5CY93G2WNH    device

# Build APK (if needed)
npm run tauri android build
```

### 3. Run Tests

```bash
# All tests
npm run wdio

# Single test
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/01-navigation.spec.ts
```

## 📋 Test Suites

| Test | Description | Time |
|------|-------------|------|
| `01-navigation.spec.ts` | Bottom nav flow | ~1-2 min |
| `02-create-project.spec.ts` | Demo project workaround | ~1-2 min |
| `03-workspace-panes.spec.ts` | All pane navigation | ~2-3 min |
| `04-account.spec.ts` | Account features | ~1-2 min |

## 🔧 Quick Fixes

**Tests fail to start?**
```bash
# Kill existing Appium
pkill -f appium

# Start fresh
appium --allow-insecure chromedriver_autodownload
```

**WebView not found?**
```bash
# Check contexts
adb shell dumpsys webview

# Clear app data
adb shell pm clear claudia.asterisk.so

# Reinstall
npm run tauri android build
```

**Device not found?**
```bash
# List devices
adb devices

# Update device ID in wdio.conf.ts
'appium:deviceName': 'YOUR_DEVICE_ID'
```

## 📸 Screenshots

Check test results:
```bash
ls -lh screenshots/
```

## 🎯 What These Tests Cover

### ✅ User Workflows Automated:

1. **Navigation** - Apps → Create → Account → Apps
2. **Demo Project** - Create → Load Demo → Workspace
3. **Workspace Panes** - Console, Agent, Deploy, Share, Preview
4. **Tools Overlay** - Open, view 9+ tools, close
5. **Account** - Profile info, theme toggle

### 🚧 Not Yet Tested (Manual Still):

- Full project creation (broken, using workaround)
- File operations
- Git operations
- Deploy workflows
- Complex multi-screen flows

## 📚 Full Documentation

See [README-E2E-TESTS.md](./README-E2E-TESTS.md) for:
- Complete setup guide
- Troubleshooting
- CI/CD integration
- Contributing guidelines
- Test architecture details

---

**Happy Testing! 🧪**
