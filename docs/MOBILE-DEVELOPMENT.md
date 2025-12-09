# Mobile Development Guide

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ (for Tauri)
- **Android Studio** (for Android builds)
- **Xcode** (for iOS builds, macOS only)
- **Tailscale** account for VPN connectivity

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourorg/opcode.git
cd opcode

# Install dependencies
npm install

# Install Tauri CLI
npm install -g @tauri-apps/cli

# Start development server
npm run dev

# Run in Tauri (desktop preview)
npm run tauri dev
```

## Android Development

### Setup Android Environment

1. **Install Android Studio** from https://developer.android.com/studio

2. **Install Android SDK and NDK**:
   ```bash
   # Open Android Studio
   # Go to: Preferences > Appearance & Behavior > System Settings > Android SDK
   # Install SDK Platform for API 33+
   # Install NDK (Side by side) version 25+
   ```

3. **Set environment variables**:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/emulator
   ```

4. **Accept Android licenses**:
   ```bash
   $ANDROID_HOME/tools/bin/sdkmanager --licenses
   ```

### Initialize Android Project

First time only:
```bash
npm run tauri android init
```

This creates the `src-tauri/gen/android` directory with Android project files.

### Development Build

```bash
# Start dev server + Android emulator
npm run tauri android dev

# Or specify device
npm run tauri android dev --device pixel_6_pro
```

### Production Build

```bash
# Debug APK
npm run tauri android build --debug

# Release APK (requires signing key)
npm run tauri android build --release

# Output: src-tauri/gen/android/app/build/outputs/apk/
```

### APK Signing (Release Builds)

1. **Generate signing key**:
   ```bash
   keytool -genkey -v \
     -keystore opcode-release.keystore \
     -alias opcode \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000
   ```

2. **Configure signing in `src-tauri/tauri.conf.json`**:
   ```json
   {
     "bundle": {
       "android": {
         "signing": {
           "storeFile": "/path/to/opcode-release.keystore",
           "storePassword": "YOUR_PASSWORD",
           "keyAlias": "opcode",
           "keyPassword": "YOUR_PASSWORD"
         }
       }
     }
   }
   ```

### Testing on Physical Device

1. **Enable Developer Options** on Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

3. **Connect device and verify**:
   ```bash
   adb devices
   # Should show your device
   ```

4. **Run on device**:
   ```bash
   npm run tauri android dev --device <device-id>
   ```

## iOS Development

### Setup iOS Environment (macOS Only)

1. **Install Xcode** from App Store

2. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```

3. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

### Initialize iOS Project

First time only:
```bash
npm run tauri ios init
```

This creates the `src-tauri/gen/ios` directory with Xcode project.

### Development Build

```bash
# Start dev server + iOS simulator
npm run tauri ios dev

# Specify simulator
npm run tauri ios dev --device "iPhone 14 Pro"
```

### Production Build

```bash
# Debug build
npm run tauri ios build --debug

# Release build (requires signing certificates)
npm run tauri ios build --release

# Output: src-tauri/gen/ios/build/
```

### Code Signing (Release Builds)

1. **Enroll in Apple Developer Program** ($99/year)

2. **Create App ID** in Apple Developer portal

3. **Generate certificates and provisioning profiles**

4. **Configure in Xcode**:
   - Open `src-tauri/gen/ios/opcode.xcodeproj`
   - Select target > Signing & Capabilities
   - Enable "Automatically manage signing"
   - Select your team

### Testing on Physical Device

1. **Connect iPhone/iPad via USB**

2. **Trust computer** on device (popup will appear)

3. **Run on device**:
   ```bash
   npm run tauri ios dev --device "Your iPhone Name"
   ```

4. **Trust developer** on device:
   - Go to Settings > General > VPN & Device Management
   - Trust your developer certificate

## Testing Strategy

### Unit Tests

Test individual components in isolation using Vitest and React Testing Library.

**Run tests**:
```bash
npm run test              # Run all tests
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode
```

**Current Coverage**: 80.5% (1215/1509 tests passing)

**Writing unit tests**:
```typescript
// tests/mobile/components/common/HapticButton.test.tsx
import { render, fireEvent, screen } from '@testing-library/react'
import { HapticButton } from '@/components/mobile/common/HapticButton'

