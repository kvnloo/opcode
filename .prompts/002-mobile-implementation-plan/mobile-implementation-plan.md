# Opcode Mobile Implementation Plan

<metadata>
  <plan_created>2025-12-07</plan_created>
  <total_phases>7</total_phases>
  <agents_utilized>15</agents_utilized>
  <estimated_duration>8-10 weeks</estimated_duration>
  <parallel_execution>enabled</parallel_execution>
  <architecture>tauri_2_mobile</architecture>
</metadata>

## Executive Summary

This plan implements mobile support for Opcode (Claudia) using Tauri 2.0 mobile with a WebSocket SSH bridge architecture. The plan is optimized for 15-agent parallel execution across 7 phases, leveraging 95% code reuse from the existing React/Rust codebase.

**Strategic Approach:**
- **Platform**: Tauri 2.0 Mobile (iOS + Android)
- **Code Reuse**: 95% frontend, 80% backend
- **Terminal Architecture**: WebSocket SSH bridge for mobile PTY limitations
- **Connection Modes**: Direct SSH, Managed Containers, Tailscale VPN
- **Optimization**: Parallel agent execution with clear dependencies

**Success Metrics:**
- Build successful APK/IPA for both platforms
- Terminal rendering at 30+ fps on mid-range devices
- All existing features functional on mobile
- <5% crash rate, 4.0+ App Store rating

---

## Phase Dependencies Graph

```
Phase 1: Foundation (No dependencies)
    ├── Platform Detection System
    ├── Mobile Build Configuration
    └── Architecture Documentation

Phase 2: Mobile UI Foundation (Depends on Phase 1)
    ├── Layout System
    ├── Bottom Navigation
    ├── Swipeable Panes
    └── Touch Components

Phase 3: Mobile Screens (Depends on Phase 2)
    ├── Apps Screen
    ├── Create Screen
    ├── Account Screen
    └── Mobile Workspace

Phase 4: Terminal & Connection (Depends on Phase 1, Phase 2)
    ├── SSH Bridge Server
    ├── Mobile Terminal
    ├── Connection Manager
    └── Keyboard Toolbar

Phase 5: Agent Execution (Depends on Phase 3, Phase 4)
    ├── Mobile Agent View
    ├── Progress Tracking
    ├── Preview Mode
    └── Background Execution

Phase 6: Polish & Performance (Depends on Phase 5)
    ├── Haptics
    ├── Optimization
    ├── Accessibility
    └── Error Handling

Phase 7: CI/CD & Distribution (Depends on Phase 6)
    ├── GitHub Actions
    ├── App Store Prep
    ├── Beta Testing
    └── Launch
```

---

## Phase 1: Foundation (Week 1-2)

<phase number="1" parallel_agents="6" dependency="none" duration="2 weeks">

### Objective
Establish mobile development environment, platform detection, and Tauri mobile build system.

### Parallel Task Group 1.A: Mobile Environment Setup
<task agent="devops-architect" priority="critical">
**Task**: Configure Tauri 2 mobile build targets and development environment
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/tauri.conf.json` (updated with mobile config)
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/Cargo.toml` (mobile dependencies)
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/gen/android/` (generated Android project)
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/gen/apple/` (generated iOS project)
**Commands**:
```bash
cargo install tauri-cli --version "^2.0.0"
cargo tauri android init
cargo tauri ios init
```
**Verification**:
- [ ] `cargo tauri android dev` starts Android emulator
- [ ] `cargo tauri ios dev` starts iOS simulator
- [ ] Build succeeds with no errors
</task>

<task agent="system-architect" priority="critical">
**Task**: Create platform detection and responsive layout system architecture
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src/hooks/usePlatform.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/hooks/useOrientation.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/hooks/useKeyboardHeight.ts`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/platform-detection.md`
**Code**:
```typescript
// usePlatform.ts
import { platform } from '@tauri-apps/plugin-os';

export type Platform = 'desktop' | 'mobile' | 'tablet';
export type OS = 'ios' | 'android' | 'macos' | 'windows' | 'linux';

export function usePlatform(): { platform: Platform; os: OS } {
  const [current, setCurrent] = useState<{ platform: Platform; os: OS }>({
    platform: 'desktop',
    os: 'linux'
  });

  useEffect(() => {
    async function detect() {
      const os = await platform();
      if (os === 'ios' || os === 'android') {
        const isTablet = window.innerWidth >= 768;
        setCurrent({
          platform: isTablet ? 'tablet' : 'mobile',
          os: os as OS
        });
      } else {
        setCurrent({ platform: 'desktop', os: os as OS });
      }
    }
    detect();
  }, []);

  return current;
}
```
**Verification**:
- [ ] Hook correctly detects iOS simulator
- [ ] Hook correctly detects Android emulator
- [ ] Hook correctly detects desktop platforms
</task>

### Parallel Task Group 1.B: Mobile UI Foundation Planning
<task agent="frontend-architect" priority="high">
**Task**: Design mobile layout system and component adaptation strategy
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/layout-architecture.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/component-mapping.md`
- `/home/kvn/workspace/evolve/repos/opcode/src/layouts/MobileLayout.tsx` (stub)
- `/home/kvn/workspace/evolve/repos/opcode/src/layouts/DesktopLayout.tsx` (extracted from App.tsx)
**Verification**:
- [ ] All existing components mapped to mobile equivalents
- [ ] Layout system supports swipeable panes
- [ ] Responsive breakpoints defined
</task>

<task agent="technical-writer" priority="medium">
**Task**: Create comprehensive mobile architecture documentation
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/README.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/architecture.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/terminal-bridge.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/connection-modes.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/development-guide.md`
**Verification**:
- [ ] All architecture decisions documented
- [ ] WebSocket SSH bridge architecture explained
- [ ] Development setup guide complete
- [ ] Connection mode comparison table included
</task>

