# Mobile Development Setup Guide

This guide covers setting up your development environment for Opcode mobile development.

## Prerequisites

### Required Tools

1. **Bun** (JavaScript runtime)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Rust** (for Tauri backend)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. **Tauri CLI with Mobile Support**
   ```bash
   cargo install tauri-cli --version "^2.0.0" --locked
   ```

### Platform-Specific Requirements

#### Android Development

**Android Studio**
- Download from: https://developer.android.com/studio
- Install Android SDK (API level 33 or higher)
- Install Android NDK (version 25.2.9519653 recommended)

**Android SDK Setup**
```bash
# Set environment variables in ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Install Required Android Components**
```bash
sdkmanager "platforms;android-33" "build-tools;33.0.0" "ndk;25.2.9519653"
```

**Configure Android Targets**
```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

#### iOS Development (macOS only)

**Xcode**
- Install from Mac App Store (version 14.0 or later)
- Accept license: `sudo xcodebuild -license accept`

**Xcode Command Line Tools**
```bash
xcode-select --install
```

**CocoaPods**
```bash
sudo gem install cocoapods
```

**Configure iOS Targets**
```bash
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
```

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/opcode.git
cd opcode
git checkout feature/mobile
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Initialize Tauri Mobile
```bash
# Initialize Android
cargo tauri android init

# Initialize iOS (macOS only)
cargo tauri ios init
```

## Running Development Builds

### Android

**Start Development Server**
```bash
# In one terminal
bun run dev
```

**Run on Android Emulator**
```bash
# Create emulator if needed
avdmanager create avd -n Pixel_6_API_33 -k "system-images;android-33;google_apis;x86_64"

# Start emulator
emulator -avd Pixel_6_API_33

# In another terminal, run app
cargo tauri android dev
```

**Run on Physical Device**
```bash
# Enable USB debugging on device
# Connect via USB
adb devices  # Verify device is connected

cargo tauri android dev
```

### iOS (macOS only)

**Start Development Server**
```bash
bun run dev
```

**Run on iOS Simulator**
```bash
# List available simulators
xcrun simctl list devices

# Run on simulator
cargo tauri ios dev
```

**Run on Physical Device**
```bash
# Connect device via USB
# Trust computer on device

cargo tauri ios dev --device
```

## Building for Production

### Android APK/AAB

**Debug Build**
```bash
cargo tauri android build --debug
```

**Release Build**
```bash
# Generate signing key (first time only)
keytool -genkey -v -keystore opcode-release.keystore -alias opcode -keyalg RSA -keysize 2048 -validity 10000

# Build release
cargo tauri android build --release
```

Output location: `src-tauri/gen/android/app/build/outputs/`

### iOS IPA

**Debug Build**
```bash
cargo tauri ios build --debug
```

**Release Build**
```bash
# Requires Apple Developer account and provisioning profile
cargo tauri ios build --release
```

Output location: `src-tauri/gen/ios/build/`

## Common Issues and Troubleshooting

### Android Issues

**Issue: NDK not found**
```
Error: Android NDK not found
```

**Solution:**
```bash
# Verify NDK_HOME is set
echo $NDK_HOME

# Reinstall NDK if needed
sdkmanager --install "ndk;25.2.9519653"
```

**Issue: Emulator not starting**
```
Error: emulator: ERROR: x86 emulation currently requires hardware acceleration
```

**Solution (Linux):**
```bash
# Install KVM
sudo apt install qemu-kvm

# Add user to kvm group
sudo usermod -a -G kvm $USER
```

**Issue: Build fails with "SDK location not found"**

**Solution:**
Create `src-tauri/gen/android/local.properties`:
```
sdk.dir=/path/to/Android/Sdk
ndk.dir=/path/to/Android/Sdk/ndk/25.2.9519653
```

### iOS Issues

**Issue: CocoaPods not found**
```
Error: CocoaPods not installed
```

**Solution:**
```bash
sudo gem install cocoapods
pod setup
```

**Issue: "Unable to boot device" in simulator**

**Solution:**
```bash
# Reset simulator
xcrun simctl erase all

# Restart CoreSimulatorService
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
```

**Issue: Code signing error**

**Solution:**
1. Open `src-tauri/gen/ios/opcode.xcodeproj` in Xcode
2. Select project → Signing & Capabilities
3. Set Team and Bundle Identifier
4. Enable "Automatically manage signing"

### General Issues

**Issue: Port 1420 already in use**
```
Error: Address already in use (os error 98)
```

**Solution:**
```bash
# Find and kill process using port 1420
lsof -ti:1420 | xargs kill -9

# Or use different port in tauri.conf.json
```

**Issue: Hot reload not working**

**Solution:**
```bash
# Clear Tauri cache
rm -rf src-tauri/target

# Restart dev server
bun run dev
cargo tauri android dev
```

**Issue: TypeScript errors in mobile components**

**Solution:**
```bash
# Regenerate types
bun run typecheck

# Clear Bun cache
rm -rf node_modules/.cache
```

## Development Tips

### Fast Iteration
- Use web preview for UI work: `bun run dev` and open http://localhost:1420
- Test mobile-specific features on emulator/simulator
- Use browser DevTools for debugging web layer

### Debugging
```bash
# Android logs
adb logcat | grep -i tauri

# iOS logs
xcrun simctl spawn booted log stream --predicate 'process == "opcode"'
```

### Performance Profiling
```bash
# Android profiler
cargo tauri android dev --features devtools

# iOS profiler (Xcode Instruments)
open src-tauri/gen/ios/opcode.xcodeproj
# Product → Profile
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the mobile architecture
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- Check out the example components in `src/mobile/`

## Resources

- [Tauri Mobile Docs](https://tauri.app/v2/guides/building/mobile/)
- [Android Developer Guides](https://developer.android.com/guide)
- [iOS Developer Guides](https://developer.apple.com/documentation/)
- [Opcode Desktop Setup](../SETUP.md)
