# Autonomous Appium E2E Testing Suite - Do Prompt

<objective>
Implement a complete, fully operational Appium E2E testing suite for Opcode Mobile on a connected Android device.

Purpose: Enable real-device testing of the Tauri 2.x mobile app with comprehensive coverage of all 61 components, 18+ panes, and 5 main screens.

Output: Production-ready E2E test infrastructure that runs on physical Android devices with 100% test pass rate.

AUTONOMOUS MODE: This prompt is designed to run without human intervention until ALL success criteria are met.
</objective>

<context>
## Project State
- **Framework**: Tauri 2.x mobile (fully configured for Android)
- **Android Config**: minSdk 24, targetSdk 34, app ID: `com.opcode.mobile`
- **Existing Tests**: 2032 Vitest tests (JSDOM-based, browser simulation)
- **Gap**: No on-device testing infrastructure

## Reference Files
@src/components/mobile/workspace/panes/*.tsx - All 18+ pane components
@src/components/mobile/common/*.tsx - Shared mobile components
@src/components/mobile/screens/*.tsx - Main screen components
@src-tauri/gen/android/ - Android build configuration
@package.json - Project dependencies

## Connected Device
- USB debugging enabled
- Android device connected via ADB
- Ready for APK installation and test execution
</context>

<requirements>
## Functional Requirements
1. Install and configure Appium with UiAutomator2 driver
2. Install WebDriverIO with all necessary dependencies
3. Build debug APK using Tauri Android toolchain
4. Create comprehensive Page Object Model (POM) architecture
5. Implement test specs for ALL screens and panes
6. Create automation script for one-command execution

## Quality Requirements
- 100% test pass rate on all implemented specs
- No ANR (Application Not Responding) during tests
- All 18+ tool panes must render correctly
- Tests must be stable and repeatable

## Technical Constraints
- Local execution only (no CI/CD)
- Use existing project structure under tests/e2e/android/
- Must integrate with existing npm scripts
</requirements>

<dependency_graph>
## Execution Order Analysis

### SEQUENTIAL DEPENDENCIES (Must execute in order)
```
[P1.S1] Verify Device → [P1.S2] Install Appium → [P1.S3] Build APK
                                    ↓
[P2] Create wdio.conf.ts (requires Appium installed)
                                    ↓
[P5] Automation Script (requires all test files)
```

### PARALLEL OPPORTUNITIES (Can execute concurrently)
```
PARALLEL_BLOCK_1 (after P1.S2 completes):
├── [P3.H] Helpers: gestures.ts, assertions.ts
├── [P3.P1] PageObject: home.page.ts
├── [P3.P2] PageObject: create.page.ts
├── [P3.P3] PageObject: workspace.page.ts
└── [P3.P4] PageObject: common.page.ts

PARALLEL_BLOCK_2 (after page objects complete):
├── [P4.S1] Spec: 01-launch.spec.ts
├── [P4.S2] Spec: 02-navigation.spec.ts
├── [P4.S3] Spec: 03-create-screen.spec.ts
└── [P4.S4] Spec: 04-workspace.spec.ts

PARALLEL_BLOCK_3 (after workspace spec):
├── [P4.S5] Spec: 05-tools-overlay.spec.ts
├── [P4.S6] Spec: 06-connection.spec.ts
└── [P4.S7] Spec: 07-account.spec.ts

PARALLEL_BLOCK_4 (pane specs - all concurrent):
├── agent-pane.spec.ts
├── console-pane.spec.ts
├── preview-pane.spec.ts
├── git-pane.spec.ts
├── shell-pane.spec.ts
├── publishing-pane.spec.ts
├── security-scanner.spec.ts
├── workflows-pane.spec.ts
├── user-settings.spec.ts
├── assistant-pane.spec.ts
├── share-pane.spec.ts
├── analytics-pane.spec.ts
├── metrics-pane.spec.ts
├── templates-pane.spec.ts
├── secrets-pane.spec.ts
├── environment-pane.spec.ts
├── audit-log-pane.spec.ts
└── backup-pane.spec.ts
```
</dependency_graph>

<orchestration>
## SPARC Orchestrator Configuration

Use `/sparc:orchestrator` with the following 6-agent configuration:

```yaml
orchestrator_config:
  max_agents: 6
  topology: "mesh"
  strategy: "adaptive"

agents:
  - id: "env-setup"
    type: "coder"
    role: "Environment & Infrastructure"
    tasks:
      - Verify ADB device connection
      - Install Appium globally
      - Install UiAutomator2 driver
      - Install WebDriverIO dependencies
      - Build debug APK
      - Create wdio.conf.ts

  - id: "page-objects"
    type: "coder"
    role: "Page Object Model Author"
    tasks:
      - Create home.page.ts
      - Create create.page.ts
      - Create workspace.page.ts
      - Create common.page.ts
    dependencies: ["env-setup:appium-installed"]

  - id: "helpers"
    type: "coder"
    role: "Test Utilities Author"
    tasks:
      - Create gestures.ts helper
      - Create assertions.ts helper
    dependencies: ["env-setup:appium-installed"]

  - id: "core-specs"
    type: "tester"
    role: "Core Test Spec Author"
    tasks:
      - Create 01-launch.spec.ts
      - Create 02-navigation.spec.ts
      - Create 03-create-screen.spec.ts
      - Create 04-workspace.spec.ts
      - Create 05-tools-overlay.spec.ts
      - Create 06-connection.spec.ts
      - Create 07-account.spec.ts
    dependencies: ["page-objects:complete", "helpers:complete"]

  - id: "pane-specs"
    type: "tester"
    role: "Pane Test Spec Author"
    tasks:
      - Create all 18+ pane spec files
    dependencies: ["page-objects:workspace.page.ts"]

  - id: "automation"
    type: "coder"
    role: "Automation & Integration"
    tasks:
      - Create scripts/android-test.sh
      - Update package.json with test:android script
      - Run full test suite
      - Validate all success criteria
    dependencies: ["core-specs:complete", "pane-specs:complete"]
```
</orchestration>

<convergence_loop>
## Autonomous Execution Protocol

```python
# CONVERGENCE LOOP - Execute until ALL criteria pass
success_criteria = {
    "device_connected": False,
    "apk_installs": False,
    "app_launches": False,
    "main_screens_accessible": False,  # 5 screens: Home, Create, Workspace, Connection, Account
    "tool_panes_render": False,         # All 18+ panes
    "tools_overlay_works": False,
    "connection_manager_status": False,
    "no_anr": False,
    "test_suite_passes": False          # 100% pass rate
}

iteration = 0
max_iterations = 10

while not all(success_criteria.values()) and iteration < max_iterations:
    iteration += 1
    log(f"=== CONVERGENCE ITERATION {iteration} ===")

    # Phase 1: Environment (if not complete)
    if not success_criteria["device_connected"]:
        run_phase("environment_setup")
        success_criteria["device_connected"] = verify_adb_connection()

    if not success_criteria["apk_installs"]:
        run_phase("build_apk")
        success_criteria["apk_installs"] = verify_apk_install()

    # Phase 2-4: Test Infrastructure (parallel where possible)
    if success_criteria["apk_installs"] and not success_criteria["test_suite_passes"]:
        # Create/fix any missing test files
        ensure_test_infrastructure()

        # Run full test suite
        test_results = run_tests()

        # Update criteria based on results
        success_criteria["app_launches"] = test_results.get("launch", False)
        success_criteria["main_screens_accessible"] = test_results.get("navigation", False)
        success_criteria["tool_panes_render"] = test_results.get("panes", False)
        success_criteria["tools_overlay_works"] = test_results.get("overlay", False)
        success_criteria["connection_manager_status"] = test_results.get("connection", False)
        success_criteria["no_anr"] = test_results.get("no_anr", False)
        success_criteria["test_suite_passes"] = test_results.get("all_pass", False)

        # If tests fail, analyze and fix
        if not success_criteria["test_suite_passes"]:
            failures = analyze_failures(test_results)
            for failure in failures:
                fix_failure(failure)  # Auto-remediate test issues

    log_criteria_status(success_criteria)

if all(success_criteria.values()):
    log("✅ ALL SUCCESS CRITERIA MET - CONVERGENCE ACHIEVED")
    create_summary()
else:
    log("⚠️ MAX ITERATIONS REACHED - Manual review needed")
    report_remaining_issues(success_criteria)
```

## Failure Auto-Remediation Strategies

```yaml
remediation_patterns:
  device_not_found:
    detection: "adb devices returns empty"
    actions:
      - "Wait 10s and retry"
      - "Prompt user if still fails after 3 retries"

  apk_build_fail:
    detection: "tauri android build fails"
    actions:
      - "Check Android SDK installation"
      - "Verify ANDROID_HOME environment"
      - "Clean and rebuild: cargo clean && npm run tauri android build"

  appium_not_installed:
    detection: "appium command not found"
    actions:
      - "npm install -g appium"
      - "appium driver install uiautomator2"

  test_timeout:
    detection: "Test exceeded timeout"
    actions:
      - "Increase timeout in wdio.conf.ts"
      - "Add explicit waits in failing spec"

  element_not_found:
    detection: "Element not found exception"
    actions:
      - "Update selector in page object"
      - "Add waitForDisplayed before interaction"
      - "Check if element exists in component source"

  app_crash:
    detection: "ANR or crash detected"
    actions:
      - "Capture logcat output"
      - "Restart app and retry"
      - "Flag for manual investigation if persistent"
```
</convergence_loop>

<implementation>
## Detailed Implementation Specifications

### Phase 1: Environment Setup

#### Step 1.1: Device Verification
```bash
# Setup Android SDK paths (from user's bashrc)
export ANDROID_HOME=$HOME/android/sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

# Verify device is connected and ready
adb devices
# Expected output: Lists device with "device" status

# Get device info for configuration
adb shell getprop ro.build.version.sdk  # API level
adb shell getprop ro.product.model      # Device model
```

#### Step 1.2: Appium Installation
```bash
# Global Appium installation
npm install -g appium@latest

# UiAutomator2 driver for Android
appium driver install uiautomator2

# Verify installation
appium --version
appium driver list
```

#### Step 1.3: WebDriverIO Dependencies
```bash
npm install -D @wdio/cli@latest
npm install -D @wdio/local-runner
npm install -D @wdio/mocha-framework
npm install -D @wdio/spec-reporter
npm install -D @wdio/appium-service
npm install -D webdriverio
npm install -D expect-webdriverio
npm install -D ts-node
npm install -D @types/mocha
```

#### Step 1.4: Build Debug APK
```bash
npm run tauri android build -- --debug
# Output: src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk
```

### Phase 2: Configuration

#### wdio.conf.ts
```typescript
import type { Options } from '@wdio/types';

export const config: Options.Testrunner = {
  runner: 'local',
  port: 4723,
  specs: ['./tests/e2e/android/**/*.spec.ts'],
  exclude: [],
  maxInstances: 1,

  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Android Device',
    'appium:app': './src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk',
    'appium:automationName': 'UiAutomator2',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 240,
    'appium:autoGrantPermissions': true,
  }],

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [['appium', {
    args: {
      allowInsecure: ['chromedriver_autodownload'],
    },
  }]],

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  // Hooks for convergence tracking
  afterTest: async function(test, context, { error, result, duration, passed, retries }) {
    if (!passed) {
      // Capture screenshot on failure
      await browser.saveScreenshot(`./screenshots/${test.title.replace(/\s/g, '_')}_${Date.now()}.png`);
    }
  },
};
```

### Phase 3: Page Objects

Each page object follows this pattern:
```typescript
// Example: home.page.ts
class HomePage {
  get appGrid() { return $('android=new UiSelector().resourceId("app-grid")'); }
  get projectCards() { return $$('android=new UiSelector().className("project-card")'); }
  get emptyState() { return $('android=new UiSelector().text("No projects yet")'); }
  get createButton() { return $('android=new UiSelector().description("Create project")'); }

