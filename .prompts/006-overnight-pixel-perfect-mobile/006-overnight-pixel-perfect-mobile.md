# Overnight Autonomous Mobile Development Meta-Prompt

## Objective

Execute an 8+ hour autonomous development workflow to create a **pixel-perfect, fully functional mobile companion app** for Claude Code. This prompt orchestrates 15 parallel agents across multiple phases to:

1. Analyze inspiration images for pixel-perfect UI
2. Implement real-time Claude Code integration via Tailscale
3. Build proper API layer for live message streaming
4. Create a powerful companion app that mirrors desktop Claude Code functionality

## Vision: Claude Code Mobile Companion

This app should enable users to:
- **Monitor Claude Code sessions in real-time** from their phone
- **View live streaming messages** as Claude works on tasks
- **Execute commands remotely** via Tailscale SSH bridge
- **Manage projects** - view, switch, and monitor across devices
- **Track agent execution** with checkpoints and rollback
- **Review code changes** with diff viewer
- **Deploy and share** projects on the go

---

## Context

### Current State (from git history)
- **Latest commit**: `2e0334d` - Complete mobile app with 232 files, 61K+ lines
- **Mobile components**: 46 components in `src/components/mobile/`
- **Mobile screens**: 4 screens in `src/screens/mobile/`
- **Test suite**: 1,261 tests (947 passing, 75.1% pass rate)
- **TypeScript**: 0 errors

### Inspiration Images (8 Replit screenshots)
Located in `claudedocs/`:
1. `Screenshot_20251207_124526_Replit.png` - Apps/Home screen
2. `Screenshot_20251207_124540_Replit.png` - Create screen
3. `Screenshot_20251207_124550_Replit.png` - Account screen
4. `Screenshot_20251207_124556_Replit.png` - Workspace Agent pane
5. `Screenshot_20251207_124607_Replit.png` - Workspace Console pane
6. `Screenshot_20251207_125036_Replit.png` - Workspace Preview pane
7. `Screenshot_20251207_125042_Replit.png` - Workspace Publishing pane
8. `Screenshot_20251207_125046_Replit.png` - Workspace Share pane

### Referenced Files
@.prompts/001-mobile-architecture-research/mobile-architecture-research.md
@.prompts/002-mobile-implementation-plan/mobile-implementation-plan.md
@docs/mobile/MOBILE_IMPLEMENTATION_SUMMARY.md
@src/lib/mobile/connection/types.ts

---

## Phase 1: UI Analysis & Architecture Planning (Hours 1-2)

### Agent 1-8: UIED Image Analysis (Parallel)

Each agent analyzes one screenshot using `/ui:uied-analysis`:

```
Agent 1: claudedocs/Screenshot_20251207_124526_Replit.png → apps-screen-uied.md
Agent 2: claudedocs/Screenshot_20251207_124540_Replit.png → create-screen-uied.md
Agent 3: claudedocs/Screenshot_20251207_124550_Replit.png → account-screen-uied.md
Agent 4: claudedocs/Screenshot_20251207_124556_Replit.png → agent-pane-uied.md
Agent 5: claudedocs/Screenshot_20251207_124607_Replit.png → console-pane-uied.md
Agent 6: claudedocs/Screenshot_20251207_125036_Replit.png → preview-pane-uied.md
Agent 7: claudedocs/Screenshot_20251207_125042_Replit.png → publishing-pane-uied.md
Agent 8: claudedocs/Screenshot_20251207_125046_Replit.png → share-pane-uied.md

Extract for each:
- All UI elements with exact dimensions
- Color palette (hex values)
- Typography (sizes, weights)
- Spacing system
- Border radii and shadows
- Icon specifications
- Layout grid

Output: .prompts/006-overnight-pixel-perfect-mobile/analysis/
```

### Agent 9: Claude Code API Research
```
Research and document the Claude Code API/IPC interface:

1. Analyze existing desktop Opcode codebase:
   - src-tauri/src/commands/*.rs
   - src/components/ClaudeCodeSession.tsx
   - src/stores/sessionStore.ts

2. Document how desktop app communicates with Claude Code:
   - PTY/terminal integration
   - Message streaming protocol
   - Session management
   - Tool execution tracking

3. Research Tailscale integration:
   - How to establish SSH tunnel from mobile
   - WebSocket bridge over Tailscale
   - Authentication flow

4. Define mobile API requirements:
   - Real-time message streaming
   - Session list/management
   - Command execution
   - File access (read-only initially)

Output: .prompts/006-overnight-pixel-perfect-mobile/api-architecture.md
```

