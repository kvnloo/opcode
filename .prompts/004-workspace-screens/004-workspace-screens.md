# Workspace Screens Implementation - 15 Agent Parallel Execution

## Objective
Implement the 5 remaining workspace screens for the Opcode mobile app based on Replit mobile screenshots. Use SPARC orchestration with 15 agents for maximum parallelization.

## Screenshot Reference Analysis

### Workspace Screen Layout (from screenshots)
The workspace has a **6-icon bottom toolbar** when inside a project:
1. **Stop button** (square) - Stop/cancel current operation
2. **Console** (terminal icon) - Terminal/shell view
3. **Agent** (grid icon) - AI agent execution view
4. **Deployments** (tree/network icon) - Publishing/deployments
5. **Share** (share icon) - Sharing options
6. **Preview** (device frames icon) - Live preview

### Screen Details from Screenshots:

**Screen 4: Agent View** (`Screenshot_20251207_124526_Replit.png`, `Screenshot_20251207_124540_Replit.png`)
- Header: Back button, project name "Hex Conquest", menu
- Title bar: "Agent" with grid icon
- Collapsible task sections with progress (0/8)
- Task description with "Show more" expansion
- Current action: "Implementing combat visual feedback"
- File edit indicator: "Edited client/src/lib/stores/useHexConquest.ts"
- Error state: "Agent encountered an error while running"
- Checkpoint with timestamp: "3 minutes ago"
- Action buttons: "Rollback here", "Changes", "View preview"
- Expandable "Worked for 3 minutes" section
- Upgrade prompt card at bottom
- Quick access bar: Secrets, Database, Auth, New Tab + Search

**Screen 5: Preview** (`Screenshot_20251207_124550_Replit.png`)
- Header tabs: "Publish" button (left), "Preview" (center, active)
- Device frame toggle (right side)
- Browser controls: Back, Forward, Refresh, URL bar "/", "Open in browser"
- Full WebView showing the app preview
- Same 6-icon bottom toolbar

**Screen 6: Publishing** (`Screenshot_20251207_124556_Replit.png`)
- Header: Back button, "Publishing" title with icon
- "Publish your app" heading
- Primary URL section with subdomain input
- Domain format: "[subdomain].replit.app"
- Availability check with green checkmark
- Upgrade promo card with benefits list
- "What does publishing do?" expandable section
- Info about app availability and costs
- "Watch video" and "Learn more" buttons

**Screen 7: Tools Menu** (`Screenshot_20251207_124607_Replit.png`)
- Full-screen overlay with search bar
- "Search for tools and files" placeholder
- "Close" button (top right)
- Search section with arrow
- Files section with arrow
- Tools list (18 items visible):
  - Agent, Assistant, Publishing, App Storage
  - Auth, Console, Database, Developer
  - Git, Integrations, Multiplayer, Preview
  - Replit Key-Value Store, Secrets, Security Scanner
  - Shell, User Settings, Workflows
- Each tool has icon, name, and description

**Screen 8: Workspace Bottom Bar** (visible in multiple screenshots)
- 6 icons in fixed bottom bar
- Active icon highlighted
- Swipe indicator line at bottom

## File Structure to Create

```
src/
├── screens/mobile/
│   └── WorkspaceScreen.tsx              # Main workspace container
├── components/mobile/workspace/
│   ├── panes/
│   │   ├── AgentPane.tsx                # Agent execution view
│   │   ├── ConsolePane.tsx              # Terminal/console view
│   │   ├── PreviewPane.tsx              # Live preview with WebView
│   │   ├── PublishingPane.tsx           # Publishing/deployments
│   │   ├── SharePane.tsx                # Sharing options
│   │   └── index.ts                     # Pane exports
│   ├── WorkspaceToolbar.tsx             # 6-icon bottom toolbar
│   ├── WorkspaceHeader.tsx              # Header with back, title, menu
│   ├── QuickAccessBar.tsx               # Secrets, Database, Auth, etc.
│   └── ToolsOverlay.tsx                 # Full-screen tools menu
├── stores/
│   └── workspaceStore.ts                # Workspace state management
└── lib/mobile/workspace/
    └── types.ts                         # Workspace type definitions
```

