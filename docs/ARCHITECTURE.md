# Opcode Mobile Architecture

## Overview

Opcode is a mobile application for managing and executing Claude Code commands remotely via Tailscale VPN. Built with React, Tauri, and Zustand, it provides a native mobile interface for Claude Code workflows.

## Technology Stack

### Core Framework
- **React 18** - UI framework with hooks and concurrent rendering
- **TypeScript** - Type-safe development with strict mode
- **Tauri v2** - Native mobile app wrapper with system integration
- **Vite** - Fast build tool with HMR

### State Management
- **Zustand** - Lightweight state management without boilerplate
- **React Query** - Server state management and caching (planned)

### UI/Styling
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Testing
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **Appium** - E2E mobile testing (planned)

## Architecture Layers

```
┌─────────────────────────────────────────┐
│           Screens Layer                 │
│  (AccountScreen, AppsScreen, etc.)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Components Layer                  │
│  • Workspace (tools, panes, trees)       │
│  • Connection (Tailscale, Claude Web)    │
│  • Common (accessible, haptic, virtual)  │
│  • Navigation (bottom nav)               │
│  • Terminal, Editor, Tools, etc.         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Hooks Layer                      │
│  • Mobile hooks (haptics, platform)      │
│  • Shared hooks (analytics, theme)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        State Layer (Zustand)             │
│  • workspaceStore (projects, files)      │
│  • sessionStore (execution state)        │
│  • connectionStore (Tailscale, SSH)      │
│  • agentStore (agent management)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Services Layer                    │
│  • API client (REST/SSE)                 │
│  • Tailscale SDK                         │
│  • SSH client                            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Tauri Layer                      │
│  • Native APIs (filesystem, process)     │
│  • IPC bridge (Rust ↔ JavaScript)        │
│  • Platform services (iOS/Android)       │
└─────────────────────────────────────────┘
```

## Core Components

### 1. Screen Components (`src/screens/mobile/`)

Top-level navigation screens:

- **WorkspaceScreen** - Project management, file explorer, code viewer
- **CreateScreen** - Project creation with prompt builder and command palette
- **AppsScreen** - Template library and example projects
- **AccountScreen** - User settings and preferences

### 2. Feature Components (`src/components/mobile/`)

Organized by feature domain:

