# Mobile Agent Pane - Data Flow Diagram

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WorkspaceScreen                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              AgentPaneContainer                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  State Management                                    │  │  │
│  │  │  • prompt: string                                    │  │  │
│  │  │  • sessionId: string | null                          │  │  │
│  │  │  • output: string (accumulated)                      │  │  │
│  │  │  • isExecuting: boolean                              │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Event Listeners (Tauri)                            │  │  │
│  │  │  • claude-output → append to output                 │  │  │
│  │  │  • claude-session-started → set sessionId           │  │  │
│  │  │  • claude-session-completed → mark complete         │  │  │
│  │  │  • claude-session-error → show error                │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  UI Components                                       │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │ ScrollArea (Terminal Output)                │    │  │  │
│  │  │  │ • Black background                           │    │  │  │
│  │  │  │ • Green monospace text                       │    │  │  │
│  │  │  │ • Auto-scroll to bottom                      │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │ AgentPane (Status & Tasks)                  │    │  │  │
│  │  │  │ • Task progress list                         │    │  │  │
│  │  │  │ • Checkpoints                                │    │  │  │
│  │  │  │ • Quick tools                                │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │ Input Area                                   │    │  │  │
│  │  │  │ [Textarea] [Execute/Stop Button]            │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: User Submits Prompt

```
┌─────────────┐
│    User     │
│ [Types msg] │
└──────┬──────┘
       │ 1. Enters prompt and clicks Execute
       ▼
┌────────────────────────────┐
│  AgentPaneContainer        │
│  handleExecute()           │
│  • setIsExecuting(true)    │
│  • setOutput('')           │
│  • startAgent(prompt)      │ ─────────┐
└───────────┬────────────────┘          │
            │ 2. Call API                │ 3. Update store
            ▼                            ▼
┌──────────────────────┐      ┌───────────────────────┐
│   api.ts             │      │  workspaceStore       │
│   executeClaudeCode( │      │  • agentStatus ='run' │
│     projectPath,     │      │  • tasks=[new task]   │
│     prompt,          │      │  • currentTaskId=id   │
│     'sonnet'         │      └───────────────────────┘
│   )                  │
└──────────┬───────────┘
           │ 4. Tauri invoke()
           ▼
┌─────────────────────────────────┐
│   Rust Backend                  │
│   execute_claude_code command   │
│   • Spawn claude process        │
│   • Capture stdout/stderr       │
└──────────┬──────────────────────┘
           │ 5. Emit events
           ▼
┌────────────────────────────────────────┐
│  Tauri Event System                    │
│  ┌──────────────────────────────────┐  │
│  │ claude-session-started           │  │
│  │ payload: { session_id, path }    │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ claude-output (streaming)        │  │
│  │ payload: { session_id, content } │  │
│  └──────────────────────────────────┘  │
└────────────┬───────────────────────────┘
             │ 6. Events received
             ▼
┌─────────────────────────────────────┐
│  AgentPaneContainer                 │
│  Event Listeners                    │
│  ┌───────────────────────────────┐  │
│  │ claude-session-started        │  │
│  │ → setSessionId(session_id)    │  │
│  │ → setIsExecuting(true)        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ claude-output                 │  │
│  │ → setOutput(prev + content)   │  │
│  │ → auto-scroll to bottom       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
             │ 7. State update triggers re-render
             ▼
┌─────────────────────────────────────┐
│  UI Updates (React)                 │
│  • Terminal shows new output        │
│  • AgentPane shows task progress    │
│  • Stop button enabled              │
└─────────────────────────────────────┘
```

## Data Flow: Session Completes

```
┌─────────────────────────────┐
│   Rust Backend              │
│   • Claude process exits    │
│   • status.success() check  │
└──────────┬──────────────────┘
           │ Emit completion event
           ▼
┌────────────────────────────────────────┐
│  Tauri Event System                    │
│  ┌──────────────────────────────────┐  │
│  │ claude-session-completed         │  │
│  │ payload: { session_id }          │  │
│  └──────────────────────────────────┘  │
└────────────┬───────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  AgentPaneContainer                 │
│  claude-session-completed listener  │
│  • setIsExecuting(false)            │
│  • updateTask(currentTaskId, {      │
│      status: 'completed',           │
│      completedAt: new Date()        │
│    })                                │
└─────────────┬───────────────────────┘
              │
              ▼
┌───────────────────────────────────┐
│  workspaceStore                   │
│  updateTask()                     │
│  • Find task by ID                │
│  • Update status to 'completed'   │
│  • Set agentStatus to 'complete'  │
└─────────────┬─────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  UI Updates                         │
│  • AgentPane shows checkmark        │
│  • Stop button → Send button        │
│  • Task marked complete in list     │
│  • Enable continue conversation     │
└─────────────────────────────────────┘
```

## Data Flow: User Stops Execution

```
┌─────────────┐
│    User     │
│ [Stop btn]  │
└──────┬──────┘
       │ 1. Clicks Stop
       ▼
┌────────────────────────────┐
│  AgentPaneContainer        │
│  handleStop()              │
└───────────┬────────────────┘
            │ 2. Call API
            ▼
┌──────────────────────┐
│   api.ts             │
│   cancelClaudeExec(  │
│     sessionId        │
│   )                  │
└──────────┬───────────┘
           │ 3. Tauri invoke()
           ▼
┌─────────────────────────────────┐
│   Rust Backend                  │
│   cancel_claude_execution       │
│   • Find process by session ID  │
│   • Send SIGTERM                │
│   • Cleanup resources           │
└──────────┬──────────────────────┘
           │ 4. Process terminated
           ▼
┌────────────────────────────┐
│  AgentPaneContainer        │
│  • setIsExecuting(false)   │
│  • stopAgent() in store    │
└────────────────────────────┘
```

