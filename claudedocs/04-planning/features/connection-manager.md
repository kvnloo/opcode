# Connection Feature Analysis: Tailscale/Claudia Backend Integration

**Date**: December 9, 2024
**Analysis Scope**: Connection features, CreateScreen enhancement requirements, and mobile architecture

---

## Executive Summary

The Opcode mobile app has **partially implemented** connection infrastructure but is **missing critical components** for the full Tailscale → Claudia Backend workflow. The CreateScreen is currently a **template selector** that needs major enhancement to become a **prompt builder** for AI-assisted project creation.

---

## 1. Current Implementation Status

### ✅ What EXISTS and WORKS

#### A. Connection UI Components (Frontend)
**Location**: `src/components/mobile/connection/`

1. **ConnectionManager.tsx** (139 lines)
   - ✅ Three connection modes: Local, Tailscale SSH, Claude Web
   - ✅ Visual connection status display
   - ✅ Mode selection UI with expandable configuration
   - ⚠️ **Simulated connection** - uses setTimeout mock (lines 32-40)
   - ⚠️ No actual backend integration yet

2. **TailscaleConnect.tsx** (52 lines)
   - ✅ Input form for Tailscale IP and username
   - ✅ Basic validation
   - ❌ No password/SSH key selection UI
   - ❌ No device discovery/auto-fill

3. **ConnectionStatus.tsx** (68 lines)
   - ✅ Visual status indicators (connected/connecting/error)
   - ✅ Mode display (local/tailscale/web)
   - ✅ Error message display

4. **ClaudeWebConnect.tsx** (36 lines)
   - ✅ GitHub OAuth button UI
   - ❌ No actual OAuth implementation
   - ❌ Placeholder only

#### B. Connection State Management
**Location**: `src/stores/connectionStore.ts` (282 lines)

- ✅ Zustand store with persistence
- ✅ Connection mode switching (local/tailscale/web)
- ✅ Status tracking (disconnected/connecting/connected/error)
- ✅ Tauri `invoke()` calls to Rust backend
- ✅ Configuration persistence (Tailscale host, username, port)
- ✅ Error handling

**Key Methods**:
```typescript
- connect()           // Calls Rust backend based on mode
- disconnect()        // Closes connection
- setMode()           // Switches connection mode
- updateTailscaleConfig()
- updateWebConfig()
```

#### C. Rust Backend (Partial)
**Location**: `src-tauri/src/commands/mobile/`

1. **connection.rs** (121 lines)
   - ✅ SSH state management with `SshState` global
   - ✅ Tauri commands: `connect_tailscale_ssh`, `disconnect_tailscale`, `get_connection_status`
   - ✅ Event emission (tailscale-connected, tailscale-disconnected)
   - ⚠️ **Basic implementation only**

2. **ssh.rs** (132 lines)
   - ✅ Full SSH client with russh library
   - ✅ Public key authentication
   - ✅ PTY (pseudo-terminal) support
   - ✅ Channel management for terminal I/O
   - ⚠️ **Insecure**: Auto-accepts all server keys (line 23)
   - ❌ No SSH agent support
   - ❌ No SFTP for file browsing

#### D. Type Definitions
**Location**: `src/lib/mobile/connection/types.ts` (25 lines)

```typescript
type ConnectionMode = 'local' | 'tailscale' | 'web'
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
interface TailscaleConfig { ip, username, port }
interface ClaudeWebConfig { accessToken, refreshToken, expiresAt }
```

#### E. Test Coverage
**Location**: `tests/mobile/integration/tailscaleConnection.test.tsx`

- ✅ Tests for `connect_tailscale_ssh`, `disconnect_tailscale`, `send_terminal_input`
- ✅ Tests for connection status checks
- ✅ Tests for error handling
- ✅ Tests for event emission
- ⚠️ All tests use mocked Tauri commands

---

### ❌ What is MISSING

#### A. Tailscale Integration (HIGH PRIORITY)
1. **No Tailscale Device Discovery**
   - Current: User must manually type Tailscale IP
   - Needed: API call to `tailscale status --json` to list available devices
   - Rust command: `get_tailscale_devices() -> Vec<TailscaleDevice>`

