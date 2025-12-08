# Workspace Screens Documentation

**Last Updated**: December 7, 2025
**Status**: Implemented and Ready for Testing

## Overview

The workspace screens provide the core development environment for Opcode mobile, implementing a Replit-inspired UX with 5 swipeable panes accessible through a bottom toolbar. This document details the architecture, implementation, and usage of all workspace components.

## Architecture

### Screen Hierarchy

```
AppsScreen (Project List)
    ↓ (User selects project)
WorkspaceScreen (Main Container)
    ├── WorkspaceHeader (Navigation + Tools Menu)
    ├── Active Pane Content (Swipeable)
    │   ├── AgentPane
    │   ├── ConsolePane
    │   ├── PreviewPane
    │   ├── PublishingPane
    │   └── SharePane
    ├── WorkspaceToolbar (Bottom Navigation)
    └── ToolsOverlay (18 tools, slide-up)
```

### File Structure

```
src/
├── screens/mobile/
│   ├── AppsScreen.tsx           # Project list and entry point
│   └── WorkspaceScreen.tsx      # Main workspace container
├── components/mobile/workspace/
│   ├── panes/
│   │   ├── AgentPane.tsx        # AI agent execution view
│   │   ├── ConsolePane.tsx      # Terminal/console
│   │   ├── PreviewPane.tsx      # Live preview with device frames
│   │   ├── PublishingPane.tsx   # Deployment configuration
│   │   └── SharePane.tsx        # Collaboration and sharing
│   ├── WorkspaceHeader.tsx      # Top navigation bar
│   ├── WorkspaceToolbar.tsx     # Bottom pane switcher
│   └── ToolsOverlay.tsx         # Tools menu slide-up
└── stores/
    └── workspaceStore.ts        # Zustand state management
```

## Screens

### 1. AppsScreen (Entry Point)

**Purpose**: Project list and workspace launcher

**File**: `src/screens/mobile/AppsScreen.tsx`

**Key Features**:
- Displays user's projects in grid/list view
- Integrates with `workspaceStore` for project selection
- Transitions to `WorkspaceScreen` when project selected
- Back navigation clears workspace state

**State Integration**:
```typescript
const { setProject, currentProject } = useWorkspaceStore();

// Select project
handleProjectSelect(project) {
  setProject({ id, name, path });
  setShowWorkspace(true);
}

// Navigate back
handleWorkspaceBack() {
  setShowWorkspace(false);
  setProject(null);
}
```

**Navigation Flow**:
```
[Project Card Tap] → Set Project in Store → Show WorkspaceScreen
[Back Button] → Clear Project → Show AppsScreen
```

### 2. WorkspaceScreen (Main Container)

**Purpose**: Container for workspace panes with bottom toolbar navigation

**File**: `src/screens/mobile/WorkspaceScreen.tsx`

**Props**:
```typescript
interface WorkspaceScreenProps {
  projectId: string;
  projectName: string;
  onBack: () => void;
}
```

**Key Features**:
- 5 workspace panes with animated transitions
- Bottom toolbar (6 icons: Stop + 5 panes)
- Tools overlay toggle from header menu
- Framer Motion animations for pane switching

**Structure**:
```typescript
<div className="h-screen flex flex-col">
  {/* Header */}
  <WorkspaceHeader
    projectName={projectName}
    onBack={onBack}
    onMenuClick={handleToolsToggle}
  />

  {/* Active Pane Content */}
  <AnimatePresence mode="wait">
    <motion.div>{renderPaneContent(activePane)}</motion.div>
  </AnimatePresence>

  {/* Tools Overlay */}
  {showToolsOverlay && <ToolsOverlay />}

  {/* Bottom Toolbar */}
  <WorkspaceToolbar
    activePane={activePane}
    onPaneChange={handlePaneChange}
  />
</div>
```

**Pane Types**:
```typescript
export type WorkspacePane = 'console' | 'agent' | 'deploy' | 'share' | 'preview';
```

**Animation Configuration**:
```typescript
// Pane transition
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
transition={{ duration: 0.2 }}
```

## Workspace Panes

### 1. Agent Pane

**Purpose**: AI agent execution, task tracking, and checkpoint management

**File**: `src/components/mobile/workspace/panes/AgentPane.tsx`