test('provides haptic feedback on press', async () => {
  const onPress = vi.fn()
  render(<HapticButton onPress={onPress}>Click Me</HapticButton>)

  const button = screen.getByRole('button', { name: 'Click Me' })
  fireEvent.press(button)

  expect(onPress).toHaveBeenCalledTimes(1)
  expect(Haptics.impact).toHaveBeenCalledWith('light')
})
```

**Test organization**:
```
tests/
├── mobile/
│   ├── components/      # Component tests
│   │   ├── common/
│   │   ├── workspace/
│   │   └── connection/
│   ├── hooks/          # Hook tests
│   ├── integration/    # Feature integration tests
│   └── workspace/      # Workspace-specific tests
└── setup.ts            # Test setup and mocks
```

### Integration Tests

Test feature workflows that span multiple components.

**Example integration test**:
```typescript
// tests/mobile/integration/workspaceNavigation.test.tsx
test('user can navigate from project list to file viewer', async () => {
  const { store } = renderWithStore(<WorkspaceScreen />)

  // Wait for projects to load
  await waitFor(() => {
    expect(screen.getByText('my-project')).toBeInTheDocument()
  })

  // Select project
  fireEvent.press(screen.getByText('my-project'))

  // Verify file tree appears
  expect(screen.getByText('src/index.ts')).toBeInTheDocument()

  // Open file
  fireEvent.press(screen.getByText('src/index.ts'))

  // Verify code viewer shows content
  expect(store.getState().selectedFile?.path).toBe('src/index.ts')
})
```

### E2E Tests (Planned)

End-to-end tests on real devices using Appium.

**Setup Appium**:
```bash
npm install -g appium
npm install -g appium-doctor

# Verify setup
appium-doctor --android
appium-doctor --ios
```

**Example E2E test**:
```typescript
// e2e/workspace.test.ts
describe('Workspace Flow', () => {
  it('should connect and execute command', async () => {
    // Launch app
    await driver.launchApp()

    // Navigate to workspace
    await $('~Workspace').click()

    // Verify connection status
    const status = await $('~connection-status').getText()
    expect(status).toBe('Connected')

    // Execute command
    await $('~command-input').setValue('/sparc:coder "build auth"')
    await $('~execute-button').click()

    // Wait for execution
    await $('~execution-status=Running').waitForExist()
    await $('~execution-status=Completed').waitForExist({ timeout: 60000 })
  })
})
```

## Build Scripts

### Package.json Scripts

```json
{
  "scripts": {
    // Development
    "dev": "vite",
    "tauri": "tauri",

    // Building
    "build": "tsc && vite build",
    "preview": "vite preview",

    // Testing
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",

    // Linting
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",

    // Type checking
    "typecheck": "tsc --noEmit",
    "check": "tsc --noEmit && cd src-tauri && cargo check"
  }
}
```

## Known Issues and Workarounds

### 1. Tailscale Connection Drops on Background

**Issue**: Connection drops when app goes to background on iOS.

**Workaround**:
```typescript
// Reconnect on app resume
import { listen } from '@tauri-apps/api/event'

listen('resume', () => {
  connectionStore.connect()
})
```

**Status**: Investigating background mode entitlements.

### 2. Virtual List Performance on Android

**Issue**: VirtualList stutters on low-end Android devices.

**Workaround**:
```typescript
// Reduce render batch size
<VirtualList
  items={files}
  itemHeight={48}
  overscan={3}  // Reduce from default 5
  renderBatchSize={10}  // Reduce from default 20