2. **No VPN Auto-Connect**
   - Current: Assumes Tailscale is already running
   - Needed: Detect if Tailscale is down → Prompt user → Open Tailscale app
   - Rust command: `check_tailscale_running() -> bool`
   - Rust command: `launch_tailscale_app() -> Result<()>`

3. **No SSH Key Management**
   - Current: Hardcoded key path or throws error (ssh.rs:65-67)
   - Needed: Key picker UI, key generation, keychain integration
   - Location: `~/.ssh/` on mobile devices

#### B. SSH File Browser (CRITICAL MISSING)
**Status**: NO IMPLEMENTATION FOUND

Required components:
1. **Rust SFTP Client** (src-tauri/src/commands/mobile/sftp.rs)
   ```rust
   pub async fn sftp_list_directory(path: String) -> Result<Vec<FileEntry>>
   pub async fn sftp_read_file(path: String) -> Result<Vec<u8>>
   pub async fn sftp_write_file(path: String, content: Vec<u8>) -> Result<()>
   pub async fn sftp_download(remote: String, local: String) -> Result<()>
   pub async fn sftp_upload(local: String, remote: String) -> Result<()>
   ```

2. **Frontend File Browser** (src/components/mobile/files/RemoteFileBrowser.tsx)
   - Directory tree navigation
   - File selection for context
   - File preview
   - Download/upload controls
   - Breadcrumb navigation

3. **File Context for Prompts**
   - Users should select remote files
   - Files sent as context to Claude API
   - Integration with CreateScreen prompt builder

#### C. Claudia Backend API Integration (UNDEFINED)
**Status**: NO DOCUMENTATION OR IMPLEMENTATION

Unknown architecture questions:
1. **What is Claudia Backend?**
   - Is it a separate server process?
   - Does it run on the dev machine (via Tailscale SSH)?
   - Or is it a cloud service?

2. **Communication Protocol**
   - REST API?
   - WebSocket?
   - gRPC?
   - How does mobile → SSH → Claudia → Claude Code work?

3. **Message Streaming**
   - Real-time token streaming from Claude?
   - WebSocket over SSH tunnel?
   - How to handle reconnections?

4. **Project Workspace Access**
   - Does Claudia serve file system access?
   - Or does mobile use SFTP directly?

#### D. Real-Time Message Streaming (PARTIAL)
**Location**: Some test files reference streaming

- Found: `tests/mobile/integration/claudeStreaming.test.tsx`
- Missing: Actual streaming implementation
- Missing: WebSocket or SSE (Server-Sent Events) client
- Missing: Message queue for offline support

#### E. Claude Web API Integration (STUB ONLY)
**Location**: `src-tauri/src/commands/mobile/connection.rs:112-120`

```rust
pub async fn connect_claude_web() -> Result<ConnectionStatus, String> {
    // TODO: Implement Claude Web API authentication
    Ok(ConnectionStatus {
        connected: false,
        error: Some("Claude Web API not yet implemented".to_string()),
    })
}
```

---

## 2. Architecture Overview

### Current Data Flow (Partial)

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE APP (Tauri)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │        Connection UI (ConnectionManager)         │      │
│  │  ┌──────────┐ ┌─────────────┐ ┌──────────────┐  │      │
│  │  │  Local   │ │  Tailscale  │ │  Claude Web  │  │      │
│  │  │  (Mock)  │ │  (Partial)  │ │   (Stub)     │  │      │
│  │  └──────────┘ └─────────────┘ └──────────────┘  │      │
│  └───────────────────┬──────────────────────────────┘      │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────┐      │
│  │      Connection Store (Zustand)                  │      │
│  │  - mode, status, config                          │      │
│  │  - connect(), disconnect()                       │      │
│  └───────────────────┬──────────────────────────────┘      │
│                      │ invoke()                             │
│  ┌───────────────────▼──────────────────────────────┐      │
│  │      Rust Backend (Tauri Commands)               │      │
│  │  ┌──────────────┐  ┌────────────────────┐        │      │
│  │  │ connection.rs│  │     ssh.rs         │        │      │
│  │  │ - connect    │  │ - SshClient        │        │      │
│  │  │ - disconnect │  │ - send_data()      │        │      │
│  │  │ - status     │  │ - PTY support      │        │      │
│  │  └──────────────┘  └────────────────────┘        │      │
│  └──────────────────────┬───────────────────────────┘      │
│                         │ TCP/SSH                           │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Dev Machine via     │
              │   Tailscale VPN       │
              │  (100.64.x.x:22)      │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   ??? CLAUDIA ???     │
              │   ??? BACKEND ???     │
              │   (Undefined)         │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Claude Code         │
              │   (Desktop App)       │
              └───────────────────────┘