## State Synchronization: workspaceStore ↔ AgentPane

```
┌───────────────────────────────────────────────────────────┐
│  workspaceStore                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ State                                                │  │
│  │ • agentStatus: 'idle' | 'running' | 'error' | ...   │  │
│  │ • tasks: Task[]                                      │  │
│  │ • currentTaskId: string | null                       │  │
│  │ • currentProject: { id, name, path }                 │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │ Zustand subscription
                        ▼
┌───────────────────────────────────────────────────────────┐
│  AgentPaneContainer                                        │
│  const { agentStatus, tasks, currentTaskId, ...}          │
│        = useWorkspaceStore()                               │
│                                                            │
│  • Converts tasks to AgentPane format                     │
│  • Maps 'running' → 'in_progress'                         │
│  • Finds currentTask from tasks array                     │
└───────────────────────┬───────────────────────────────────┘
                        │ Props
                        ▼
┌───────────────────────────────────────────────────────────┐
│  AgentPane                                                 │
│  props: {                                                  │
│    tasks: Task[]                                           │
│    currentTask: Task | null                                │
│    agentStatus: AgentStatus                                │
│  }                                                         │
│                                                            │
│  • Displays task progress UI                              │
│  • Shows checkpoints                                      │
│  • Renders quick tools                                    │
└───────────────────────────────────────────────────────────┘
```

## Event Listener Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│  AgentPaneContainer Mount                                 │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│  useEffect(() => {                                         │
│    const setupListeners = async () => {                   │
│      unlistenOutput = await listen('claude-output', ...)  │
│      unlistenStarted = await listen('claude-session-...') │
│      unlistenCompleted = await listen('claude-session...') │
│      unlistenError = await listen('claude-session-error')  │
│    }                                                       │
│    setupListeners()                                        │
│                                                            │
│    return () => {                                          │
│      unlistenOutput?.()                                    │
│      unlistenStarted?.()                                   │
│      unlistenCompleted?.()                                 │
│      unlistenError?.()                                     │
│    }                                                       │
│  }, [sessionId, currentTaskId])                            │
└───────────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│  Listeners Active                                          │
│  • All 4 event types subscribed                           │
│  • Callbacks registered in Tauri event system             │
│  • Ready to receive events from backend                   │
└───────────────────┬───────────────────────────────────────┘
                    │ Component unmounts
                    ▼
┌───────────────────────────────────────────────────────────┐
│  Cleanup                                                   │
│  • All listeners unsubscribed                             │
│  • No memory leaks                                        │
│  • Clean state for next mount                             │
└───────────────────────────────────────────────────────────┘
```

## Output Accumulation & Auto-scroll

```
┌────────────────────────────────────────┐
│  Event: claude-output                  │
│  payload: { content: "New line\n" }    │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│  setOutput(prev => prev + content)     │
│  • Accumulates all output              │
│  • Preserves previous content          │
│  • Adds new content to end             │
└───────────────┬────────────────────────┘
                │ State update
                ▼
┌────────────────────────────────────────┐
│  useEffect(() => {                     │
│    outputEndRef.current?.scrollInto... │
│  }, [output])                          │
│  • Triggers on every output change     │
│  • Smooth scroll to bottom             │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│  ScrollArea re-render                  │
│  <pre>{output}</pre>                   │
│  <div ref={outputEndRef} />            │
│  • New content displayed               │
│  • Auto-scrolled to show latest        │
└────────────────────────────────────────┘
```

## Task Status State Machine

```
        startAgent(prompt)
              │
              ▼
        ┌──────────┐
        │  IDLE    │
        └────┬─────┘
             │
             │ execute → claude-session-started
             ▼
        ┌──────────┐
        │ RUNNING  │ ◄──┐
        └────┬─────┘    │
             │          │ claude-output (streaming)
             │          │ (stays in RUNNING)
             ├──────────┘
             │
      ┌──────┴──────┐
      │             │
      │ success     │ error
      ▼             ▼
┌──────────┐  ┌──────────┐
│COMPLETE  │  │  ERROR   │
└──────────┘  └──────────┘
      │             │
      │             │
      └──────┬──────┘
             │ new prompt
             ▼
        ┌──────────┐
        │  IDLE    │
        └──────────┘
```

## Error Handling Flow

```
┌──────────────────────────┐
│  Error Occurs            │
│  • API call fails        │
│  • Backend error         │
│  • Process crash         │
└───────────┬──────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Event: claude-session-error        │
│  payload: {                         │
│    session_id: string,              │
│    error: "Error message"           │
│  }                                  │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  AgentPaneContainer                 │
│  claude-session-error listener      │
│  • setIsExecuting(false)            │
│  • updateTask(currentTaskId, {      │
│      status: 'error',               │
│      error: payload.error,          │
│      completedAt: new Date()        │
│    })                                │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  UI Updates                         │
│  • AgentPane shows error badge      │
│  • Error message displayed          │
│  • Stop button → Send button        │
│  • User can retry with new prompt   │
└─────────────────────────────────────┘
```