/>
```

**Status**: Considering react-window alternative.

### 3. SSH File Browser Timeout

**Issue**: Large directories timeout after 30s.

**Workaround**:
```typescript
// Increase timeout and use streaming
const files = await ssh.readdir(path, {
  timeout: 60000,
  streaming: true,  // Load incrementally
  maxDepth: 2       // Limit recursion
})
```

**Status**: Working on pagination solution.

### 4. Test Coverage for Integration Tests

**Issue**: Integration tests have lower coverage (65%) compared to unit tests (85%).

**Workaround**:
- Focus on critical user paths
- Use test IDs for better selection
- Mock external dependencies consistently

**Status**: Adding more integration test cases.

### 5. iOS Keyboard Pushes Content Off Screen

**Issue**: Virtual keyboard covers input fields.

**Workaround**:
```typescript
// Adjust content padding
const { keyboardHeight } = useKeyboardHeight()

<View style={{ paddingBottom: keyboardHeight }}>
  <Input />
</View>
```

**Status**: Investigating KeyboardAvoidingView alternative.

## Development Workflow

### Daily Development

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Run tests in watch mode**:
   ```bash
   npm run test:watch
   ```

3. **Type check**:
   ```bash
   npm run typecheck
   ```

4. **Lint and fix**:
   ```bash
   npm run lint:fix
   ```

### Before Committing

```bash
# Run full check
npm run typecheck && npm run lint && npm run test
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Performance Profiling

### React DevTools Profiler

```bash
# Install React DevTools
npm install -g react-devtools

# Connect to app
react-devtools
```

### Tauri Performance Monitoring

```typescript
import { performance } from '@tauri-apps/api/performance'

// Measure operation
const start = performance.now()
await heavyOperation()
const duration = performance.now() - start

console.log(`Operation took ${duration}ms`)
```

### Memory Profiling

```typescript
// Check memory usage
if (performance.memory) {
  console.log('Memory:', {
    used: performance.memory.usedJSHeapSize / 1048576,
    total: performance.memory.totalJSHeapSize / 1048576,
    limit: performance.memory.jsHeapSizeLimit / 1048576
  })
}
```

## Debugging

### Enable Verbose Logging

```typescript
// src/lib/logger.ts
export const logger = {
  debug: (...args) => {
    if (import.meta.env.DEV) {
      console.log('[DEBUG]', ...args)
    }
  },
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
}
```

### Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware'

export const useWorkspaceStore = create(
  devtools(
    (set) => ({
      // state
    }),
    { name: 'workspace', enabled: import.meta.env.DEV }
  )
)
```

### Tauri Debug Console

Access web inspector in development builds:
```bash
# Android
npm run tauri android dev --debug

# iOS
npm run tauri ios dev --debug

# Desktop (auto-opens DevTools)
npm run tauri dev
```

### Network Debugging

Use Charles Proxy or Proxyman to inspect HTTP traffic:
```bash
# Set proxy in app
export HTTP_PROXY=http://localhost:8888
export HTTPS_PROXY=http://localhost:8888
```

## Optimization Tips

### 1. Reduce Bundle Size

```bash
# Analyze bundle
npm run build
npx vite-bundle-visualizer

# Code split by route
const WorkspaceScreen = lazy(() => import('./WorkspaceScreen'))
```

### 2. Optimize Images

```typescript
// Use WebP format
import imageUrl from './image.webp'

// Lazy load images
<img loading="lazy" src={imageUrl} />
```

### 3. Minimize Re-renders

```typescript
// Use selectors
const projects = useWorkspaceStore(s => s.projects)

// Not entire store
const store = useWorkspaceStore() // ❌
```

### 4. Virtualize Long Lists

```typescript
<VirtualList
  items={largeArray}
  itemHeight={48}
  renderItem={renderItem}
/>
```

## Deployment

### Android Play Store

1. Build release APK
2. Sign APK with release key
3. Upload to Play Console
4. Submit for review

### iOS App Store

1. Archive app in Xcode
2. Upload to App Store Connect
3. Submit for review

### Over-the-Air Updates (Planned)

Using Tauri updater:
```typescript
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'

const update = await checkUpdate()
if (update.shouldUpdate) {
  await installUpdate()
  await relaunch()
}
```

## Resources

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join community discussions
- **Stack Overflow**: Tag questions with `opcode-mobile`
- **Documentation**: Check docs/ directory for guides