```

### Required Data Flow (Complete Vision)

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE APP (Tauri)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │        CreateScreen (Prompt Builder)             │      │
│  │  - Natural language description                  │      │
│  │  - File context selector (SFTP browser)          │      │
│  │  - Template suggestions                          │      │
│  └───────────────────┬──────────────────────────────┘      │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────┐      │
│  │      Connection Store                            │      │
│  │  - Auto-connect Tailscale                        │      │
│  │  - Establish SSH tunnel                          │      │
│  │  - Stream messages to Claudia                    │      │
│  └───────────────────┬──────────────────────────────┘      │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────┐      │
│  │      Rust Backend (Enhanced)                     │      │
│  │  ┌──────────────┐  ┌─────────────┐               │      │
│  │  │ ssh.rs       │  │  sftp.rs    │               │      │
│  │  │ - Connect    │  │  - Browse   │               │      │
│  │  │ - Terminal   │  │  - Read     │               │      │
│  │  └──────────────┘  │  - Download │               │      │
│  │                    └─────────────┘               │      │
│  │  ┌─────────────────────────────────┐             │      │
│  │  │   claudia_client.rs (NEW)       │             │      │
│  │  │  - send_prompt()                │             │      │
│  │  │  - stream_response()            │             │      │
│  │  │  - get_workspace_files()        │             │      │
│  │  └─────────────────────────────────┘             │      │
│  └──────────────────────┬───────────────────────────┘      │
│                         │ SSH Tunnel                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Dev Machine         │
              │   Tailscale IP        │
              │   (100.64.x.x)        │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Claudia Backend     │
              │   (HTTP/WS Server)    │
              │   Port: 3000?         │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Claude Code         │
              │   (IPC/API)           │
              └───────────────────────┘
```

---

## 3. Required Components

### A. Connection Status Enhancement

**UI Improvements**:
1. Auto-detect Tailscale status
2. Device picker dropdown (from `tailscale status --json`)
3. SSH key selection UI
4. Connection health indicator (latency, packet loss)
5. Reconnection logic with exponential backoff

### B. VPN Auto-Trigger

**Functionality**:
1. Check if Tailscale is running on mobile
2. If not → Show alert: "Tailscale required. Open app?"
3. Button to launch Tailscale app (deep link: `tailscale://`)
4. Poll until VPN is up
5. Auto-retry connection

**Rust Implementation**:
```rust
// src-tauri/src/commands/mobile/tailscale.rs
pub async fn check_tailscale_status() -> Result<TailscaleStatus> {
    // Parse `tailscale status --json`
}

pub fn open_tailscale_app() -> Result<()> {
    // Platform-specific deep link
    // Android: Intent
    // iOS: URL scheme
}
```

### C. SSH File Browser (CRITICAL)

**UI Components**:
1. **RemoteFileBrowser.tsx**
   - Tree view of remote file system
   - Breadcrumb navigation
   - File icons (by extension)
   - Multi-select for context
   - Search/filter

2. **FileContextSelector.tsx**
   - Selected files panel
   - "Add context" button
   - File preview (first 100 lines)
   - Remove from context

**Rust SFTP Client**:
```rust
// src-tauri/src/commands/mobile/sftp.rs
use russh_sftp::client::SftpSession;

pub async fn sftp_connect(ssh_session: Session) -> Result<SftpSession>

pub async fn sftp_list(path: String) -> Result<Vec<FileEntry>> {
    // Returns: name, size, modified, is_dir
}

pub async fn sftp_read(path: String) -> Result<String> {
    // Read file contents (with size limit)
}

pub async fn sftp_download_chunked(path: String) -> Result<DownloadHandle> {
    // Streaming download for large files
}
```