## Agent Assignment (15 Agents)

### Phase 1: Foundation (3 agents in parallel)
| Agent | Task | Output |
|-------|------|--------|
| system-architect | Design workspace architecture and state management | `docs/mobile/WORKSPACE_ARCHITECTURE.md`, `src/lib/mobile/workspace/types.ts` |
| coder | Create WorkspaceScreen container with toolbar integration | `src/screens/mobile/WorkspaceScreen.tsx` |
| frontend-architect | Create WorkspaceToolbar with 6 icons | `src/components/mobile/workspace/WorkspaceToolbar.tsx` |

### Phase 2: Core Panes (5 agents in parallel)
| Agent | Task | Output |
|-------|------|--------|
| mobile-dev-1 | Implement AgentPane with task progress, actions | `src/components/mobile/workspace/panes/AgentPane.tsx` |
| mobile-dev-2 | Implement ConsolePane (terminal integration) | `src/components/mobile/workspace/panes/ConsolePane.tsx` |
| mobile-dev-3 | Implement PreviewPane with WebView, browser controls | `src/components/mobile/workspace/panes/PreviewPane.tsx` |
| mobile-dev-4 | Implement PublishingPane with domain config | `src/components/mobile/workspace/panes/PublishingPane.tsx` |
| mobile-dev-5 | Implement SharePane with sharing options | `src/components/mobile/workspace/panes/SharePane.tsx` |

### Phase 3: Supporting Components (4 agents in parallel)
| Agent | Task | Output |
|-------|------|--------|
| coder | Create ToolsOverlay (full-screen tools menu) | `src/components/mobile/workspace/ToolsOverlay.tsx` |
| frontend-architect | Create QuickAccessBar (Secrets, Database, etc.) | `src/components/mobile/workspace/QuickAccessBar.tsx` |
| coder | Create WorkspaceHeader with navigation | `src/components/mobile/workspace/WorkspaceHeader.tsx` |
| backend-dev | Create Zustand store for workspace state | `src/stores/workspaceStore.ts` |

### Phase 4: Integration & Testing (3 agents in parallel)
| Agent | Task | Output |
|-------|------|--------|
| coder | Update AppsScreen to navigate to WorkspaceScreen | Updated `src/screens/mobile/AppsScreen.tsx` |
| tester | Create comprehensive tests for workspace | `tests/mobile/workspace/*.test.tsx` |
| technical-writer | Update documentation | `docs/mobile/WORKSPACE_SCREENS.md` |

## Detailed Component Specifications

### WorkspaceScreen.tsx
```tsx
// Container for all workspace panes
// Props: projectId, projectName
// State: activePane (0-5), toolsOverlayOpen
// Features:
// - Renders active pane based on toolbar selection
// - Manages pane transitions (slide animation)
// - Handles back navigation to AppsScreen
// - Shows ToolsOverlay when triggered from QuickAccessBar
```

### WorkspaceToolbar.tsx
```tsx
// 6-icon fixed bottom toolbar
// Icons (left to right):
// 1. Stop (square) - stops current operation
// 2. Console (terminal) - shows ConsolePane
// 3. Agent (grid) - shows AgentPane
// 4. Deploy (tree) - shows PublishingPane
// 5. Share (share) - shows SharePane
// 6. Preview (frames) - shows PreviewPane
// Features:
// - Active icon highlighted with underline
// - Haptic feedback on tap
// - Icon animations on state change
```

### AgentPane.tsx (Most Complex)
```tsx
// Based on screenshots 124526 and 124540
// Sections:
// 1. Task Progress Header
//    - Collapsible with chevron
//    - Task title + progress (0/8)
//    - Current task description
// 2. Task Details Card
//    - "Task" label with expand icon
//    - Full task description
//    - "Show more" toggle
// 3. Current Action
//    - Action description text
//    - File edit indicator with icon
// 4. Error State (conditional)
//    - Error message with warning styling
// 5. Checkpoint Section
//    - Green checkmark + timestamp
//    - Task summary
//    - Action buttons row: Rollback, Changes, View preview
// 6. Work Duration
//    - Expandable "Worked for X minutes"
// 7. Upgrade Card (conditional)
//    - Promo content
// 8. QuickAccessBar
//    - Secrets, Database, Auth, New Tab
//    - Search bar at bottom
```