  async waitForLoaded() {
    await this.appGrid.waitForDisplayed({ timeout: 30000 });
  }

  async getProjectCount() {
    return (await this.projectCards).length;
  }

  async tapCreateProject() {
    await this.createButton.click();
  }
}
export default new HomePage();
```

### Phase 4: Test Specs

Each spec follows this pattern:
```typescript
// Example: 01-launch.spec.ts
import HomePage from '../pageobjects/home.page';
import { expect } from 'expect-webdriverio';

describe('App Launch', () => {
  it('should launch without crash', async () => {
    // App is automatically launched by Appium
    await expect(browser).toHaveTitle(/Opcode/);
  });

  it('should display home screen', async () => {
    await HomePage.waitForLoaded();
    await expect(HomePage.appGrid).toBeDisplayed();
  });

  it('should show create button', async () => {
    await expect(HomePage.createButton).toBeDisplayed();
  });
});
```

### Phase 5: Automation Script

#### scripts/android-test.sh
```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Success criteria tracking
declare -A CRITERIA
CRITERIA[device_connected]=false
CRITERIA[apk_built]=false
CRITERIA[apk_installed]=false
CRITERIA[appium_running]=false
CRITERIA[tests_passed]=false

check_criteria() {
    local all_passed=true
    echo ""
    log "=== SUCCESS CRITERIA STATUS ==="
    for key in "${!CRITERIA[@]}"; do
        if [ "${CRITERIA[$key]}" = true ]; then
            echo -e "  ✅ $key"
        else
            echo -e "  ❌ $key"
            all_passed=false
        fi
    done
    echo ""
    $all_passed
}