### D. Claudia Backend API (NEEDS DEFINITION)

**Required Clarification**:
1. What is the Claudia Backend architecture?
2. HTTP REST API? WebSocket? gRPC?
3. Authentication mechanism?
4. Request/response format?

**Assumed API Design** (for now):
```typescript
// HTTP REST API over SSH tunnel
POST /api/v1/prompt
{
  "prompt": "Create a React component...",
  "files": [
    { "path": "/home/user/project/src/App.tsx", "content": "..." }
  ],
  "workspace": "/home/user/project"
}

// Response: WebSocket URL for streaming
{
  "sessionId": "abc123",
  "streamUrl": "ws://localhost:3000/stream/abc123"
}

// WebSocket messages
{ "type": "token", "content": "Hello" }
{ "type": "tool_call", "tool": "edit_file", "args": {...} }
{ "type": "done" }
```

**Rust Client**:
```rust
// src-tauri/src/commands/mobile/claudia_client.rs
pub async fn claudia_send_prompt(
    prompt: String,
    files: Vec<FileContext>,
    workspace: String,
) -> Result<StreamingResponse>

pub async fn claudia_stream_connect(
    session_id: String,
) -> Result<WebSocketStream>
```

### E. Real-Time Message Streaming

**WebSocket Client** (Frontend):
```typescript
// src/lib/mobile/claudia/streaming.ts
export class ClaudiaStreamClient {
  connect(sessionId: string): void
  onToken(callback: (token: string) => void): void
  onToolCall(callback: (tool: ToolCall) => void): void
  onComplete(callback: () => void): void
  disconnect(): void
}
```

**Rust WebSocket Handler**:
```rust
// Forward SSH tunnel → local WebSocket
pub async fn tunnel_websocket(
    ssh_tunnel: SshTunnel,
    ws_url: String,
) -> Result<WebSocketStream>
```

### F. Workspace Configuration

**Configuration UI** (SettingsScreen):
1. Default workspace path on dev machine
2. SSH connection preferences
3. Claudia backend URL/port
4. Auto-connect on app launch

**Configuration Store**:
```typescript
interface WorkspaceConfig {
  defaultPath: string;         // /home/user/projects
  claudiaPort: number;          // 3000
  autoConnect: boolean;         // true
  favoriteProjects: string[];   // ["/home/user/app1", ...]
}
```

---

## 4. CreateScreen Enhancement Requirements

### Current State
**File**: `src/screens/mobile/CreateScreen.tsx` (385 lines)

**Functionality**:
1. ✅ Natural language description input (textarea)
2. ✅ Template selection (Next.js, Express, React Native, Full Stack)
3. ✅ Project name input
4. ⚠️ Simulated project creation (calls `create_ai_project` but likely mocked)
5. ⚠️ Workaround button to bypass broken flow (line 178-185)

**Steps**:
1. **"describe"** - User types project description
2. **"template"** - Select template, enter project name
3. **"creating"** - Progress bar (fake)
4. **"done"** - Success screen

### Required Enhancements

#### A. Add Prompt Builder UI

**New Step**: `'context'` (between describe and template)

**UI Elements**:
1. **File Context Section**
   ```
   📂 Add Files from Workspace
   ┌─────────────────────────────────┐
   │ 🔍 Browse Remote Files          │ ← Opens RemoteFileBrowser
   └─────────────────────────────────┘

   Selected Files (2):
   ┌─────────────────────────────────┐
   │ 📄 src/App.tsx                  │ [Remove]
   │ 📄 src/components/Header.tsx    │ [Remove]
   └─────────────────────────────────┘
   ```

2. **Advanced Options** (Collapsible)
   ```
   ⚙️ Advanced Settings
   ┌─────────────────────────────────┐
   │ Target Directory: /home/user/   │
   │ Model: Claude 3.5 Sonnet        │
   │ Max Tokens: 4096                │
   └─────────────────────────────────┘
   ```