### Agent 10: Gap Analysis & Technical Spec
```
After Agents 1-9 complete:

1. Compare UIED analysis with current implementations
2. Identify missing UI elements
3. Map API requirements to UI components
4. Create technical specification for:
   - Real-time message display in AgentPane
   - Live terminal output in ConsolePane
   - Session switching and management
   - Connection status indicators

Output: .prompts/006-overnight-pixel-perfect-mobile/technical-spec.md
```

---

## Phase 2: Core Infrastructure (Hours 2-4)

### Agent 11: Tailscale Connection Layer
```
Implement Tailscale SSH bridge for mobile:

Files to create/modify:
- src-tauri/src/commands/mobile/tailscale.rs
- src/lib/mobile/connection/tailscale.ts
- src/components/mobile/connection/TailscaleConnect.tsx (update)

Implementation:
1. Tailscale device discovery:
   - List available Tailscale devices
   - Show connection status per device
   - Store device preferences

2. SSH tunnel establishment:
   - Use Tauri plugin for SSH (or WebSocket bridge)
   - Handle authentication (key-based preferred)
   - Maintain persistent connection
   - Auto-reconnect on network change

3. Connection state management:
   - ConnectionStatus enum: disconnected, connecting, connected, error
   - Zustand store for connection state
   - Visual indicators in UI

Rust backend (src-tauri/src/commands/mobile/tailscale.rs):
```rust
use tauri::command;

#[command]
pub async fn tailscale_discover_devices() -> Result<Vec<TailscaleDevice>, String> {
    // Discover Tailscale network devices
}

#[command]
pub async fn tailscale_connect(device_id: String, ssh_key: String) -> Result<ConnectionHandle, String> {
    // Establish SSH connection via Tailscale
}

#[command]
pub async fn tailscale_execute(handle: ConnectionHandle, command: String) -> Result<String, String> {
    // Execute command on remote machine
}
```

Test with: tailscale ping <device> from mobile
```

### Agent 12: Claude Code Message Streaming API
```
Implement real-time message streaming from Claude Code:

Files to create/modify:
- src/lib/mobile/api/claudeCodeStream.ts
- src/lib/mobile/api/messageParser.ts
- src/hooks/mobile/useClaudeCodeStream.ts
- src/stores/messageStore.ts

Implementation:
1. WebSocket connection over Tailscale:
   - Connect to Claude Code's message output
   - Parse JSONL message format
   - Handle tool calls, results, and text

2. Message type definitions:
```typescript
interface ClaudeMessage {
  id: string;
  type: 'text' | 'tool_use' | 'tool_result' | 'error';
  content: string;
  timestamp: number;
  metadata?: {
    toolName?: string;
    toolInput?: Record<string, unknown>;
    filePath?: string;
  };
}

interface ClaudeSession {
  id: string;
  projectPath: string;
  startedAt: number;
  status: 'active' | 'idle' | 'completed';
  messages: ClaudeMessage[];
  currentTask?: string;
}
```

3. Stream hook:
```typescript
export function useClaudeCodeStream(sessionId: string) {
  const [messages, setMessages] = useState<ClaudeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://tailscale-device:port/claude/sessions/${sessionId}/stream`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => ws.close();
  }, [sessionId]);

  return { messages, isConnected, error };
}
```

4. Message store with Zustand:
```typescript
interface MessageStore {
  sessions: Map<string, ClaudeSession>;
  activeSessionId: string | null;
  addMessage: (sessionId: string, message: ClaudeMessage) => void;
  setActiveSession: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;
}
```
```

### Agent 13: Session Management API
```
Implement session discovery and management:

Files to create/modify:
- src/lib/mobile/api/sessions.ts
- src/hooks/mobile/useSessions.ts
- src/stores/sessionStore.ts (mobile version)

Implementation:
1. Session discovery:
   - List active Claude Code sessions on remote machine
   - Parse ~/.claude/projects/ for project metadata
   - Get session history with first messages

2. Session API:
```typescript
// List all sessions on connected device
async function listSessions(): Promise<ClaudeSession[]> {
  const result = await invoke('list_claude_sessions');
  return parseSessionList(result);
}