**Component Hierarchy**:
```
AgentPane
├── Task Progress (Collapsible)
│   └── TaskList (Checkmarks, Spinners, Errors)
├── Current Task Details (Collapsible)
├── Current Action Banner (Blue, animated)
├── Error Alert (Amber warning)
├── Checkpoints (Rollback buttons)
│   ├── Rollback Action
│   ├── View Changes
│   └── View Preview
├── Work Duration (Collapsible)
├── Upgrade Promo Card (Dismissible)
└── Quick Access Bar (Fixed bottom)
    ├── 4 Quick Tools (Secrets, Database, Auth, New Tab)
    └── Search Bar
```

**Props**:
```typescript
interface AgentPaneProps {
  tasks: Task[];                    // All tasks
  currentTask: Task | null;         // Active task
  agentStatus: AgentStatus;         // idle | running | error | complete
  checkpoints?: Checkpoint[];       // Rollback points
  workDuration?: number;            // Minutes worked
  error?: string;                   // Error message
  onRollback?: (checkpointId: string) => void;
  onViewChanges?: () => void;
  onViewPreview?: () => void;
  onOpenTool?: (toolId: string) => void;
}
```

**Task Interface**:
```typescript
interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: string;
}
```

**Checkpoint Interface**:
```typescript
interface Checkpoint {
  id: string;
  timestamp: number;
  summary: string;
  filesChanged: string[];
}
```

**Key Features**:
- Collapsible sections with animated chevrons
- Real-time task status updates with color coding
- Checkpoint rollback system
- Quick access toolbar (4 tools + search)
- Haptic feedback on all interactions
- Upgrade promo card (dismissible)
- Relative time formatting ("2 hours ago")

**State Visual Indicators**:
- **Pending**: Empty circle, gray
- **In Progress**: Blue spinner (animated)
- **Completed**: Green checkmark
- **Error**: Red alert icon

**Color Coding**:
```typescript
// Task status colors
pending: 'bg-card border-border'
in_progress: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
completed: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
error: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
```

### 2. Console Pane

**Purpose**: Terminal/console for shell access with project context

**File**: `src/components/mobile/workspace/panes/ConsolePane.tsx`

**Component Hierarchy**:
```
ConsolePane
├── Terminal Header
│   ├── Console Title
│   ├── Project Path Display
│   └── Clear Button
├── Terminal Output (Scrollable)
│   └── Lines (Input, Output, Error color-coded)
├── Input Section
│   ├── Quick Commands Bar
│   ├── Terminal Input Field + Run Button
│   └── Code Keyboard (Special characters)
```

**Props**:
```typescript
interface ConsolePaneProps {
  projectId: string;
  projectPath: string;
  onOutput?: (output: string) => void;
}
```

**Terminal Line Types**:
```typescript
interface TerminalLine {
  id: number;
  content: string;
  type: 'input' | 'output' | 'error';
}
```

**Key Features**:
- Command execution in project context
- Auto-scroll to latest output
- Quick command buttons (git, npm, etc.)
- Code keyboard for special characters
- Color-coded output (input=cyan, output=white, error=red)
- Command history support

**Command Execution**:
```typescript
// Execute in project directory via Tauri
await invoke<string>('execute_terminal_command', {
  command,
  cwd: projectPath,
  projectId,
});
```

**Terminal Colors**:
```css
.terminal-input { color: #4fc3f7; }    /* Cyan */
.terminal-output { color: #d4d4d4; }   /* White */
.terminal-error { color: #f44336; }    /* Red */
.terminal-bg { background: #1e1e1e; }  /* Dark */
```

**Quick Commands Integration**:
- Uses `<QuickCommands />` component
- Common commands: npm, git, ls, clear
- Inserts command into input field

### 3. Preview Pane

**Purpose**: Live preview with device frames and browser controls

**File**: `src/components/mobile/workspace/panes/PreviewPane.tsx`

**Component Hierarchy**:
```
PreviewPane
├── Header Section
│   ├── Publish Button (Primary CTA)
│   ├── Preview Title
│   └── Device Frame Toggle (iPhone/Android/Desktop)
├── Browser Controls Bar
│   ├── Back Button
│   ├── Forward Button
│   ├── Refresh Button
│   ├── URL Input Field
│   └── Open External Button
└── Preview Content Area
    └── Device Frame Container
        ├── iPhone Notch (if iPhone)
        ├── Loading Indicator
        └── WebView/iframe
```

