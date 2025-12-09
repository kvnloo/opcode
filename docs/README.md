# Opcode Documentation

Welcome to the Opcode mobile application documentation. This directory contains comprehensive guides for developers working on or using Opcode.

## Documentation Index

### Core Documentation

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
   - Technology stack overview
   - Architecture layers (screens, components, hooks, stores, services)
   - Component hierarchy and organization
   - State management patterns (Zustand)
   - Tauri integration and IPC
   - Navigation flow
   - Data flow patterns
   - Performance optimizations

2. **[MOBILE-DEVELOPMENT.md](./MOBILE-DEVELOPMENT.md)** - Development guide
   - Quick start setup
   - Android development (build, deploy, testing)
   - iOS development (build, deploy, testing)
   - Testing strategy (unit, integration, E2E)
   - Build scripts and CI/CD
   - Known issues and workarounds
   - Performance profiling
   - Debugging techniques
   - Deployment process

3. **[COMPONENTS.md](./COMPONENTS.md)** - Component reference
   - Common components (AccessibleText, HapticButton, VirtualList)
   - Workspace components (FileTree, CodeViewer, ToolsOverlay)
   - Connection components (TailscaleConnect, ConnectionManager)
   - Navigation components (BottomNavigation)
   - Terminal components
   - Integration patterns
   - Best practices
   - Testing examples

4. **[FEATURES.md](./FEATURES.md)** - Feature specifications
   - Connection features (Tailscale VPN)
   - Enhanced Create Screen (prompt builder, command palette)
   - Real-time execution (SSE streaming, progress tracking)
   - Mobile workspace (project management, file explorer)
   - Authentication & security
   - Analytics & insights
   - Platform features (iOS/Android)

### Test Reports

- **[TEST_COVERAGE_REPORT.md](./TEST_COVERAGE_REPORT.md)** - Current test coverage status (80.5%)
- **[MOBILE_TESTING_REPORT.md](./MOBILE_TESTING_REPORT.md)** - Mobile-specific test results

### Technical Notes

- **[mobile-agent-data-flow.md](./mobile-agent-data-flow.md)** - Agent execution data flow
- **[performance-optimizations-summary.md](./performance-optimizations-summary.md)** - Performance improvements
- **[type-safety-audit-report.md](./type-safety-audit-report.md)** - TypeScript type safety analysis

### Project Planning

- **[SPEC-prompt-builder.md](./SPEC-prompt-builder.md)** - Prompt builder feature specification

## Quick Links

### For New Developers

1. Start with [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
2. Follow [MOBILE-DEVELOPMENT.md](./MOBILE-DEVELOPMENT.md) to set up your environment
3. Reference [COMPONENTS.md](./COMPONENTS.md) when building features
4. Check [FEATURES.md](./FEATURES.md) for feature status and roadmap

### For Contributors

1. Read the architecture overview
2. Check test coverage and aim to maintain/improve it
3. Follow component patterns from COMPONENTS.md
4. Run tests before submitting PRs: `npm run test && npm run typecheck`

### For Users

1. [FEATURES.md](./FEATURES.md) - See what features are available
2. [MOBILE-DEVELOPMENT.md](./MOBILE-DEVELOPMENT.md) - Build from source

## Project Structure

```
src/
├── components/mobile/    # Mobile-specific UI components
│   ├── common/          # Reusable components
│   ├── workspace/       # Workspace screen components
│   ├── connection/      # Connection management
│   ├── navigation/      # Bottom tab navigation
│   └── ...
├── screens/mobile/      # Top-level screen components
│   ├── WorkspaceScreen.tsx
│   ├── CreateScreen.tsx
│   ├── AppsScreen.tsx
│   └── AccountScreen.tsx
├── hooks/mobile/        # Mobile-specific React hooks
│   ├── usePlatform.ts
│   ├── useHaptics.ts
│   └── ...
├── stores/             # Zustand state management
│   ├── workspaceStore.ts
│   ├── sessionStore.ts
│   ├── connectionStore.ts
│   └── agentStore.ts
└── services/           # API clients and services

tests/mobile/           # Test suite
├── components/         # Component tests
├── hooks/             # Hook tests
├── integration/       # Integration tests
└── workspace/         # Workspace-specific tests

docs/                  # Documentation (you are here)
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tauri v2** - Native mobile wrapper
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vitest** - Testing
- **Radix UI** - Component primitives

## Key Features

✅ **Implemented**:
- Bottom tab navigation (Workspace, Create, Apps, Account)
- File tree browser with git status
- Syntax-highlighted code viewer
- Tailscale VPN connection
- Claude Web API connection
- Tools overlay for quick actions
- Haptic feedback on mobile
- Virtual scrolling for performance
- 80.5% test coverage

🚧 **In Development**:
- Advanced prompt builder with autocomplete
- Command palette (214+ commands)
- SSH file browser over Tailscale
- Real-time output streaming (SSE)
- Progress tracking for multi-step commands
- Workflow templates

⏳ **Planned**:
- Offline support
- WebSocket for bidirectional communication
- E2E tests with Appium
- Code editing capabilities
- Git operations UI

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run tauri dev        # Desktop preview

# Android
npm run tauri android dev    # Android emulator
npm run tauri android build  # Release APK

# iOS
npm run tauri ios dev        # iOS simulator
npm run tauri ios build      # Release build

# Testing
npm run test             # Run unit tests
npm run test:ui          # Vitest UI
npm run test:coverage    # Coverage report

# Quality
npm run typecheck        # TypeScript check
npm run lint             # ESLint
npm run lint:fix         # Auto-fix issues
```

## Getting Help

- **Issues**: Report bugs and request features on GitHub
- **Architecture Questions**: Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Component Usage**: Check [COMPONENTS.md](./COMPONENTS.md)
- **Build Problems**: See [MOBILE-DEVELOPMENT.md](./MOBILE-DEVELOPMENT.md) Known Issues

## Contributing

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
2. Check [FEATURES.md](./FEATURES.md) for what's being worked on
3. Write tests for new features (maintain 80%+ coverage)
4. Follow component patterns from [COMPONENTS.md](./COMPONENTS.md)
5. Run `npm run typecheck && npm run lint && npm run test` before committing

## Documentation Maintenance

This documentation should be updated when:
- New major features are added
- Architecture changes significantly
- New components are created
- Testing strategy changes
- Known issues are discovered or resolved

Last Updated: December 2024
Current Version: 0.1.0-alpha
Test Coverage: 80.5% (1215/1509 tests passing)