// Get session details
async function getSession(sessionId: string): Promise<ClaudeSession> {
  const result = await invoke('get_claude_session', { sessionId });
  return parseSession(result);
}

// Resume/attach to session
async function attachToSession(sessionId: string): Promise<WebSocket> {
  return createSessionStream(sessionId);
}
```

3. Project metadata:
```typescript
interface ProjectMetadata {
  path: string;
  name: string;
  lastModified: number;
  claudeMdExists: boolean;
  sessionCount: number;
  latestSession?: {
    id: string;
    startedAt: number;
    firstMessage: string;
  };
}
```

4. Polling for updates:
   - Poll session list every 5 seconds when on Apps screen
   - Push notifications for session status changes (future)
```

### Agent 14: Remote Command Execution
```
Implement secure command execution on remote machine:

Files to create/modify:
- src/lib/mobile/api/commands.ts
- src/hooks/mobile/useRemoteTerminal.ts
- src/components/mobile/terminal/MobileTerminal.tsx (update)

Implementation:
1. Command execution via SSH:
```typescript
async function executeCommand(command: string): Promise<CommandResult> {
  const connection = useConnectionStore.getState().activeConnection;
  if (!connection) throw new Error('Not connected');

  return invoke('ssh_execute', {
    connectionId: connection.id,
    command,
    timeout: 30000
  });
}
```

2. PTY streaming for interactive commands:
```typescript
function useRemoteTerminal() {
  const [output, setOutput] = useState<string[]>([]);
  const ptyRef = useRef<RemotePTY | null>(null);

  const connect = async () => {
    ptyRef.current = await invoke('ssh_pty_create');
    ptyRef.current.onData((data) => {
      setOutput(prev => [...prev, data]);
    });
  };

  const write = (data: string) => {
    ptyRef.current?.write(data);
  };

  return { output, connect, write };
}
```

3. Quick commands:
   - Pre-defined safe commands (git status, ls, etc.)
   - Claude Code specific: /compact, /clear, /help
   - Custom user commands

4. Safety measures:
   - Command allowlist for quick commands
   - Confirmation for destructive commands
   - Rate limiting
```