### PreviewPane.tsx
```tsx
// Based on screenshot 124550
// Header: Publish button | Preview title | Device frames toggle
// Browser controls bar:
// - Back, Forward, Refresh buttons
// - URL input field
// - Arrow button
// - "Open in browser" link
// Main content: WebView iframe
// Features:
// - Device frame selection (iPhone, Android, Desktop)
// - URL navigation
// - Refresh functionality
// - External browser launch
```

### PublishingPane.tsx
```tsx
// Based on screenshot 124556
// Header: Back button, "Publishing" title with icon
// Content:
// 1. "Publish your app" heading
// 2. Primary URL section
//    - Label + description
//    - Input field with subdomain
//    - ".replit.app" suffix
//    - Availability indicator (checkmark)
// 3. Upgrade Promo Card
//    - Star icon + "Limited time offer" heading
//    - Benefits list with icons
//    - "Upgrade now" button
// 4. Info Section
//    - "What does publishing do?" collapsible
//    - Globe icon + description
//    - Dollar icon + costs info
//    - Action buttons: Watch video, Learn more
```

### ToolsOverlay.tsx
```tsx
// Based on screenshot 124607
// Full-screen overlay (modal)
// Header: Search input + Close button
// Sections:
// 1. Search - link to file search
// 2. Files - link to file browser
// 3. Tools list (18 items)
//    - Icon + Name + Description for each
//    - Scrollable list
// Tools to include:
// Agent, Assistant, Publishing, App Storage,
// Auth, Console, Database, Developer,
// Git, Integrations, Multiplayer, Preview,
// Replit Key-Value Store, Secrets, Security Scanner,
// Shell, User Settings, Workflows
```

### workspaceStore.ts
```tsx
// Zustand store for workspace state
interface WorkspaceState {
  // Navigation
  activePane: 'console' | 'agent' | 'deploy' | 'share' | 'preview';
  toolsOverlayOpen: boolean;

  // Project context
  currentProject: { id: string; name: string; } | null;

  // Agent state
  agentTasks: Task[];
  currentTask: Task | null;
  agentStatus: 'idle' | 'running' | 'error' | 'complete';
  workDuration: number;

  // Preview state
  previewUrl: string;
  deviceFrame: 'iphone' | 'android' | 'desktop';

  // Publishing state
  subdomain: string;
  subdomainAvailable: boolean;
  publishStatus: 'unpublished' | 'publishing' | 'published';

  // Actions
  setActivePane: (pane: string) => void;
  openToolsOverlay: () => void;
  closeToolsOverlay: () => void;
  setProject: (project: { id: string; name: string }) => void;
  // ... more actions
}
```

## Execution Instructions

### For Each Agent:
1. Read this prompt completely
2. Review the relevant screenshot(s)
3. Check existing components in `src/components/mobile/` for patterns
4. Use existing libraries: Framer Motion, Radix UI, Tailwind CSS
5. Follow TypeScript strict mode
6. Add proper accessibility attributes
7. Include haptic feedback hooks where appropriate

### Parallel Execution Strategy:
```
Phase 1 (Foundation):     [architect] [coder] [frontend-arch]
                              ↓           ↓          ↓
Phase 2 (Panes):         [mob-1] [mob-2] [mob-3] [mob-4] [mob-5]
                            ↓       ↓       ↓       ↓       ↓
Phase 3 (Support):        [coder] [front] [coder] [backend]
                             ↓       ↓       ↓        ↓
Phase 4 (Integration):    [coder]  [tester]  [writer]
```

## Success Criteria

1. All 5 workspace panes render correctly
2. WorkspaceToolbar switches between panes
3. Navigation from AppsScreen → WorkspaceScreen works
4. ToolsOverlay shows all 18 tools
5. State persists across pane switches
6. Animations are smooth (60fps)
7. All components are accessible
8. Tests cover main functionality

## Output

Save all files to the paths specified in the file structure.
Create `docs/mobile/WORKSPACE_SCREENS.md` with implementation summary.