# Phase 1: Device Check
log "🔍 Checking device connection..."
if adb devices | grep -q "device$"; then
    CRITERIA[device_connected]=true
    DEVICE_MODEL=$(adb shell getprop ro.product.model | tr -d '\r')
    log "Device found: $DEVICE_MODEL"
else
    error "No device connected. Please connect your Android device with USB debugging enabled."
    exit 1
fi

# Phase 2: Build APK
log "📦 Building debug APK..."
if npm run tauri android build -- --debug; then
    CRITERIA[apk_built]=true
    log "APK built successfully"
else
    error "APK build failed"
    exit 1
fi

# Phase 3: Install APK
APK_PATH="src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    log "📲 Installing APK..."
    if adb install -r "$APK_PATH"; then
        CRITERIA[apk_installed]=true
        log "APK installed successfully"
    else
        error "APK installation failed"
        exit 1
    fi
else
    error "APK not found at $APK_PATH"
    exit 1
fi

# Phase 4: Start Appium
log "🚀 Starting Appium server..."
appium --allow-insecure chromedriver_autodownload &
APPIUM_PID=$!
sleep 5

if kill -0 $APPIUM_PID 2>/dev/null; then
    CRITERIA[appium_running]=true
    log "Appium server started (PID: $APPIUM_PID)"