### Agent 15: Design Token System
```
Create unified design system from UIED analysis:

Files to create:
- src/styles/mobile/tokens.css
- src/styles/mobile/tokens.ts
- Update tailwind.config.mobile.js

Implementation:
1. Extract from all 8 UIED analyses:
   - Color palette (Replit dark theme)
   - Typography scale
   - Spacing system
   - Border radii
   - Shadows
   - Animation curves

2. CSS Custom Properties:
```css
:root {
  /* Colors */
  --color-bg-primary: #0d1117;
  --color-bg-secondary: #161b22;
  --color-bg-tertiary: #21262d;
  --color-text-primary: #f0f6fc;
  --color-text-secondary: #8b949e;
  --color-text-muted: #6e7681;
  --color-accent-primary: #58a6ff;
  --color-accent-success: #3fb950;
  --color-accent-warning: #d29922;
  --color-accent-error: #f85149;

  /* Typography */
  --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

3. TypeScript constants for programmatic access
4. Update Tailwind config to use tokens
```

---

## Phase 3: UI Implementation & Integration (Hours 4-6)

### Agent 1: Apps Screen with Live Sessions
```
Refine AppsScreen to show real-time session data:

Files to modify:
- src/screens/mobile/AppsScreen.tsx
- src/components/mobile/apps/ProjectCard.tsx
- src/components/mobile/apps/ProjectList.tsx

Changes:
1. Integrate with session API:
   - Show live sessions at top
   - Indicate active Claude Code activity
   - Show last message preview

2. Project cards show:
   - Live status indicator (green pulse if active)
   - Current task preview
   - Time elapsed
   - Message count

3. Pull-to-refresh fetches latest sessions

4. Real-time updates via WebSocket

UI must match apps-screen-uied.md exactly
```

### Agent 2: Create Screen with Remote Project Creation
```
Refine CreateScreen for remote project initialization:

Files to modify:
- src/screens/mobile/CreateScreen.tsx
- src/components/mobile/create/PromptInput.tsx

Changes:
1. Connect to remote machine to:
   - List available templates
   - Create new project in specified path
   - Initialize Claude Code session

2. Prompt input sends to Claude Code:
   - Execute initial prompt via SSH
   - Stream response back
   - Navigate to workspace on success

3. Template selection from remote

UI must match create-screen-uied.md exactly
```

### Agent 3: Account Screen with Connection Management
```
Refine AccountScreen for multi-device management:

Files to modify:
- src/screens/mobile/AccountScreen.tsx
- src/components/mobile/account/SettingsList.tsx

Changes:
1. Show connected Tailscale devices
2. Connection preferences:
   - Default device
   - Auto-connect on launch
   - SSH key management

3. Usage statistics from connected device

4. Session preferences:
   - Notification settings
   - Theme sync
   - Default workspace pane

UI must match account-screen-uied.md exactly
```

### Agent 4: Agent Pane with Live Claude Messages
```
THE CORE FEATURE - Real-time Claude Code message display:

Files to modify:
- src/components/mobile/workspace/panes/AgentPane.tsx
- src/components/mobile/agent/TaskProgress.tsx
- src/components/mobile/agent/MessageList.tsx (NEW)

Implementation:
1. Live message streaming:
```typescript
function AgentPane() {
  const { activeSessionId } = useWorkspaceStore();
  const { messages, isConnected } = useClaudeCodeStream(activeSessionId);

  return (
    <div className="flex flex-col h-full">
      <ConnectionIndicator connected={isConnected} />
      <MessageList messages={messages} />
      <QuickActionsBar />
    </div>
  );
}
```

2. Message rendering by type:
   - Text: Markdown with syntax highlighting
   - Tool use: Collapsible with tool name + input
   - Tool result: Collapsible with output preview
   - File edits: Diff viewer integration

3. Auto-scroll to latest message

4. Task grouping:
   - Group messages by task/goal
   - Show progress percentage
   - Checkpoint integration

5. Action buttons:
   - Rollback (send /undo command)
   - Stop (send interrupt signal)
   - View full output

UI must match agent-pane-uied.md exactly
```

### Agent 5: Console Pane with Remote Terminal
```
Implement live remote terminal:

Files to modify:
- src/components/mobile/workspace/panes/ConsolePane.tsx
- src/components/mobile/terminal/MobileTerminal.tsx

Implementation:
1. Connect to remote PTY:
```typescript
function ConsolePane() {
  const { output, connect, write, isConnected } = useRemoteTerminal();

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <TerminalOutput lines={output} />
      <TerminalInput onSubmit={write} />
      <CodeKeyboard onKey={(key) => write(key)} />
    </div>
  );
}
```

2. Terminal features:
   - ANSI color support
   - Scrollback buffer
   - Copy/paste
   - Quick commands

3. Code keyboard:
   - Tab, Ctrl, Esc keys
   - Common symbols
   - Arrow keys

UI must match console-pane-uied.md exactly
```

### Agent 6: Preview Pane with Remote Preview
```
Implement remote preview tunneling:

Files to modify:
- src/components/mobile/workspace/panes/PreviewPane.tsx
- src/components/mobile/preview/PreviewWebView.tsx

Implementation:
1. Tunnel to local dev server:
   - Detect running dev servers on remote
   - Create SSH tunnel for port forwarding
   - Display in WebView

2. Device frame simulation:
   - iPhone, Android, Desktop frames
   - Responsive testing

3. Browser controls:
   - URL input
   - Refresh
   - Back/forward
   - Open in browser

UI must match preview-pane-uied.md exactly
```

### Agent 7: Publishing Pane with Remote Deployment
```
Implement remote deployment control:

Files to modify:
- src/components/mobile/workspace/panes/PublishingPane.tsx

Implementation:
1. Connect to deployment config on remote
2. Trigger deployments via SSH
3. Stream deployment logs
4. Show deployment history

UI must match publishing-pane-uied.md exactly
```

### Agent 8: Share Pane with Collaboration
```
Implement sharing functionality:

Files to modify:
- src/components/mobile/workspace/panes/SharePane.tsx

Implementation:
1. Generate share links
2. Manage collaborators via API
3. Embed code generation
4. Social sharing

UI must match share-pane-uied.md exactly
```

---

## Phase 4: Polish & Testing (Hours 6-7)

### Agent 9-11: Test Suite Fixes (Parallel)
```
Fix remaining test failures:

Agent 9: Hook tests
- Fix IntersectionObserver mock
- Fix useSwipeNavigation timing issues

Agent 10: Component tests
- Fix Framer Motion animation tests
- Fix async state update tests

Agent 11: Integration tests
- Fix navigation flow tests
- Add API mock tests

Target: 95%+ pass rate
```

### Agent 12-13: Performance Optimization (Parallel)
```
Agent 12: Rendering performance
- Virtualize message lists
- Lazy load heavy components
- Memoize expensive calculations

Agent 13: Network optimization
- WebSocket reconnection strategy
- Message batching
- Offline queue for commands
```

### Agent 14: Accessibility Audit
```
Ensure full accessibility:
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- Touch targets (44px minimum)
- ARIA labels
```

### Agent 15: Connection Reliability
```
Ensure robust connectivity:
- Auto-reconnect with exponential backoff
- Connection state persistence
- Offline mode indicators
- Network change handling
```

---

## Phase 5: Documentation & Final Validation (Hours 7-8)

### All Agents: Final Tasks

```
1. TypeScript Check
   npx tsc --noEmit → 0 errors

2. Lint Check
   npm run lint → 0 errors/warnings

3. Test Suite
   npm run test:run -- tests/mobile → 95%+ pass rate

4. Manual Testing Checklist:
   [ ] Connect to Tailscale device
   [ ] View live Claude Code session
   [ ] See real-time message streaming
   [ ] Execute command via terminal
   [ ] View project preview
   [ ] Switch between workspace panes
   [ ] Navigate between screens

5. Create Demo Video (Screenshots at minimum):
   - Connection flow
   - Live message streaming
   - Remote terminal usage

6. Update Documentation:
   - docs/mobile/COMPANION_APP.md
   - docs/mobile/TAILSCALE_SETUP.md
   - docs/mobile/API_REFERENCE.md

7. Git Commit:
   "feat(mobile): complete Claude Code companion app with real-time streaming

   - Implement Tailscale SSH bridge for remote connection
   - Add real-time Claude Code message streaming
   - Create remote terminal with PTY support
   - Build session management and project discovery
   - Refine all UI to pixel-perfect Replit design
   - Add comprehensive test coverage (95%+)
   - Include accessibility and performance optimizations"

8. Push to remote
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (Tauri)                       │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React)                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ AppsScreen  │ │CreateScreen │ │AccountScreen│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────────────────────────────────────┐           │
│  │           WorkspaceScreen                    │           │
│  │  ┌───────┬───────┬───────┬───────┬───────┐ │           │
│  │  │Agent  │Console│Preview│Publish│Share  │ │           │
│  │  │(Live) │(PTY)  │(Tunnel│       │       │ │           │
│  │  └───────┴───────┴───────┴───────┴───────┘ │           │
│  └─────────────────────────────────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  State Layer (Zustand)                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │connectionStore│ │ messageStore │ │workspaceStore│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Tailscale    │ │Claude Stream │ │ Sessions API │        │
│  │ Connection   │ │ (WebSocket)  │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Rust Backend (Tauri)                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ SSH Commands │ │ PTY Bridge   │ │ File Access  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Tailscale VPN
                           │
┌─────────────────────────────────────────────────────────────┐
│                 Remote Machine (Desktop)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Claude Code  │ │   Projects   │ │  Dev Servers │        │
│  │   Sessions   │ │ ~/.claude/   │ │  (localhost) │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

### UI Fidelity
- [ ] All 8 screens match Replit inspiration within 95% accuracy
- [ ] Design tokens extracted and applied consistently
- [ ] Animations smooth at 60fps
- [ ] Responsive across phone and tablet

### Functionality
- [ ] Tailscale connection works reliably
- [ ] Real-time message streaming displays correctly
- [ ] Remote terminal executes commands
- [ ] Session switching works seamlessly
- [ ] Preview tunneling displays dev server

### Quality
- [ ] TypeScript: 0 errors
- [ ] Tests: 95%+ pass rate
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Performance: <2s load, 60fps animations

### Documentation
- [ ] Setup guide complete
- [ ] API reference documented
- [ ] Architecture diagram updated

---

## Execution Instructions

```bash
# Start overnight workflow
/sparc:orchestrator \
  --agents 15 \
  --topology adaptive \
  --memory-enabled \
  --checkpoint-frequency phase \
  --auto-recovery enabled \
  --max-duration 8h

# Or run manually:
# Phase 1: UIED Analysis (parallel)
# Phase 2: Infrastructure (parallel)
# Phase 3: UI Integration (parallel)
# Phase 4: Testing & Polish (parallel)
# Phase 5: Final Validation (sequential)
```

---

## Progress Checkpoints & Commits

After each phase:

### 1. Create Checkpoint
Save to `.prompts/006-overnight-pixel-perfect-mobile/checkpoints/phase-{N}-complete.md`:
- Tasks completed
- Files created/modified
- Test results
- Screenshots
- Issues encountered
- Next steps

### 2. Git Commit After Each Phase

**Phase 1 Commit:**
```bash
git add .prompts/006-overnight-pixel-perfect-mobile/analysis/
git commit -m "chore(mobile): complete UIED analysis of all 8 inspiration screens

- Analyze Apps, Create, Account screens
- Analyze all 5 workspace panes (Agent, Console, Preview, Publishing, Share)
- Document color palette, typography, spacing, icons
- Create gap analysis comparing to current implementation"
git push origin feature/mobile
```

**Phase 2 Commit:**
```bash
git add src-tauri/src/commands/mobile/ src/lib/mobile/api/ src/hooks/mobile/ src/stores/ src/styles/
git commit -m "feat(mobile): implement core infrastructure for Claude Code companion

- Add Tailscale SSH bridge for remote connection
- Implement real-time Claude Code message streaming API
- Create session management and discovery
- Add remote command execution layer
- Extract unified design token system"
git push origin feature/mobile
```

**Phase 3 Commit:**
```bash
git add src/screens/mobile/ src/components/mobile/
git commit -m "feat(mobile): integrate live Claude Code functionality into all screens

- Apps screen shows live sessions with real-time status
- Agent pane streams Claude messages in real-time
- Console pane connects to remote PTY terminal
- Preview pane tunnels to remote dev servers
- All UI refined to match Replit pixel-perfect"
git push origin feature/mobile
```

**Phase 4 Commit:**
```bash
git add tests/mobile/ src/
git commit -m "fix(mobile): polish and testing improvements

- Fix remaining test failures (target 95%+ pass rate)
- Optimize rendering performance with virtualization
- Improve network reliability with auto-reconnect
- Complete accessibility audit (WCAG 2.1 AA)"
git push origin feature/mobile
```

**Phase 5 Commit:**
```bash
git add .
git commit -m "feat(mobile): finalize Claude Code companion app v1.0

- Complete documentation (setup, API reference, architecture)
- All tests passing (95%+)
- TypeScript: 0 errors
- Ready for beta testing"
git push origin feature/mobile
```

---

## Error Recovery

If agent fails:
1. Log to `.prompts/006-overnight-pixel-perfect-mobile/errors/`
2. Retry with increased context
3. If persistent, continue with other agents
4. Document in final summary

---

## Autonomous Operation Notes

This prompt runs 8+ hours without human intervention:

1. **Self-healing**: Retry failed operations
2. **Progress tracking**: Regular checkpoints
3. **Error isolation**: One failure doesn't stop others
4. **Git safety**: Commit after each phase
5. **Documentation**: All decisions logged

**Start time**: {timestamp}
**Expected completion**: {timestamp + 8 hours}
**Human review needed**: Morning after completion

---

## Key Differentiator

This is not just a UI clone - it's a **fully functional Claude Code companion** that:
- Streams real-time messages from active Claude sessions
- Executes commands on remote machines
- Manages projects across devices
- Provides mobile access to all Claude Code features

The user should be able to:
1. Leave their desk
2. Open the mobile app
3. See exactly what Claude is doing in real-time
4. Intervene with commands if needed
5. Monitor progress while away from their computer