**Props**:
```typescript
interface PreviewPaneProps {
  previewUrl: string;
  onUrlChange: (url: string) => void;
  onPublish: () => void;
  deviceFrame?: DeviceFrame;
  onDeviceChange?: (device: DeviceFrame) => void;
}

type DeviceFrame = 'iphone' | 'android' | 'desktop';
```

**Device Frame Dimensions**:
```typescript
const frames = {
  iphone:  { width: '375px', height: '667px', label: 'iPhone' },
  android: { width: '360px', height: '640px', label: 'Android' },
  desktop: { width: '100%',  height: '100%',  label: 'Desktop' }
};
```

**Key Features**:
- 3 device frame modes (cycle button)
- Browser-like navigation controls
- URL bar with enter-to-navigate
- Open in external browser
- Device-specific styling (iPhone notch, Android radius)
- Animated frame transitions
- Loading states with spinner

**Device Frame Styling**:
```typescript
// iPhone: Rounded corners + notch
className="rounded-[3rem]"
<div className="notch" /> // Top center

// Android: Subtle rounding
className="rounded-lg"

// Desktop: Full screen
className="w-full h-full"
```

**Navigation Controls**:
- Back/Forward buttons (disabled state styling)
- Refresh with loading indicator
- URL input with chevron submit button
- External browser via Tauri shell API

### 4. Publishing Pane

**Purpose**: Subdomain configuration and deployment workflow

**File**: `src/components/mobile/workspace/panes/PublishingPane.tsx`

**Component Hierarchy**:
```
PublishingPane
├── Header
│   ├── Back Button
│   ├── Publishing Title + Icon
│   └── Menu Button
├── Content (Scrollable)
│   ├── Heading + Description
│   ├── Primary URL Section
│   │   ├── Subdomain Input
│   │   ├── Suffix Display (.opcode.app)
│   │   └── Availability Indicator (Check/X/Loading)
│   ├── Upgrade Promo Card
│   │   ├── Features List (4 benefits)
│   │   ├── Free Domain Badge
│   │   └── Upgrade CTA Button
│   ├── Publish Button (Primary action)
│   ├── Published Status Card (Success state)
│   ├── Info Expandable Section
│   │   ├── What Publishing Does
│   │   ├── Pricing Info
│   │   └── Video/Docs Links
│   └── Deployment History (Recent 5)
```

**Props**:
```typescript
interface PublishingPaneProps {
  subdomain: string;
  onSubdomainChange: (value: string) => void;
  isAvailable: boolean;
  isChecking: boolean;
  publishStatus: 'unpublished' | 'publishing' | 'published';
  onPublish: () => void;
  deploymentHistory?: Deployment[];
  suffix?: string; // Default: ".opcode.app"
}
```

**Deployment Interface**:
```typescript
interface Deployment {
  id: string;
  subdomain: string;
  status: 'active' | 'building' | 'failed';
  timestamp: Date;
  url: string;
}
```

**Key Features**:
- Real-time subdomain availability checking
- Input validation (alphanumeric + hyphens)
- Debounced availability checks (500ms)
- Upgrade promo with 4 benefits
- Expandable info section
- Deployment history list
- Status indicators (green=available, red=taken)

**Subdomain Validation**:
```typescript
// Input sanitization
value.toLowerCase().replace(/[^a-z0-9-]/g, '')

// Validation regex
/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/

// Reserved subdomains
['www', 'api', 'admin', 'app', 'staging', 'dev', 'prod']
```

**Publish Workflow**:
```
1. Enter subdomain → Auto-check availability (debounced)
2. Show green checkmark if available
3. Click "Publish app" button
4. Show "Publishing..." with spinner
5. Show success card with live URL link
6. Add to deployment history
```

**Upgrade Promo Features**:
- Free '.com' domain (up to $13)
- Monthly Opcode Agent credits
- Publish and persist live apps
- Access to powerful models

### 5. Share Pane

**Purpose**: Collaboration, embedding, and social sharing

**File**: `src/components/mobile/workspace/panes/SharePane.tsx`