else
    error "Appium server failed to start"
    exit 1
fi

# Cleanup function
cleanup() {
    log "🛑 Cleaning up..."
    if [ -n "$APPIUM_PID" ]; then
        kill $APPIUM_PID 2>/dev/null || true
    fi
}
trap cleanup EXIT

# Phase 5: Run Tests
log "🧪 Running E2E tests..."
mkdir -p screenshots

if npx wdio run wdio.conf.ts; then
    CRITERIA[tests_passed]=true
    log "All tests passed!"
else
    warn "Some tests failed. Check output above."
fi

# Final Status
echo ""
log "=== FINAL RESULTS ==="
if check_criteria; then
    echo -e "${GREEN}✅ ALL SUCCESS CRITERIA MET${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME CRITERIA NOT MET${NC}"
    exit 1
fi
```
</implementation>

<output>
## Files to Create

### Directory Structure
```
tests/e2e/android/
├── specs/
│   ├── 01-launch.spec.ts
│   ├── 02-navigation.spec.ts
│   ├── 03-create-screen.spec.ts
│   ├── 04-workspace.spec.ts
│   ├── 05-tools-overlay.spec.ts
│   ├── 06-connection.spec.ts
│   ├── 07-account.spec.ts
│   └── panes/
│       ├── agent-pane.spec.ts
│       ├── console-pane.spec.ts
│       ├── preview-pane.spec.ts
│       ├── git-pane.spec.ts
│       ├── shell-pane.spec.ts
│       ├── publishing-pane.spec.ts
│       ├── security-scanner.spec.ts
│       ├── workflows-pane.spec.ts
│       ├── user-settings.spec.ts
│       ├── assistant-pane.spec.ts
│       ├── share-pane.spec.ts
│       ├── analytics-pane.spec.ts
│       ├── metrics-pane.spec.ts
│       ├── templates-pane.spec.ts
│       ├── secrets-pane.spec.ts
│       ├── environment-pane.spec.ts
│       ├── audit-log-pane.spec.ts
│       └── backup-pane.spec.ts
├── pageobjects/
│   ├── home.page.ts
│   ├── create.page.ts
│   ├── workspace.page.ts
│   └── common.page.ts
└── helpers/
    ├── gestures.ts
    └── assertions.ts