### Parallel Task Group 1.C: Backend Mobile Support
<task agent="backend-dev" priority="high">
**Task**: Create Rust mobile command structure and platform-specific code
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/mod.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/mod.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/ios.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/android.rs`
**Code**:
```rust
// src-tauri/src/commands/mobile/mod.rs
pub mod ssh_bridge;
pub mod tailscale;
pub mod claude_web;
pub mod platform;

pub use ssh_bridge::*;
pub use tailscale::*;
pub use claude_web::*;
pub use platform::*;
```
**Verification**:
- [ ] Mobile module compiles successfully
- [ ] iOS-specific code uses Swift interop correctly
- [ ] Android-specific code uses Kotlin interop correctly
</task>

<task agent="planner" priority="high">
**Task**: Create detailed task breakdown and agent coordination plan for Phase 2-7
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/.prompts/002-mobile-implementation-plan/phase-breakdown.md`
- `/home/kvn/workspace/evolve/repos/opcode/.prompts/002-mobile-implementation-plan/agent-assignments.md`
**Verification**:
- [ ] All 7 phases have detailed task lists
- [ ] Agent assignments optimized for parallel execution
- [ ] Dependencies clearly mapped
</task>

### Verification Criteria for Phase 1
- [ ] Tauri mobile build system fully configured
- [ ] Android emulator and iOS simulator working
- [ ] Platform detection hooks functional
- [ ] Mobile command structure in Rust backend
- [ ] Architecture documentation complete
- [ ] Mobile layout system designed
- [ ] All agents have clear Phase 2 assignments

</phase>

---

## Phase 2: Mobile UI Foundation (Week 2-3)

<phase number="2" parallel_agents="7" dependency="phase-1" duration="1 week">

### Objective
Build mobile-specific UI components: bottom navigation, swipeable panes, touch-optimized layouts.

### Parallel Task Group 2.A: Core Mobile Components
<task agent="mobile-dev" priority="critical">
**Task**: Implement bottom navigation bar (Replit-style)
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/BottomNavigation.tsx`
**Code**:
```typescript
import { Folder, Code, Terminal, MessageSquare } from 'lucide-react';

type Pane = 'files' | 'editor' | 'terminal' | 'chat';

interface BottomNavigationProps {
  active: Pane;
  onChange: (pane: Pane) => void;
}

export function BottomNavigation({ active, onChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'files' as Pane, icon: Folder, label: 'Files' },
    { id: 'editor' as Pane, icon: Code, label: 'Editor' },
    { id: 'terminal' as Pane, icon: Terminal, label: 'Terminal' },
    { id: 'chat' as Pane, icon: MessageSquare, label: 'Claude' },
  ];

  return (
    <div className="flex items-center justify-around bg-[#252526] border-t border-[#333] py-2 pb-safe">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            active === tab.id ? 'text-[#4a9eff] bg-[#4a9eff]/10' : 'text-[#888]'
          }`}
        >
          <tab.icon size={24} />
          <span className="text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```
**Verification**:
- [ ] Bottom navigation visible on mobile
- [ ] Tab switching works smoothly
- [ ] Active tab highlighted
</task>

<task agent="mobile-dev" priority="critical">
**Task**: Implement swipeable pane system with Framer Motion
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/SwipeablePane.tsx`
**Code**:
```typescript
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface SwipeablePaneProps {
  panes: Array<{ id: string; component: React.ReactNode }>;
  activePane: string;
  onSwipe: (newPaneId: string) => void;
}