**Component Hierarchy**:
```
SharePane
├── Header (Sticky)
├── Content (Scrollable)
│   ├── Share Link Section
│   │   ├── URL Preview Card
│   │   └── Copy Link + Share Buttons
│   ├── Collaboration Section
│   │   ├── Invite Form (Email + Permission)
│   │   └── Collaborator List (Avatar, Info, Actions)
│   ├── Embed Section
│   │   ├── Size Selector (Small/Medium/Large)
│   │   ├── Embed Code Preview
│   │   └── Copy Embed Button
│   └── Social Sharing Section
│       ├── Twitter/X Button
│       ├── LinkedIn Button
│       ├── Copy Link Button
│       └── QR Code Button + Display
```

**Props**:
```typescript
interface SharePaneProps {
  projectUrl: string;
  projectName: string;
  collaborators: Collaborator[];
  onInvite: (email: string, permission: 'view' | 'edit' | 'admin') => void;
  onShare: (platform: 'twitter' | 'linkedin' | 'system') => void;
  onCopyLink: () => void;
  onRemoveCollaborator?: (id: string) => void;
  onUpdatePermission?: (id: string, permission) => void;
}
```

**Collaborator Interface**:
```typescript
interface Collaborator {
  id: string;
  email: string;
  name?: string;
  permission: 'view' | 'edit' | 'admin';
  avatarUrl?: string;
  joinedAt: Date;
}
```

**Embed Sizes**:
```typescript
const EMBED_SIZES = {
  small:  { width: 400,  height: 300 },
  medium: { width: 800,  height: 600 },
  large:  { width: 1200, height: 900 }
};
```

**Key Features**:
- One-tap link copying with feedback
- Native share sheet integration (if available)
- Email validation for invites
- Permission management dropdown
- Collaborator removal
- 3 embed sizes with live preview
- Social platform sharing (Twitter, LinkedIn)
- QR code generation
- Haptic feedback on all actions

**Share Methods**:
1. **Copy Link**: Clipboard API + 2s "Copied!" feedback
2. **System Share**: Native share sheet (`navigator.share`)
3. **Email Invite**: Form validation → API call
4. **Embed Code**: iframe generator → clipboard
5. **Social**: Opens platform share URL in new window
6. **QR Code**: Toggle display with mock QR icon

**Permission Levels**:
- **View**: Read-only access
- **Edit**: Can modify files
- **Admin**: Full control + invite others

## Navigation Components

### WorkspaceHeader

**File**: `src/components/mobile/workspace/WorkspaceHeader.tsx`

**Purpose**: Top navigation bar with project name and actions

**Features**:
- Back button (chevron left)
- Project name display (truncated)
- More options dropdown menu
  - Show Tools
  - Project Settings
  - Share Project

**Structure**:
```typescript
<header className="flex items-center justify-between">
  <Button onClick={onBack}>
    <ChevronLeft />
  </Button>
  <h1>{projectName}</h1>
  <DropdownMenu>
    <DropdownMenuItem onClick={onMenuClick}>Show Tools</DropdownMenuItem>
    <DropdownMenuItem>Project Settings</DropdownMenuItem>
    <DropdownMenuItem>Share Project</DropdownMenuItem>
  </DropdownMenu>
</header>
```

### WorkspaceToolbar

**File**: `src/components/mobile/workspace/panes/WorkspaceToolbar.tsx`

**Purpose**: Bottom navigation with 6 icons (Stop + 5 panes)

**Icon Layout**:
```
[Stop] [Console] [Agent] [Deploy] [Share] [Preview]
```

**Features**:
- Stop button (red when agent running)
- 5 pane selectors with icons
- Blue underline for active pane
- Haptic feedback on tap
- 44x44 touch targets (WCAG AA)
- Safe area bottom padding

**Pane Icons**:
```typescript
const panes = [
  { id: 'console', Icon: Terminal, label: 'Console' },
  { id: 'agent',   Icon: Grid3x3,  label: 'Agent' },
  { id: 'deploy',  Icon: Network,  label: 'Deploy' },
  { id: 'share',   Icon: Share2,   label: 'Share' },
  { id: 'preview', Icon: Monitor,  label: 'Preview' }
];
```