wdio.conf.ts                    # WebDriverIO configuration
scripts/android-test.sh         # Automation script
screenshots/                    # Test failure screenshots
```

### Package.json Updates
```json
{
  "scripts": {
    "test:android": "./scripts/android-test.sh",
    "test:android:quick": "npx wdio run wdio.conf.ts --spec tests/e2e/android/specs/01-launch.spec.ts"
  }
}
```
</output>

<verification>
## Verification Protocol

### Per-Phase Verification

#### Phase 1 Verification
```bash
# Device connected?
adb devices | grep -q "device$" && echo "✅ Device" || echo "❌ Device"

# Appium installed?
appium --version && echo "✅ Appium" || echo "❌ Appium"

# UiAutomator2 driver?
appium driver list | grep -q "uiautomator2" && echo "✅ Driver" || echo "❌ Driver"

# APK built?
[ -f "src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk" ] && echo "✅ APK" || echo "❌ APK"
```

#### Phase 2 Verification
```bash
# Config exists?
[ -f "wdio.conf.ts" ] && echo "✅ Config" || echo "❌ Config"

# TypeScript compiles?
npx tsc --noEmit wdio.conf.ts && echo "✅ Types" || echo "❌ Types"
```

#### Phase 3-4 Verification
```bash
# Count test files
SPEC_COUNT=$(find tests/e2e/android/specs -name "*.spec.ts" | wc -l)
echo "Spec files: $SPEC_COUNT (expected: 25+)"

# Count page objects
PO_COUNT=$(find tests/e2e/android/pageobjects -name "*.page.ts" | wc -l)
echo "Page objects: $PO_COUNT (expected: 4)"
```

#### Full Suite Verification
```bash
# Run complete test suite
npm run test:android

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ ALL TESTS PASSED"
else
    echo "❌ SOME TESTS FAILED"
fi
```
</verification>

<success_criteria>
## Success Criteria Checklist

All criteria must be TRUE for convergence:

- [ ] **device_connected**: `adb devices` shows device with "device" status
- [ ] **apk_installs**: APK installs without error on physical device
- [ ] **app_launches**: App launches and displays splash/home screen
- [ ] **main_screens_accessible**: All 5 main screens navigable (Home, Create, Workspace, Connection, Account)
- [ ] **tool_panes_render**: All 18+ tool panes load and render correctly
- [ ] **tools_overlay_works**: Tools overlay opens/closes properly
- [ ] **connection_manager_status**: Connection manager shows proper status indicators
- [ ] **no_anr**: No ANR (Application Not Responding) dialogs during tests
- [ ] **test_suite_passes**: `npm run test:android` exits with code 0 (100% pass rate)

## Convergence Exit Condition

```
EXIT when: ALL(success_criteria) == TRUE
   OR when: iterations >= 10 (escalate to human)
```
</success_criteria>

<summary_requirements>
Create `.prompts/015-appium-e2e-do/completed/SUMMARY.md` upon convergence.

Include:
- Total files created with paths
- Test count and pass rate
- Time taken for full execution
- Any issues encountered and resolutions
- Screenshots of test execution (if available)
- Next recommended steps (production release, CI/CD integration)
</summary_requirements>

<execution_command>
## To Execute This Prompt

```bash
# Use SPARC orchestrator with 6 agents
/sparc:orchestrator --agents 6 --topology mesh --task "Execute .prompts/015-appium-e2e-do/015-appium-e2e-do.md"
```

Or run the convergence loop directly:
```bash
# Manual execution
./scripts/android-test.sh

# With retry on failure
while ! ./scripts/android-test.sh; do
    echo "Retrying in 30 seconds..."
    sleep 30
done
```
</execution_command>
