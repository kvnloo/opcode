# E2E Test Execution Checklist ✅

Use this checklist when running E2E tests to ensure everything is properly set up.

## 📋 Pre-Test Setup

### 1. Device/Emulator Ready
- [ ] Physical device connected OR emulator running
- [ ] USB debugging enabled (physical device)
- [ ] Device appears in `adb devices` output
- [ ] Device ID matches wdio.conf.ts (`R5CY93G2WNH` for Pixel 8a)

```bash
adb devices
# Expected output:
# R5CY93G2WNH    device
```

### 2. APK Built
- [ ] Latest code changes committed
- [ ] APK built successfully
- [ ] APK exists at expected path

```bash
# Build APK
npm run tauri android build

# Verify APK exists
ls -lh src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

### 3. Appium Server Running
- [ ] Appium installed globally (`npm install -g appium`)
- [ ] UiAutomator2 driver installed (`appium driver install uiautomator2`)
- [ ] Appium server started with correct flags
- [ ] Server shows "Appium REST http interface listener started"

```bash
# Start Appium (leave running in separate terminal)
appium --allow-insecure chromedriver_autodownload

# Expected output:
# [Appium] Welcome to Appium v2.x.x
# [Appium] Appium REST http interface listener started on 0.0.0.0:4723
```

### 4. Dependencies Installed
- [ ] Node modules installed
- [ ] WebdriverIO dependencies present

```bash
npm install

# Verify wdio CLI exists
npx wdio --version
```

## 🚀 Running Tests

### All Tests (~5-8 minutes)
```bash
npm run wdio
```
- [ ] Tests start without errors
- [ ] Device screen shows app launching
- [ ] Tests complete with pass/fail summary

### Individual Test Suites

#### 01 - Navigation Flow (~1-2 min)
```bash
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/01-navigation.spec.ts
```
- [ ] 14 test cases execute
- [ ] All navigation tabs tested
- [ ] Screenshots captured

#### 02 - Create Project (~1-2 min)
```bash
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/02-create-project.spec.ts
```
- [ ] 12 test cases execute
- [ ] Demo Project button found
- [ ] Workspace loads successfully

#### 03 - Workspace Panes (~2-3 min)
```bash
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/03-workspace-panes.spec.ts
```
- [ ] 25 test cases execute
- [ ] All 5 panes tested
- [ ] Tools overlay verified

#### 04 - Account Features (~1-2 min)
```bash
npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/04-account.spec.ts
```
- [ ] 17 test cases execute
- [ ] Theme toggle works
- [ ] Profile info displays

## 🎯 Success Criteria

### Test Results
- [ ] All test suites pass (green checkmarks)
- [ ] No "WebView not found" errors
- [ ] No "Element not found" errors
- [ ] No timeouts or crashes
- [ ] Screenshots saved in `./screenshots/`

### Expected Output Pattern
```
01 - Navigation Flow
  Initial State
    ✓ should launch on Apps screen by default
    ✓ should show bottom navigation bar
    ...
  14 passing (1m 23s)

02 - Create Project Flow (Workaround)
  ...
  12 passing (1m 45s)

03 - Workspace Pane Navigation
  ...
  25 passing (2m 18s)

04 - Account Features
  ...
  17 passing (1m 34s)

Total: 68 passing (6m 40s)
```

## 🔍 Verification Steps

### 1. Check Screenshots
```bash
ls -lh screenshots/

# Should see recent screenshots like:
# nav-01-apps-initial_1234567890.png
# create-01-screen-loaded_1234567891.png
# panes-01-console-default_1234567892.png
# account-01-screen-loaded_1234567893.png
```
- [ ] Screenshots captured for each test
- [ ] Screenshots show expected UI states
- [ ] No blank or error screenshots

### 2. Check Device State
```bash
# App should still be running
adb shell dumpsys window | grep -i focus
```
- [ ] App is in foreground
- [ ] No crashes logged
- [ ] Device responsive

### 3. Review Test Logs
- [ ] No uncaught exceptions
- [ ] No JavaScript errors
- [ ] WebView context switching successful
- [ ] All selectors found elements

## ❌ Failure Handling

### If Tests Fail

#### WebView Not Found
1. [ ] Check Appium flags: `--allow-insecure chromedriver_autodownload`
2. [ ] Clear app data: `adb shell pm clear claudia.asterisk.so`
3. [ ] Reinstall APK: `npm run tauri android build`
4. [ ] Restart Appium server

#### Element Not Found
1. [ ] Check if app UI changed (breaking test selectors)
2. [ ] Verify app version matches test expectations
3. [ ] Increase wait timeout in test
4. [ ] Use Appium Inspector to verify selectors

#### App Crashes
1. [ ] Check device logs: `adb logcat | grep -i crash`
2. [ ] Check for memory issues
3. [ ] Clear app data and retry
4. [ ] Check device storage space

#### Timeout Errors
1. [ ] Check network connection (if app loads remote data)
2. [ ] Increase timeout in wdio.conf.ts
3. [ ] Use faster device/emulator
4. [ ] Check for blocking dialogs

## 🎨 Debug Mode

### Run with Verbose Logging
```bash
npx wdio run wdio.conf.ts --logLevel trace --spec tests/e2e/android/specs/01-navigation.spec.ts
```
- [ ] Detailed logs show each step
- [ ] Can identify exact failure point
- [ ] WebDriver commands visible

### Appium Inspector (Manual Verification)
```bash
# Start Appium Inspector
# Point to: http://localhost:4723
# Use capabilities from wdio.conf.ts
```
- [ ] Can manually test selectors
- [ ] Verify element hierarchy
- [ ] Test gestures manually

## 📊 Post-Test Cleanup

### Optional: Clean Up
```bash
# Remove old screenshots
rm screenshots/*

# Clear app data
adb shell pm clear claudia.asterisk.so

# Stop Appium server
pkill -f appium
```

### Save Test Results
- [ ] Screenshot folder backed up (if needed)
- [ ] Test failures documented
- [ ] CI/CD logs saved

## 🔄 Regular Testing Schedule

### Daily (During Active Development)
- [ ] Run navigation tests (quick smoke test)
- [ ] Run affected workflow tests after changes

### Before Each PR
- [ ] Run full test suite
- [ ] Verify all tests pass
- [ ] Check screenshots for visual regressions

### Before Release
- [ ] Run full test suite on multiple devices
- [ ] Manual verification of critical paths
- [ ] Performance benchmarking

## 📚 Quick Reference

**Device ID:** `R5CY93G2WNH` (Pixel 8a)
**App Package:** `claudia.asterisk.so`
**Appium Port:** `4723`
**Test Framework:** Mocha + WebdriverIO
**Total Tests:** 68 test cases across 4 suites
**Execution Time:** ~5-8 minutes (full suite)

---

**Last Updated:** 2025-12-09
**Status:** ✅ Production Ready