**Active State Styling**:
```css
/* Active pane */
.active {
  color: white;
  border-bottom: 2px solid #3b82f6; /* Blue underline */
}

/* Inactive pane */
.inactive {
  color: #a1a1aa; /* Zinc-400 */
}
```

### ToolsOverlay

**File**: `src/components/mobile/workspace/ToolsOverlay.tsx`

**Purpose**: Full-screen slide-up menu with 18 tools

**Tool Categories**:
1. **Search** (2 tools)
   - Search (Search through files)
   - Files (Find a file)

2. **Tools** (16 tools)
   - Agent, Assistant, Publishing
   - App Storage, Auth, Console
   - Database, Developer, Git
   - Integrations, Multiplayer, Preview
   - KV Store, Secrets, Security
   - Shell, Settings, Workflows

**Features**:
- Search bar with live filtering
- Tool items with icon + description
- Slide-up animation (spring physics)
- Dark overlay backdrop
- Close button (X icon)
- Clear search button
- Staggered tool appearance
- Empty state for no results

**Tool Item Structure**:
```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'search' | 'tools';
}
```

**Animation**:
```typescript
// Slide up from bottom
initial={{ y: '100%' }}
animate={{ y: 0 }}
exit={{ y: '100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}

// Stagger tool items
transition={{ delay: index * 0.03 }}
```

## State Management

### workspaceStore

**File**: `src/stores/workspaceStore.ts`

**Technology**: Zustand with persistence and subscriptions

**State Structure**:
```typescript
interface WorkspaceState {
  // Project
  currentProject: { id: string; name: string; path: string } | null;

  // Navigation
  activePane: WorkspacePane;
  toolsOverlayOpen: boolean;

  // Agent
  agentStatus: 'idle' | 'running' | 'error' | 'complete';
  tasks: Task[];
  currentTaskId: string | null;
  checkpoints: Checkpoint[];
  workDurationSeconds: number;

  // Preview
  previewUrl: string;
  deviceFrame: DeviceFrame;
  isPreviewLoading: boolean;

  // Publishing
  subdomain: string;
  subdomainAvailable: boolean | null;
  publishStatus: 'unpublished' | 'checking' | 'publishing' | 'published' | 'error';
  publishError: string | null;
}
```

**Key Actions**:
```typescript
// Project
setProject(project)
resetWorkspace()

// Navigation
setActivePane(pane)
openToolsOverlay()
closeToolsOverlay()

// Agent
startAgent(taskDescription)
stopAgent()
addTask(task)
updateTask(taskId, updates)
addCheckpoint(checkpoint)
rollbackToCheckpoint(checkpointId)
incrementWorkDuration()
clearTasks()

// Preview
setPreviewUrl(url)
setDeviceFrame(frame)
setPreviewLoading(loading)
refreshPreview()

// Publishing
setSubdomain(subdomain)
checkSubdomainAvailability()
publish()
unpublish()
```

**Selector Hooks**:
```typescript
// Optimized selectors for common state
useCurrentProject()
useActivePane()
useAgentStatus()
useTasks()
useCurrentTask()
usePreview()
usePublishing()
```

**Persistence**:
```typescript
// Only persist user preferences
persist(workspaceStore, {
  name: 'workspace-storage',
  partialize: (state) => ({
    deviceFrame: state.deviceFrame,
    subdomain: state.subdomain,
    previewUrl: state.previewUrl
  })
})
```

## Integration Patterns

### With AppsScreen

**Navigation Flow**:
```typescript
// AppsScreen.tsx
const { setProject, currentProject } = useWorkspaceStore();

// Select project → Show workspace
handleProjectSelect(project) {
  setProject({ id, name, path });
  setShowWorkspace(true);
}

// Conditional rendering
if (showWorkspace && currentProject) {
  return <WorkspaceScreen />;
}
return <ProjectList />;
```

### With Existing Components

**Terminal Integration**:
```typescript
// ConsolePane uses existing MobileTerminal components
import { TerminalInput } from '@/components/mobile/terminal/TerminalInput';
import { CodeKeyboard } from '@/components/mobile/terminal/CodeKeyboard';
import { QuickCommands } from '@/components/mobile/terminal/QuickCommands';
```

**Preview Integration**:
```typescript
// PreviewPane uses PreviewWebView patterns
import { motion, AnimatePresence } from 'framer-motion';
// Device frames, browser controls, external open
```

