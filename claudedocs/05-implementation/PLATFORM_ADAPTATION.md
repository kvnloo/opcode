# Claude Code Mobile - Opcode Adaptation Plan

## Executive Summary

**Goal**: Create a Replit-style mobile app (Android/iOS) that wraps Claude Code, starting from the [winfunc/opcode](https://github.com/winfunc/opcode) open source project.

**Why Opcode?** It already has:
- ✅ Project & Session Management
- ✅ Custom CC Agents with background execution
- ✅ Usage Analytics Dashboard
- ✅ MCP Server Management
- ✅ Timeline & Checkpoints (session versioning)
- ✅ CLAUDE.md Management
- ✅ React + TypeScript frontend (portable)
- ✅ 19k stars, active community, AGPL-3.0 license

---

## Architecture Decision: Mobile Strategy

### Option Analysis

| Approach | Effort | Native Feel | Code Reuse | Recommendation |
|----------|--------|-------------|------------|----------------|
| **Tauri 2 Mobile** | Low | Medium | 95% | ✅ **Best for MVP** |
| Capacitor Wrapper | Medium | Medium | 80% | Good alternative |
| React Native Port | High | High | 40% | Long-term polish |
| Flutter Rewrite | Very High | High | 0% | Not recommended |

### Recommended Path: Tauri 2 Mobile

**Why Tauri 2?**
- Opcode is already built on Tauri 2
- Tauri 2 has [official iOS/Android support](https://v2.tauri.app/start/prerequisites/#mobile)
- Reuse 95%+ of existing Rust backend and React frontend
- Single codebase for desktop AND mobile
- Smaller bundle sizes than Electron/Capacitor

**Limitations to address:**
- Some Rust crates may need mobile-specific alternatives
- Terminal emulation (PTY) works differently on mobile
- File system access is sandboxed on mobile

---

## Adapted Architecture

```
opcode-mobile/
├── src/                          # React frontend (existing + mobile adaptations)
│   ├── components/
│   │   ├── existing/             # Existing opcode components
│   │   └── mobile/               # New mobile-specific components
│   │       ├── MobileTerminal.tsx       # Touch-optimized terminal
│   │       ├── MobileFileBrowser.tsx    # Swipe-based file nav
│   │       ├── MobileCodeEditor.tsx     # Touch-friendly editor
│   │       ├── BottomNavigation.tsx     # Tab bar navigation
│   │       ├── SwipeablePane.tsx        # Pane switching
│   │       ├── VirtualKeyboard.tsx      # Code-specific keyboard
│   │       └── ConnectionManager.tsx    # Tailscale/Web mode selector
│   ├── hooks/
│   │   ├── useMobileGestures.ts
│   │   ├── useOrientation.ts
│   │   └── useKeyboardHeight.ts
│   ├── lib/
│   │   └── mobile/
│   │       ├── tailscale.ts       # Tailscale VPN integration
│   │       └── remoteSession.ts   # WebSocket SSH bridge
│   └── layouts/
│       ├── DesktopLayout.tsx      # Existing desktop layout
│       └── MobileLayout.tsx       # New responsive mobile layout
├── src-tauri/
│   ├── src/
│   │   ├── commands/              # Existing + new mobile commands
│   │   │   └── mobile/
│   │   │       ├── tailscale.rs   # Tailscale connection
│   │   │       ├── ssh_bridge.rs  # SSH over WebSocket
│   │   │       └── remote_fs.rs   # Remote file operations
│   │   └── mobile/
│   │       ├── ios.rs             # iOS-specific code
│   │       └── android.rs         # Android-specific code
│   ├── gen/
│   │   ├── android/               # Generated Android project
│   │   └── apple/                 # Generated iOS project
│   └── Cargo.toml                 # Updated with mobile targets
└── capacitor.config.ts            # (Optional fallback)
```

---

## Phase 1: Mobile Foundation (Week 1-2)

### 1.1 Fork & Setup Mobile Targets

```bash
# Clone opcode
git clone https://github.com/winfunc/opcode.git opcode-mobile
cd opcode-mobile

# Install Tauri CLI with mobile support
cargo install tauri-cli --version "^2.0.0"

# Initialize mobile targets
cargo tauri android init
cargo tauri ios init

# Install mobile development dependencies
# Android: Android Studio + NDK
# iOS: Xcode + CocoaPods
```

### 1.2 Configure `tauri.conf.json` for Mobile

```json
{
  "productName": "Claude Code Mobile",
  "identifier": "com.ecsolutions.claudecodemobile",
  "build": {
    "beforeDevCommand": "bun run dev",
    "beforeBuildCommand": "bun run build",
    "frontendDist": "../dist"
  },
  "app": {
    "withGlobalTauri": true,
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "iOS": {
      "minimumSystemVersion": "13.0"
    },
    "android": {
      "minSdkVersion": 24
    }
  },
  "plugins": {
    "deep-link": {
      "mobile": [
        { "host": "claudecode.app", "pathPrefix": ["/"] }
      ]
    }
  }
}
```

### 1.3 Add Responsive Detection

```typescript
// src/hooks/usePlatform.ts
import { platform } from '@tauri-apps/plugin-os';

export type Platform = 'desktop' | 'mobile' | 'tablet';

export function usePlatform(): Platform {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('desktop');
  
  useEffect(() => {
    async function detectPlatform() {
      const os = await platform();
      if (os === 'ios' || os === 'android') {
        const isTablet = window.innerWidth >= 768;
        setCurrentPlatform(isTablet ? 'tablet' : 'mobile');
      } else {
        setCurrentPlatform('desktop');
      }
    }
    detectPlatform();
  }, []);
  
  return currentPlatform;
}
```

---

## Phase 2: Mobile UI Components (Week 2-3)

### 2.1 Mobile Layout Wrapper

```tsx
// src/layouts/MobileLayout.tsx
import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { usePlatform } from '@/hooks/usePlatform';

type Pane = 'files' | 'editor' | 'terminal' | 'chat';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const platform = usePlatform();
  const [activePane, setActivePane] = useState<Pane>('chat');
  const [splitMode, setSplitMode] = useState(false);
  
  if (platform === 'desktop') {
    return <>{children}</>;
  }

  const panes: Pane[] = ['files', 'editor', 'terminal', 'chat'];
  const currentIndex = panes.indexOf(activePane);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      setActivePane(panes[currentIndex - 1]);
    } else if (info.offset.x < -threshold && currentIndex < panes.length - 1) {
      setActivePane(panes[currentIndex + 1]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Connection Status Bar */}
      <ConnectionStatusBar />
      
      {/* Main Content - Swipeable */}
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
            {activePane === 'files' && <MobileFileBrowser />}
            {activePane === 'editor' && <MobileCodeEditor />}
            {activePane === 'terminal' && <MobileTerminal />}
            {activePane === 'chat' && <MobileChatInterface />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        active={activePane} 
        onChange={setActivePane}
        onSplit={() => setSplitMode(!splitMode)}
      />
    </div>
  );
}
```

### 2.2 Bottom Navigation (Replit-style)

```tsx
// src/components/mobile/BottomNavigation.tsx
import { Folder, Code, Terminal, MessageSquare, Maximize2 } from 'lucide-react';
import { hapticFeedback } from '@/lib/mobile/haptics';

type Pane = 'files' | 'editor' | 'terminal' | 'chat';

interface BottomNavigationProps {
  active: Pane;
  onChange: (pane: Pane) => void;
  onSplit: () => void;
}

export function BottomNavigation({ active, onChange, onSplit }: BottomNavigationProps) {
  const tabs = [
    { id: 'files' as Pane, icon: Folder, label: 'Files' },
    { id: 'editor' as Pane, icon: Code, label: 'Editor' },
    { id: 'terminal' as Pane, icon: Terminal, label: 'Terminal' },
    { id: 'chat' as Pane, icon: MessageSquare, label: 'Claude' },
  ];

  const handleTabPress = (pane: Pane) => {
    hapticFeedback('light');
    onChange(pane);
  };

  return (
    <div className="flex items-center justify-around bg-[#252526] border-t border-[#333] py-2 pb-safe">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabPress(tab.id)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            active === tab.id 
              ? 'text-[#4a9eff] bg-[#4a9eff]/10' 
              : 'text-[#888]'
          }`}
        >
          <tab.icon size={24} />
          <span className="text-xs mt-1">{tab.label}</span>
        </button>
      ))}
      
      {/* Split View Toggle (Tablet) */}
      <button
        onClick={onSplit}
        className="flex flex-col items-center p-2 text-[#888] md:flex hidden"
      >
        <Maximize2 size={24} />
        <span className="text-xs mt-1">Split</span>
      </button>
    </div>
  );
}
```

### 2.3 Mobile Terminal with Touch Support

```tsx
// src/components/mobile/MobileTerminal.tsx
import { useRef, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function MobileTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use WebView-based xterm.js for full terminal emulation
  // Or simplified text-based terminal for basic commands
  
  const sendCommand = async () => {
    if (!input.trim()) return;
    
    try {
      const result = await invoke<string>('execute_terminal_command', {
        command: input
      });
      setHistory(prev => [...prev, `$ ${input}`, result]);
      setInput('');
    } catch (error) {
      setHistory(prev => [...prev, `$ ${input}`, `Error: ${error}`]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm text-[#d4d4d4]"
      >
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>
      
      {/* Input Area with Code Keyboard */}
      <div className="border-t border-[#333] p-2">
        {/* Quick Command Bar */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
          {['claude', 'git', 'npm', 'cd', 'ls'].map(cmd => (
            <button
              key={cmd}
              onClick={() => setInput(prev => prev + cmd + ' ')}
              className="px-3 py-1 bg-[#333] rounded text-sm text-[#d4d4d4] whitespace-nowrap"
            >
              {cmd}
            </button>
          ))}
        </div>
        
        {/* Input Field */}
        <div className="flex gap-2">
          <span className="text-[#0dbc79] font-mono">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
            className="flex-1 bg-transparent text-[#d4d4d4] font-mono outline-none"
            placeholder="Enter command..."
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button
            onClick={sendCommand}
            className="px-4 py-2 bg-[#4a9eff] text-white rounded"
          >
            Run
          </button>
        </div>
      </div>
      
      {/* Code-Specific Keyboard Toolbar */}
      <CodeKeyboardToolbar onInsert={(char) => setInput(prev => prev + char)} />
    </div>
  );
}

function CodeKeyboardToolbar({ onInsert }: { onInsert: (char: string) => void }) {
  const keys = ['tab', '|', '&', ';', '-', '/', '~', '"', "'", '`', '{', '}', '[', ']'];
  
  return (
    <div className="flex gap-1 p-2 bg-[#252526] overflow-x-auto">
      {keys.map(key => (
        <button
          key={key}
          onClick={() => onInsert(key === 'tab' ? '\t' : key)}
          className="px-3 py-2 bg-[#333] rounded text-[#d4d4d4] font-mono text-sm min-w-[40px]"
        >
          {key === 'tab' ? '⇥' : key}
        </button>
      ))}
    </div>
  );
}
```

---

## Phase 3: Connection Modes (Week 3-4)

### 3.1 Connection Mode Manager

```tsx
// src/components/mobile/ConnectionManager.tsx
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

type ConnectionMode = 'local' | 'tailscale' | 'web';

interface ConnectionState {
  mode: ConnectionMode;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  host?: string;
  error?: string;
}

export function ConnectionManager() {
  const [connection, setConnection] = useState<ConnectionState>({
    mode: 'local',
    status: 'disconnected'
  });
  const [tailscaleConfig, setTailscaleConfig] = useState({
    ip: '',
    username: '',
    sshPort: 22
  });

  const connectTailscale = async () => {
    setConnection(prev => ({ ...prev, status: 'connecting' }));
    
    try {
      await invoke('connect_tailscale_ssh', {
        host: tailscaleConfig.ip,
        username: tailscaleConfig.username,
        port: tailscaleConfig.sshPort
      });
      
      setConnection({
        mode: 'tailscale',
        status: 'connected',
        host: tailscaleConfig.ip
      });
    } catch (error) {
      setConnection(prev => ({
        ...prev,
        status: 'error',
        error: String(error)
      }));
    }
  };

  const connectClaudeWeb = async () => {
    setConnection(prev => ({ ...prev, status: 'connecting' }));
    
    try {
      // OAuth flow for Claude Web
      await invoke('authenticate_claude_web');
      setConnection({
        mode: 'web',
        status: 'connected'
      });
    } catch (error) {
      setConnection(prev => ({
        ...prev,
        status: 'error',
        error: String(error)
      }));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-white">Connection Mode</h2>
      
      {/* Connection Status */}
      <ConnectionStatusBadge status={connection.status} mode={connection.mode} />
      
      {/* Mode Selection */}
      <div className="grid gap-4">
        {/* Tailscale SSH Mode */}
        <div className="p-4 bg-[#252526] rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#4a9eff]/20 rounded-lg flex items-center justify-center">
              🔗
            </div>
            <div>
              <h3 className="font-medium text-white">Tailscale SSH</h3>
              <p className="text-sm text-[#888]">Connect to your dev machine</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tailscale IP (e.g., 100.64.0.5)"
              value={tailscaleConfig.ip}
              onChange={(e) => setTailscaleConfig(prev => ({ ...prev, ip: e.target.value }))}
              className="w-full p-3 bg-[#1e1e1e] rounded border border-[#333] text-white"
            />
            <input
              type="text"
              placeholder="Username"
              value={tailscaleConfig.username}
              onChange={(e) => setTailscaleConfig(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-3 bg-[#1e1e1e] rounded border border-[#333] text-white"
            />
            <button
              onClick={connectTailscale}
              disabled={connection.status === 'connecting'}
              className="w-full p-3 bg-[#4a9eff] text-white rounded font-medium disabled:opacity-50"
            >
              {connection.status === 'connecting' ? 'Connecting...' : 'Connect via Tailscale'}
            </button>
          </div>
        </div>
        
        {/* Claude Web Mode */}
        <div className="p-4 bg-[#252526] rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#0dbc79]/20 rounded-lg flex items-center justify-center">
              ☁️
            </div>
            <div>
              <h3 className="font-medium text-white">Claude Code Web</h3>
              <p className="text-sm text-[#888]">Direct API connection (Pro/Max)</p>
            </div>
          </div>
          
          <button
            onClick={connectClaudeWeb}
            disabled={connection.status === 'connecting'}
            className="w-full p-3 bg-[#0dbc79] text-white rounded font-medium disabled:opacity-50"
          >
            Connect with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Rust Backend: SSH Bridge

```rust
// src-tauri/src/commands/mobile/ssh_bridge.rs
use tauri::command;
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};
use futures_util::{SinkExt, StreamExt};

#[derive(Debug, serde::Serialize)]
pub struct ConnectionResult {
    success: bool,
    message: String,
}

#[command]
pub async fn connect_tailscale_ssh(
    host: String,
    username: String,
    port: u16,
) -> Result<ConnectionResult, String> {
    // For mobile, we'll connect to a WebSocket bridge running on the dev machine
    // The bridge (see ssh_bridge.py in original plan) handles actual SSH
    
    let ws_url = format!("ws://{}:8765", host);
    
    match connect_async(&ws_url).await {
        Ok((ws_stream, _)) => {
            // Store connection in app state for terminal use
            // ...
            
            Ok(ConnectionResult {
                success: true,
                message: format!("Connected to {} via Tailscale", host),
            })
        }
        Err(e) => Err(format!("Failed to connect: {}", e))
    }
}

#[command]
pub async fn execute_terminal_command(
    command: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    // Route to appropriate backend based on connection mode
    let state = app_handle.state::<ConnectionState>();
    
    match state.mode {
        ConnectionMode::Local => {
            // Execute locally using existing opcode logic
            execute_local_command(&command).await
        }
        ConnectionMode::Tailscale => {
            // Send through WebSocket to SSH bridge
            execute_remote_command(&command, &state.ws_connection).await
        }
        ConnectionMode::Web => {
            // Use Claude Code Web API
            execute_web_command(&command, &state.api_token).await
        }
    }
}
```

---

## Phase 4: Integrate Existing Opcode Features (Week 4-5)

### 4.1 Adapt Existing Components for Mobile

The key advantage of starting with opcode is that these features already exist and just need mobile-responsive wrappers:

```typescript
// src/components/mobile/adapters.tsx

// Wrap existing ProjectBrowser for mobile
export function MobileProjectBrowser() {
  const platform = usePlatform();
  
  return (
    <div className={platform === 'mobile' ? 'mobile-wrapper' : ''}>
      {/* Use existing ProjectBrowser component */}
      <ProjectBrowser 
        variant={platform === 'mobile' ? 'compact' : 'full'}
        onProjectSelect={(project) => {
          if (platform === 'mobile') {
            // Navigate to workspace on mobile
            navigate('/workspace', { state: { project } });
          }
        }}
      />
    </div>
  );
}

// Wrap existing AgentManager for mobile
export function MobileAgentManager() {
  return (
    <ResponsiveWrapper
      mobile={<AgentList variant="cards" />}
      desktop={<AgentManager />}
    />
  );
}

// Wrap existing UsageDashboard for mobile
export function MobileUsageDashboard() {
  return (
    <ResponsiveWrapper
      mobile={<UsageCharts simplified />}
      desktop={<UsageDashboard />}
    />
  );
}
```

### 4.2 Mobile-Specific Screens

```tsx
// src/screens/MobileHomeScreen.tsx
// Replit-style home with quick actions

export function MobileHomeScreen() {
  const { recentProjects, recentSessions } = useProjects();
  const { agents } = useAgents();
  
  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {/* Quick Start */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Start Coding</h2>
        <div className="space-y-3">
          <QuickActionCard
            icon="✨"
            title="New with Claude"
            description="Describe what you want to build"
            onClick={() => navigate('/create')}
          />
          <QuickActionCard
            icon="📁"
            title="Open Project"
            description="Browse your Claude Code projects"
            onClick={() => navigate('/projects')}
          />
          <QuickActionCard
            icon="🤖"
            title="Run Agent"
            description="Execute a custom CC Agent"
            onClick={() => navigate('/agents')}
          />
        </div>
      </section>
      
      {/* Recent Sessions */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white">Recent</h2>
          <button className="text-[#4a9eff] text-sm">See All</button>
        </div>
        <div className="space-y-2">
          {recentSessions.slice(0, 5).map(session => (
            <SessionCard 
              key={session.id} 
              session={session}
              compact
            />
          ))}
        </div>
      </section>
      
      {/* Favorite Agents */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Your Agents</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {agents.slice(0, 6).map(agent => (
            <AgentPill key={agent.id} agent={agent} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## Phase 5: Build & Distribution (Week 5-6)

### 5.1 Build Commands

```bash
# Development
bun run tauri android dev   # Android emulator
bun run tauri ios dev       # iOS simulator

# Production builds
bun run tauri android build  # APK/AAB
bun run tauri ios build      # IPA

# Signing (Android)
cd src-tauri/gen/android
./gradlew assembleRelease

# Signing (iOS)
cd src-tauri/gen/apple
xcodebuild -scheme opcode-mobile archive
```

### 5.2 App Store Metadata

```yaml
# Android Play Store
app_name: "Claude Code Mobile"
package_name: "com.ecsolutions.claudecodemobile"
category: "Developer Tools"
content_rating: "Everyone"

# iOS App Store
bundle_id: "com.ecsolutions.claudecodemobile"
category: "Developer Tools"
age_rating: "4+"
```

### 5.3 GitHub Actions CI/CD

```yaml
# .github/workflows/mobile-build.yml
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

---

## Phase 6: Polish & Launch (Week 6+)

### 6.1 Mobile-Specific Features to Add

| Feature | Priority | Effort |
|---------|----------|--------|
| Haptic feedback | High | Low |
| Push notifications (task complete) | High | Medium |
| Offline mode (queue commands) | Medium | High |
| Split view (iPad) | Medium | Medium |
| External keyboard shortcuts | Medium | Low |
| Widget (iOS/Android) | Low | Medium |
| Handoff (iOS ↔ Mac) | Low | High |

### 6.2 Testing Checklist

- [ ] Terminal rendering on various screen sizes
- [ ] Code editor performance with large files
- [ ] Connection stability (Tailscale/Web)
- [ ] Memory usage on older devices
- [ ] Battery consumption during long sessions
- [ ] Gesture conflicts with system navigation
- [ ] Keyboard handling (soft keyboard height)
- [ ] Dark/light mode switching
- [ ] Orientation changes
- [ ] Background/foreground transitions

---

## Licensing Considerations

**Opcode is AGPL-3.0** which means:
- ✅ You can fork, modify, and distribute
- ✅ You can use commercially
- ⚠️ You must release source code of modifications
- ⚠️ You must use AGPL-3.0 for derivative works
- ⚠️ Network use counts as distribution

For a commercial closed-source app, you would need to either:
1. Keep it open source under AGPL
2. Contact the opcode team about alternative licensing
3. Rewrite the features you need from scratch

---

## Summary: Adapted Development Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1-2 | Foundation | Fork opcode, Tauri mobile targets, responsive detection |
| 2-3 | Mobile UI | Bottom nav, swipeable panes, mobile terminal |
| 3-4 | Connections | Tailscale SSH, Claude Web mode, SSH bridge |
| 4-5 | Integration | Adapt existing opcode features, mobile screens |
| 5-6 | Build | CI/CD, signing, store listings |
| 6+ | Polish | Haptics, notifications, testing, launch |

---

## Next Steps

1. **Fork opcode**: `git clone https://github.com/winfunc/opcode.git`
2. **Set up mobile dev environment**: Android Studio + Xcode
3. **Initialize Tauri mobile**: `cargo tauri android init && cargo tauri ios init`
4. **Create feature branch**: `git checkout -b feature/mobile-support`
5. **Start with Phase 1.3**: Add responsive platform detection

Would you like me to generate any specific component code, set up the initial mobile configuration, or dive deeper into any phase?