3. **Prompt Preview** (Read-only)
   ```
   📝 Final Prompt
   ┌─────────────────────────────────┐
   │ Create a task management app... │
   │                                 │
   │ Context Files:                  │
   │ - src/App.tsx (125 lines)       │
   │ - src/components/Header.tsx     │
   └─────────────────────────────────┘
   ```

#### B. Connection Check

Before showing template selection:
```typescript
const checkConnection = async () => {
  const { status, mode } = useConnectionStore.getState();

  if (mode === 'local') {
    // No remote context needed
    return true;
  }

  if (status !== 'connected') {
    showAlert('Please connect to your dev machine first');
    navigateToSettings(); // Or auto-open ConnectionManager
    return false;
  }

  return true;
};
```

#### C. Enhanced Template Suggestion

Use Claude API to analyze description + file context:
```typescript
const analyzeWithContext = async () => {
  const response = await claudiaClient.analyzeProject({
    description,
    files: selectedFiles.map(f => ({
      path: f.path,
      snippet: f.content.slice(0, 500) // First 500 chars
    }))
  });

  setSuggestedTemplates(response.templates);
  setSuggestedActions(response.actions); // e.g., "Extend existing React app"
};
```

#### D. Smart Project Creation

Replace mock with real implementation:
```typescript
const handleCreateProject = async () => {
  setStep('creating');

  try {
    // Stream response from Claude via Claudia
    const stream = await claudiaClient.createProject({
      prompt: buildFullPrompt(),
      files: selectedFiles,
      workspace: workspaceConfig.defaultPath,
      template: selectedTemplate.id,
    });

    stream.onProgress((progress) => {
      setCreationProgress(progress.percentage);
      setStatusMessage(progress.message); // "Creating files...", "Installing deps..."
    });

    stream.onComplete((project) => {
      setCreatedProject(project);
      setStep('done');
    });

    stream.onError((error) => {
      setError(error.message);
      setStep('template');
    });

  } catch (error) {
    // Handle error
  }
};
```

#### E. New Workflow Steps

```
1. Describe
   ↓
2. Select Connection (if not connected)
   ↓
3. Add Context (Browse files, select relevant ones)
   ↓
4. Review & Enhance Prompt
   ↓
5. Select Template (with AI suggestions)
   ↓
6. Configure Details (project name, target dir)
   ↓
7. Create (Real-time streaming)
   ↓
8. Done (Open in workspace)
```

---

## 5. Integration Points Summary

### Frontend → Rust → Backend

**CreateScreen flow**:
```
User types description
  ↓
[Check connection status]
  ↓
User browses remote files (SFTP)
  ↓
User selects files for context
  ↓
Files downloaded (or read via SFTP)
  ↓
Prompt + files sent to Claudia
  ↓
Claudia forwards to Claude Code
  ↓
Claude Code executes tools
  ↓
Real-time updates streamed back
  ↓
Mobile displays progress
  ↓
Project created, open workspace
```

### Missing Implementation Steps

1. **SFTP client** (Rust) - Browse/read remote files
2. **Claudia API client** (Rust) - HTTP + WebSocket
3. **Streaming handler** (Frontend) - Display tokens in real-time
4. **File context UI** (Frontend) - Browse and select files
5. **Connection auto-setup** (Frontend + Rust) - Detect and launch Tailscale

---

## 6. Open Questions & Unknowns

### Critical Architecture Questions

1. **Claudia Backend Location**
   - Where does Claudia run? (Dev machine? Cloud? Embedded in Claude Code?)
   - How to discover it? (Hardcoded port? mDNS? Config file?)

2. **Communication Protocol**
   - REST API? What endpoints?
   - WebSocket for streaming? What message format?
   - Does it use Claude API directly or proxy through Claude Code desktop?

3. **Authentication**
   - How does mobile authenticate with Claudia?
   - SSH tunnel provides transport security, but what about API keys?
   - Do we need OAuth? API tokens?

4. **Workspace Management**
   - Does Claudia have concept of "workspaces"?
   - Can mobile create new projects remotely?
   - How to handle file system permissions?