**Tools Integration**:
```typescript
// ToolsOverlay uses ToolsMenu component structure
import { ToolItem } from '../tools/ToolItem';
// 18 tools list with search
```

### With Tauri Backend

**Command Execution**:
```typescript
// Console commands
await invoke<string>('execute_terminal_command', {
  command,
  cwd: projectPath,
  projectId
});
```

**External Browser**:
```typescript
// Open preview in system browser
const { open } = await import('@tauri-apps/api/shell');
await open(currentUrl);
```

## Styling

### Dark Theme

**Color Palette**:
```css
/* Primary colors */
--background: oklch(0.1450 0 0);     /* #1e1e1e */
--foreground: oklch(0.9851 0 0);     /* #ffffff */
--card: oklch(0.2050 0 0);           /* #2a2a2a */
--border: oklch(0.3211 0 0);         /* #3f3f3f */

/* Status colors */
--blue-500: #3b82f6;    /* Active, info */
--green-500: #22c55e;   /* Success, available */
--red-500: #ef4444;     /* Error, unavailable */
--amber-500: #f59e0b;   /* Warning */
--purple-500: #a855f7;  /* Upgrade promo */

/* Terminal colors */
--terminal-bg: #1e1e1e;
--terminal-input: #4fc3f7;    /* Cyan */
--terminal-output: #d4d4d4;   /* Gray */
--terminal-error: #f44336;    /* Red */
```

**Typography**:
```css
/* Font families */
--font-sans: system-ui, -apple-system, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* Font sizes */
text-xs: 0.75rem;    /* 12px - labels */
text-sm: 0.875rem;   /* 14px - body */
text-base: 1rem;     /* 16px - body */
text-lg: 1.125rem;   /* 18px - headings */
text-xl: 1.25rem;    /* 20px - headings */
text-2xl: 1.5rem;    /* 24px - titles */
```

### Responsive Design

**Safe Areas**:
```css
/* Bottom toolbar safe area */
padding-bottom: env(safe-area-inset-bottom);

/* Top header safe area */
padding-top: env(safe-area-inset-top);
```

**Touch Targets**:
```css
/* WCAG AA minimum */
min-width: 44px;
min-height: 44px;

/* Toolbar buttons */
.toolbar-button {
  min-width: 64px;
  min-height: 48px;
}
```

**Breakpoints**:
```css
/* Phone (default) */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

## Accessibility

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- All interactive elements focusable
- Tab order follows visual layout
- Escape closes overlays
- Enter submits forms

**Screen Reader Support**:
```typescript
// Button labels
<button aria-label="Go back">
  <ChevronLeft />
</button>

// Current page indicator
<button aria-current={isActive ? 'page' : undefined}>
  {pane.label}
</button>

// Loading states
<div role="status" aria-live="polite">
  Publishing...
</div>
```

**Focus Management**:
```typescript
// Auto-focus search in overlay
<Input autoFocus placeholder="Search..." />

// Focus trap in modals
useEffect(() => {
  if (isOpen) {
    trapFocus(overlayRef.current);
  }
}, [isOpen]);
```

**Color Contrast**:
- Text on background: 7:1 (AAA)
- Interactive elements: 4.5:1 (AA)
- Icons and graphics: 3:1 (AA)

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing

### Unit Tests

**Component Tests** (`tests/mobile/components/`):
```typescript
// AgentPane.test.tsx
describe('AgentPane', () => {
  it('renders task list with status indicators', () => {});
  it('shows loading state when agent running', () => {});
  it('calls onRollback when checkpoint clicked', () => {});
  it('displays error message in error state', () => {});
});

// ConsolePane.test.tsx
describe('ConsolePane', () => {
  it('executes commands in project directory', () => {});
  it('displays output with correct colors', () => {});
  it('auto-scrolls to bottom on new output', () => {});
});

