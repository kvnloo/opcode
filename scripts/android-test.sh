#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Setup Android SDK paths (from user's bashrc)
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android/sdk}"
export NDK_HOME="${NDK_HOME:-$ANDROID_HOME/ndk/25.2.9519653}"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

# Check for --build flag
BUILD_APK=false
if [[ "$1" == "--build" ]]; then
    BUILD_APK=true
fi

# Phase 1: Device Check
log "🔍 Checking device connection..."
if adb devices 2>/dev/null | grep -q "device$"; then
    CRITERIA[device_connected]=true
    DEVICE_MODEL=$(adb shell getprop ro.product.model 2>/dev/null | tr -d '\r')
    log "Device found: $DEVICE_MODEL"
else
    error "No device connected. Please connect your Android device with USB debugging enabled."
    exit 1
fi

# Phase 2: Build APK (if requested)
APK_PATH="src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk"
if [ "$BUILD_APK" = true ] || [ ! -f "$APK_PATH" ]; then
    log "📦 Building debug APK..."
    if npm run tauri android build -- --debug; then
        CRITERIA[apk_built]=true
        log "APK built successfully"
    else
        error "APK build failed"
        exit 1
    fi
else
    log "📦 Using existing APK"
    CRITERIA[apk_built]=true
fi

# Phase 3: Install APK
if [ -f "$APK_PATH" ]; then
    log "📲 Installing APK..."
    if adb install -r "$APK_PATH" 2>/dev/null; then
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
