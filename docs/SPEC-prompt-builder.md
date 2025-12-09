# Prompt Builder Specification

## Overview

The Prompt Builder is an advanced UI component that transforms the Create screen into a comprehensive command interface for Claude Code. It provides intelligent command discovery, workflow reuse, metaprompt access, and real-time execution feedback—all while maintaining seamless connectivity through Tailscale VPN.

## Vision Statement

**"The mobile app is a fancy UI for input/output to Claude Code running on the computer."**

The Prompt Builder embodies this vision by:
- Providing rich command discovery and composition on mobile
- Maintaining SSH connection to the workstation via Tailscale
- Streaming real-time output from Claude Code execution
- Preserving full command power while optimizing for mobile UX

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App (Frontend)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │            Enhanced Create Screen                   │ │
│  │  ┌────────────────────────────────────────────┐   │ │
│  │  │  1. Project Location Display               │   │ │
│  │  │     - Default workspace path               │   │ │
│  │  │     - SSH file browser button              │   │ │
│  │  │     - Connection status indicator          │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  │  ┌────────────────────────────────────────────┐   │ │
│  │  │  2. Prompt Builder                         │   │ │
│  │  │     - Multi-line input with autocomplete   │   │ │
│  │  │     - Command palette                       │   │ │
│  │  │     - Workflow templates                    │   │ │
│  │  │     - Metaprompt library                    │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  │  ┌────────────────────────────────────────────┐   │ │
│  │  │  3. Context Panel                          │   │ │
│  │  │     - Selected files/folders               │   │ │
│  │  │     - Active project context               │   │ │
│  │  │     - Environment variables                 │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  │  ┌────────────────────────────────────────────┐   │ │
│  │  │  4. Execution View                         │   │ │
│  │  │     - Real-time output streaming           │   │ │
│  │  │     - Progress indicators                   │   │ │
│  │  │     - Session history                       │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────┘   │ │
└─────────────────────────────────────────────────────────┘
                        ↕ Tailscale VPN
┌─────────────────────────────────────────────────────────┐
│               Workstation (Backend via SSH)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ~/.claude/                                        │ │
│  │    - commands/ (214+ slash commands)              │ │
│  │    - workflows/ (saved workflow definitions)      │ │
│  │    - prompts/ (metaprompt library)                │ │
│  │    - settings.json (default workspace config)     │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Claude Code CLI                                   │ │
│  │    - Receives commands via SSH                     │ │
│  │    - Executes in project directories              │ │
│  │    - Streams output back to mobile                │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## UI Components

### 1. Project Location Section

**Location**: Top of Create screen, above prompt builder

