# Opcode Mobile

Cross-platform mobile client for Opcode - your AI-powered development environment on the go.

## What is Opcode Mobile?

Opcode Mobile brings the full power of AI-assisted development to your phone or tablet. Built with Tauri, it provides native iOS and Android apps with the same capabilities as the desktop version, adapted for mobile workflows.

**Key Features:**
- Native mobile UI with bottom navigation and swipeable panes
- AI chat interface optimized for mobile screens
- File browsing and editing on-the-go
- Multiple connection modes (Local, Tailscale SSH, Claude Web)
- Responsive design supporting phones and tablets
- Offline capability with request queueing

## Quick Start

### Prerequisites

Install required tools:
```bash
# Bun (JavaScript runtime)
curl -fsSL https://bun.sh/install | bash

# Rust (for Tauri)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Tauri CLI
cargo install tauri-cli --version "^2.0.0" --locked
```

### Platform Setup

**Android**
```bash
# Install Android Studio and SDK
# Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653

# Add Rust targets
rustup target add aarch64-linux-android armv7-linux-androideabi
```

**iOS** (macOS only)
```bash
# Install Xcode from App Store
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Add Rust targets
rustup target add aarch64-apple-ios aarch64-apple-ios-sim
```

### Run Development Build

```bash
# Clone and install
git clone https://github.com/your-org/opcode.git
cd opcode
git checkout feature/mobile
bun install

# Initialize Tauri mobile
cargo tauri android init  # For Android
cargo tauri ios init      # For iOS

# Start dev server
bun run dev

# Run on device/emulator (in another terminal)
cargo tauri android dev   # Android
cargo tauri ios dev       # iOS
```

## Project Structure

```
opcode/
├── src/
│   ├── mobile/              # Mobile-specific code
│   │   ├── components/      # BottomNav, MobileHeader, etc.
│   │   ├── screens/         # ChatScreen, FilesScreen, etc.
│   │   ├── layouts/         # MobileLayout, TabletLayout
│   │   ├── hooks/           # usePlatform, useOrientation
│   │   └── utils/           # Platform helpers
│   ├── components/          # Shared components
│   ├── lib/                 # Utilities and APIs
│   └── App.tsx             # Root component
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── mobile/         # Mobile-specific backend
│   │   └── lib.rs          # Tauri commands
│   ├── gen/
│   │   ├── android/        # Generated Android project
│   │   └── ios/            # Generated iOS project
│   └── Cargo.toml
└── docs/
    └── mobile/             # Mobile documentation
        ├── SETUP.md        # Detailed setup guide
        ├── ARCHITECTURE.md # Architecture documentation
        └── CONTRIBUTING.md # Contribution guidelines
```

## Development Commands

```bash
# Development
bun run dev                    # Start dev server
cargo tauri android dev        # Run on Android
cargo tauri ios dev           # Run on iOS

# Building
cargo tauri android build     # Build Android APK/AAB
cargo tauri ios build         # Build iOS IPA

# Testing
bun run test                  # Run unit tests
bun run test:mobile          # Run mobile-specific tests
bun run typecheck            # TypeScript type checking

# Linting
bun run lint                 # Lint code
bun run lint:fix             # Auto-fix issues
```

## Platform Detection

Opcode adapts its UI based on the platform:

**Mobile (< 768px)**
- Bottom navigation bar
- Full-screen views
- Swipeable panes
- Mobile-optimized modals

**Tablet (768px - 1023px)**
- Sidebar navigation
- Side-by-side panes
- Hybrid touch/mouse support

**Desktop (≥ 1024px)**
- Multi-pane layout
- Custom titlebar
- Keyboard shortcuts

## Connection Modes

### 1. Local Mode
Access files directly on your device (photos, documents, etc.)

### 2. Tailscale SSH
Connect to remote servers via encrypted Tailscale VPN

### 3. Claude Web
Interact with Claude API for AI assistance

## Documentation

- **[SETUP.md](./docs/mobile/SETUP.md)** - Detailed setup instructions, troubleshooting
- **[ARCHITECTURE.md](./docs/mobile/ARCHITECTURE.md)** - Architecture overview, design decisions
- **[CONTRIBUTING.md](./docs/mobile/CONTRIBUTING.md)** - Contribution guidelines, code standards

## Common Issues

**Android: NDK not found**
```bash
export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653
```

**iOS: Code signing error**
```bash
# Open in Xcode and configure signing
open src-tauri/gen/ios/opcode.xcodeproj
```

**Port already in use**
```bash
lsof -ti:1420 | xargs kill -9
```

See [SETUP.md](./docs/mobile/SETUP.md#common-issues-and-troubleshooting) for more solutions.

## Contributing

We welcome contributions! Please read:

1. [CONTRIBUTING.md](./docs/mobile/CONTRIBUTING.md) for code guidelines
2. [ARCHITECTURE.md](./docs/mobile/ARCHITECTURE.md) to understand the design
3. Create a PR following the mobile checklist

### Development Workflow

1. Create feature branch: `git checkout -b mobile/feature-name`
2. Make changes following code guidelines
3. Test on Android and iOS (or browser mobile view)
4. Run tests: `bun run test:mobile`
5. Submit PR with mobile testing checklist

## Support

- **Issues**: https://github.com/your-org/opcode/issues
- **Discussions**: https://github.com/your-org/opcode/discussions
- **Discord**: #mobile-dev channel

## License

[Your License Here]

## Acknowledgments

Built with:
- [Tauri](https://tauri.app/) - Cross-platform native runtime
- [React](https://react.dev/) - UI framework
- [Bun](https://bun.sh/) - JavaScript runtime and bundler
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**Ready to develop on the go?** Follow the [Quick Start](#quick-start) above or read the [full setup guide](./docs/mobile/SETUP.md).