#### Workspace (`workspace/`)
- **ToolsOverlay** - Quick access to development tools
- **panes/** - Workspace panels (SharePane, SettingsPane, etc.)
- **FileTree** - Hierarchical file browser
- **CodeViewer** - Syntax-highlighted code display

#### Connection (`connection/`)
- **TailscaleConnect** - Tailscale VPN connection UI
- **ClaudeWebConnect** - Claude Web API connection
- **ConnectionManager** - Connection state management

#### Common (`common/`)
- **AccessibleText** - Screen reader optimized text
- **HapticButton** - Tactile feedback buttons
- **VirtualList** - Virtualized list rendering for performance

#### Navigation (`navigation/`)
- **BottomNavigation** - iOS/Android bottom tab bar

#### Other Domains
- **terminal/** - SSH terminal emulator
- **editor/** - Code editing (planned)
- **tools/** - Development tool integrations
- **agent/** - Agent execution UI
- **preview/** - Live preview (planned)

### 3. Mobile Hooks (`src/hooks/mobile/`)

Platform-specific React hooks:

- **usePlatform** - Platform detection and capabilities
- **useHaptics** - Tactile feedback integration
- **useIntersectionObserver** - Viewport intersection detection
- **useKeyboardHeight** - Virtual keyboard height tracking
- **useOrientation** - Device orientation changes
- **useSwipeNavigation** - Gesture-based navigation
- **useGitStatus** - Git repository status (via SSH)
- **useDatabaseQuery** - Database query helpers (planned)
- **useSettings** - User settings management

### 4. State Stores (`src/stores/`)

Zustand stores for global state:

#### workspaceStore
```typescript
{
  // Projects
  projects: Project[]
  currentProject: Project | null

  // Files
  files: FileNode[]
  selectedFile: FileNode | null
  fileContent: string | null

  // Actions
  fetchProjects()
  setCurrentProject(id)
  fetchFiles(projectId)
  openFile(path)
}
```

#### sessionStore
```typescript
{
  // Sessions
  sessions: Session[]
  currentSession: Session | null

  // Execution
  isExecuting: boolean
  output: OutputLine[]
  progress: Progress

  // Actions
  startSession(command)
  stopSession()
  streamOutput(line)
}
```

#### connectionStore
```typescript
{
  // Connection state
  status: 'disconnected' | 'connecting' | 'connected'
  provider: 'tailscale' | 'claude-web' | null
  workstation: Device | null

  // Actions
  connect(provider)
  disconnect()
  checkHealth()
}
```

#### agentStore
```typescript
{
  // Agent state
  agents: Agent[]
  activeAgent: Agent | null

  // Execution
  isRunning: boolean
  taskProgress: TaskProgress

  // Actions
  spawnAgent(type)
  executeTask(agentId, task)
  stopAgent(agentId)
}
```

## Data Flow Patterns

### 1. Component → Store → API
```typescript
// User interaction
<Button onClick={() => workspaceStore.fetchProjects()} />

// Store action
async fetchProjects() {
  const projects = await api.getProjects()
  set({ projects })
}

// API call
async getProjects() {
  return fetch('/api/projects')
}
```

### 2. SSE Streaming → Store → Component
```typescript
// API starts SSE stream
api.streamOutput((line) => {
  sessionStore.streamOutput(line)
})

// Store updates
streamOutput(line) {
  set((state) => ({
    output: [...state.output, line]
  }))
}

// Component subscribes
const output = useSessionStore(s => s.output)
```

### 3. Platform Hook → Store → Component
```typescript
// Hook detects platform event
const { isKeyboardVisible } = useKeyboardHeight()

// Store reacts
useEffect(() => {
  layoutStore.setKeyboardVisible(isKeyboardVisible)
}, [isKeyboardVisible])

// Component adapts UI
const paddingBottom = layoutStore.keyboardHeight
```

## Tauri Integration

### IPC Commands

Tauri provides native system access via IPC:

```typescript
// Filesystem operations
import { readTextFile, writeFile } from '@tauri-apps/plugin-fs'

// Execute shell commands
import { Command } from '@tauri-apps/plugin-shell'

// Network operations
import { fetch } from '@tauri-apps/api/http'

// App lifecycle
import { exit, relaunch } from '@tauri-apps/plugin-process'
```

### Platform Detection
```typescript
import { platform } from '@tauri-apps/plugin-os'

const currentPlatform = await platform() // 'ios' | 'android'
```

### Native Events
```typescript
import { listen } from '@tauri-apps/api/event'

listen('resume', () => {
  // App resumed from background
  connectionStore.checkHealth()
})
```

## Navigation Flow

```
┌──────────────┐
│  App Entry   │
│  (App.tsx)   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│     BottomNavigation                  │
│  ┌──────┬──────┬────────┬─────────┐  │
│  │ Work │Create│  Apps  │ Account │  │
│  └──┬───┴──┬───┴───┬────┴────┬────┘  │
└─────┼──────┼───────┼─────────┼───────┘
      │      │       │         │
      ▼      ▼       ▼         ▼
┌─────────┐┌────────┐┌──────┐┌────────┐
│Workspace││Create  ││Apps  ││Account │
│Screen   ││Screen  ││Screen││Screen  │
└─────────┘└────────┘└──────┘└────────┘
```

### Screen Responsibilities

- **WorkspaceScreen**: Active project, file tree, code viewer, tools overlay
- **CreateScreen**: New project, prompt builder, command palette, workflows
- **AppsScreen**: Template library, example projects, quickstart guides
- **AccountScreen**: Settings, connection config, authentication

## State Management Patterns

### 1. Local Component State
Use for UI-only state that doesn't need sharing:
```typescript
const [isOpen, setIsOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
```

### 2. Zustand Store State
Use for shared state across components:
```typescript
const projects = useWorkspaceStore(s => s.projects)
const fetchProjects = useWorkspaceStore(s => s.fetchProjects)
```

### 3. React Query (Planned)
Use for server state with caching:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: api.getProjects
})
```

### 4. URL State (React Router)
Use for navigation state:
```typescript
const { projectId } = useParams()
const navigate = useNavigate()
```

## Testing Strategy

### Unit Tests (Vitest + RTL)
Test individual components in isolation:
```typescript
test('HapticButton provides tactile feedback', async () => {
  const onPress = vi.fn()
  render(<HapticButton onPress={onPress} />)

  fireEvent.press(screen.getByRole('button'))

  expect(onPress).toHaveBeenCalled()
  expect(Haptics.impact).toHaveBeenCalledWith('light')
})
```

### Integration Tests
Test feature workflows:
```typescript
test('user can browse and open files', async () => {
  render(<WorkspaceScreen />)

  // Wait for projects to load
  await waitFor(() => {
    expect(screen.getByText('my-project')).toBeInTheDocument()
  })

  // Open project
  fireEvent.press(screen.getByText('my-project'))

  // File tree loads
  expect(screen.getByText('src/index.ts')).toBeInTheDocument()
})
```

### E2E Tests (Appium - Planned)
Test on real devices:
```typescript
test('full workflow: connect → create → execute', async () => {
  // Connect to Tailscale
  await tapByText('Connect to Tailscale')
  await expectVisible('Connected')

  // Create new project
  await tapByText('Create')
  await typeInto('input', 'Build a TODO app')
  await tapByText('Execute')

  // Verify execution
  await expectVisible('Creating project...')
})
```

## Performance Optimizations

### 1. Virtual Scrolling
Large lists use windowing:
```typescript
<VirtualList
  items={files}
  itemHeight={48}
  renderItem={(file) => <FileItem file={file} />}
/>
```

### 2. Code Splitting
Screens load on demand:
```typescript
const WorkspaceScreen = lazy(() => import('./WorkspaceScreen'))
```

### 3. Memoization
Expensive calculations cached:
```typescript
const filteredFiles = useMemo(() =>
  files.filter(f => f.name.includes(query)),
  [files, query]
)
```

### 4. Zustand Selectors
Prevent unnecessary re-renders:
```typescript
// ❌ Re-renders on any store change
const store = useWorkspaceStore()

// ✅ Only re-renders when projects change
const projects = useWorkspaceStore(s => s.projects)
```

## Build Configuration

### Development
```bash
npm run dev          # Vite dev server
npm run tauri dev    # Tauri dev mode (mobile)
```

### Testing
```bash
npm run test         # Unit tests
npm run test:ui      # Vitest UI
npm run test:coverage # Coverage report
```

### Production
```bash
npm run build        # Vite build
npm run tauri build  # Native app build
```

### Android Build
```bash
npm run tauri android init  # First time setup
npm run tauri android dev   # Development build
npm run tauri android build # Release build
```

### iOS Build
```bash
npm run tauri ios init      # First time setup
npm run tauri ios dev       # Development build
npm run tauri ios build     # Release build
```

## Key Design Decisions

### 1. Zustand over Redux
- Less boilerplate
- No action creators or reducers
- Simpler TypeScript types
- Better performance
- Hooks-first API

### 2. Tauri over React Native
- Smaller app size
- Better performance
- Access to native Rust APIs
- WebView-based (familiar web tech)
- Single codebase for mobile + desktop

### 3. Vitest over Jest
- Faster test execution
- Better ESM support
- Vite-aligned configuration
- Superior TypeScript support
- Modern test runner features

### 4. Component-first Organization
- Features organized by domain (workspace, connection, etc.)
- Easier to find related components
- Clear ownership boundaries
- Better code splitting

## Security Considerations

### 1. Tailscale VPN
- End-to-end encrypted connections
- No exposed public endpoints
- Device-to-device authentication
- Secure key storage in OS keychain

### 2. SSH Key Management
- Keys stored in secure keychain
- Passphrase protection optional
- Biometric unlock (Touch ID/Face ID)
- Key rotation recommended

### 3. API Security
- No API keys in code
- Credentials stored securely
- HTTPS only for web APIs
- Token expiration handling

## Future Architecture Improvements

### 1. React Query Integration
Replace manual fetch/cache logic with React Query:
- Automatic caching and revalidation
- Background refetching
- Optimistic updates
- Infinite queries for pagination

### 2. WebSocket Upgrade
Replace SSE with WebSocket for bidirectional communication:
- Lower latency
- Better mobile battery life
- Automatic reconnection
- Binary protocol support

### 3. Offline Support
Add offline capabilities:
- Service worker caching
- Local SQLite database
- Sync queue for offline actions
- Conflict resolution

### 4. Module Federation
Split app into micro-frontends:
- Independent feature deployment
- Faster builds
- Better code sharing
- Plugin architecture

## Debugging Tips

### Enable Debug Logging
```typescript
// In store
set({ projects }, false, 'fetchProjects')

// Console shows: 'fetchProjects' with new state
```

### Zustand DevTools
```typescript
import { devtools } from 'zustand/middleware'

export const useWorkspaceStore = create(
  devtools((set) => ({...}), { name: 'workspace' })
)
```

### React DevTools
```bash
# Install React DevTools
npm install -g react-devtools
react-devtools

# Connect from app
import { setupDevtools } from 'react-devtools'
setupDevtools()
```

### Tauri DevTools
```bash
# Enable web inspector
tauri dev --config '{"tauri": {"bundle": {"active": true}}}'
```

## Related Documentation

- [MOBILE-DEVELOPMENT.md](./MOBILE-DEVELOPMENT.md) - Build and testing guide
- [FEATURES.md](./FEATURES.md) - Complete feature list
- [API.md](./API.md) - API reference (planned)
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide (planned)