export function SwipeablePane({ panes, activePane, onSwipe }: SwipeablePaneProps) {
  const currentIndex = panes.findIndex(p => p.id === activePane);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      onSwipe(panes[currentIndex - 1].id);
    } else if (info.offset.x < -threshold && currentIndex < panes.length - 1) {
      onSwipe(panes[currentIndex + 1].id);
    }
  };

  return (
    <motion.div
      className="flex-1 overflow-hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activePane}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="h-full"
        >
          {panes[currentIndex]?.component}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
```
**Verification**:
- [ ] Swipe gestures work on touch devices
- [ ] Animations smooth (60fps)
- [ ] Pane switching responsive
</task>

<task agent="coder" priority="high">
**Task**: Implement MobileLayout wrapper component
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/layouts/MobileLayout.tsx`
**Dependencies**: SwipeablePane, BottomNavigation components
**Verification**:
- [ ] Layout switches based on platform detection
- [ ] Desktop layout unaffected
- [ ] Mobile layout includes all navigation elements
</task>

### Parallel Task Group 2.B: Touch-Optimized Components
<task agent="frontend-architect" priority="high">
**Task**: Create touch-optimized button and interaction components
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/TouchButton.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/TouchCard.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/TouchList.tsx`
**Verification**:
- [ ] Touch targets minimum 44px
- [ ] Haptic feedback on interactions
- [ ] No accidental tap issues
</task>

<task agent="mobile-dev" priority="medium">
**Task**: Implement mobile-specific gestures (long-press, swipe actions)
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/hooks/useMobileGestures.ts`
**Verification**:
- [ ] Long-press detection working
- [ ] Swipe-to-delete functional
- [ ] Gesture conflicts resolved
</task>

### Parallel Task Group 2.C: Responsive Adapters
<task agent="coder" priority="high">
**Task**: Create responsive wrappers for existing components
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/adapters/ProjectBrowserAdapter.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/adapters/SessionListAdapter.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/adapters/AgentManagerAdapter.tsx`
**Code Pattern**:
```typescript
// Example adapter
export function ProjectBrowserAdapter() {
  const { platform } = usePlatform();

  return (
    <div className={platform === 'mobile' ? 'mobile-wrapper' : ''}>
      <ProjectList
        variant={platform === 'mobile' ? 'compact' : 'full'}
      />
    </div>
  );
}
```
**Verification**:
- [ ] All existing components have mobile adapters
- [ ] Desktop functionality unchanged
- [ ] Mobile variants properly styled
</task>

<task agent="tester" priority="high">
**Task**: Create mobile UI component test suite
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/BottomNavigation.test.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/SwipeablePane.test.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/MobileLayout.test.tsx`
**Verification**:
- [ ] All mobile components have tests
- [ ] Gesture interactions tested
- [ ] Platform detection mocked correctly
</task>

### Verification Criteria for Phase 2
- [ ] Bottom navigation functional
- [ ] Swipeable panes working smoothly
- [ ] Touch gestures responsive
- [ ] All existing components have mobile adapters
- [ ] Mobile layout system complete
- [ ] Tests passing for all mobile UI components

</phase>

---

## Phase 3: Mobile Screens (Week 3-4)

<phase number="3" parallel_agents="6" dependency="phase-2" duration="1 week">

### Objective
Build mobile-specific screens: Apps, Create, Account, and mobile workspace views.

### Parallel Task Group 3.A: Primary Screens
<task agent="coder" priority="critical">
**Task**: Implement mobile Apps screen (project/session browser)
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/AppsScreen.tsx`
**Code**:
```typescript
export function AppsScreen() {
  const { projects, recentSessions } = useProjects();

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Recent</h2>
        <div className="space-y-2">
          {recentSessions.slice(0, 5).map(session => (
            <SessionCard key={session.id} session={session} compact />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">All Projects</h2>
        <div className="grid grid-cols-2 gap-3">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
```
**Verification**:
- [ ] Apps screen displays projects and sessions
- [ ] Cards tap to open
- [ ] Scrolling smooth
</task>

<task agent="coder" priority="critical">
**Task**: Implement mobile Create screen (new session/agent)
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/CreateScreen.tsx`
**Verification**:
- [ ] Create new session flow works
- [ ] Agent selection working
- [ ] Project path picker functional
</task>

<task agent="mobile-dev" priority="high">
**Task**: Implement mobile Account screen (settings, usage, MCP)
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/AccountScreen.tsx`
**Verification**:
- [ ] Settings accessible
- [ ] Usage dashboard visible
- [ ] MCP manager functional
</task>

### Parallel Task Group 3.B: Workspace Components
<task agent="coder" priority="high">
**Task**: Implement mobile workspace (active session view)
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/MobileWorkspace.tsx`
**Verification**:
- [ ] Chat interface functional
- [ ] File browser accessible
- [ ] Terminal view working (placeholder for Phase 4)
</task>

<task agent="frontend-architect" priority="medium">
**Task**: Implement mobile file browser with swipe actions
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/MobileFileBrowser.tsx`
**Verification**:
- [ ] File tree navigation works
- [ ] Swipe actions (delete, rename) functional
- [ ] File selection working
</task>

<task agent="tester" priority="high">
**Task**: Create mobile screen integration tests
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/screens/AppsScreen.test.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/screens/CreateScreen.test.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/screens/AccountScreen.test.tsx`
**Verification**:
- [ ] All screens have integration tests
- [ ] Navigation flows tested
- [ ] Data loading tested
</task>

### Verification Criteria for Phase 3
- [ ] Apps screen displays projects/sessions correctly
- [ ] Create screen allows new session creation
- [ ] Account screen shows settings/usage/MCP
- [ ] Mobile workspace functional
- [ ] File browser working with swipe actions
- [ ] All screens tested

</phase>

---

## Phase 4: Terminal & Connection (Week 4-6)

<phase number="4" parallel_agents="8" dependency="phase-1,phase-2" duration="2 weeks">

### Objective
Implement WebSocket SSH bridge architecture and mobile terminal with touch keyboard.

### Parallel Task Group 4.A: SSH Bridge Server (Critical Path)
<task agent="backend-dev" priority="critical">
**Task**: Implement WebSocket SSH bridge server in Rust
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/ssh_bridge.rs`
**Code**:
```rust
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};
use futures_util::{SinkExt, StreamExt};
use ssh2::Session;

#[derive(Debug, serde::Serialize)]
pub struct ConnectionResult {
    success: bool,
    message: String,
}

#[tauri::command]
pub async fn connect_ssh_bridge(
    host: String,
    username: String,
    port: u16,
) -> Result<ConnectionResult, String> {
    let ws_url = format!("ws://{}:8765", host);

    match connect_async(&ws_url).await {
        Ok((ws_stream, _)) => {
            // Store connection in app state
            Ok(ConnectionResult {
                success: true,
                message: format!("Connected to {} via WebSocket", host),
            })
        }
        Err(e) => Err(format!("Failed to connect: {}", e))
    }
}

#[tauri::command]
pub async fn execute_terminal_command(
    command: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    // Send command through WebSocket to SSH bridge
    // Returns command output
    Ok("Command executed".to_string())
}
```
**Verification**:
- [ ] WebSocket connection established
- [ ] Commands sent through bridge
- [ ] SSH output received correctly
</task>

<task agent="backend-dev" priority="critical">
**Task**: Create standalone WebSocket-to-SSH bridge server
**Output**: `/home/kvn/workspace/evolve/repos/opcode/bridge-server/src/main.rs`
**Note**: Separate Rust project for bridge server that users can self-host
**Verification**:
- [ ] Bridge server accepts WebSocket connections
- [ ] Bridge server connects to SSH hosts
- [ ] Protocol translation working correctly
</task>

### Parallel Task Group 4.B: Mobile Terminal
<task agent="mobile-dev" priority="critical">
**Task**: Implement mobile terminal with xterm.js
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/MobileTerminal.tsx`
**Code**:
```typescript
import { useRef, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

export function MobileTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cols: 80, // Limited for mobile performance
      rows: 24,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect to WebSocket bridge
    const ws = new WebSocket('ws://localhost:8765');
    term.onData(data => ws.send(data));
    ws.onmessage = (event) => term.write(event.data);

    xtermRef.current = term;

    return () => {
      term.dispose();
      ws.close();
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div ref={terminalRef} className="flex-1" />
      <CodeKeyboardToolbar />
    </div>
  );
}
```
**Verification**:
- [ ] xterm.js renders on mobile
- [ ] Terminal input/output working
- [ ] Performance >30fps on test devices
</task>

<task agent="mobile-dev" priority="high">
**Task**: Implement mobile code keyboard toolbar
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/CodeKeyboardToolbar.tsx`
**Code**:
```typescript
export function CodeKeyboardToolbar({ onInsert }: { onInsert: (char: string) => void }) {
  const keys = ['ESC', 'TAB', 'CTRL', '|', '&', ';', '-', '/', '~', '{', '}', '[', ']'];

  return (
    <div className="flex gap-1 p-2 bg-[#252526] overflow-x-auto">
      {keys.map(key => (
        <button
          key={key}
          onClick={() => onInsert(key === 'TAB' ? '\t' : key)}
          className="px-3 py-2 bg-[#333] rounded text-[#d4d4d4] font-mono text-sm min-w-[40px]"
        >
          {key === 'TAB' ? '⇥' : key}
        </button>
      ))}
    </div>
  );
}
```
**Verification**:
- [ ] Keyboard toolbar visible
- [ ] Special keys insert correctly
- [ ] Toolbar scrolls horizontally
</task>

### Parallel Task Group 4.C: Connection Manager
<task agent="coder" priority="high">
**Task**: Implement connection mode manager (SSH, Tailscale, Web)
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/ConnectionManager.tsx`
**Verification**:
- [ ] Connection mode selection working
- [ ] Tailscale SSH connection functional
- [ ] Claude Web API connection working
</task>

<task agent="backend-dev" priority="medium">
**Task**: Implement Tailscale connection in Rust
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/tailscale.rs`
**Verification**:
- [ ] Tailscale IP connection working
- [ ] SSH over Tailscale functional
</task>

<task agent="backend-dev" priority="medium">
**Task**: Implement Claude Web API integration
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/claude_web.rs`
**Verification**:
- [ ] OAuth flow functional
- [ ] API requests working
- [ ] Token refresh implemented
</task>

### Parallel Task Group 4.D: Testing & Documentation
<task agent="tester" priority="high">
**Task**: Create terminal and connection integration tests
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/MobileTerminal.test.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/ConnectionManager.test.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/integration/ssh-bridge.test.rs`
**Verification**:
- [ ] Terminal rendering tested
- [ ] WebSocket connection tested
- [ ] SSH bridge protocol tested
</task>

<task agent="technical-writer" priority="medium">
**Task**: Document terminal architecture and connection modes
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/terminal-setup.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/bridge-server-deployment.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/connection-troubleshooting.md`
**Verification**:
- [ ] Bridge server setup documented
- [ ] Connection modes explained
- [ ] Troubleshooting guide complete
</task>

### Verification Criteria for Phase 4
- [ ] WebSocket SSH bridge server functional
- [ ] Mobile terminal renders correctly
- [ ] xterm.js performance acceptable (>30fps)
- [ ] Code keyboard toolbar working
- [ ] Connection modes (SSH, Tailscale, Web) functional
- [ ] Integration tests passing
- [ ] Terminal architecture documented

</phase>

---

## Phase 5: Agent Execution (Week 6-7)

<phase number="5" parallel_agents="7" dependency="phase-3,phase-4" duration="1 week">

### Objective
Implement mobile agent execution UI with progress tracking and background execution.

### Parallel Task Group 5.A: Agent UI Components
<task agent="mobile-dev" priority="critical">
**Task**: Implement mobile agent execution view
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/MobileAgentView.tsx`
**Verification**:
- [ ] Agent list displays correctly
- [ ] Agent execution starts
- [ ] Output streaming visible
</task>

<task agent="coder" priority="high">
**Task**: Implement mobile-optimized agent progress tracker
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/AgentProgressTracker.tsx`
**Verification**:
- [ ] Progress indicators visible
- [ ] Real-time updates working
- [ ] Error states handled
</task>

<task agent="mobile-dev" priority="high">
**Task**: Implement agent output preview mode
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/AgentPreviewMode.tsx`
**Verification**:
- [ ] Preview shows agent output
- [ ] Collapsible sections working
- [ ] File changes visible
</task>

### Parallel Task Group 5.B: Background Execution
<task agent="backend-dev" priority="critical">
**Task**: Implement mobile background execution support
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/background.rs`
**Verification**:
- [ ] Agents continue when app backgrounded
- [ ] Notifications on completion
- [ ] State persisted correctly
</task>

<task agent="mobile-dev" priority="medium">
**Task**: Implement push notifications for agent completion
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/notifications.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/notifications.rs`
**Verification**:
- [ ] Notifications sent on agent completion
- [ ] Deep links to agent output working
- [ ] Notification permissions requested
</task>

### Parallel Task Group 5.C: Mobile Agent Features
<task agent="coder" priority="medium">
**Task**: Adapt existing agent manager for mobile
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/adapters/AgentManagerAdapter.tsx`
**Verification**:
- [ ] Agent creation working
- [ ] Agent editing functional
- [ ] Agent deletion working
</task>

<task agent="tester" priority="high">
**Task**: Create agent execution test suite
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/AgentView.test.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/AgentExecution.test.tsx`
**Verification**:
- [ ] Agent execution flow tested
- [ ] Background execution tested
- [ ] Notification delivery tested
</task>

### Verification Criteria for Phase 5
- [ ] Mobile agent view functional
- [ ] Agent progress tracking working
- [ ] Preview mode displays output correctly
- [ ] Background execution supported
- [ ] Push notifications working
- [ ] Agent manager adapted for mobile
- [ ] Tests passing

</phase>

---

## Phase 6: Polish & Performance (Week 7-8)

<phase number="6" parallel_agents="8" dependency="phase-5" duration="1 week">

### Objective
Add haptic feedback, optimize performance, ensure accessibility, and polish UX.

### Parallel Task Group 6.A: Haptics & Feedback
<task agent="mobile-dev" priority="high">
**Task**: Implement haptic feedback system
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/haptics.ts`
**Code**:
```typescript
import { invoke } from '@tauri-apps/api/core';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export async function hapticFeedback(type: HapticType) {
  try {
    await invoke('trigger_haptic', { hapticType: type });
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
}
```
**Verification**:
- [ ] Haptics trigger on button presses
- [ ] Different feedback for different actions
- [ ] Works on iOS and Android
</task>

<task agent="backend-dev" priority="medium">
**Task**: Implement native haptic commands
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/ios_haptics.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/android_haptics.rs`
**Verification**:
- [ ] iOS haptics using UIImpactFeedbackGenerator
- [ ] Android haptics using Vibrator API
- [ ] Fallback for unsupported devices
</task>

### Parallel Task Group 6.B: Performance Optimization
<task agent="performance-engineer" priority="critical">
**Task**: Optimize mobile rendering performance
**Output**: `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/performance-optimizations.md`
**Actions**:
- Profile rendering on low-end devices
- Implement virtualized lists for long content
- Optimize bundle size (code splitting)
- Reduce xterm.js column count (80-120 max)
**Verification**:
- [ ] 60fps scrolling on mid-range devices
- [ ] <5MB APK size increase
- [ ] Terminal rendering >30fps
- [ ] App launch time <3s
</task>

<task agent="performance-engineer" priority="high">
**Task**: Implement mobile-specific performance monitoring
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/performance.ts`
**Verification**:
- [ ] FPS monitoring active
- [ ] Memory usage tracked
- [ ] Battery consumption measured
- [ ] Network latency monitored
</task>

### Parallel Task Group 6.C: Accessibility
<task agent="coder" priority="high">
**Task**: Ensure mobile accessibility compliance
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/accessible/` (accessible component variants)
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/accessibility-guide.md`
**Verification**:
- [ ] Screen reader support (TalkBack, VoiceOver)
- [ ] Minimum touch targets (44px)
- [ ] High contrast mode support
- [ ] Dynamic type support
</task>

### Parallel Task Group 6.D: Error Handling & Reliability
<task agent="coder" priority="high">
**Task**: Implement comprehensive mobile error handling
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/errorBoundary.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/crashReporting.ts`
**Verification**:
- [ ] Error boundaries catch all errors
- [ ] Crash reports sent to analytics
- [ ] User-friendly error messages
- [ ] Recovery options provided
</task>

<task agent="backend-dev" priority="medium">
**Task**: Implement connection resilience and reconnection
**Output**: `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/reconnection.ts`
**Verification**:
- [ ] Auto-reconnect on network restore
- [ ] Queued commands during offline
- [ ] Visual feedback for connection state
</task>

### Parallel Task Group 6.E: Testing & QA
<task agent="tester" priority="critical">
**Task**: Create comprehensive mobile test plan and execute
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/e2e/` (end-to-end tests)
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/test-matrix.md`
**Test Matrix**:
- iOS: iPhone 12, iPhone 14, iPad Air
- Android: Pixel 6, Samsung Galaxy S21, OnePlus 9
**Verification**:
- [ ] All features tested on 6+ devices
- [ ] Performance benchmarks recorded
- [ ] Bug tracking and resolution
</task>

<task agent="reviewer" priority="high">
**Task**: Conduct mobile code review and quality audit
**Output**: `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/code-review-findings.md`
**Verification**:
- [ ] All mobile code reviewed
- [ ] Security vulnerabilities checked
- [ ] Best practices enforced
- [ ] Technical debt documented
</task>

### Verification Criteria for Phase 6
- [ ] Haptic feedback implemented and working
- [ ] Performance optimized (60fps, <5MB)
- [ ] Accessibility compliance achieved
- [ ] Error handling comprehensive
- [ ] Reconnection logic working
- [ ] All features tested on multiple devices
- [ ] Code review complete
- [ ] No critical bugs remaining

</phase>

---

## Phase 7: CI/CD & Distribution (Week 8-10)

<phase number="7" parallel_agents="6" dependency="phase-6" duration="2 weeks">

### Objective
Set up automated builds, prepare App Store/Play Store listings, beta test, and launch.

### Parallel Task Group 7.A: CI/CD Pipeline
<task agent="cicd-engineer" priority="critical">
**Task**: Create GitHub Actions workflow for mobile builds
**Output**: `/home/kvn/workspace/evolve/repos/opcode/.github/workflows/mobile-build.yml`
**Code**:
```yaml
name: Mobile Build

on:
  push:
    branches: [main, mobile]
    tags: ['v*']

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Rust
        uses: dtolnay/rust-action@stable
        with:
          targets: aarch64-linux-android,armv7-linux-androideabi

      - name: Install dependencies
        run: bun install

      - name: Build Android
        run: bun run tauri android build

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: src-tauri/gen/android/app/build/outputs/apk/

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install Rust
        uses: dtolnay/rust-action@stable
        with:
          targets: aarch64-apple-ios,x86_64-apple-ios

      - name: Install dependencies
        run: bun install

      - name: Build iOS
        run: bun run tauri ios build

      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: src-tauri/gen/apple/build/
```
**Verification**:
- [ ] Android builds successfully on CI
- [ ] iOS builds successfully on CI
- [ ] Artifacts uploaded correctly
</task>

<task agent="devops-architect" priority="high">
**Task**: Set up code signing for Android and iOS
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/signing-setup.md`
- GitHub Secrets configuration
**Verification**:
- [ ] Android signing configured
- [ ] iOS signing configured (certificates, provisioning profiles)
- [ ] Secrets stored securely in GitHub
</task>

### Parallel Task Group 7.B: App Store Preparation
<task agent="technical-writer" priority="critical">
**Task**: Create App Store and Play Store listings
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/store-assets/ios/description.txt`
- `/home/kvn/workspace/evolve/repos/opcode/store-assets/android/description.txt`
- `/home/kvn/workspace/evolve/repos/opcode/store-assets/screenshots/` (iOS and Android screenshots)
- `/home/kvn/workspace/evolve/repos/opcode/store-assets/privacy-policy.md`
**Content**:
```
App Name: Claudia Mobile
Subtitle: Claude Code on the go
Description:
Claude Code Mobile brings the power of AI-assisted development to your phone.
Connect to your development environments via SSH, manage Claude Code sessions,
execute custom agents, and code from anywhere.

Features:
- Full terminal access via SSH bridge
- Claude Code session management
- Custom agent execution with progress tracking
- Project and session browser
- Usage analytics dashboard
- MCP server management

Requirements:
- Claude Code subscription (Pro or Teams)
- SSH access to development environment OR Tailscale setup

Keywords: developer tools, ssh client, terminal, claude, ai coding
Category: Developer Tools
Age Rating: 4+ (iOS), Everyone (Android)
```
**Verification**:
- [ ] App descriptions written
- [ ] Screenshots captured (5+ per platform)
- [ ] Privacy policy complete
- [ ] App icons created (all required sizes)
</task>

<task agent="coder" priority="high">
**Task**: Create app preview videos for App Store/Play Store
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/store-assets/videos/ios-preview.mp4`
- `/home/kvn/workspace/evolve/repos/opcode/store-assets/videos/android-preview.mp4`
**Verification**:
- [ ] Videos show key features
- [ ] Videos meet platform requirements (30s max)
- [ ] Videos uploaded to store listings
</task>

### Parallel Task Group 7.C: Beta Testing
<task agent="planner" priority="high">
**Task**: Organize beta testing program
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/beta-testing-plan.md`
- TestFlight setup (iOS)
- Google Play Internal Testing setup (Android)
**Verification**:
- [ ] 20-50 beta testers recruited
- [ ] TestFlight build distributed
- [ ] Play Store internal track live
- [ ] Feedback collection mechanism ready
</task>

<task agent="tester" priority="high">
**Task**: Coordinate beta testing and bug triage
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/beta-feedback-summary.md`
- GitHub Issues for beta bugs
**Verification**:
- [ ] All beta feedback collected
- [ ] Critical bugs fixed
- [ ] Performance issues addressed
- [ ] Beta testers satisfied
</task>

### Parallel Task Group 7.D: Launch Preparation
<task agent="technical-writer" priority="medium">
**Task**: Create launch documentation and user guides
**Output**:
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/user-guide.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/getting-started.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/faq.md`
**Verification**:
- [ ] User guide covers all features
- [ ] Getting started guide clear for new users
- [ ] FAQ addresses common questions
</task>

### Verification Criteria for Phase 7
- [ ] CI/CD pipeline building successfully
- [ ] Code signing configured
- [ ] App Store listings complete
- [ ] Beta testing completed with positive feedback
- [ ] All critical bugs resolved
- [ ] User documentation complete
- [ ] Ready for App Store/Play Store submission

</phase>

---

## File Creation Summary

### New Directories
```
/home/kvn/workspace/evolve/repos/opcode/
├── src/
│   ├── components/mobile/
│   ├── screens/mobile/
│   ├── layouts/
│   ├── hooks/mobile/
│   └── lib/mobile/
├── src-tauri/src/
│   ├── commands/mobile/
│   └── mobile/
├── bridge-server/ (separate project)
├── tests/mobile/
├── docs/mobile/
└── store-assets/
```

### Files by Category

**Platform Detection & Hooks** (Phase 1):
- `/home/kvn/workspace/evolve/repos/opcode/src/hooks/usePlatform.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/hooks/useOrientation.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/hooks/useKeyboardHeight.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/hooks/useMobileGestures.ts`

**Mobile UI Components** (Phase 2):
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/BottomNavigation.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/SwipeablePane.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/TouchButton.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/TouchCard.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/TouchList.tsx`

**Layouts** (Phase 2):
- `/home/kvn/workspace/evolve/repos/opcode/src/layouts/MobileLayout.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/layouts/DesktopLayout.tsx`

**Mobile Screens** (Phase 3):
- `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/AppsScreen.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/CreateScreen.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/AccountScreen.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/MobileWorkspace.tsx`

**Mobile File Browser** (Phase 3):
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/MobileFileBrowser.tsx`

**Terminal & Connection** (Phase 4):
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/MobileTerminal.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/CodeKeyboardToolbar.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/ConnectionManager.tsx`

**Agent Components** (Phase 5):
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/MobileAgentView.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/AgentProgressTracker.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/AgentPreviewMode.tsx`

**Rust Backend** (Phases 1, 4, 5):
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/mod.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/ssh_bridge.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/tailscale.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/claude_web.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/mod.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/ios.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/android.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/background.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/notifications.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/ios_haptics.rs`
- `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/mobile/android_haptics.rs`

**Bridge Server** (Phase 4):
- `/home/kvn/workspace/evolve/repos/opcode/bridge-server/Cargo.toml`
- `/home/kvn/workspace/evolve/repos/opcode/bridge-server/src/main.rs`

**Mobile Libraries** (Phases 5, 6):
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/notifications.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/haptics.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/performance.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/errorBoundary.tsx`
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/crashReporting.ts`
- `/home/kvn/workspace/evolve/repos/opcode/src/lib/mobile/reconnection.ts`

**Tests** (All Phases):
- `/home/kvn/workspace/evolve/repos/opcode/tests/mobile/` (40+ test files across phases)

**Documentation** (All Phases):
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/` (15+ documentation files)

**CI/CD** (Phase 7):
- `/home/kvn/workspace/evolve/repos/opcode/.github/workflows/mobile-build.yml`

**Store Assets** (Phase 7):
- `/home/kvn/workspace/evolve/repos/opcode/store-assets/` (screenshots, videos, descriptions)

**Total New Files**: ~120 files

---

## Agent Assignment Summary

| Agent | Primary Tasks | Phases | Key Deliverables |
|-------|--------------|--------|------------------|
| **devops-architect** | Mobile build setup, signing | 1, 7 | Tauri config, CI/CD, code signing |
| **system-architect** | Platform detection, architecture | 1 | Platform hooks, architecture docs |
| **frontend-architect** | Mobile layout design, touch components | 1, 2 | Layout system, touch components |
| **backend-dev** | Rust mobile commands, SSH bridge | 1, 4, 5, 6 | SSH bridge, connection modes, haptics |
| **mobile-dev** | Mobile UI, terminal, gestures | 2, 3, 4, 5, 6 | Bottom nav, terminal, agent view |
| **coder** | Screen implementation, adapters | 2, 3, 5, 6, 7 | Screens, adapters, error handling |
| **tester** | Test suites, QA, beta coordination | All phases | Tests, test matrix, beta testing |
| **technical-writer** | Documentation, store listings | 1, 4, 7 | Docs, user guides, store assets |
| **planner** | Task coordination, beta program | 1, 7 | Phase breakdown, beta plan |
| **performance-engineer** | Optimization, monitoring | 6 | Performance optimizations, monitoring |
| **reviewer** | Code review, quality audit | 6 | Code review findings |
| **cicd-engineer** | CI/CD pipeline | 7 | GitHub Actions workflows |
| **security-engineer** | Security audit (as needed) | 6 | Security review |
| **refactoring-expert** | Code cleanup (as needed) | 6 | Technical debt resolution |
| **researcher** | Platform research (as needed) | 1 | Platform capabilities research |

---

## Open Questions

<open_questions>

### Critical Path Questions (Must Resolve Before Implementation)
1. **Bridge Server Hosting**:
   - Should Phase 1 include a managed bridge service, or start self-hosted only?
   - **Recommendation**: Start self-hosted, add managed service post-launch if demand exists

2. **Session Synchronization**:
   - Should desktop and mobile share sessions in real-time, or manual export/import only?
   - **Recommendation**: Manual export/import for v1, real-time sync in v2

3. **Offline Capabilities**:
   - Should mobile support offline mode with cached session viewing?
   - **Recommendation**: Requires internet for v1, explore offline in future releases

### Non-Critical Questions (Can Defer to Implementation)
1. OAuth vs API key authentication for Claude API on mobile
2. Biometric app unlock requirement (optional security feature)
3. Free tier limits if implementing managed bridge service
4. Widget support for iOS/Android home screens
5. Handoff support between iOS and macOS

</open_questions>

---

## Assumptions

<assumptions>

### Technical Assumptions
1. **Tauri 2 Mobile** will continue to receive feature parity updates as promised by the Tauri team
2. **xterm.js performance** issues can be mitigated with optimization and column limiting (80-120 cols)
3. **App Store approval** will not block terminal/SSH functionality (precedent: Termius, Blink Shell)
4. **Bridge server** can be implemented in Rust with tokio-tungstenite and ssh2 crates
5. **Network latency** of 100-300ms is acceptable for terminal interactions (proven by existing apps)
6. **Mobile screen size** is sufficient for terminal UX with proper design

### User Assumptions
1. Users have access to a remote development environment (VPS, cloud VM, or desktop) for SSH connection
2. Users are comfortable with WebSocket bridge architecture (proven pattern in existing apps)
3. Users will self-host bridge server initially (no managed service in v1)
4. Users understand mobile terminal limitations vs desktop

### Infrastructure Assumptions
1. GitHub Actions supports both iOS and Android builds with sufficient free tier quota
2. App Store and Play Store approval processes take 2-7 days
3. Beta testing with 20-50 users provides sufficient feedback
4. No significant blocking issues with Tauri 2 mobile platform

</assumptions>

---

## Dependencies

<dependencies>

### External Dependencies
**Required:**
- Tauri 2.0+ with stable mobile support ✅ (available now)
- Rust 1.70+ ✅
- Xcode (iOS development) ✅ (macOS requirement)
- Android Studio / Android SDK ✅
- Bun or npm package manager ✅
- xterm.js (@xterm/xterm) ✅

**Optional (for managed service):**
- Container orchestration platform (Railway, Fly.io, AWS Fargate)
- Object storage (S3, R2) for session persistence
- Authentication service (Clerk, Auth0, or custom)
- Payment processing (Stripe)

**Optional (for Tailscale mode):**
- User's Tailscale account and mobile app
- mDNS/Bonjour for local device discovery

### Internal Dependencies
**Phase Dependencies:**
- Phase 2 depends on Phase 1 (platform detection)
- Phase 3 depends on Phase 2 (mobile UI components)
- Phase 4 depends on Phase 1, 2 (platform + UI foundation)
- Phase 5 depends on Phase 3, 4 (screens + terminal)
- Phase 6 depends on Phase 5 (all features complete)
- Phase 7 depends on Phase 6 (polished product)

**Rust Crate Dependencies:**
```toml
[dependencies]
tokio = { version = "1.35", features = ["full"] }
tokio-tungstenite = "0.21"
ssh2 = "0.9"
serde = { version = "1.0", features = ["derive"] }
tauri = { version = "2.0", features = ["mobile"] }
```

**npm Dependencies:**
```json
{
  "@xterm/xterm": "^5.3.0",
  "@xterm/addon-fit": "^0.8.0",
  "framer-motion": "^10.16.0",
  "@tauri-apps/api": "^2.0.0",
  "@tauri-apps/plugin-os": "^2.0.0"
}
```

</dependencies>

---

## Risk Mitigation Strategies

| Risk | Severity | Mitigation |
|------|----------|------------|
| Tauri mobile missing features | Medium | Use Capacitor as fallback, document limitations clearly |
| xterm.js mobile performance | Medium | Limit cols to 80-120, use canvas renderer, extensive device testing |
| App Store rejection | Low | Follow guidelines strictly, reference similar apps (Termius, Blink Shell) |
| Bridge server complexity | Medium | Use proven libraries (tokio-tungstenite, ssh2), extensive integration testing |
| User adoption slow | Low | Desktop remains primary, mobile is value-add bonus feature |
| Network connectivity issues | Low | Implement robust reconnection logic, queue commands during offline periods |
| Android WebView performance | Medium | Extensive Android device testing, performance profiling, consider Capacitor fallback |

---

## Success Metrics

### Technical Metrics
- [ ] Build succeeds on CI/CD for iOS and Android
- [ ] Terminal rendering at 30+ fps on mid-range devices (Pixel 6, iPhone 12)
- [ ] App launch time <3 seconds
- [ ] Crash rate <5%
- [ ] APK/IPA size <50MB

### User Metrics
- [ ] 4.0+ App Store rating
- [ ] 4.0+ Play Store rating
- [ ] 1,000+ installs in first 3 months
- [ ] 30%+ weekly active users
- [ ] <10% uninstall rate

### Feature Completeness
- [ ] All existing desktop features functional on mobile
- [ ] Terminal I/O working correctly
- [ ] Connection modes (SSH, Tailscale, Web) functional
- [ ] Agent execution with progress tracking
- [ ] Background execution supported
- [ ] Push notifications working

---

## Next Steps

### Immediate Actions (Week 1)
1. **Set up mobile development environment**:
   - Install Android Studio and Android SDK
   - Install Xcode (macOS only)
   - Install Tauri CLI 2.0+

2. **Initialize Tauri mobile targets**:
   ```bash
   cd /home/kvn/workspace/evolve/repos/opcode
   cargo tauri android init
   cargo tauri ios init
   ```

3. **Create feature branch**:
   ```bash
   git checkout -b feature/mobile-support
   ```

4. **Assign agents to Phase 1 tasks**:
   - Use Claude Code's Task tool to spawn 6 agents concurrently for Phase 1 tasks
   - Each agent receives full task description and file paths from this plan

### Decision Point (End of Week 2)
- **Evaluate Tauri mobile viability**:
  - Is the build process stable?
  - Do all platform detection hooks work?
  - Are there any critical blockers?

- **Go/No-Go Decision**:
  - ✅ Continue with Tauri mobile path
  - ⚠️ Pivot to Capacitor if critical issues found

### Phase 2 Kickoff (Week 3)
- Spawn 7 agents for Phase 2 parallel execution
- Begin mobile UI component development
- Start responsive adapter creation

---

## Execution Commands

### Development
```bash
# Android emulator
bun run tauri android dev

# iOS simulator
bun run tauri ios dev
```

### Production Builds
```bash
# Android (APK/AAB)
bun run tauri android build

# iOS (IPA)
bun run tauri ios build
```

### Testing
```bash
# Run mobile tests
bun test tests/mobile

# Run on physical device
bun run tauri android dev --device
bun run tauri ios dev --device
```

### CI/CD
```bash
# Trigger mobile build on GitHub Actions
git push origin feature/mobile-support
```

---

**End of Implementation Plan**

**Total Estimated Duration**: 8-10 weeks
**Parallel Agent Execution**: 15 agents utilized
**Code Reuse**: 95% frontend, 80% backend
**Platform Support**: iOS 13+, Android 7+ (API 24+)
