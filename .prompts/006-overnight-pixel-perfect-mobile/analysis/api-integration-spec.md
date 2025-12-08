# Mobile API Integration Technical Specification

## Document Overview

This specification defines how to wire mobile screens to the existing Opcode API infrastructure. The integration follows a layered architecture: Connection Layer → API Client → Store Layer → UI Components.

**Last Updated**: 2025-12-07
**Status**: Implementation Ready
**Target Platform**: iOS/Android (Tauri Mobile)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AppsScreen Integration](#appsscreen-integration)
3. [WorkspaceScreen Integration](#workspacescreen-integration)
4. [Connection Layer Design](#connection-layer-design)
5. [Store Integration](#store-integration)
6. [Event System](#event-system)
7. [Error Handling](#error-handling)
8. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Architecture Overview

### Current State Analysis

**Existing API Client** (`/home/kvn/workspace/evolve/repos/opcode/src/lib/api.ts`):
- 1930 lines of comprehensive API methods
- Full CRUD operations for projects, sessions, agents
- Real-time session output streaming (lines 969-1004)
- Claude Code execution methods (lines 1029-1072)
- File system operations (lines 1076-1086)

**Existing Stores**:
- `sessionStore.ts` (lines 1-191): Manages projects/sessions state
- `workspaceStore.ts` (lines 1-405): Manages workspace/task state

**Mobile Connection Placeholder** (`/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/connection.rs`):
- Basic structure exists (lines 1-56)
- Stub implementations for local/tailscale/web modes
- Ready for implementation

### Integration Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile UI Components                   │
│         (AppsScreen, WorkspaceScreen, Panes)            │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   Zustand Stores                         │
│        (sessionStore, workspaceStore, connectionStore)   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                    API Client (api.ts)                   │
│     (Tauri invoke() calls to Rust backend commands)     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│               Connection Layer (NEW)                     │
│    (connectionStore.ts + Rust connection handlers)      │
│         Modes: local | tailscale | web                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Backend Services                          │
│   (Desktop: Local FS, SSH Tunnel via Tailscale)         │
│   (Web: Claude API Proxy, Cloud Sessions)               │
└──────────────────────────────────────────────────────────┘
```

---

## 2. AppsScreen Integration

### Current State (`/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/AppsScreen.tsx`)

**Lines 17-22**: Placeholder projects array
**Lines 24-34**: Project selection handler (sets workspaceStore)
**Lines 45-52**: Conditional rendering for WorkspaceScreen

### Implementation Requirements

#### 2.1 Data Fetching with sessionStore

**File**: `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/AppsScreen.tsx`

**Changes Required**:

```typescript
// Line 1: Add useEffect import
import { useState, useEffect } from 'react';

// Line 6: Add sessionStore import
import { useSessionStore } from '@/stores/sessionStore';

// Line 17: Replace placeholder with actual state
export function AppsScreen() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const { setProject, currentProject } = useWorkspaceStore();

  // ADD: Connect to sessionStore
  const {
    projects,
    fetchProjects,
    isLoadingProjects,
    error
  } = useSessionStore();

  // ADD: Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // REMOVE: Line 22 (placeholder projects array)
  // const projects: Project[] = [];

  // Line 24-34: Update handleProjectSelect to use real project data
  const handleProjectSelect = (project: Project) => {
    setProject({
      id: project.id,
      name: project.id, // Use project ID as name initially
      path: project.path
    });
    setShowWorkspace(true);
  };
```

**API Method Used**: `api.listProjects()` (line 468-475 in api.ts)
- Returns: `Promise<Project[]>`
- Project structure: `{ id, path, sessions[], created_at, most_recent_session? }`

**Store Integration**:
- `sessionStore.fetchProjects()` (line 52-63) calls `api.listProjects()`
- Sets `projects` array in store
- Manages `isLoadingProjects` and `error` states

#### 2.2 Session Display Per Project

**Changes Required**:

```typescript
// In ProjectList component (new prop needed)
interface ProjectListProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  // ADD: Session data for each project
  sessionCounts?: Record<string, number>;
}

// In AppsScreen:
const { projects, sessions, fetchProjectSessions } = useSessionStore();

// Compute session counts
const sessionCounts = Object.fromEntries(
  projects.map(p => [p.id, sessions[p.id]?.length || 0])
);

// Pass to ProjectList
<ProjectList
  projects={projects}
  onProjectClick={handleProjectSelect}
  sessionCounts={sessionCounts}
/>
```

**API Method Used**: `api.getProjectSessions(projectId)` (line 496-503 in api.ts)
- Returns: `Promise<Session[]>`
- Session structure: `{ id, project_id, project_path, created_at, first_message?, ... }`

**Store Integration**:
- `sessionStore.fetchProjectSessions(projectId)` (line 66-83)
- Stores sessions in `sessions[projectId]` dictionary
- Can be called on-demand or prefetched for all projects

#### 2.3 Real-Time Updates

**Implementation**: Subscribe to Tauri events for session updates

```typescript
// Add to AppsScreen useEffect
import { listen } from '@tauri-apps/api/event';

useEffect(() => {
  const unlistenSession = listen('session-updated', (event) => {
    const session = event.payload as Session;
    handleSessionUpdate(session);
  });

  const unlistenProject = listen('project-created', () => {
    fetchProjects(); // Refresh project list
  });

  return () => {
    unlistenSession.then(fn => fn());
    unlistenProject.then(fn => fn());
  };
}, []);
```

**Store Method**: `sessionStore.handleSessionUpdate(session)` (line 154-176)

#### 2.4 Loading and Error States

**Current State**: No loading/error UI
**Required Changes**:

```typescript
// After line 72 in AppsScreen.tsx
<ScrollArea className="flex-1">
  <div className="p-4 space-y-4">
    {isLoadingProjects && (
      <div className="text-center py-8">
        <LoadingSpinner />
        <p className="text-muted-foreground mt-2">Loading projects...</p>
      </div>
    )}

    {error && (
      <div className="text-center py-8">
        <ErrorMessage message={error} />
        <Button onClick={fetchProjects}>Retry</Button>
      </div>
    )}

    {!isLoadingProjects && !error && (
      <ProjectList
        projects={projects}
        onProjectClick={handleProjectSelect}
        sessionCounts={sessionCounts}
      />
    )}
  </div>
</ScrollArea>
```

### 2.5 Project Creation Flow

**File**: New file `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/CreateScreen.tsx`

```typescript
import { useState } from 'react';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/sessionStore';

export function CreateScreen({ onProjectCreated }: { onProjectCreated: () => void }) {
  const [selectedPath, setSelectedPath] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { fetchProjects } = useSessionStore();

  const handleSelectDirectory = async () => {
    // Use Tauri dialog
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected) {
      setSelectedPath(selected);
    }
  };

  const handleCreateProject = async () => {
    if (!selectedPath) return;

    setIsCreating(true);
    try {
      const project = await api.createProject(selectedPath);
      await fetchProjects(); // Refresh project list
      onProjectCreated();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create New Project</h2>

      <Button onClick={handleSelectDirectory}>
        Select Directory
      </Button>

      {selectedPath && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Selected:</p>
          <p className="font-mono text-sm">{selectedPath}</p>

          <Button
            onClick={handleCreateProject}
            disabled={isCreating}
            className="mt-4"
          >
            {isCreating ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      )}
    </div>
  );
}
```

**API Method Used**: `api.createProject(path)` (line 482-489 in api.ts)

---

## 3. WorkspaceScreen Integration

### Current State (`/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/WorkspaceScreen.tsx`)

**Lines 182-263**: Placeholder pane components
**Lines 38-39**: activePane and toolsOverlay local state
**Lines 49-88**: Screen layout with header, pane content, toolbar

### 3.1 Agent Pane Integration

**File**: `/home/kvn/workspace/evolve/repos/opcode/src/screens/mobile/WorkspaceScreen.tsx`

**Current Placeholder** (lines 213-224):
```typescript
function AgentPane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Bot size={48} className="mx-auto mb-4 text-purple-500" />
        <h2 className="text-xl font-semibold mb-2">Agent</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">AI agent chat will appear here</p>
      </div>
    </div>
  );
}
```

**Required Implementation**:

```typescript
function AgentPane({ projectId }: { projectId: string }) {
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { currentProject } = useWorkspaceStore();

  // Real-time output listener
  useEffect(() => {
    if (!sessionId) return;

    const unlisten = listen('claude-output', (event: any) => {
      if (event.payload.session_id === sessionId) {
        setOutput(prev => prev + event.payload.content);
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [sessionId]);

  // Execute Claude Code
  const handleExecute = async () => {
    if (!prompt.trim() || !currentProject) return;

    setIsRunning(true);
    try {
      // Start new session
      await api.executeClaudeCode(
        currentProject.path,
        prompt,
        'sonnet' // Default model
      );

      // Session ID will be provided via event
      // Listen for 'claude-session-started' event
    } catch (error) {
      console.error('Failed to execute:', error);
      setIsRunning(false);
    }
  };

  // Stop execution
  const handleStop = async () => {
    if (sessionId) {
      await api.cancelClaudeExecution(sessionId);
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Output */}
      <ScrollArea className="flex-1 p-4">
        <pre className="font-mono text-sm whitespace-pre-wrap">
          {output || 'No output yet. Enter a prompt below to start.'}
        </pre>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="mb-2"
          disabled={isRunning}
        />

        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={handleExecute} disabled={!prompt.trim()}>
              Execute
            </Button>
          ) : (
            <Button onClick={handleStop} variant="destructive">
              Stop
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**API Methods Used**:
- `api.executeClaudeCode(projectPath, prompt, model)` (line 1031-1033) - Start new session
- `api.continueClaudeCode(projectPath, prompt, model)` (line 1038-1040) - Continue existing
- `api.resumeClaudeCode(projectPath, sessionId, prompt, model)` (line 1045-1047) - Resume session
- `api.cancelClaudeExecution(sessionId?)` (line 1053-1055) - Stop execution
- `api.getClaudeSessionOutput(sessionId)` (line 1070-1072) - Get current output

**Tauri Events to Listen**:
- `claude-output`: Real-time output chunks
- `claude-session-started`: Session ID assignment
- `claude-session-completed`: Session finished
- `claude-session-error`: Execution error

**Store Integration**:
- `workspaceStore.startAgent(taskDescription)` (line 139-157) - Track agent task
- `workspaceStore.updateTask(taskId, updates)` (line 183-205) - Update progress
- `workspaceStore.agentStatus` (line 102) - Current status ('idle' | 'running' | 'error' | 'complete')

### 3.2 Console Pane Integration

**Current Placeholder** (lines 200-211):
```typescript
function ConsolePane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Terminal size={48} className="mx-auto mb-4 text-blue-500" />
        <h2 className="text-xl font-semibold mb-2">Console</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">Terminal output will appear here</p>
      </div>
    </div>
  );
}
```

**Required Implementation** (Remote Terminal):

```typescript
function ConsolePane({ projectId }: { projectId: string }) {
  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const { connectionMode, connectionStatus } = useConnectionStore();
  const { currentProject } = useWorkspaceStore();

  // Connect to remote terminal via connection layer
  useEffect(() => {
    if (connectionMode === 'local') {
      // Local mode: Direct file system access
      initLocalTerminal();
    } else if (connectionMode === 'tailscale') {
      // SSH tunnel mode: Connect to desktop via Tailscale
      initRemoteTerminal();
    }

    return () => {
      cleanupTerminal();
    };
  }, [connectionMode, currentProject]);

  // Listen for terminal output
  useEffect(() => {
    const unlisten = listen('terminal-output', (event: any) => {
      setTerminalOutput(prev => prev + event.payload.output);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const handleSendCommand = async () => {
    if (!terminalInput.trim()) return;

    try {
      // Send command via connection layer
      await invoke('send_terminal_command', {
        projectPath: currentProject?.path,
        command: terminalInput,
        connectionMode
      });

      setTerminalInput('');
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400">
      {/* Terminal Output */}
      <ScrollArea className="flex-1 p-4 font-mono text-sm">
        <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
      </ScrollArea>

      {/* Command Input */}
      <div className="p-4 border-t border-green-400/20 flex gap-2">
        <Input
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
          placeholder="Enter command..."
          className="flex-1 bg-black border-green-400/20 text-green-400 font-mono"
        />
        <Button
          onClick={handleSendCommand}
          disabled={connectionStatus !== 'connected'}
          className="bg-green-400/10 text-green-400 border-green-400/20"
        >
          Send
        </Button>
      </div>

      {connectionStatus !== 'connected' && (
        <div className="p-2 bg-yellow-400/10 text-yellow-400 text-sm text-center">
          Not connected. Check connection settings.
        </div>
      )}
    </div>
  );
}
```

**Connection Layer Requirements**:
- **Local Mode**: Execute commands directly on device (via Tauri `Command` API)
- **Tailscale Mode**: SSH tunnel to desktop, proxy commands through WebSocket
- **Web Mode**: Not applicable (cloud sessions don't have terminal access)

**New Rust Commands Needed**:
```rust
// In src-tauri/src/commands/terminal.rs (new file)
#[command]
pub async fn send_terminal_command(
    project_path: String,
    command: String,
    connection_mode: String,
) -> Result<(), String> {
    match connection_mode.as_str() {
        "local" => execute_local_command(project_path, command).await,
        "tailscale" => execute_remote_command(project_path, command).await,
        _ => Err("Unsupported connection mode".to_string()),
    }
}
```

### 3.3 Preview Pane Integration

**Current Placeholder** (lines 252-263):
```typescript
function PreviewPane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Eye size={48} className="mx-auto mb-4 text-pink-500" />
        <h2 className="text-xl font-semibold mb-2">Preview</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">Live preview will appear here</p>
      </div>
    </div>
  );
}
```

**Required Implementation** (Remote WebView):

```typescript
function PreviewPane({ projectId }: { projectId: string }) {
  const { previewUrl, deviceFrame, setDeviceFrame, refreshPreview } = useWorkspaceStore();
  const { connectionMode } = useConnectionStore();
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Determine preview URL based on connection mode
  const resolvedPreviewUrl = useMemo(() => {
    if (connectionMode === 'local') {
      return previewUrl; // Local dev server
    } else if (connectionMode === 'tailscale') {
      return `http://${tailscaleHost}:${devServerPort}${previewUrl}`;
    } else {
      return null; // Web mode: use cloud preview URL
    }
  }, [connectionMode, previewUrl]);

  // Device frame styles
  const getFrameStyles = () => {
    switch (deviceFrame) {
      case 'iphone':
        return { width: '375px', height: '667px' };
      case 'android':
        return { width: '360px', height: '640px' };
      case 'desktop':
        return { width: '100%', height: '100%' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Controls */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={deviceFrame === 'iphone' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceFrame('iphone')}
          >
            iPhone
          </Button>
          <Button
            variant={deviceFrame === 'android' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceFrame('android')}
          >
            Android
          </Button>
          <Button
            variant={deviceFrame === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceFrame('desktop')}
          >
            Desktop
          </Button>
        </div>

        <Button size="sm" onClick={refreshPreview}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {resolvedPreviewUrl ? (
          <div
            className="bg-white rounded-lg shadow-xl overflow-hidden"
            style={getFrameStyles()}
          >
            <iframe
              src={resolvedPreviewUrl}
              className="w-full h-full border-0"
              onError={() => setPreviewError('Failed to load preview')}
            />
          </div>
        ) : (
          <div className="text-center">
            <Eye size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No preview available</p>
            {connectionMode === 'web' && (
              <p className="text-sm text-muted-foreground mt-2">
                Web mode preview not yet implemented
              </p>
            )}
          </div>
        )}
      </div>

      {previewError && (
        <div className="p-2 bg-destructive/10 text-destructive text-sm text-center">
          {previewError}
        </div>
      )}
    </div>
  );
}
```

**Store Integration**:
- `workspaceStore.previewUrl` (line 107) - Current preview path
- `workspaceStore.deviceFrame` (line 108) - Device frame type
- `workspaceStore.setDeviceFrame(frame)` (line 252) - Change frame
- `workspaceStore.refreshPreview()` (line 256-262) - Force reload

**Connection Layer Requirements**:
- **Local Mode**: Direct localhost preview
- **Tailscale Mode**: Tunnel to desktop dev server
- **Web Mode**: Cloud preview URL from deployment service

### 3.4 Share Pane Integration

**Current Placeholder** (lines 239-250):
```typescript
function SharePane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Share2 size={48} className="mx-auto mb-4 text-orange-500" />
        <h2 className="text-xl font-semibold mb-2">Share</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">Sharing options will appear here</p>
      </div>
    </div>
  );
}
```

**Required Implementation** (Session Sharing):

```typescript
function SharePane({ projectId }: { projectId: string }) {
  const { sessions, fetchProjectSessions } = useSessionStore();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Fetch sessions for this project
  useEffect(() => {
    fetchProjectSessions(projectId);
  }, [projectId, fetchProjectSessions]);

  const projectSessions = sessions[projectId] || [];

  const handleGenerateShareLink = async (sessionId: string) => {
    try {
      // Generate shareable link (would call backend API)
      const link = await invoke<string>('generate_session_share_link', {
        projectId,
        sessionId,
      });
      setShareLink(link);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      // Show toast notification
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Session List */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold mb-2">Sessions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a session to share
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {projectSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No sessions yet. Start a conversation in the Agent pane.
            </p>
          ) : (
            projectSessions.map((session) => (
              <Card
                key={session.id}
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  selectedSession === session.id && "border-primary"
                )}
                onClick={() => setSelectedSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {session.first_message || 'New Session'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.created_at * 1000).toLocaleString()}
                    </p>
                  </div>

                  {selectedSession === session.id && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateShareLink(session.id);
                      }}
                    >
                      Share
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Share Link Display */}
      {shareLink && (
        <div className="p-4 border-t border-border bg-muted/20">
          <p className="text-sm font-medium mb-2">Share Link</p>
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={handleCopyLink}>
              <Copy size={16} className="mr-2" />
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**API Method Used**: `api.getProjectSessions(projectId)` (line 496-503 in api.ts)

**Store Integration**:
- `sessionStore.sessions[projectId]` (line 10) - Sessions for project
- `sessionStore.fetchProjectSessions(projectId)` (line 66-83) - Fetch sessions

**New Rust Command Needed**:
```rust
#[command]
pub async fn generate_session_share_link(
    project_id: String,
    session_id: String,
) -> Result<String, String> {
    // Generate shareable link (e.g., cloud upload + short URL)
    // Return: "https://share.opcode.app/s/{short_code}"
    todo!("Implement session sharing")
}
```

---

## 4. Connection Layer Design

### 4.1 Connection Store

**New File**: `/home/kvn/workspace/evolve/repos/opcode/src/stores/connectionStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';

type ConnectionMode = 'local' | 'tailscale' | 'web';

interface ConnectionConfig {
  mode: ConnectionMode;
  tailscale?: {
    host: string;
    username: string;
    port: number;
  };
  web?: {
    apiToken: string;
    baseUrl: string;
  };
}

interface ConnectionState {
  mode: ConnectionMode;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
  config: ConnectionConfig;

  // Actions
  setMode: (mode: ConnectionMode) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  updateConfig: (config: Partial<ConnectionConfig>) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      mode: 'local',
      status: 'disconnected',
      error: null,
      config: { mode: 'local' },

      setMode: (mode) => {
        set({ mode, config: { ...get().config, mode } });
      },

      connect: async () => {
        const { mode, config } = get();
        set({ status: 'connecting', error: null });

        try {
          if (mode === 'tailscale') {
            if (!config.tailscale) {
              throw new Error('Tailscale configuration missing');
            }

            const result = await invoke<{ connected: boolean; error?: string }>(
              'connect_tailscale_ssh',
              {
                host: config.tailscale.host,
                username: config.tailscale.username,
                port: config.tailscale.port,
              }
            );

            if (result.connected) {
              set({ status: 'connected' });
            } else {
              set({
                status: 'error',
                error: result.error || 'Connection failed'
              });
            }
          } else if (mode === 'web') {
            const result = await invoke<{ connected: boolean; error?: string }>(
              'connect_claude_web'
            );

            if (result.connected) {
              set({ status: 'connected' });
            } else {
              set({
                status: 'error',
                error: result.error || 'Connection failed'
              });
            }
          } else {
            // Local mode - always connected
            set({ status: 'connected' });
          }
        } catch (error) {
          set({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      disconnect: async () => {
        set({ status: 'disconnected', error: null });
      },

      updateConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
        }));
      },
    }),
    {
      name: 'connection-storage',
      partialize: (state) => ({
        mode: state.mode,
        config: state.config,
      }),
    }
  )
);
```

### 4.2 Rust Connection Layer Implementation

**File**: `/home/kvn/workspace/evolve/repos/opcode/src-tauri/src/commands/mobile/connection.rs`

**Current State**: Lines 1-56 (stubs)
**Required Changes**:

```rust
use tauri::command;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use ssh2::Session;

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub mode: String,
    pub host: Option<String>,
    pub error: Option<String>,
}

// Connection state manager
pub struct ConnectionManager {
    ssh_session: Option<Session>,
    mode: String,
}

lazy_static::lazy_static! {
    static ref CONNECTION_MANAGER: Arc<Mutex<ConnectionManager>> = Arc::new(Mutex::new(ConnectionManager {
        ssh_session: None,
        mode: "local".to_string(),
    }));
}

/// Check if mobile connection features are available
#[command]
pub fn check_mobile_connection() -> ConnectionStatus {
    // Check system capabilities
    ConnectionStatus {
        connected: true,
        mode: "local".to_string(),
        host: None,
        error: None,
    }
}

/// Get current connection mode
#[command]
pub async fn get_connection_mode() -> String {
    let manager = CONNECTION_MANAGER.lock().await;
    manager.mode.clone()
}

/// Connect via Tailscale SSH
#[command]
pub async fn connect_tailscale_ssh(
    host: String,
    username: String,
    port: u16,
) -> Result<ConnectionStatus, String> {
    use std::net::TcpStream;

    let mut manager = CONNECTION_MANAGER.lock().await;

    // Connect to SSH
    let tcp = TcpStream::connect(format!("{}:{}", host, port))
        .map_err(|e| format!("TCP connection failed: {}", e))?;

    let mut session = Session::new()
        .map_err(|e| format!("SSH session creation failed: {}", e))?;

    session.set_tcp_stream(tcp);
    session.handshake()
        .map_err(|e| format!("SSH handshake failed: {}", e))?;

    // Authenticate (using SSH keys)
    session.userauth_agent(&username)
        .map_err(|e| format!("SSH authentication failed: {}", e))?;

    if !session.authenticated() {
        return Err("SSH authentication failed".to_string());
    }

    // Store session
    manager.ssh_session = Some(session);
    manager.mode = "tailscale".to_string();

    Ok(ConnectionStatus {
        connected: true,
        mode: "tailscale".to_string(),
        host: Some(host),
        error: None,
    })
}

/// Execute command via SSH tunnel
#[command]
pub async fn execute_remote_command(
    command: String,
) -> Result<String, String> {
    let manager = CONNECTION_MANAGER.lock().await;

    let session = manager.ssh_session.as_ref()
        .ok_or("No active SSH session")?;

    let mut channel = session.channel_session()
        .map_err(|e| format!("Failed to open channel: {}", e))?;

    channel.exec(&command)
        .map_err(|e| format!("Command execution failed: {}", e))?;

    let mut output = String::new();
    std::io::Read::read_to_string(&mut channel, &mut output)
        .map_err(|e| format!("Failed to read output: {}", e))?;

    channel.wait_close()
        .map_err(|e| format!("Failed to close channel: {}", e))?;

    Ok(output)
}

/// Connect to Claude Web API
#[command]
pub async fn connect_claude_web() -> Result<ConnectionStatus, String> {
    // TODO: Implement Claude Web API authentication
    // 1. Prompt for API token
    // 2. Validate token
    // 3. Store session

    Ok(ConnectionStatus {
        connected: false,
        mode: "web".to_string(),
        host: None,
        error: Some("Claude Web API not yet implemented".to_string()),
    })
}

/// Disconnect from current connection
#[command]
pub async fn disconnect() -> Result<(), String> {
    let mut manager = CONNECTION_MANAGER.lock().await;
    manager.ssh_session = None;
    manager.mode = "local".to_string();
    Ok(())
}
```

**Dependencies to Add** (in `src-tauri/Cargo.toml`):
```toml
[dependencies]
ssh2 = "0.9"
lazy_static = "1.4"
```

### 4.3 API Passthrough Layer

**Strategy**: For Tailscale mode, proxy all `api.ts` calls through SSH tunnel

**Implementation**: Wrap invoke calls with connection mode check

```typescript
// New file: /home/kvn/workspace/evolve/repos/opcode/src/lib/apiProxy.ts
import { invoke } from '@tauri-apps/api/core';
import { useConnectionStore } from '@/stores/connectionStore';

export async function proxyInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  const { mode, status } = useConnectionStore.getState();

  if (status !== 'connected') {
    throw new Error('Not connected. Check connection status.');
  }

  if (mode === 'tailscale') {
    // Proxy through SSH tunnel
    return invoke<T>('proxy_command_via_ssh', {
      targetCommand: command,
      targetArgs: args,
    });
  } else if (mode === 'web') {
    // Call Claude Web API
    return invoke<T>('proxy_command_via_web', {
      targetCommand: command,
      targetArgs: args,
    });
  } else {
    // Local mode: direct invoke
    return invoke<T>(command, args);
  }
}
```

**Integration with api.ts**:
- Minimal changes: replace `invoke` with `proxyInvoke`
- Or: Add connection mode checks in critical methods

---

## 5. Store Integration

### 5.1 sessionStore Enhancements

**File**: `/home/kvn/workspace/evolve/repos/opcode/src/stores/sessionStore.ts`

**Current State**: Lines 1-191 (functional, but missing some mobile-specific needs)

**Enhancements Needed**:

```typescript
// Add to SessionState interface (after line 19)
interface SessionState {
  // ... existing fields ...

  // ADD: Active session tracking
  activeSessionId: string | null;
  activeSessionOutput: string;

  // ADD: Session filtering/search
  sessionFilter: {
    projectId?: string;
    searchQuery?: string;
  };

  // ADD: Actions
  setActiveSession: (sessionId: string | null) => void;
  appendSessionOutput: (sessionId: string, output: string) => void;
  setSessionFilter: (filter: Partial<SessionState['sessionFilter']>) => void;
  getFilteredSessions: () => Session[];
}

// Add implementations (after line 186)
setActiveSession: (sessionId) => {
  set({ activeSessionId: sessionId });
},

appendSessionOutput: (sessionId, output) => {
  const { activeSessionId } = get();
  if (activeSessionId === sessionId) {
    set((state) => ({
      activeSessionOutput: state.activeSessionOutput + output
    }));
  }
},

setSessionFilter: (filter) => {
  set((state) => ({
    sessionFilter: { ...state.sessionFilter, ...filter }
  }));
},

getFilteredSessions: () => {
  const { sessions, sessionFilter } = get();
  let allSessions: Session[] = [];

  // Flatten all sessions
  Object.values(sessions).forEach(projectSessions => {
    allSessions = [...allSessions, ...projectSessions];
  });

  // Apply filters
  if (sessionFilter.projectId) {
    allSessions = allSessions.filter(s => s.project_id === sessionFilter.projectId);
  }

  if (sessionFilter.searchQuery) {
    const query = sessionFilter.searchQuery.toLowerCase();
    allSessions = allSessions.filter(s =>
      s.first_message?.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
    );
  }

  // Sort by most recent
  return allSessions.sort((a, b) => b.created_at - a.created_at);
}
```

### 5.2 workspaceStore Enhancements

**File**: `/home/kvn/workspace/evolve/repos/opcode/src/stores/workspaceStore.ts`

**Current State**: Lines 1-405 (comprehensive, needs connection integration)

**Enhancements Needed**:

```typescript
// Add to WorkspaceState interface (after line 59)
interface WorkspaceState {
  // ... existing fields ...

  // ADD: Connection-aware state
  connectionMode: ConnectionMode;
  isRemotePreview: boolean;
  remotePreviewUrl: string | null;

  // ADD: Agent session tracking
  agentSessionId: string | null;
  agentOutput: string;

  // ADD: Actions
  setConnectionMode: (mode: ConnectionMode) => void;
  setRemotePreview: (url: string | null) => void;
  setAgentSession: (sessionId: string | null) => void;
  appendAgentOutput: (output: string) => void;
  clearAgentOutput: () => void;
}

// Add implementations (after line 347)
setConnectionMode: (mode) => {
  set({ connectionMode: mode });
},

setRemotePreview: (url) => {
  set({
    remotePreviewUrl: url,
    isRemotePreview: url !== null
  });
},

setAgentSession: (sessionId) => {
  set({ agentSessionId: sessionId, agentOutput: '' });
},

appendAgentOutput: (output) => {
  set((state) => ({
    agentOutput: state.agentOutput + output
  }));
},

clearAgentOutput: () => {
  set({ agentOutput: '', agentSessionId: null });
}
```

---

## 6. Event System

### 6.1 Tauri Event Listeners

**Implementation**: Global event listener in main app component

**File**: `/home/kvn/workspace/evolve/repos/opcode/src/App.tsx` (or mobile entry point)

```typescript
import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useSessionStore } from '@/stores/sessionStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

function AppEventListeners() {
  const { handleSessionUpdate, handleOutputUpdate } = useSessionStore();
  const { appendAgentOutput } = useWorkspaceStore();

  useEffect(() => {
    // Session events
    const unlistenSessionUpdate = listen('session-updated', (event: any) => {
      handleSessionUpdate(event.payload);
    });

    const unlistenSessionOutput = listen('session-output', (event: any) => {
      const { session_id, output } = event.payload;
      handleOutputUpdate(session_id, output);
    });

    // Claude Code events
    const unlistenClaudeOutput = listen('claude-output', (event: any) => {
      appendAgentOutput(event.payload.content);
    });

    const unlistenClaudeSessionStarted = listen('claude-session-started', (event: any) => {
      const { session_id } = event.payload;
      useWorkspaceStore.getState().setAgentSession(session_id);
    });

    const unlistenClaudeSessionCompleted = listen('claude-session-completed', (event: any) => {
      useWorkspaceStore.getState().updateTask(
        useWorkspaceStore.getState().currentTaskId!,
        { status: 'completed', completedAt: new Date() }
      );
    });

    const unlistenClaudeSessionError = listen('claude-session-error', (event: any) => {
      useWorkspaceStore.getState().updateTask(
        useWorkspaceStore.getState().currentTaskId!,
        { status: 'error', error: event.payload.error, completedAt: new Date() }
      );
    });

    // Terminal events
    const unlistenTerminalOutput = listen('terminal-output', (event: any) => {
      // Handle in ConsolePane component
    });

    // Project events
    const unlistenProjectCreated = listen('project-created', (event: any) => {
      useSessionStore.getState().fetchProjects();
    });

    // Cleanup
    return () => {
      unlistenSessionUpdate.then(fn => fn());
      unlistenSessionOutput.then(fn => fn());
      unlistenClaudeOutput.then(fn => fn());
      unlistenClaudeSessionStarted.then(fn => fn());
      unlistenClaudeSessionCompleted.then(fn => fn());
      unlistenClaudeSessionError.then(fn => fn());
      unlistenTerminalOutput.then(fn => fn());
      unlistenProjectCreated.then(fn => fn());
    };
  }, []);

  return null;
}
```

### 6.2 Rust Event Emission

**Pattern**: Use `tauri::Manager::emit` to send events from Rust

**Example Implementation**:

```rust
// In src-tauri/src/commands/claude.rs (existing file)
use tauri::Manager;

pub async fn execute_claude_code_internal(
    app_handle: tauri::AppHandle,
    project_path: String,
    prompt: String,
    model: String,
) -> Result<(), String> {
    let session_id = uuid::Uuid::new_v4().to_string();

    // Emit session started event
    app_handle.emit("claude-session-started", serde_json::json!({
        "session_id": session_id,
        "project_path": project_path,
    })).map_err(|e| e.to_string())?;

    // Execute command and stream output
    let mut child = tokio::process::Command::new("claude")
        .args(&["-p", &project_path, "-m", &model])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn claude: {}", e))?;

    // Stream stdout
    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let app_handle_clone = app_handle.clone();
    let session_id_clone = session_id.clone();

    tokio::spawn(async move {
        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();

        while let Some(line) = lines.next_line().await.ok().flatten() {
            let _ = app_handle_clone.emit("claude-output", serde_json::json!({
                "session_id": session_id_clone,
                "content": line + "\n",
            }));
        }
    });

    // Wait for completion
    let status = child.wait().await.map_err(|e| e.to_string())?;

    if status.success() {
        app_handle.emit("claude-session-completed", serde_json::json!({
            "session_id": session_id,
        })).map_err(|e| e.to_string())?;
    } else {
        app_handle.emit("claude-session-error", serde_json::json!({
            "session_id": session_id,
            "error": "Command failed",
        })).map_err(|e| e.to_string())?;
    }

    Ok(())
}
```

---

## 7. Error Handling

### 7.1 API Error Handling Strategy

**Pattern**: Centralized error handling in stores with user-friendly messages

```typescript
// In sessionStore.ts
fetchProjects: async () => {
  set({ isLoadingProjects: true, error: null });
  try {
    const projects = await api.listProjects();
    set({ projects, isLoadingProjects: false });
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to fetch projects';

    set({
      error: errorMessage,
      isLoadingProjects: false
    });

    // Optional: Toast notification
    // toast.error(errorMessage);
  }
},
```

### 7.2 Connection Error Handling

**Pattern**: Retry logic with exponential backoff

```typescript
// In connectionStore.ts
connect: async () => {
  const { mode, config } = get();
  set({ status: 'connecting', error: null });

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      if (mode === 'tailscale') {
        const result = await invoke<ConnectionStatus>(
          'connect_tailscale_ssh',
          config.tailscale
        );

        if (result.connected) {
          set({ status: 'connected' });
          return;
        } else {
          throw new Error(result.error || 'Connection failed');
        }
      }
    } catch (error) {
      retryCount++;

      if (retryCount >= maxRetries) {
        set({
          status: 'error',
          error: `Connection failed after ${maxRetries} attempts: ${error}`,
        });
        return;
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }
},
```

### 7.3 User-Facing Error Messages

**Component**: Reusable error display component

```typescript
// New file: /home/kvn/workspace/evolve/repos/opcode/src/components/mobile/ErrorDisplay.tsx
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle size={48} className="text-destructive mb-4" />
      <h3 className="font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>

      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button onClick={onDismiss} variant="outline">
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## 8. Implementation Roadmap

### Phase 1: Core API Integration (Week 1)

**Priority**: Critical path for basic functionality

**Tasks**:
1. **AppsScreen Basic Integration** (2 days)
   - Connect `api.listProjects()` to sessionStore
   - Display projects in ProjectList
   - Handle loading and error states
   - Implement project creation flow

2. **WorkspaceScreen Agent Pane** (3 days)
   - Implement `api.executeClaudeCode()` integration
   - Real-time output streaming via events
   - Session management (start/stop/resume)
   - Basic chat UI with input/output

**Deliverables**:
- ✅ Users can view projects
- ✅ Users can create new projects
- ✅ Users can start Claude Code sessions
- ✅ Users can see real-time agent output

**Testing Checklist**:
- [ ] Projects load correctly from API
- [ ] Project creation works and refreshes list
- [ ] Agent execution starts successfully
- [ ] Output streams in real-time
- [ ] Stop button terminates execution

---

### Phase 2: Connection Layer (Week 2)

**Priority**: Required for remote functionality

**Tasks**:
1. **Connection Store Setup** (1 day)
   - Create connectionStore.ts
   - Implement mode switching (local/tailscale/web)
   - Persist connection config

2. **Rust SSH Implementation** (2 days)
   - Implement `connect_tailscale_ssh` command
   - SSH tunnel setup and authentication
   - Command execution over SSH
   - Error handling and reconnection logic

3. **API Proxy Layer** (2 days)
   - Create apiProxy.ts wrapper
   - Route commands based on connection mode
   - Implement command passthrough for SSH mode
   - Test all API methods via tunnel

**Deliverables**:
- ✅ Connection mode switcher UI
- ✅ Tailscale SSH connection works
- ✅ All API methods work via SSH tunnel
- ✅ Auto-reconnect on connection loss

**Testing Checklist**:
- [ ] Tailscale connection establishes successfully
- [ ] SSH tunnel proxies commands correctly
- [ ] API calls work identically in local and remote modes
- [ ] Connection errors display user-friendly messages
- [ ] Reconnection works after network interruption

---

### Phase 3: Advanced Panes (Week 3)

**Priority**: Enhanced functionality

**Tasks**:
1. **Console Pane** (2 days)
   - Remote terminal implementation
   - Command execution via SSH
   - Terminal output streaming
   - Command history

2. **Preview Pane** (2 days)
   - Device frame switcher
   - Remote preview via SSH tunnel
   - Refresh functionality
   - URL resolution by connection mode

3. **Share Pane** (1 day)
   - Session list display
   - Share link generation
   - Copy to clipboard
   - Share analytics (optional)

**Deliverables**:
- ✅ Console pane with remote terminal
- ✅ Preview pane with device frames
- ✅ Share pane with session links

**Testing Checklist**:
- [ ] Terminal commands execute correctly
- [ ] Terminal output streams in real-time
- [ ] Preview loads correctly in all device frames
- [ ] Preview URL resolves based on connection mode
- [ ] Share links generate and copy correctly

---

### Phase 4: Real-Time & Polish (Week 4)

**Priority**: User experience refinement

**Tasks**:
1. **Event System** (2 days)
   - Global event listeners setup
   - Session update events
   - Output streaming events
   - Project creation events
   - Error event handling

2. **Error Handling** (1 day)
   - ErrorDisplay component
   - Retry logic for failed operations
   - User-friendly error messages
   - Connection error recovery

3. **Performance Optimization** (1 day)
   - Lazy loading for large session lists
   - Output buffering for performance
   - Connection pooling
   - Cache invalidation strategies

4. **Polish & Testing** (1 day)
   - Loading skeletons
   - Smooth transitions
   - Empty states
   - Edge case testing

**Deliverables**:
- ✅ Real-time updates work across all screens
- ✅ Errors handled gracefully with retry
- ✅ Performance optimized for mobile
- ✅ UI polish complete

**Testing Checklist**:
- [ ] Real-time events update UI immediately
- [ ] Errors display with clear messages and retry options
- [ ] Large session lists perform well
- [ ] Output streaming doesn't cause UI lag
- [ ] All transitions smooth on mobile devices

---

## Appendix A: API Method Reference

### Project Management
- `api.listProjects()` → `Promise<Project[]>` (line 468-475)
- `api.createProject(path)` → `Promise<Project>` (line 482-489)
- `api.getProjectSessions(projectId)` → `Promise<Session[]>` (line 496-503)

### Claude Code Execution
- `api.executeClaudeCode(projectPath, prompt, model)` → `Promise<void>` (line 1031-1033)
- `api.continueClaudeCode(projectPath, prompt, model)` → `Promise<void>` (line 1038-1040)
- `api.resumeClaudeCode(projectPath, sessionId, prompt, model)` → `Promise<void>` (line 1045-1047)
- `api.cancelClaudeExecution(sessionId?)` → `Promise<void>` (line 1053-1055)
- `api.getClaudeSessionOutput(sessionId)` → `Promise<string>` (line 1070-1072)

### Session Management
- `api.loadSessionHistory(sessionId, projectId)` → `Promise<any[]>` (line 1009-1011)
- `api.listRunningClaudeSessions()` → `Promise<any[]>` (line 1061-1063)

### File System
- `api.listDirectoryContents(directoryPath)` → `Promise<FileEntry[]>` (line 1077-1079)
- `api.searchFiles(basePath, query)` → `Promise<FileEntry[]>` (line 1084-1086)

---

## Appendix B: Store State Reference

### sessionStore
- `projects: Project[]` - All projects
- `sessions: Record<string, Session[]>` - Sessions by projectId
- `currentSessionId: string | null` - Active session
- `isLoadingProjects: boolean` - Loading state
- `error: string | null` - Error message

### workspaceStore
- `currentProject: { id, name, path } | null` - Active project
- `activePane: WorkspacePane` - Current pane
- `agentStatus: 'idle' | 'running' | 'error' | 'complete'` - Agent state
- `tasks: Task[]` - Task history
- `previewUrl: string` - Preview path
- `deviceFrame: DeviceFrame` - Device frame type

### connectionStore (New)
- `mode: ConnectionMode` - Current connection mode
- `status: 'disconnected' | 'connecting' | 'connected' | 'error'` - Connection state
- `config: ConnectionConfig` - Connection configuration

---

## Appendix C: Event Reference

### Session Events
- `session-updated` → `{ session: Session }` - Session modified
- `session-output` → `{ session_id: string, output: string }` - Output chunk

### Claude Code Events
- `claude-output` → `{ session_id: string, content: string }` - Output chunk
- `claude-session-started` → `{ session_id: string, project_path: string }` - Session started
- `claude-session-completed` → `{ session_id: string }` - Session finished
- `claude-session-error` → `{ session_id: string, error: string }` - Execution error

### Terminal Events
- `terminal-output` → `{ output: string }` - Terminal output chunk

### Project Events
- `project-created` → `{ project: Project }` - New project created

---

**END OF SPECIFICATION**
