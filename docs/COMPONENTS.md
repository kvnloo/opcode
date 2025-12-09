# Component Documentation

## Overview

This document describes the key components in the Opcode mobile application, their responsibilities, props, and usage patterns.

## Table of Contents

1. [Common Components](#common-components)
2. [Workspace Components](#workspace-components)
3. [Connection Components](#connection-components)
4. [Navigation Components](#navigation-components)
5. [Terminal Components](#terminal-components)
6. [Integration Patterns](#integration-patterns)

---

## Common Components

### AccessibleText

Screen reader optimized text component with semantic HTML.

**Props**:
```typescript
interface AccessibleTextProps {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6  // Heading level
  role?: 'heading' | 'label' | 'text'
  accessibilityLabel?: string
  className?: string
}
```

**Usage**:
```tsx
<AccessibleText level={1} role="heading">
  Welcome to Opcode
</AccessibleText>

<AccessibleText role="label" accessibilityLabel="Project name">
  {project.name}
</AccessibleText>
```

**Features**:
- Automatic ARIA labels
- Semantic HTML mapping
- Screen reader optimized
- Focus management

---

### HapticButton

Button with tactile feedback for mobile devices.

**Props**:
```typescript
interface HapticButtonProps {
  children: React.ReactNode
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
  className?: string
}
```

**Usage**:
```tsx
<HapticButton
  variant="primary"
  size="lg"
  hapticStyle="medium"
  onPress={handleExecute}
  loading={isExecuting}
>
  Execute Command
</HapticButton>
```

**Features**:
- Native haptic feedback (iOS/Android)
- Loading state with spinner
- Disabled state styling
- Customizable haptic intensity
- Accessible (keyboard + screen reader)

---

### VirtualList

High-performance virtualized list for large datasets.

**Props**:
```typescript
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number | ((item: T) => number)
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number  // Items to render outside viewport
  renderBatchSize?: number  // Items per render batch
  onEndReached?: () => void  // Infinite scroll callback
  onEndReachedThreshold?: number  // Trigger distance
  estimatedItemHeight?: number  // For variable height
  keyExtractor?: (item: T, index: number) => string
  className?: string
}
```

**Usage**:
```tsx
<VirtualList
  items={files}
  itemHeight={48}
  overscan={5}
  renderItem={(file) => (
    <FileItem key={file.id} file={file} />
  )}
  onEndReached={loadMoreFiles}
  onEndReachedThreshold={0.8}
/>
```

**Features**:
- Windowing for performance
- Variable height items
- Infinite scroll support
- Smooth scrolling
- Minimal re-renders
- Accessibility support

**Performance**:
- Handles 10,000+ items smoothly
- Only renders visible + overscan items
- Automatic scroll position restoration

---

## Workspace Components

### WorkspaceScreen

Main screen for project management and code viewing.

**Features**:
- Project list with search
- File tree navigation
- Code viewer with syntax highlighting
- Tools overlay access
- Git status integration

**Layout**:
```
┌─────────────────────────────────┐
│  🔍 Search projects...          │
├─────────────────────────────────┤
│  📁 my-project          main ✓  │
│  📁 another-project    develop  │
│  📁 demo-app           master   │
├─────────────────────────────────┤
│  ┌─ src/                        │
│  │  ├─ components/              │
│  │  ├─ hooks/                   │
│  │  └─ stores/                  │
│  └─ tests/                      │
└─────────────────────────────────┘
```

**State Management**:
```typescript
const projects = useWorkspaceStore(s => s.projects)
const selectedProject = useWorkspaceStore(s => s.currentProject)
const fetchProjects = useWorkspaceStore(s => s.fetchProjects)
```

---

### FileTree

Hierarchical file browser with git status.

**Props**:
```typescript
interface FileTreeProps {
  projectId: string
  onFileSelect: (file: FileNode) => void
  selectedPath?: string
  showGitStatus?: boolean
  collapsedPaths?: Set<string>
  onToggleCollapse?: (path: string) => void
}

interface FileNode {
  path: string
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked'
  size?: number
  modifiedAt?: number
}
```

**Usage**:
```tsx
<FileTree
  projectId={project.id}
  onFileSelect={handleFileSelect}
  selectedPath={selectedFile?.path}
  showGitStatus={true}
/>
```

**Features**:
- Lazy loading of directories
- Git status indicators
- Keyboard navigation
- Multi-select (planned)
- Drag and drop (planned)

---

### CodeViewer

Syntax-highlighted code display with line numbers.

**Props**:
```typescript
interface CodeViewerProps {
  content: string
  language: string
  fileName?: string
  showLineNumbers?: boolean
  highlightedLines?: number[]
  onLineClick?: (lineNumber: number) => void
  readOnly?: boolean
  theme?: 'light' | 'dark' | 'auto'
}
```

**Usage**:
```tsx
<CodeViewer
  content={fileContent}
  language="typescript"
  fileName="index.ts"
  showLineNumbers={true}
  theme="dark"
/>
```

**Features**:
- Syntax highlighting (via Prism.js)
- Line numbers
- Code folding (planned)
- Search in file (planned)
- Diff view (planned)

---

### ToolsOverlay

Quick access overlay for development tools.

**Features**:
- Common git operations
- Terminal access
- Build commands
- Test runners
- Workflow templates

**Layout**:
```
┌─────────────────────────────────┐
│  ⚙️  Tools                  [✕]  │
├─────────────────────────────────┤
│  🔧 Quick Actions               │
│  ├─ Commit Changes              │
│  ├─ Pull Latest                 │
│  └─ Push Branch                 │
├─────────────────────────────────┤
│  🧪 Testing                     │
│  ├─ Run Tests                   │
│  └─ Coverage Report             │
├─────────────────────────────────┤
│  🚀 Workflows                   │
│  ├─ Full Stack Dev              │
│  └─ Bug Fix Pipeline            │
└─────────────────────────────────┘
```

**Usage**:
```tsx
const [isOpen, setIsOpen] = useState(false)

<ToolsOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  projectId={project.id}
/>
```

---

## Connection Components

### TailscaleConnect

Tailscale VPN connection management UI.

**Props**:
```typescript
interface TailscaleConnectProps {
  onConnected?: (device: Device) => void
  onDisconnected?: () => void
  autoConnect?: boolean
}

interface Device {
  id: string
  name: string
  hostname: string
  ipAddress: string
  online: boolean
}
```

**Usage**:
```tsx
<TailscaleConnect
  autoConnect={true}
  onConnected={(device) => {
    console.log('Connected to:', device.name)
  }}
/>
```

**Features**:
- OAuth login flow
- Device discovery
- Connection status indicator
- Auto-reconnect on network change
- Multi-device support

**Connection States**:
```typescript
type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'authenticating'
  | 'connected'
  | 'error'
```

---

### ClaudeWebConnect

Claude Web API connection UI.

**Props**:
```typescript
interface ClaudeWebConnectProps {
  apiKey?: string
  onConnected?: () => void
  onError?: (error: Error) => void
}
```

**Usage**:
```tsx
<ClaudeWebConnect
  apiKey={settings.apiKey}
  onConnected={() => {
    console.log('Connected to Claude Web API')
  }}
  onError={(error) => {
    console.error('Connection failed:', error)
  }}
/>
```

**Features**:
- API key management
- Connection testing
- Rate limit display
- Token usage tracking

---

### ConnectionManager

Manages multiple connection providers.

**Props**:
```typescript
interface ConnectionManagerProps {
  defaultProvider?: 'tailscale' | 'claude-web'
  showProviderSwitch?: boolean
  onProviderChange?: (provider: string) => void
}
```

**Usage**:
```tsx
<ConnectionManager
  defaultProvider="tailscale"
  showProviderSwitch={true}
  onProviderChange={(provider) => {
    console.log('Switched to:', provider)
  }}
/>
```

**Features**:
- Provider selection
- Connection health monitoring
- Fallback handling
- Connection history

---

## Navigation Components

### BottomNavigation

iOS/Android style bottom tab navigation.

**Props**:
```typescript
interface BottomNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  showLabels?: boolean
  hapticFeedback?: boolean
}

interface Tab {
  id: string
  label: string
  icon: React.ComponentType
  badge?: number | string
  disabled?: boolean
}
```

**Usage**:
```tsx
<BottomNavigation
  tabs={[
    { id: 'workspace', label: 'Workspace', icon: FolderIcon },
    { id: 'create', label: 'Create', icon: PlusIcon },
    { id: 'apps', label: 'Apps', icon: GridIcon },
    { id: 'account', label: 'Account', icon: UserIcon }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  hapticFeedback={true}
/>
```

**Features**:
- Platform-specific styling
- Badge indicators
- Haptic feedback
- Smooth transitions
- Keyboard accessible

---

## Terminal Components

### Terminal

SSH terminal emulator for remote command execution.

**Props**:
```typescript
interface TerminalProps {
  connection: SSHConnection
  initialCommand?: string
  cwd?: string
  env?: Record<string, string>
  onOutput?: (output: string) => void
  onExit?: (code: number) => void
}
```

**Usage**:
```tsx
<Terminal
  connection={sshConnection}
  cwd="/Users/kvn/workspace/project"
  onOutput={(output) => console.log(output)}
  onExit={(code) => console.log('Exit code:', code)}
/>
```

**Features**:
- Real-time output streaming
- Input handling
- ANSI escape codes
- Command history
- Copy/paste support
- Scrollback buffer

---

## Integration Patterns

### Pattern 1: Store + Component

```tsx
// Component uses store for state
function ProjectList() {
  const projects = useWorkspaceStore(s => s.projects)
  const fetchProjects = useWorkspaceStore(s => s.fetchProjects)
  const isLoading = useWorkspaceStore(s => s.isLoading)

  useEffect(() => {
    fetchProjects()
  }, [])

  if (isLoading) return <Spinner />

  return (
    <VirtualList
      items={projects}
      itemHeight={64}
      renderItem={(project) => (
        <ProjectItem project={project} />
      )}
    />
  )
}
```

### Pattern 2: Hook + Component

```tsx
// Component uses custom hook
function FileViewer({ path }: { path: string }) {
  const { content, isLoading, error } = useFileContent(path)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <CodeViewer
      content={content}
      language={detectLanguage(path)}
      fileName={basename(path)}
    />
  )
}

// Custom hook
function useFileContent(path: string) {
  const [state, setState] = useState({ content: '', isLoading: true })

  useEffect(() => {
    fetchFileContent(path).then((content) => {
      setState({ content, isLoading: false })
    })
  }, [path])

  return state
}
```

### Pattern 3: Compound Components

```tsx
// Parent manages state, children display
function WorkspacePanel() {
  const [selectedTab, setSelectedTab] = useState('files')

  return (
    <Panel>
      <Panel.Header>
        <Panel.Tabs
          tabs={['files', 'git', 'terminal']}
          active={selectedTab}
          onChange={setSelectedTab}
        />
      </Panel.Header>
      <Panel.Content>
        {selectedTab === 'files' && <FileTree />}
        {selectedTab === 'git' && <GitPanel />}
        {selectedTab === 'terminal' && <Terminal />}
      </Panel.Content>
    </Panel>
  )
}
```

### Pattern 4: Render Props

```tsx
// Component provides data via render prop
<ConnectionProvider>
  {({ status, device, connect, disconnect }) => (
    <div>
      <p>Status: {status}</p>
      {status === 'connected' ? (
        <>
          <p>Connected to: {device.name}</p>
          <Button onClick={disconnect}>Disconnect</Button>
        </>
      ) : (
        <Button onClick={connect}>Connect</Button>
      )}
    </div>
  )}
</ConnectionProvider>
```

### Pattern 5: Portal Components

```tsx
// Overlay renders outside parent DOM
function ToolsButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Tools
      </Button>

      {isOpen && (
        <Portal>
          <ToolsOverlay
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </Portal>
      )}
    </>
  )
}
```

## Best Practices

### 1. Component Composition
Prefer small, focused components over large monolithic ones.

### 2. Props vs State
Use props for parent-controlled state, internal state for UI-only concerns.

### 3. Memoization
Memoize expensive computations and callbacks:
```tsx
const sortedFiles = useMemo(
  () => files.sort((a, b) => a.name.localeCompare(b.name)),
  [files]
)

const handleSelect = useCallback(
  (file: FileNode) => onFileSelect(file),
  [onFileSelect]
)
```

### 4. Error Boundaries
Wrap risky components in error boundaries:
```tsx
<ErrorBoundary fallback={<ErrorMessage />}>
  <CodeViewer content={content} />
</ErrorBoundary>
```

### 5. Accessibility
Always provide ARIA labels and keyboard navigation:
```tsx
<button
  aria-label="Close dialog"
  onClick={onClose}
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <XIcon />
</button>
```

## Testing Components

### Unit Test Example
```typescript
test('FileTree renders files and directories', () => {
  const files: FileNode[] = [
    { path: 'src', name: 'src', type: 'directory' },
    { path: 'src/index.ts', name: 'index.ts', type: 'file' }
  ]

  render(<FileTree files={files} onSelect={vi.fn()} />)

  expect(screen.getByText('src')).toBeInTheDocument()
  expect(screen.getByText('index.ts')).toBeInTheDocument()
})
```

### Integration Test Example
```typescript
test('selecting file opens in code viewer', async () => {
  render(<WorkspaceScreen />)

  // Select project
  fireEvent.press(screen.getByText('my-project'))

  // Wait for file tree
  await waitFor(() => {
    expect(screen.getByText('src/index.ts')).toBeInTheDocument()
  })

  // Select file
  fireEvent.press(screen.getByText('src/index.ts'))

  // Verify code viewer opens
  expect(screen.getByTestId('code-viewer')).toBeInTheDocument()
})
```
