#!/bin/bash
# E2E Test Runner for Samsung Device
# Device: SM-S938U (R5CY93G2WNH)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Claudia Mobile E2E Tests - Samsung SM-S938U${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""

# Set Android SDK path
export ANDROID_HOME=/home/kvn/android/sdk
export ANDROID_SDK_ROOT=/home/kvn/android/sdk
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0:$PATH

# 1. Check device connection
echo -e "${YELLOW}[1/5] Checking device connection...${NC}"
if ! adb devices | grep -q "R5CY93G2WNH"; then
    echo -e "${RED}❌ Device R5CY93G2WNH not found!${NC}"
    echo "Please connect the Samsung device via USB"
    exit 1
fi
echo -e "${GREEN}✅ Device connected: R5CY93G2WNH${NC}"
echo ""

# 2. Check Appium server
echo -e "${YELLOW}[2/5] Checking Appium server...${NC}"
if ! curl -s http://localhost:4723/status > /dev/null 2>&1; then
    echo -e "${RED}❌ Appium server not running!${NC}"
    echo "Starting Appium server..."
    appium &
    sleep 5
    if ! curl -s http://localhost:4723/status > /dev/null 2>&1; then
        echo -e "${RED}❌ Failed to start Appium server${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Appium server running on port 4723${NC}"
echo ""

# 3. Verify APK exists
echo -e "${YELLOW}[3/5] Verifying APK...${NC}"
APK_PATH="./src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}❌ APK not found at: $APK_PATH${NC}"
    echo "Please build the Android app first"
    exit 1
fi
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo -e "${GREEN}✅ APK found ($APK_SIZE): $APK_PATH${NC}"
echo ""

# 4. Create screenshots directory
echo -e "${YELLOW}[4/5] Preparing test environment...${NC}"
mkdir -p ./screenshots
echo -e "${GREEN}✅ Screenshots directory ready${NC}"
echo ""

# 5. Run tests
echo -e "${YELLOW}[5/5] Running E2E tests...${NC}"
echo ""

# Parse command line arguments
TEST_SPEC=""
if [ "$1" == "--spec" ] && [ -n "$2" ]; then
    TEST_SPEC="--spec $2"
    echo -e "${GREEN}Running specific test: $2${NC}"
elif [ "$1" == "--suite" ] && [ -n "$2" ]; then
    case "$2" in
        "core")
            TEST_SPEC="--spec tests/e2e/android/specs/0*.spec.ts"
            echo -e "${GREEN}Running core test suite${NC}"
            ;;
        "panes")
            TEST_SPEC="--spec tests/e2e/android/specs/panes/*.spec.ts"
            echo -e "${GREEN}Running panes test suite${NC}"
            ;;
        "launch")
            TEST_SPEC="--spec tests/e2e/android/specs/01-launch.spec.ts"
            echo -e "${GREEN}Running launch test only${NC}"
            ;;
        *)
            echo -e "${RED}Unknown suite: $2${NC}"
            echo "Available suites: core, panes, launch"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}Running all E2E tests${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""

# Run WebdriverIO
npm run wdio -- $TEST_SPEC

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ All tests passed!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
else
    echo ""
    echo -e "${RED}═══════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ❌ Some tests failed${NC}"
    echo -e "${RED}  Check screenshots in ./screenshots/ directory${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════${NC}"
    exit 1
fi