5. **Offline Support**
   - What happens if connection drops mid-creation?
   - Queue requests? Retry? Abort?

### Implementation Priority

**High Priority** (Must Have):
1. ✅ SFTP file browser (Rust + UI)
2. ✅ Claudia API client (once protocol is defined)
3. ✅ Real-time streaming (WebSocket)
4. ✅ CreateScreen prompt builder UI
5. ✅ Connection auto-setup

**Medium Priority** (Should Have):
1. Tailscale device discovery
2. SSH key management
3. Connection health monitoring
4. Offline request queueing

**Low Priority** (Nice to Have):
1. Claude Web API integration (direct mode)
2. Local mode with mock backend
3. Advanced file search/filter

---

## 7. Recommended Next Steps

### Phase 1: Define Architecture (1-2 days)
1. **Document Claudia Backend**
   - API specification (REST endpoints, WebSocket protocol)
   - Installation/setup instructions
   - Authentication mechanism
   - Example requests/responses

2. **Create Integration Diagram**
   - Complete data flow
   - Port numbers, protocols
   - Error handling paths

### Phase 2: Implement SFTP Browser (3-4 days)
1. **Rust SFTP Client**
   - `sftp_list_directory()`
   - `sftp_read_file()`
   - Add to connection.rs commands

2. **Frontend File Browser**
   - `RemoteFileBrowser.tsx` component
   - Integration with CreateScreen
   - File preview modal

### Phase 3: Claudia Client (4-5 days)
1. **Rust HTTP Client**
   - `claudia_send_prompt()`
   - `claudia_get_workspaces()`

2. **Rust WebSocket Client**
   - `claudia_stream_connect()`
   - Message parsing
   - Frontend event emission

3. **Frontend Streaming Handler**
   - `ClaudiaStreamClient` class
   - Progress display
   - Error handling

### Phase 4: CreateScreen Enhancement (3-4 days)
1. **Add context selection step**
2. **Implement prompt builder**
3. **Connect to real Claudia backend**
4. **Add connection checks**

### Phase 5: Connection UX Polish (2-3 days)
1. **Tailscale device picker**
2. **VPN auto-trigger**
3. **SSH key selector**
4. **Connection health UI**

**Total Estimated Time**: 13-18 days

---

## 8. Success Criteria

### Minimum Viable Feature (MVP)
- ✅ User can connect to dev machine via Tailscale SSH
- ✅ User can browse remote file system (SFTP)
- ✅ User can select files as context
- ✅ User can describe project in natural language
- ✅ CreateScreen sends prompt + files to Claudia
- ✅ Real-time streaming of Claude's response
- ✅ Project created on remote machine
- ✅ User can open project in mobile workspace

### Stretch Goals
- Auto-detect and connect to Tailscale
- Intelligent template suggestions based on context
- Offline request queueing
- Multiple workspace support
- Claude Web API direct mode (no SSH required)

---

## Appendix: Key Files Reference

### Frontend
- `src/components/mobile/connection/ConnectionManager.tsx` - Connection UI
- `src/components/mobile/connection/TailscaleConnect.tsx` - Tailscale form
- `src/stores/connectionStore.ts` - Connection state (Zustand)
- `src/screens/mobile/CreateScreen.tsx` - Project creation wizard
- `src/lib/mobile/connection/types.ts` - TypeScript types

### Backend (Rust)
- `src-tauri/src/commands/mobile/connection.rs` - Connection commands
- `src-tauri/src/commands/mobile/ssh.rs` - SSH client implementation
- `src-tauri/src/main.rs` - Tauri app setup

### Tests
- `tests/mobile/integration/tailscaleConnection.test.tsx` - Connection tests
- `tests/mobile/integration/claudeStreaming.test.tsx` - Streaming tests
- `tests/mobile/components/connection/` - Component tests

### Documentation
- `MOBILE_README.md` - Mobile overview
- `docs/mobile/ARCHITECTURE.md` - Architecture documentation
- `docs/mobile/SETUP.md` - Setup instructions

---

**End of Analysis**
