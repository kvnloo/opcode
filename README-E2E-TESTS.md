# E2E Testing Quick Reference

## ✅ Configuration Status: READY TO TEST

Your WebdriverIO/Appium configuration is **completely set up** for the Samsung SM-S938U device.

### Current Setup
- ✅ Device: Samsung SM-S938U (R5CY93G2WNH) connected
- ✅ Appium: Running on http://localhost:4723
- ✅ APK: claudia.asterisk.so v0.1.0 (353MB)
- ✅ Config: wdio.conf.ts correctly configured
- ✅ Tests: 40 test specs ready

### Quick Commands

```bash
# Run all tests
npm run wdio

# Run using the convenience script
./scripts/run-e2e-tests.sh

# Run specific test
./scripts/run-e2e-tests.sh --spec tests/e2e/android/specs/01-launch.spec.ts

# Run test suites
./scripts/run-e2e-tests.sh --suite core    # Core functionality tests
./scripts/run-e2e-tests.sh --suite panes   # All pane tests
./scripts/run-e2e-tests.sh --suite launch  # Just launch test
```

### Test Organization

**Core Tests** (4 tests):
- `01-launch.spec.ts` - App launch verification
- `02-navigation.spec.ts` - Screen navigation
- `03-create-screen.spec.ts` - Project creation
- `04-workspace.spec.ts` - Workspace features

**Pane Tests** (33 tests):
- Files, Database, API Tester, Logs
- Performance, Extensions, Environment
- Agent, Console, Preview, Git, Shell
- Publishing, Security, Workflows
- Settings, Assistant, Share, Analytics
- Metrics, Templates, Secrets, Audit
- Backup, and more...

### Troubleshooting

#### Device Not Found
```bash
adb kill-server && adb start-server
adb devices -l
```

#### Appium Not Running
```bash
export ANDROID_HOME=/home/kvn/android/sdk
appium &
```

#### Test Failures
- Check `./screenshots/` for failure screenshots
- Review Appium logs for detailed errors
- Verify app state before running tests

### Configuration Files

- **wdio.conf.ts** - Main WebdriverIO configuration
- **tests/e2e/android/** - Test specifications and helpers
- **scripts/run-e2e-tests.sh** - Convenient test runner
- **docs/e2e-test-setup.md** - Detailed setup documentation

### Advanced Usage

#### Run with custom timeout
```bash
npm run wdio -- --mochaTimeout 180000
```

#### Run with debug output
```bash
npm run wdio -- --logLevel trace
```

#### Run specific page object tests
```bash
npm run wdio -- --spec "tests/e2e/android/specs/panes/*.spec.ts"
```

### CI/CD Integration

GitHub Actions workflow available at:
`.github/workflows/e2e-android.yml`

This workflow:
- Builds Android APK
- Sets up Appium and Android emulator
- Runs E2E tests
- Uploads screenshots on failure

### Next Steps

1. **Run a quick test**: `./scripts/run-e2e-tests.sh --suite launch`
2. **Review results**: Check console output and screenshots
3. **Run full suite**: `./scripts/run-e2e-tests.sh`
4. **Iterate on failures**: Fix issues and re-run specific tests

### Package Scripts

From `package.json`:
```json
{
  "test:android": "./scripts/android-test.sh",
  "test:android:build": "./scripts/android-test.sh --build",
  "wdio": "wdio run wdio.conf.ts"
}
```

### Environment Setup

Add to your shell profile (~/.bashrc or ~/.zshrc):
```bash
export ANDROID_HOME=/home/kvn/android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0
```

### Documentation

- **Full Setup Guide**: `docs/e2e-test-setup.md`
- **Test Runner**: `scripts/run-e2e-tests.sh`
- **WebdriverIO Config**: `wdio.conf.ts`

---

**Ready to test!** Start with: `./scripts/run-e2e-tests.sh --suite launch`
