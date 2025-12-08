# Contributing to Opcode

Thank you for your interest in contributing to Opcode! This guide will help you get started with contributing to our cross-platform AI development environment.

## Table of Contents

- [Getting Started](#getting-started)
- [Mobile Development](#mobile-development)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Community](#community)

## Getting Started

Before contributing, please:

1. **Check existing issues and PRs**: Avoid duplicating efforts by reviewing [open issues](https://github.com/getAsterisk/opcode/issues) and pull requests
2. **Fork the repository**: Create your own fork of the Opcode repository
3. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/opcode.git`
4. **Set up your development environment**: Follow the instructions below

### Development Setup

#### Prerequisites

- **Bun** (latest): JavaScript runtime and package manager
- **Rust** (1.70.0+): Required for Tauri backend
- **Git**: Version control

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
cargo install tauri-cli --version "^2.0.0" --locked
```

#### Desktop Development

```bash
# Clone and install
cd opcode
bun install

# Run development server
bun run tauri dev
```

## Mobile Development

Opcode supports both Android and iOS platforms. Here's how to set up mobile development:

### Android Setup

#### Prerequisites

1. **Android Studio**: Download from [developer.android.com](https://developer.android.com/studio)
2. **Android SDK** (API level 33+)
3. **Android NDK** (25.2.9519653 recommended)

#### Environment Configuration

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Add Android Targets

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

#### Initialize and Run

```bash
# Initialize Android project (first time only)
cargo tauri android init

# Start development server (terminal 1)
bun run dev

# Run on emulator or device (terminal 2)
cargo tauri android dev

# Build release APK
cargo tauri android build --apk
```

### iOS Setup (macOS only)

#### Prerequisites

1. **Xcode** (14.0+): Download from App Store
2. **Xcode Command Line Tools**
3. **CocoaPods**: Dependency manager for iOS

#### Installation

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Add iOS targets
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
```

#### Initialize and Run

```bash
# Initialize iOS project (first time only)
cargo tauri ios init

# Start development server (terminal 1)
bun run dev

# Run on simulator (terminal 2)
cargo tauri ios dev

# Open in Xcode (for code signing configuration)
open src-tauri/gen/apple/opcode.xcodeproj
```

### Testing on Devices

#### Android Physical Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Run `cargo tauri android dev` (device will be auto-detected)

#### iOS Physical Device

1. Register your device in Apple Developer Portal
2. Configure code signing in Xcode
3. Connect via USB
4. Select your device in Xcode and run

### Mobile Debugging Tips

- **Chrome DevTools**: Use for web debugging (`chrome://inspect` for Android)
- **Safari Web Inspector**: Use for iOS debugging (Develop > Simulator)
- **Console Logs**: Check Tauri console output in terminal
- **React DevTools**: Install mobile browser extension for component inspection

## Code Standards

### TypeScript Style Guide

- **Naming Conventions**:
  - Components: PascalCase (`MobileLayout`, `ChatScreen`)
  - Hooks: camelCase with `use` prefix (`usePlatform`, `useOrientation`)
  - Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
  - Functions: camelCase (`handleSubmit`, `formatDate`)

- **File Organization**:
  - One component per file
  - Co-locate tests with source files
  - Group related files in feature directories

- **React Patterns**:
  - Prefer functional components with hooks
  - Use TypeScript interfaces for props
  - Implement proper error boundaries
  - Memoize expensive computations with `useMemo`

```typescript
// Good component example
interface ChatScreenProps {
  conversationId: string;
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatScreen({ conversationId, onSendMessage }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const platform = usePlatform();

  return (
    <div className={platform === 'mobile' ? 'mobile-layout' : 'desktop-layout'}>
      {/* Component content */}
    </div>
  );
}
```

- **Styling**:
  - Use Tailwind CSS utility classes
  - Follow mobile-first responsive design
  - Use semantic class names for custom styles
  - Prefer composition over inheritance

### Rust Code Style

- **Formatting**: Use `cargo fmt` before committing
- **Linting**: Run `cargo clippy` and address warnings
- **Error Handling**:
  - Use `Result<T, E>` for fallible operations
  - Provide descriptive error messages
  - Never unwrap in production code paths

```rust
// Good error handling
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}
```

- **Documentation**:
  - Add `///` doc comments for public APIs
  - Include examples in documentation
  - Document function parameters and return values

- **Safety**:
  - Minimize `unsafe` code
  - Validate all inputs from frontend
  - Use type safety to prevent errors

### Security Requirements

- **Input Validation**: Validate and sanitize all user inputs
- **Path Traversal**: Check file paths to prevent directory traversal attacks
- **Sensitive Data**: Never log API keys, tokens, or passwords
- **Dependencies**: Keep dependencies updated and audit for vulnerabilities
- **Permissions**: Request minimal required permissions on mobile platforms

## Pull Request Process

### Before Submitting

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes**: Follow code standards and write tests
3. **Test thoroughly**: Test on relevant platforms (desktop, Android, iOS)
4. **Run checks**:
   ```bash
   bun run typecheck          # TypeScript type checking
   cd src-tauri && cargo fmt  # Rust formatting
   cd src-tauri && cargo clippy  # Rust linting
   ```

### Branch Naming Conventions

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `mobile/description` - Mobile-specific changes
- `perf/description` - Performance improvements

### Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples**:
```
feat(mobile): add bottom navigation for mobile screens
fix(android): resolve file permission issues on Android 13+
docs(contributing): update mobile setup instructions
```

### Pull Request Title Format

Use the same format as commit messages with one of these prefixes:

- `Feature:` - New features
- `Fix:` - Bug fixes
- `Docs:` - Documentation changes
- `Refactor:` - Code refactoring
- `Improve:` - Performance or quality improvements
- `Mobile:` - Mobile-specific changes
- `Other:` - Other changes

**Examples**:
- `Feature: added swipeable panes for mobile chat interface`
- `Fix: resolved iOS keyboard overlap issue`
- `Mobile: implemented responsive tablet layout`

### Pull Request Description

Provide a clear description including:

1. **Problem**: What issue does this PR solve?
2. **Solution**: How does your change address the problem?
3. **Testing**: How did you test your changes?
4. **Screenshots**: Include screenshots for UI changes (especially mobile)
5. **Breaking Changes**: Document any breaking changes
6. **Side Effects**: Note any potential impacts

### Review Process

1. **Automated Checks**: CI must pass (build, tests, linting)
2. **Code Review**: At least one maintainer approval required
3. **Platform Testing**: Verify changes on relevant platforms
4. **Documentation**: Update docs if needed
5. **Merge**: Maintainers will merge after approval

## Testing Guidelines

### Unit Tests

```typescript
// Example test
describe('usePlatform', () => {
  it('should detect mobile platform on small screens', () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => usePlatform());
    expect(result.current).toBe('mobile');
  });
});
```

### Integration Tests

- Test component interactions
- Verify API integrations
- Test Tauri commands from frontend

### Mobile Testing Checklist

When testing mobile features:

- [ ] Test on Android emulator/device
- [ ] Test on iOS simulator/device (if applicable)
- [ ] Test portrait and landscape orientations
- [ ] Test on different screen sizes (phone and tablet)
- [ ] Verify touch interactions (tap, swipe, pinch)
- [ ] Test with mobile browser DevTools
- [ ] Verify performance on physical devices
- [ ] Test network connectivity handling (offline mode)

### Running Tests

```bash
# Unit tests
bun run test

# Mobile-specific tests
bun run test:mobile

# Type checking
bun run typecheck

# Rust tests
cd src-tauri && cargo test
```

## Community

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand our community standards.

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community discussion
- **Discord**: Real-time chat (join via GitHub)
- **X (Twitter)**: Follow [@getAsterisk](https://x.com/getAsterisk) for updates

### Getting Help

- Check existing [documentation](README.md)
- Search [issues](https://github.com/getAsterisk/opcode/issues)
- Ask in [GitHub Discussions](https://github.com/getAsterisk/opcode/discussions)
- Join our Discord community

### Areas for Contribution

We welcome contributions in these areas:

- 🐛 **Bug Fixes**: Help squash bugs
- ✨ **Features**: Implement new capabilities
- 📱 **Mobile**: Improve Android/iOS support
- 🎨 **UI/UX**: Enhance user interface and experience
- 📚 **Documentation**: Improve guides and tutorials
- 🧪 **Testing**: Add test coverage
- 🌐 **i18n**: Internationalization support
- ♿ **Accessibility**: Improve accessibility features
- ⚡ **Performance**: Optimize speed and efficiency

### Recognition

Contributors will be:

- Listed in our [Contributors](https://github.com/getAsterisk/opcode/graphs/contributors) page
- Mentioned in release notes for significant contributions
- Invited to our contributor community channels

---

Thank you for contributing to Opcode! Your efforts help make AI-powered development accessible to everyone, everywhere. 🚀

**Questions?** Open a [discussion](https://github.com/getAsterisk/opcode/discussions) or reach out in our community channels.