// PreviewPane.test.tsx
describe('PreviewPane', () => {
  it('cycles through device frames', () => {});
  it('navigates to URL on enter key', () => {});
  it('shows loading indicator during load', () => {});
});
```

### Integration Tests

**Navigation Flow** (`tests/mobile/integration/workspace.test.tsx`):
```typescript
describe('Workspace Navigation', () => {
  it('navigates from AppsScreen to WorkspaceScreen', () => {});
  it('switches between panes via toolbar', () => {});
  it('opens and closes tools overlay', () => {});
  it('persists active pane on reload', () => {});
});
```

### Coverage Targets

| Component | Line Coverage | Branch Coverage |
|-----------|--------------|-----------------|
| AgentPane | >80% | >75% |
| ConsolePane | >80% | >75% |
| PreviewPane | >80% | >75% |
| PublishingPane | >80% | >75% |
| SharePane | >80% | >75% |
| WorkspaceStore | >90% | >85% |

**Run Tests**:
```bash
npm run test:mobile              # All mobile tests
npm run test:mobile:watch        # Watch mode
npm run test:mobile:coverage     # Coverage report
```

## Performance

### Optimization Strategies

**Lazy Loading**:
```typescript
// Defer non-critical panes
const SharePane = lazy(() => import('./panes/SharePane'));
const PublishingPane = lazy(() => import('./panes/PublishingPane'));

<Suspense fallback={<LoadingSkeleton />}>
  {activePane === 'share' && <SharePane />}
</Suspense>
```

**Memoization**:
```typescript
// Expensive computations
const filteredTools = useMemo(() => {
  return TOOLS.filter(tool =>
    tool.name.includes(searchQuery)
  );
}, [searchQuery]);

// Callbacks
const handlePaneChange = useCallback((pane) => {
  setActivePane(pane);
}, []);
```

**Virtual Scrolling**:
```typescript
// Large task lists in AgentPane
import { VirtualList } from '@/components/mobile/common/VirtualList';

<VirtualList
  items={tasks}
  height={400}
  itemHeight={60}
  renderItem={(task) => <TaskItem task={task} />}
/>
```

### Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Pane Switch Animation | 60fps | Configured |
| Overlay Open Time | <200ms | Configured |
| Command Execution | <100ms | Platform-dependent |
| Preview Load | <2s | Network-dependent |

## Future Enhancements

### Planned Features

**Offline Support**:
- Service worker for offline access
- IndexedDB for command history
- Cached preview snapshots
- Offline task queue

**Push Notifications**:
- Agent task completion alerts
- Deployment status updates
- Collaborator activity
- Error notifications

**Real-time Collaboration**:
- Live cursor positions
- Shared terminal sessions
- Real-time file sync
- Presence indicators

**Advanced Agent Features**:
- Multiple concurrent agents
- Agent templates library
- Custom agent personalities
- Agent performance metrics

**Enhanced Preview**:
- Multiple device frames side-by-side
- Network throttling simulation
- Accessibility audits
- Performance profiling

## Troubleshooting

### Common Issues

**Pane not switching**:
```typescript
// Check activePane state
console.log(useWorkspaceStore.getState().activePane);

// Ensure toolbar callback connected
<WorkspaceToolbar onPaneChange={setActivePane} />
```

**Terminal commands failing**:
```typescript
// Verify Tauri command registered
// In src-tauri/src/main.rs
.invoke_handler(tauri::generate_handler![execute_terminal_command])

// Check project path
console.log(currentProject?.path);
```

**Preview not loading**:
```typescript
// Check CORS configuration
// Preview URL must allow iframe embedding
X-Frame-Options: ALLOW-FROM https://your-app.com

// Verify iframe sandbox
sandbox="allow-scripts allow-same-origin allow-forms"
```

**Store state not persisting**:
```typescript
// Check localStorage
localStorage.getItem('workspace-storage');

// Verify partialize config
partialize: (state) => ({
  deviceFrame: state.deviceFrame,
  subdomain: state.subdomain,
  previewUrl: state.previewUrl
})
```

## References

### Related Documentation

- [Mobile Implementation Summary](./MOBILE_IMPLEMENTATION_SUMMARY.md)
- [Architecture](./ARCHITECTURE.md)
- [Swipeable Panes](./SWIPEABLE_PANES.md)
- [Mobile Polish](./MOBILE_POLISH.md)
- [Performance Optimization](./performance-optimization.md)

### External Resources

- [Replit Mobile UX Inspiration](https://replit.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Zustand Guide](https://docs.pmnd.rs/zustand)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Maintainers**: Opcode Mobile Team
**Last Review**: December 7, 2025
**Next Review**: January 2026