**Purpose**: Show where the project will be created and allow browsing remote filesystem

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  📍 Project Location                       [Connection●] │
│  ┌─────────────────────────────────────────────────────┐│
│  │ /Users/kvn/workspace/projects              [Browse] ││
│  └─────────────────────────────────────────────────────┘│
│  Default workspace • Click Browse to change              │
└─────────────────────────────────────────────────────────┘
```

#### Components

**A. Location Display**
- Shows current target directory from `~/.claude/settings.json`
- Format: Full path with folder icon
- Tappable to copy path
- Visual indicator if path is custom vs default

**B. Browse Button**
- Opens SSH File Browser modal
- Uses Tailscale connection to browse remote filesystem
- Tree view of directories
- Quick access to common locations:
  - Default workspace
  - Recent projects
  - Home directory
  - Custom paths

**C. Connection Status Indicator**
- Green dot: Connected to workstation
- Yellow dot: Connecting...
- Red dot: Connection lost
- Gray dot: Not connected
- Tooltip with connection details on long-press

#### Data Structure

```typescript
interface ProjectLocation {
  path: string;              // e.g., "/Users/kvn/workspace/projects"
  isDefault: boolean;        // From settings.json
  isAccessible: boolean;     // SSH connectivity check
  lastVerified: number;      // Timestamp of last check
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

interface WorkspaceSettings {
  defaultWorkspace: string;  // From ~/.claude/settings.json
  recentProjects: string[];
  customPaths: string[];
}
```

---

### 2. Prompt Builder

**Location**: Center of screen, main interaction area

**Purpose**: Compose prompts with intelligent command discovery and autocomplete

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✨ What would you like to create?                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │ /sparc:                                         [⌘K]││
│  │                                                      ││
│  │ ▼ Command Suggestions                               ││
│  │   /sparc:orchestrator - Multi-agent coordination    ││
│  │   /sparc:coder - Autonomous coding                  ││
│  │   /sparc:architect - System design                  ││
│  └─────────────────────────────────────────────────────┘│
│  [📚 Workflows] [🎯 Metaprompts] [⚙️ Context]          │
└─────────────────────────────────────────────────────────┘
```

#### Components

**A. Multi-line Prompt Input**

Features:
- Syntax highlighting for:
  - Slash commands (`/sparc:coder`)
  - File references (`@file.ts`)
  - Bash commands (`!npm install`)
  - Variables (`$PROJECT_NAME`)
- Auto-complete triggered by:
  - `/` for slash commands
  - `@` for file references
  - `$` for variables
- Tab completion
- Line numbers (optional, toggle in settings)
- Keyboard shortcuts:
  - `⌘K` / `Ctrl+K`: Open command palette
  - `Tab`: Accept suggestion
  - `Esc`: Close suggestions
  - `⌘Enter`: Execute prompt

**B. Command Autocomplete Overlay**

Triggered by typing `/`:

```typescript
interface SlashCommandSuggestion {
  command: SlashCommand;           // Full command details
  relevanceScore: number;          // 0-1, based on search match
  category: string;                // e.g., "SPARC", "GitHub", "Project Management"
  recentlyUsed: boolean;           // Show "Recently used" badge
}
```

Display:
- Fuzzy search across command name, description, namespace
- Grouped by category
- Icons based on command type
- Keyboard navigation (↑/↓ arrows)
- Click or Enter to insert
- Shows:
  - Full command with namespace
  - Description
  - Accepted arguments indicator
  - Tool restrictions
  - Scope (user/project/default)

**C. File Reference Autocomplete**

Triggered by typing `@`:

```typescript
interface FileReferenceSuggestion {
  path: string;                    // Relative to project root
  type: 'file' | 'directory';
  modified: number;                // Last modified timestamp
  size: number;                    // File size in bytes
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked';
}
```

Display:
- Browse project filesystem via SSH
- Filter by extension
- Show git status
- Recent files at top
- Directory tree navigation

**D. Variable Autocomplete**

Triggered by typing `$`:

```
$ARGUMENTS       - Command arguments
$PROJECT_NAME    - Current project name
$PROJECT_PATH    - Project directory
$WORKSPACE       - Workspace root
$USER            - Current user
```

---

### 3. Command Palette

**Trigger**: `⌘K` / `Ctrl+K` or tap command palette button

**Purpose**: Quick access to all 214+ available commands across 25 categories

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search commands...                            [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │ sparc                                               ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │ 📊 SPARC Methodology (18 commands)                  ││
│  │  ┌─────────────────────────────────────────────────┐││
│  │  │ /sparc:orchestrator                             │││
│  │  │ Multi-agent coordination                        │││
│  │  │ Tags: coordination • agents • workflow          │││
│  │  └─────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────┐││
│  │  │ /sparc:coder                                    │││
│  │  │ Autonomous coding                               │││
│  │  │ Tags: implementation • autonomous               │││
│  │  └─────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────┘│
│  ↑↓ Navigate • Enter Select • Esc Close                │
└─────────────────────────────────────────────────────────┘
```

#### Features

**Command Categories** (25 total):
1. **SuperClaude Commands** (`/sc:*`) - 26 commands
2. **SPARC Methodology** (`/sparc:*`) - 18 commands
3. **Swarm Strategies** (`/swarm:*`) - 17 commands
4. **Project Management** (`/pm:*`) - 38 commands
5. **GitHub Operations** (`/github:*`) - 19 commands
6. **Coordination** (`/coordination:*`) - 7 commands
7. **Hive Mind** (`/hive-mind:*`) - 12 commands
8. **Analysis** (`/analysis:*`) - 7 commands
9. **Automation** (`/automation:*`) - 10 commands
10. **Memory Management** (`/memory:*`) - 6 commands
11. **Monitoring** (`/monitoring:*`) - 6 commands
12. **Optimization** (`/optimization:*`) - 6 commands
13. **UI/Frontend** (`/ui:*`) - 6 commands
14. **Flow Nexus** (`/flow-nexus:*`) - 9 commands
15. **Hooks** (`/hooks:*`) - 8 commands
16. **Training** (`/training:*`) - 6 commands
17. **Pair Programming** (`/pair:*`) - 9 commands
18. **Workflows** (`/workflows:*`) - 6 commands
19. **Status Line** (`/statusline:*`) - 8 commands
20. **Stream Chain** (`/stream-chain:*`) - 2 commands
21. **Agents** (`/agents:*`) - 5 commands
22. **Verify** (`/verify:*`) - 2 commands
23. **Truth** (`/truth:*`) - 1 command
24. **System** (`/system:*`) - 1 command
25. **Custom Commands** (User/Project) - Variable

**Search Capabilities**:
- Fuzzy search across command name, description, tags
- Category filtering
- Scope filtering (default/user/project)
- Recently used commands at top
- Keyboard shortcuts for common commands

**Command Detail View**:

Tap a command to see full details:

```
┌─────────────────────────────────────────────────────────┐
│  /sparc:orchestrator                              [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Multi-agent coordination                           ││
│  │                                                      ││
│  │  Category: SPARC Methodology                        ││
│  │  Scope: Default                                     ││
│  │  Arguments: Optional                                ││
│  │                                                      ││
│  │  Description:                                       ││
│  │  Orchestrate complex tasks using multiple          ││
│  │  specialized agents working in parallel.           ││
│  │                                                      ││
│  │  Usage:                                             ││
│  │  /sparc:orchestrator "Build auth system"           ││
│  │  /sparc:orchestrator --agents 15 "Complex task"    ││
│  │                                                      ││
│  │  [Insert Command]  [View Full Documentation]       ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

### 4. Workflows Panel

**Trigger**: Tap "Workflows" button below prompt input

**Purpose**: Access and execute saved workflow templates

#### Data Structure

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'research' | 'testing' | 'analysis' | 'maintenance' | 'custom';
  commands: WorkflowStep[];
  metadata: {
    created: number;
    lastUsed?: number;
    usageCount: number;
    author: 'system' | 'user';
    tags: string[];
  };
}

interface WorkflowStep {
  order: number;
  command: string;              // e.g., "/sparc:architect 'Design auth system'"
  description: string;
  parallel?: boolean;           // Can run in parallel with other steps
  dependencies?: number[];      // Depends on steps with these orders
}
```

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  📚 Workflows                                      [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 🔍 Search workflows...                              ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ⭐ Recently Used                                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Full Stack Development                             ││
│  │  3 steps • Last used 2 hours ago                    ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  🏗️ Development Workflows                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Feature Implementation                             ││
│  │  5 steps • Used 12 times                            ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │  Bug Fix Workflow                                   ││
│  │  4 steps • Used 8 times                             ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  🔬 Research Workflows                                  │
│  🧪 Testing Workflows                                   │
│  📊 Analysis Workflows                                  │
└─────────────────────────────────────────────────────────┘
```

#### Workflow Detail View

```
┌─────────────────────────────────────────────────────────┐
│  Full Stack Development                           [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Build a complete full-stack feature with           ││
│  │  database, API, and frontend.                       ││
│  │                                                      ││
│  │  Steps:                                             ││
│  │  1️⃣ /sparc:architect "Design system"                ││
│  │  2️⃣ /sparc:coder "Implement backend"                ││
│  │  3️⃣ /sparc:coder "Implement frontend"   [Parallel]  ││
│  │  4️⃣ /sparc:tester "Create test suite"               ││
│  │  5️⃣ /sparc:reviewer "Code review"                   ││
│  │                                                      ││
│  │  Used 12 times • Last: 2 hours ago                  ││
│  │                                                      ││
│  │  [Customize] [Execute Workflow]                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

#### Built-in Workflow Templates

From the codebase, these workflow categories exist:
1. **Development** - Feature implementation, bug fixes
2. **Research** - Investigation, exploration workflows
3. **Testing** - Test creation, validation workflows
4. **Analysis** - Code analysis, review workflows
5. **Maintenance** - Refactoring, cleanup workflows

---

### 5. Metaprompts Library

**Trigger**: Tap "Metaprompts" button below prompt input

**Purpose**: Access reusable prompt templates and patterns

#### Data Structure

```typescript
interface Metaprompt {
  id: string;
  name: string;
  description: string;
  template: string;              // Prompt template with variables
  variables: Variable[];         // Required/optional variables
  category: 'research' | 'implementation' | 'analysis' | 'design' | 'documentation';
  metadata: {
    created: number;
    author: 'system' | 'user';
    tags: string[];
    examples: string[];          // Example usages
  };
}

interface Variable {
  name: string;                  // e.g., "feature_name"
  type: 'string' | 'file' | 'directory' | 'enum';
  required: boolean;
  description: string;
  default?: string;
  options?: string[];            // For enum type
}
```

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  🎯 Metaprompts                                    [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 🔍 Search metaprompts...                            ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  🔬 Research Metaprompts                                │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Deep Research Pipeline                             ││
│  │  Research → Plan → Implement                        ││
│  │  Variables: topic, depth                            ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  🏗️ Implementation Metaprompts                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Feature Implementation                             ││
│  │  Design → Code → Test                               ││
│  │  Variables: feature_name, scope                     ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  📊 Analysis Metaprompts                                │
│  🎨 Design Metaprompts                                  │
│  📝 Documentation Metaprompts                           │
└─────────────────────────────────────────────────────────┘
```

#### Metaprompt Detail View

```
┌─────────────────────────────────────────────────────────┐
│  Deep Research Pipeline                           [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Three-stage research pipeline:                     ││
│  │  1. Research - Gather information                   ││
│  │  2. Plan - Create implementation plan               ││
│  │  3. Implement - Execute the plan                    ││
│  │                                                      ││
│  │  Variables:                                         ││
│  │  • topic (required): Research topic                 ││
│  │  • depth (optional): Research depth                 ││
│  │    Options: quick, standard, deep, exhaustive       ││
│  │                                                      ││
│  │  Example:                                           ││
│  │  topic="OAuth 2.0 implementation"                   ││
│  │  depth="deep"                                       ││
│  │                                                      ││
│  │  [Customize Variables] [Generate Prompt]            ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

#### Variable Input Form

When using a metaprompt:

```
┌─────────────────────────────────────────────────────────┐
│  Configure: Deep Research Pipeline                [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Topic *                                            ││
│  │  ┌─────────────────────────────────────────────────┐││
│  │  │ OAuth 2.0 implementation                        │││
│  │  └─────────────────────────────────────────────────┘││
│  │                                                      ││
│  │  Depth                                              ││
│  │  ┌─────────────────────────────────────────────────┐││
│  │  │ Deep                           ▼                │││
│  │  └─────────────────────────────────────────────────┘││
│  │    • quick - Fast overview                          ││
│  │    • standard - Normal depth                        ││
│  │    • deep - Comprehensive                           ││
│  │    • exhaustive - Maximum detail                    ││
│  │                                                      ││
│  │  [Cancel] [Generate Prompt]                         ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

Generated prompt is inserted into prompt builder:

```
/sc:research "OAuth 2.0 implementation" --depth deep

Research OAuth 2.0 implementation patterns and best practices.
Focus on security considerations and modern implementation approaches.
```

---

### 6. Context Panel

**Trigger**: Tap "Context" button or automatically shown when files selected

**Purpose**: Show what context will be sent with the prompt

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ Context                                        [✕]   │
│                                                          │
│  📁 Selected Files (3)                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │  ✓ src/auth/login.ts                      [Remove]  ││
│  │  ✓ src/auth/types.ts                      [Remove]  ││
│  │  ✓ tests/auth/login.test.ts               [Remove]  ││
│  └─────────────────────────────────────────────────────┘│
│  [+ Add Files/Folders]                                  │
│                                                          │
│  🌐 Environment                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  PROJECT_NAME: opcode                               ││
│  │  NODE_ENV: development                              ││
│  │  WORKSPACE: /Users/kvn/workspace                    ││
│  └─────────────────────────────────────────────────────┘│
│  [+ Add Variable]                                       │
│                                                          │
│  📊 Active Project                                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Name: opcode                                       ││
│  │  Path: /Users/kvn/workspace/evolve/repos/opcode     ││
│  │  Git Branch: feature/mobile                         ││
│  │  Last Modified: 2 hours ago                         ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

#### Features

- File/folder selection via SSH browser
- Git status integration
- Environment variable management
- Recent files quick access
- Context size estimation (tokens)
- Preview selected files

---

### 7. Execution View

**Trigger**: After executing a prompt

**Purpose**: Stream real-time output from Claude Code execution

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ▶️ Executing: /sparc:coder "Build auth"          [✕]   │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │  ✅ Analyzing requirements...                       ││
│  │  ✅ Planning implementation...                      ││
│  │  🔄 Writing code...                                 ││
│  │     Created src/auth/login.ts                       ││
│  │     Created src/auth/types.ts                       ││
│  │     Modified src/index.ts                           ││
│  │  ⏳ Running tests...                                ││
│  │                                                      ││
│  │  [View Full Output] [Stop Execution]                ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  📊 Progress: 3/5 steps complete                        │
│  ⏱️ Elapsed: 2m 14s                                     │
└─────────────────────────────────────────────────────────┘
```

#### Features

**Real-time Streaming**:
- SSE (Server-Sent Events) or WebSocket connection
- Progressive output display
- Syntax highlighting for code snippets
- Collapsible sections for long output
- Auto-scroll with pause option

**Progress Tracking**:
- Step-by-step progress for multi-step commands
- Token usage indicator
- Time elapsed
- Estimated time remaining (for known workflows)

**Interactive Controls**:
- Stop execution
- Pause/resume (if supported)
- Expand/collapse sections
- Copy output
- Save session log

**Completion Actions**:
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Execution Complete                            [✕]   │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Successfully created authentication system         ││
│  │                                                      ││
│  │  Files Created: 5                                   ││
│  │  Files Modified: 2                                  ││
│  │  Tests Added: 8                                     ││
│  │                                                      ││
│  │  Duration: 3m 42s                                   ││
│  │  Tokens Used: 12,459                                ││
│  │                                                      ││
│  │  [View Changes] [Open in Workspace] [New Prompt]    ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Command Execution Flow

```
┌─────────────┐
│   Mobile    │
│    App      │
└──────┬──────┘
       │ 1. User composes prompt
       │    with command autocomplete
       │
       ▼
┌──────────────────┐
│  Prompt Builder  │ 2. Parse prompt
│                  │    - Extract commands
│                  │    - Resolve file refs
│                  │    - Substitute variables
└──────┬───────────┘
       │ 3. Send via Tailscale SSH
       │
       ▼
┌──────────────────┐
│   Workstation    │ 4. Execute Claude Code
│  (via Tailscale) │    claude code "<prompt>"
└──────┬───────────┘
       │ 5. Stream output via SSE
       │
       ▼
┌──────────────────┐
│ Execution View   │ 6. Display real-time
│                  │    output with formatting
└──────────────────┘
```

### 2. Command Discovery Flow

```
User types "/" in input
       │
       ▼
Load slash commands from:
  1. ~/.claude/commands/ (user-level)
  2. project/.claude/commands/ (project-level)
  3. Built-in commands (214+ from command-routing.md)
       │
       ▼
Parse and index:
  - Command name
  - Namespace
  - Description
  - Scope (user/project/default)
  - Arguments
  - Tools allowed
       │
       ▼
Build searchable index:
  - Fuzzy search capability
  - Category grouping
  - Recent usage tracking
       │
       ▼
Display autocomplete overlay:
  - Filter as user types
  - Show relevant commands
  - Highlight matches
  - Keyboard navigation
```

### 3. File Reference Flow

```
User types "@" in input
       │
       ▼
SSH connection to workstation
via Tailscale
       │
       ▼
Browse project filesystem:
  - Read directory structure
  - Check git status
  - Get file metadata
       │
       ▼
Display file browser:
  - Tree view of files
  - Filter by extension
  - Show git status
  - Recent files at top
       │
       ▼
User selects file(s)
       │
       ▼
Add to Context Panel
Insert reference in prompt
```

### 4. Workflow Execution Flow

```
User selects workflow
       │
       ▼
Load workflow definition:
  - Steps
  - Dependencies
  - Variables
       │
       ▼
If variables required:
  │
  ▼
Show variable input form
  │
  ▼
User fills variables
       │
       ▼
Generate composed prompt:
  - Substitute variables
  - Expand steps
  - Add context
       │
       ▼
Execute via Claude Code
       │
       ▼
Track multi-step progress:
  - Execute steps in order
  - Handle parallel steps
  - Wait for dependencies
       │
       ▼
Display combined output
```

---

## API Requirements

### Backend Endpoints (via Tauri/SSH)

#### 1. Command Management

```rust
#[tauri::command]
async fn slash_commands_list(project_path: Option<String>) -> Result<Vec<SlashCommand>, String>

#[tauri::command]
async fn slash_command_get(command_id: String) -> Result<SlashCommand, String>

#[tauri::command]
async fn slash_command_execute(
    command: String,
    project_path: String,
    context: ExecutionContext
) -> Result<ExecutionHandle, String>
```

#### 2. Filesystem Operations (via SSH)

```rust
#[tauri::command]
async fn ssh_browse_directory(path: String) -> Result<Vec<FileEntry>, String>

#[tauri::command]
async fn ssh_get_file_content(path: String) -> Result<String, String>

#[tauri::command]
async fn ssh_search_files(query: String, path: String) -> Result<Vec<FileEntry>, String>
```

#### 3. Workflow Management

```rust
#[tauri::command]
async fn workflow_list() -> Result<Vec<Workflow>, String>

#[tauri::command]
async fn workflow_get(workflow_id: String) -> Result<Workflow, String>

#[tauri::command]
async fn workflow_execute(
    workflow_id: String,
    variables: HashMap<String, String>
) -> Result<ExecutionHandle, String>
```

#### 4. Metaprompt Management

```rust
#[tauri::command]
async fn metaprompt_list() -> Result<Vec<Metaprompt>, String>

#[tauri::command]
async fn metaprompt_get(metaprompt_id: String) -> Result<Metaprompt, String>

#[tauri::command]
async fn metaprompt_generate(
    metaprompt_id: String,
    variables: HashMap<String, String>
) -> Result<String, String>
```

#### 5. Execution Management

```rust
#[tauri::command]
async fn execution_get_output(execution_id: String) -> Result<String, String>

#[tauri::command]
async fn execution_subscribe(execution_id: String) -> Result<(), String>

#[tauri::command]
async fn execution_stop(execution_id: String) -> Result<(), String>
```

#### 6. Settings Management

```rust
#[tauri::command]
async fn settings_get() -> Result<ClaudeSettings, String>

#[tauri::command]
async fn settings_update(settings: ClaudeSettings) -> Result<(), String>

#[tauri::command]
async fn settings_get_default_workspace() -> Result<String, String>
```

---

## Tailscale Integration

### SSH File Browser via Tailscale

**Problem**: Mobile app needs to browse filesystem on remote workstation

**Solution**: SSH over Tailscale VPN

#### Connection Flow

```
1. User has Tailscale installed on:
   - Mobile device
   - Workstation

2. Both devices connected to same Tailnet

3. Mobile app connects via SSH:
   ssh user@workstation-hostname

4. Browse filesystem via SSH commands:
   - ls
   - find
   - cat
   - git status
```

#### Implementation

**Frontend (React Native)**:

```typescript
// Connect to workstation via SSH through Tailscale
async function connectToWorkstation() {
  const config = await getTailscaleConfig();

  // Tailscale handles routing and encryption
  // SSH connection appears local
  const connection = await ssh.connect({
    host: config.workstationHostname,  // e.g., "my-workstation"
    username: config.username,
    privateKey: await getPrivateKey(),  // Stored securely on device
  });

  return connection;
}

// Browse directory
async function browseDirectory(path: string) {
  const ssh = await connectToWorkstation();

  const result = await ssh.exec(`
    cd "${path}" && \
    find . -maxdepth 1 -type f -o -type d | \
    xargs stat -f '%N|%m|%z|%SHp'
  `);

  return parseFileList(result);
}

// Execute Claude Code command
async function executeClaudeCommand(prompt: string, projectPath: string) {
  const ssh = await connectToWorkstation();

  // Start Claude Code with streaming output
  const sessionId = generateSessionId();

  await ssh.exec(`
    cd "${projectPath}" && \
    claude code "${prompt}" --stream --session-id ${sessionId}
  `);

  // Subscribe to output stream via SSE
  return subscribeToExecutionStream(sessionId);
}
```

**Backend (Rust/Tauri)**:

```rust
// SSH connection pool for Tailscale connections
struct TailscaleSSHPool {
    connections: HashMap<String, Arc<Mutex<Session>>>,
}

impl TailscaleSSHPool {
    async fn get_connection(&mut self, hostname: &str) -> Result<Arc<Mutex<Session>>, Error> {
        // Reuse existing connection if available
        if let Some(conn) = self.connections.get(hostname) {
            return Ok(Arc::clone(conn));
        }

        // Create new SSH connection via Tailscale
        let session = Session::connect(hostname)?;
        let conn = Arc::new(Mutex::new(session));
        self.connections.insert(hostname.to_string(), Arc::clone(&conn));

        Ok(conn)
    }
}

// Browse filesystem via SSH
#[tauri::command]
async fn ssh_browse_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let pool = SSH_POOL.lock().await;
    let conn = pool.get_connection("workstation").await?;

    let output = conn.lock().await.exec(&format!(
        "cd {} && ls -lah --color=never",
        path
    ))?;

    parse_file_listing(&output)
}
```

#### Security Considerations

1. **Authentication**:
   - Use SSH key authentication (not passwords)
   - Store private key securely in mobile keychain
   - Support passphrase-protected keys

2. **Tailscale VPN**:
   - All traffic encrypted by Tailscale
   - Device-to-device authentication
   - No exposed ports
   - ACL-based access control

3. **Command Execution**:
   - Sanitize all user input
   - Restrict commands to safe subset
   - Validate file paths
   - Prevent command injection

---

## User Experience Flows

### Flow 1: Quick Command Execution

```
1. User opens Create screen
2. Connection indicator shows green (connected)
3. User taps in prompt input
4. Types "/"
5. Autocomplete shows command list
6. Types "sparc"
7. List filters to SPARC commands
8. Taps "/sparc:coder"
9. Types description: "Build login form with email/password"
10. Taps Execute (or ⌘Enter)
11. Execution view appears
12. Real-time output streams from Claude Code
13. Shows progress: Analyzing → Planning → Implementing → Testing
14. Completion screen shows files created
15. Taps "Open in Workspace"
16. Switches to Workspace screen showing new files
```

### Flow 2: Using a Workflow

```
1. User opens Create screen
2. Taps "Workflows" button
3. Workflows panel slides up
4. Browses "Development Workflows"
5. Taps "Feature Implementation"
6. Workflow detail appears
7. Shows 5 steps with descriptions
8. Taps "Customize"
9. Variable input form appears
10. Fills "feature_name": "User Profile"
11. Fills "scope": "backend"
12. Taps "Execute Workflow"
13. Multi-step execution begins
14. Shows progress through each step
15. Step 2 and 3 run in parallel (indicated)
16. Completion shows all files created
17. Taps "New Prompt" to continue
```

### Flow 3: Using a Metaprompt

```
1. User opens Create screen
2. Taps "Metaprompts" button
3. Metaprompts panel slides up
4. Searches "research"
5. Taps "Deep Research Pipeline"
6. Detail view shows template and variables
7. Taps "Customize Variables"
8. Variable form appears
9. Fills "topic": "React Server Components"
10. Selects "depth": "deep"
11. Taps "Generate Prompt"
12. Prompt is inserted into prompt builder
13. User reviews and edits generated prompt
14. Adds file references with @
15. Taps Execute
16. Three-stage execution begins
17. Shows progress: Research → Plan → Implement
18. Each stage streams output
19. Completion shows comprehensive results
```

### Flow 4: Browsing Remote Files

```
1. User types "@" in prompt input
2. File browser overlay appears
3. Shows project root directory
4. User navigates to src/components/
5. Sees list of .tsx files
6. Files show git status (M for modified)
7. Taps "Button.tsx" to select
8. File is added to Context Panel
9. File reference inserted in prompt: @src/components/Button.tsx
10. User continues composing prompt
11. Execution includes selected file in context
```

### Flow 5: Changing Project Location

```
1. User opens Create screen
2. Default location shows: /Users/kvn/workspace/projects
3. Taps "Browse" button
4. SSH file browser modal opens
5. Shows filesystem via Tailscale connection
6. Quick access shows:
   - Default workspace ⭐
   - Recent projects 🕐
   - Home directory 🏠
   - Custom paths 📁
7. User navigates to ~/code/experiments
8. Taps "Select This Location"
9. Location updates in display
10. All subsequent operations use new location
11. Can tap "Reset to Default" to revert
```

---

## Technical Implementation Details

### 1. Command Indexing Strategy

**Problem**: 214+ commands need fast search and filtering

**Solution**: Build in-memory search index on app startup

```typescript
interface CommandIndex {
  commands: Map<string, SlashCommand>;
  byCategory: Map<string, string[]>;      // category -> command IDs
  byNamespace: Map<string, string[]>;     // namespace -> command IDs
  byScope: Map<string, string[]>;         // scope -> command IDs
  searchIndex: FlexSearch.Index;          // Full-text search
  recentCommands: string[];               // LRU cache of command IDs
}

// Build index from command files
async function buildCommandIndex(): Promise<CommandIndex> {
  const commands = await loadAllCommands();

  const index: CommandIndex = {
    commands: new Map(),
    byCategory: new Map(),
    byNamespace: new Map(),
    byScope: new Map(),
    searchIndex: new FlexSearch.Index({
      tokenize: "forward",
      resolution: 9,
    }),
    recentCommands: loadRecentCommands(),
  };

  for (const cmd of commands) {
    // Add to maps
    index.commands.set(cmd.id, cmd);
    addToMultiMap(index.byCategory, cmd.category, cmd.id);
    if (cmd.namespace) {
      addToMultiMap(index.byNamespace, cmd.namespace, cmd.id);
    }
    addToMultiMap(index.byScope, cmd.scope, cmd.id);

    // Add to search index
    index.searchIndex.add(cmd.id, [
      cmd.name,
      cmd.full_command,
      cmd.description,
      cmd.namespace,
    ].join(" "));
  }

  return index;
}

// Search commands
function searchCommands(query: string, filters?: CommandFilters): SlashCommand[] {
  const index = getCommandIndex();

  // Full-text search
  const ids = index.searchIndex.search(query, { limit: 50 });

  // Apply filters
  let results = ids.map(id => index.commands.get(id)).filter(Boolean);

  if (filters?.category) {
    const categoryIds = new Set(index.byCategory.get(filters.category));
    results = results.filter(cmd => categoryIds.has(cmd.id));
  }

  if (filters?.scope) {
    const scopeIds = new Set(index.byScope.get(filters.scope));
    results = results.filter(cmd => scopeIds.has(cmd.id));
  }

  // Sort by relevance and recent usage
  return results.sort((a, b) => {
    const aRecent = index.recentCommands.indexOf(a.id);
    const bRecent = index.recentCommands.indexOf(b.id);

    if (aRecent >= 0 && bRecent >= 0) {
      return aRecent - bRecent;  // More recent first
    }
    if (aRecent >= 0) return -1;
    if (bRecent >= 0) return 1;

    return 0;  // Maintain search relevance order
  });
}
```

### 2. Real-time Output Streaming

**Problem**: Stream output from Claude Code on workstation to mobile app

**Solution**: SSE (Server-Sent Events) over SSH tunnel

```typescript
// Frontend: Subscribe to execution stream
async function subscribeToExecutionStream(executionId: string) {
  const ssh = await connectToWorkstation();

  // Create SSE endpoint via SSH tunnel
  const sseUrl = await ssh.createTunnel({
    remotePort: 3000,  // Claude Code SSE server
    path: `/stream/${executionId}`,
  });

  // Subscribe to SSE
  const eventSource = new EventSource(sseUrl);

  eventSource.addEventListener('output', (event) => {
    const data = JSON.parse(event.data);
    handleExecutionOutput(data);
  });

  eventSource.addEventListener('progress', (event) => {
    const data = JSON.parse(event.data);
    updateProgressIndicator(data);
  });

  eventSource.addEventListener('complete', (event) => {
    const data = JSON.parse(event.data);
    handleExecutionComplete(data);
    eventSource.close();
  });

  return eventSource;
}

// Backend: Claude Code SSE server
async fn start_sse_server(execution_id: String) -> Result<(), Error> {
    let listener = TcpListener::bind("127.0.0.1:3000").await?;

    loop {
        let (stream, _) = listener.accept().await?;

        // Handle SSE connection
        tokio::spawn(async move {
            let output_stream = subscribe_to_execution(execution_id);

            while let Some(output) = output_stream.next().await {
                let event = match output {
                    ExecutionOutput::Text(text) => {
                        format!("event: output\ndata: {}\n\n", json!({"text": text}))
                    }
                    ExecutionOutput::Progress(step, total) => {
                        format!("event: progress\ndata: {}\n\n", json!({"step": step, "total": total}))
                    }
                    ExecutionOutput::Complete(result) => {
                        format!("event: complete\ndata: {}\n\n", json!(result))
                    }
                };

                stream.write_all(event.as_bytes()).await?;
            }
        });
    }
}
```

### 3. Context Management

**Problem**: Track which files and context are included with prompt

**Solution**: Context manager that handles file references and variables

```typescript
interface ContextManager {
  selectedFiles: Set<string>;
  variables: Map<string, string>;
  projectInfo: ProjectInfo;
}

class ContextManager {
  addFile(path: string) {
    this.selectedFiles.add(path);
    this.emit('context-changed');
  }

  removeFile(path: string) {
    this.selectedFiles.delete(path);
    this.emit('context-changed');
  }

  setVariable(name: string, value: string) {
    this.variables.set(name, value);
    this.emit('context-changed');
  }

  async resolveContext(): Promise<ResolvedContext> {
    // Load file contents via SSH
    const fileContents = await Promise.all(
      Array.from(this.selectedFiles).map(async (path) => {
        const content = await sshGetFileContent(path);
        return { path, content };
      })
    );

    // Resolve variables
    const resolvedVars = new Map(this.variables);
    resolvedVars.set('PROJECT_NAME', this.projectInfo.name);
    resolvedVars.set('PROJECT_PATH', this.projectInfo.path);

    return {
      files: fileContents,
      variables: Object.fromEntries(resolvedVars),
      project: this.projectInfo,
    };
  }

  estimateTokens(): number {
    // Rough estimate: 1 token ≈ 4 characters
    let chars = 0;

    for (const [_, value] of this.variables) {
      chars += value.length;
    }

    // Estimate file sizes (would need actual content for accuracy)
    chars += this.selectedFiles.size * 500;  // Assume avg 500 chars/file

    return Math.ceil(chars / 4);
  }
}
```

---

## Performance Considerations

### 1. Command Loading

- **Lazy load** command details (only load full content when needed)
- **Cache** parsed commands in memory
- **Index** commands on app startup for fast search
- **Debounce** search input (300ms) to reduce searches while typing

### 2. SSH Connections

- **Connection pooling** - Reuse SSH connections
- **Keep-alive** - Maintain connection with periodic pings
- **Reconnect** - Auto-reconnect on connection loss
- **Timeout** - 30s timeout for SSH operations

### 3. File Browsing

- **Pagination** - Load directories in chunks (100 items)
- **Virtual scrolling** - Only render visible items
- **Debounce** - Debounce directory navigation (150ms)
- **Cache** - Cache directory listings for 5 minutes

### 4. Output Streaming

- **Buffer** - Buffer output in chunks (1KB)
- **Throttle** - Update UI at most 10fps
- **Compression** - Use gzip for large outputs
- **Truncate** - Limit output display to last 10,000 lines

---

## Accessibility

- **Screen reader** support for all UI elements
- **Keyboard navigation** throughout the interface
- **High contrast** mode support
- **Font scaling** support
- **Focus indicators** on all interactive elements
- **Semantic HTML** for proper structure
- **ARIA labels** for complex components

---

## Mobile-Specific Considerations

### iOS

- **Keyboard avoidance** - Adjust layout when keyboard appears
- **Safe area** - Respect notch and home indicator
- **Haptics** - Provide tactile feedback for actions
- **Gestures** - Support swipe-to-dismiss for modals
- **Dark mode** - Support system dark mode preference

### Android

- **Back button** - Handle Android back button properly
- **Keyboard types** - Use appropriate keyboard for each input
- **Status bar** - Adjust status bar color
- **Navigation bar** - Respect navigation bar height
- **Material Design** - Follow Material Design patterns

---

## Error Handling

### Connection Errors

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Connection Lost                                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Cannot connect to workstation via Tailscale.       ││
│  │                                                      ││
│  │  • Check Tailscale is running on both devices       ││
│  │  • Verify both devices are in same Tailnet          ││
│  │  • Check SSH configuration                          ││
│  │                                                      ││
│  │  [Retry Connection] [View Logs] [Settings]          ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Command Errors

```
┌─────────────────────────────────────────────────────────┐
│  ❌ Command Failed                                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Error executing /sparc:coder                       ││
│  │                                                      ││
│  │  Claude Code returned error:                        ││
│  │  File not found: src/auth/login.ts                  ││
│  │                                                      ││
│  │  [View Full Error] [Edit Prompt] [Retry]            ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Filesystem Errors

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Access Denied                                        │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Cannot access directory: /root/                    ││
│  │                                                      ││
│  │  Permission denied. Please choose a directory       ││
│  │  you have access to.                                ││
│  │                                                      ││
│  │  [Go Back] [Choose Different Location]              ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 2

1. **Voice input** - Dictate prompts via speech recognition
2. **Prompt history** - Browse and reuse previous prompts
3. **Collaborative mode** - Share prompts and sessions with team
4. **Offline mode** - Queue prompts for execution when reconnected
5. **Custom themes** - User-customizable color schemes

### Phase 3

1. **AI suggestions** - Suggest commands based on context
2. **Smart defaults** - Learn user preferences and suggest values
3. **Prompt templates** - User-created prompt templates
4. **Batch execution** - Execute multiple prompts sequentially
5. **Result comparison** - Compare outputs from different executions

### Phase 4

1. **Visual diff** - Visual file comparison for changes
2. **Code preview** - Syntax-highlighted code preview
3. **Integrated git** - Git operations from mobile
4. **Team workspaces** - Shared team command libraries
5. **Analytics** - Usage analytics and insights

---

## Success Metrics

### User Engagement
- Daily active users
- Average session duration
- Commands executed per day
- Workflows used per week

### Performance
- Time to first command
- Search response time (<100ms)
- Connection establishment time (<2s)
- Output streaming latency (<500ms)

### Reliability
- Connection success rate (>99%)
- Command execution success rate (>95%)
- Error recovery rate
- SSH reconnection time (<5s)

### User Satisfaction
- Net Promoter Score (NPS)
- Feature adoption rate
- User retention (30-day)
- Support ticket volume
