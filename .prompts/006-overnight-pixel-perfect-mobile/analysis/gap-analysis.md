# Mobile UI Gap Analysis: Current vs Replit Inspiration

**Analysis Date:** 2025-12-07
**Current Branch:** feature/mobile
**Inspiration Source:** Replit Mobile App Screenshots (8 screens)

---

## Executive Summary

The current Opcode mobile implementation has solid architectural foundations and component structure, but significant gaps exist in functionality, visual polish, and data integration. The app is currently using **hardcoded placeholder data** with no live API integration, while Replit shows fully functional, data-driven experiences.

### Priority Overview
- **Critical (P0):** 12 items - Blocks core functionality
- **High (P1):** 18 items - Significant UX impact
- **Medium (P2):** 14 items - Polish and refinement
- **Low (P3):** 8 items - Nice-to-have enhancements

---

## 1. Screen-by-Screen Comparison

### 1.1 Apps Screen (Screenshot: 125042, 125046)

#### Current Implementation (`AppsScreen.tsx`)
```typescript
- Empty projects array (hardcoded: [])
- Basic filter bar with "All Apps" text
- Simple list view structure
- Navigation to WorkspaceScreen works
```

#### Replit Implementation
**Features Present:**
- Project cards with preview thumbnails
- "Waiting for you" status badges
- Public/Private visibility indicators
- Author information (veeman961)
- Filter: "All Apps" with dropdown arrow
- Rich project previews (Hex Conquest game visible)
- Multiple projects visible

#### Gaps Identified

| Gap | Current State | Target State | Priority | API Needed |
|-----|--------------|--------------|----------|------------|
| **No project data** | Empty array | Show user projects | P0 Critical | `api.listProjects()` |
| **No preview images** | Placeholder emoji | Real thumbnails | P1 High | Project metadata |
| **Missing status badges** | No badges | "Waiting for you" tags | P1 High | Project status API |
| **No author info** | Hardcoded | Dynamic from user data | P2 Medium | User context |
| **Filter not functional** | Static text | Working dropdown | P1 High | Filter/sort logic |
| **Missing project metadata** | No metadata | Last edited, status | P2 Medium | Extended project API |

**API Integration Required:**
```typescript
// Current: Empty hardcoded array
const projects: Project[] = [];

// Target: Live data from API
const projects = await api.listProjects();
// Need to enhance Project interface to include:
// - previewImage: string (screenshot/thumbnail URL)
// - status: 'waiting' | 'running' | 'stopped'
// - lastEdited: Date
// - isPublic: boolean
```

---

### 1.2 Create Screen (Screenshots: 125036, 125042)

#### Current Implementation (`CreateScreen.tsx`)
```typescript
- Build/Design toggle (implemented)
- Prompt input (implemented)
- Template selector (implemented)
- Static placeholder text
- No actual creation logic (TODO comment)
```

#### Replit Implementation
**Features Present:**
- Workspace selector at top (veeman961's workspace)
- Build/Design tabs with Beta badge on Design
- Large text area for prompt input
- Template buttons: Web app, Mobile app (Beta), Data app, 3D Game
- Attachment and voice input icons
- "Creating App..." status button
- Recent file attachments shown
- Footer: "Start creating for free" with Core upsell link

#### Gaps Identified

| Gap | Current State | Target State | Priority | API Needed |
|-----|--------------|--------------|----------|------------|
| **No workspace selector** | Missing | User workspace dropdown | P1 High | Workspace API |
| **No file attachments** | Missing | Attach files to prompt | P2 Medium | File upload API |
| **No voice input** | Missing | Voice-to-text capability | P3 Low | Voice API |
| **No creation flow** | TODO comment | Live project creation | P0 Critical | `api.createProject()` |
| **No loading states** | Basic boolean | Rich "Creating App..." UI | P1 High | State management |
| **Missing Beta badges** | Missing | Visual indicators | P2 Medium | Feature flags |
| **No recent attachments** | Missing | Show recent files | P2 Medium | Session storage |

**API Integration Required:**
```typescript
// Need new creation API
interface CreateProjectParams {
  mode: 'build' | 'design';
  prompt: string;
  template: string;
  workspaceId?: string;
  attachments?: File[];
}

const newProject = await api.createProject(params);
// Should return project ID and redirect to workspace
```

---

### 1.3 Workspace/Agent Screen (Screenshots: 124526, 124540)

#### Current Implementation (`WorkspaceScreen.tsx`, `AgentPane.tsx`)
```typescript
AgentPane:
- Task progress collapsible sections ✓
- Task list with status indicators ✓
- Checkpoint cards with actions ✓
- Work duration display ✓
- Upgrade card ✓
- Quick access toolbar (Secrets, Database, Auth, New Tab) ✓
- Search bar at bottom ✓

WorkspaceScreen:
- Header with back button and menu ✓
- Bottom toolbar with 5 panes ✓
- Animated pane transitions ✓
```

#### Replit Implementation
**Features Present:**
- Title: "Hex Conquest" with back arrow and menu
- Agent icon with label "Agent"
- Expandable task sections (0/8 progress)
- Task descriptions with "Show more" expansion
- File edit indicators with paths
- Error status messages
- Checkpoint cards with:
  - Timestamp (3 minutes ago)
  - Summary text
  - Action buttons: Rollback, Changes, View preview
- "Worked for 3 minutes" collapsible section
- Upgrade to Core card with:
  - Star icon
  - Benefits list with icons
  - "Upgrade now" CTA button
- Bottom toolbar: Secrets, Database, Auth, New Tab (grid layout)
- Search bar: "Search tools and files..."

#### Gaps Identified

| Gap | Current State | Target State | Priority | API Needed |
|-----|--------------|--------------|----------|------------|
| **No real task data** | Mock tasks | Live agent tasks | P0 Critical | Agent run API |
| **No checkpoint data** | Mock checkpoints | Real checkpoint history | P0 Critical | `api.listCheckpoints()` |
| **No file change tracking** | Missing | Show edited files with paths | P1 High | File system API |
| **No work duration tracking** | Mock duration | Real time tracking | P1 High | Session metrics |
| **Search not functional** | UI only | Working file/tool search | P1 High | Search API |
| **Tool buttons inactive** | UI only | Open actual tools | P1 High | Tool routing |
| **No rollback functionality** | UI only | Working time travel | P1 High | Checkpoint restore API |

**API Integration Required:**
```typescript
// Already defined in api.ts but not wired up:
- api.listAgentRuns(agentId)
- api.getAgentRun(id)
- api.listCheckpoints(sessionId, projectId, projectPath)
- api.restoreCheckpoint(checkpointId, sessionId, projectId, projectPath)

// Need to wire these to actual UI components
```

---

### 1.4 Preview Screen (Screenshot: 124550)

#### Current Implementation (`PreviewPane.tsx`)
```typescript
- Device frame switching (iPhone, Android, Desktop) ✓
- Browser controls (back, forward, refresh) ✓
- URL input field ✓
- "Open in browser" button ✓
- Iframe preview ✓
- Loading states ✓
- Publish button ✓
```

#### Replit Implementation
**Features Present:**
- Top bar with "Publish" button (green icon) and "Preview" label
- Device frame toggle button
- Browser controls: back, forward, refresh
- URL bar with "/" path
- "Open in browser" external link button
- Full app preview (Hex Conquest game)
- Bottom navigation bar with icons

#### Gaps Identified

| Gap | Current State | Target State | Priority | API Needed |
|-----|--------------|--------------|----------|------------|
| **Publish not functional** | UI callback only | Real publish flow | P0 Critical | Publish API |
| **No live preview URL** | Mock URL | Real project URL | P0 Critical | Project URL API |
| **No preview refresh on changes** | Manual only | Auto-refresh on save | P1 High | WebSocket/polling |
| **Device frame UI polish** | Basic | Refined device borders | P2 Medium | CSS refinement |

**API Integration Required:**
```typescript
// Need project URL endpoint
interface ProjectPreview {
  url: string;
  status: 'building' | 'ready' | 'error';
  lastDeployed?: Date;
}

const preview = await api.getProjectPreview(projectId);
```

---

### 1.5 Publishing Screen (Screenshot: 124556)

#### Current Implementation (`PublishingPane.tsx`)
```typescript
- Subdomain input with availability check ✓
- Primary URL section ✓
- Upgrade card with benefits ✓
- "What does publishing do?" expandable ✓
- Publish button with states ✓
- Deployment history (if data provided) ✓
```

#### Replit Implementation
**Features Present:**
- Header: "Publishing" with icon and menu
- Title: "Publish your app"
- Primary URL section with:
  - Input: "hex-conquest--veeman961"
  - Suffix: ".replit.app"
  - Green checkmark: "Available"
- Upgrade card (blue border):
  - Star icon
  - "Limited time offer: Free '.com' domain"
  - Benefits with icons (link, dollar, radio, chevron)
  - Badge: "Free domain included"
  - "Upgrade now" button
- "What does publishing do?" expandable section (open):
  - Globe icon + explanation
  - Dollar icon + costs explanation
  - Action buttons: "Watch video", "Learn more"

#### Gaps Identified

| Gap | Current State | Target State | Priority | API Needed |
|-----|--------------|--------------|----------|------------|
| **Availability check not real** | Mock isAvailable prop | Live subdomain check | P0 Critical | Domain check API |
| **Publish flow incomplete** | Callback only | Full deployment | P0 Critical | Deploy API |
| **No deployment status** | Missing | Show build progress | P1 High | Deployment status API |
| **Missing video/docs links** | Missing | Working links | P2 Medium | CMS/docs URLs |

**API Integration Required:**
```typescript
// Need new publishing APIs
const available = await api.checkSubdomainAvailability(subdomain);

const deployment = await api.publishProject({
  projectId,
  subdomain,
  customDomain?: string
});

const status = await api.getDeploymentStatus(deploymentId);
```

---

### 1.6 Tools/Search Screen (Screenshot: 125036)

#### Current Implementation
**COMPLETELY MISSING** - No equivalent screen exists

#### Replit Implementation
**Features Present:**
- Header: "Search for tools and files" with Close button
- Search section:
  - Search input with description
  - Files finder with description
- Tools section (extensive list):
  - Agent (with icon and description)
  - Assistant
  - Publishing
  - App Storage
  - Auth
  - Console
  - Database
  - Developer
  - Git
  - Integrations
  - Multiplayer
  - Preview
  - Replit Key-Value Store
  - Secrets
  - Security Scanner
  - Shell
  - User Settings
  - Workflows
- Each tool has:
  - Icon
  - Name
  - Description

#### Gaps Identified

| Gap | Current State | Target State | Priority | Component Needed |
|-----|--------------|--------------|----------|------------------|
| **Entire screen missing** | Does not exist | Full tools browser | P0 Critical | New ToolsScreen.tsx |
| **No tools list** | Missing | Complete tool catalog | P0 Critical | Tools data structure |
| **No search functionality** | Missing | Search tools & files | P1 High | Search implementation |
| **No tool navigation** | Missing | Deep link to tools | P1 High | Routing system |

**Component to Create:**
```typescript
// New file: src/screens/mobile/ToolsScreen.tsx
export function ToolsScreen() {
  // Search input
  // Tools list with categories
  // Tool navigation handlers
}
```

---

### 1.7 Account Screen (Screenshot: 125046 bottom)

#### Current Implementation (`AccountScreen.tsx`)
```typescript
- Profile card with hardcoded user ✓
- Upgrade banner (conditional) ✓
- Settings list ✓
```

#### Replit Implementation
**Features Present:**
- Large avatar circle with initials "VE"
- Username: veeman961
- Handle: @veeman961
- Email: veeman961@gmail.com
- Bio placeholder: "You don't have a bio yet..."
- "Join Replit Core" blue button with star icon
- Usage section with arrow
- Sections:
  - PROFILE: Edit Profile
  - THEME: Theme - Dark
  - REPLIT TEAMS: Get Teams (external link)
  - NOTIFICATIONS: Notifications
  - SUPPORT: Help, Docs (external link)
  - OTHER: About, Manage Account
  - Log Out (red text)

#### Gaps Identified

| Gap | Current State | Target State | Priority | API Needed |
|-----|--------------|--------------|----------|------------|
| **No real user data** | Hardcoded mock | Live user profile | P0 Critical | User API/auth context |
| **Missing bio field** | Not shown | User bio display/edit | P2 Medium | Profile API |
| **Settings list incomplete** | Basic list | Full settings menu | P1 High | Settings structure |
| **No Usage section** | Missing | Usage tracking/limits | P1 High | Usage API |
| **Theme switcher missing** | Missing | Dark/Light toggle | P2 Medium | Theme API |
| **No logout functionality** | Missing | Working logout | P1 High | Auth API |
| **Missing external links** | Missing | Teams, Docs, Help | P2 Medium | URL configuration |

**API Integration Required:**
```typescript
// Already exists: api.getClaudeSettings()
// But need proper user management:

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isPro: boolean;
  usage?: UsageStats;
}

// Need user context/auth:
const user = useAuth(); // or similar
const usage = await api.getUsageStats();
```

---

## 2. Component Gap List

### 2.1 Missing Components (High Priority)

| Component | Location | Purpose | Priority |
|-----------|----------|---------|----------|
| **ToolsScreen** | `src/screens/mobile/` | Complete tools browser | P0 |
| **WorkspaceHeader** | `src/components/mobile/workspace/` | Workspace selector | P1 |
| **StatusBadge** | `src/components/mobile/apps/` | Project status indicators | P1 |
| **FileAttachment** | `src/components/mobile/create/` | File attachment UI | P2 |
| **VoiceInput** | `src/components/mobile/create/` | Voice input button | P3 |
| **DeploymentStatus** | `src/components/mobile/workspace/` | Build progress UI | P1 |
| **UsageIndicator** | `src/components/mobile/account/` | Usage limits display | P1 |
| **ThemeToggle** | `src/components/mobile/account/` | Theme switcher | P2 |

### 2.2 Components Needing Modification

| Component | Current Issue | Required Changes | Priority |
|-----------|--------------|------------------|----------|
| **ProjectCard** | No preview images | Add thumbnail support | P1 |
| **ProjectList** | Empty state only | Add loading, error states | P1 |
| **AgentPane** | Mock data | Wire to real API | P0 |
| **ConsolePane** | Mock command execution | Real terminal integration | P1 |
| **PublishingPane** | Mock availability check | Real domain API | P0 |
| **SharePane** | UI only | Wire sharing APIs | P2 |
| **AccountScreen** | Hardcoded user | Dynamic user data | P0 |
| **BottomNavigation** | Basic | Add badge notifications | P2 |

### 2.3 Styling Gaps

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| **Project cards** | Basic card | Rich preview with overlay | P1 |
| **Status badges** | Missing | Yellow "Waiting for you" badges | P1 |
| **Icons** | Lucide icons | Need more variety | P2 |
| **Typography** | Basic | Match Replit font hierarchy | P2 |
| **Spacing** | Good foundation | Fine-tune padding/margins | P2 |
| **Colors** | Basic theme | Richer accent colors | P2 |
| **Borders** | Standard | Subtle borders on cards | P3 |
| **Shadows** | Standard | Enhanced depth on modals | P3 |

---

## 3. Functionality Gaps

### 3.1 Critical (P0) - Blocks Core Functionality

1. **No Live Project Data**
   - Current: Empty projects array
   - Need: `api.listProjects()` integration
   - Impact: Users can't see their projects

2. **No Project Creation**
   - Current: TODO comment in CreateScreen
   - Need: Full creation flow with API
   - Impact: Users can't create projects

3. **No Agent Task Integration**
   - Current: Mock tasks in AgentPane
   - Need: Real agent run data from `api.listAgentRuns()`
   - Impact: Agent pane is non-functional

4. **No Checkpoint System**
   - Current: Mock checkpoints
   - Need: Real checkpoint API integration
   - Impact: Time travel features don't work

5. **No Authentication**
   - Current: Hardcoded user
   - Need: Real auth context and user API
   - Impact: No user-specific data

6. **No Publishing Flow**
   - Current: UI callback only
   - Need: Full deploy API integration
   - Impact: Can't publish projects

7. **No Live Preview URLs**
   - Current: Mock preview URL
   - Need: Real project preview API
   - Impact: Preview doesn't show real content

8. **Missing Tools Screen**
   - Current: Doesn't exist
   - Need: Complete tools browser component
   - Impact: Can't access many features

9. **No Workspace Selection**
   - Current: Missing
   - Need: Workspace dropdown and API
   - Impact: Multi-workspace users blocked

10. **No Subdomain Availability Check**
    - Current: Mock boolean
    - Need: Real domain check API
    - Impact: Publish flow incomplete

11. **No Search Functionality**
    - Current: UI only
    - Need: Working file/tool search
    - Impact: Poor discoverability

12. **No Real Terminal**
    - Current: Mock command execution
    - Need: Real Tauri terminal integration
    - Impact: Console pane non-functional

### 3.2 High (P1) - Significant UX Impact

1. **No Project Thumbnails**
   - Need: Screenshot/preview API
   - Impact: Projects not visually identifiable

2. **No Status Badges**
   - Need: Project status API
   - Impact: Can't see which projects need attention

3. **No File Change Tracking**
   - Need: File system delta API
   - Impact: Can't see what agent modified

4. **No Work Duration Tracking**
   - Need: Session time metrics
   - Impact: No visibility into agent work time

5. **No Loading States**
   - Need: Proper loading UI throughout
   - Impact: App feels unresponsive

6. **No Error Handling**
   - Need: Error boundaries and fallbacks
   - Impact: Poor error experience

7. **Filter Not Functional**
   - Need: Project filtering/sorting logic
   - Impact: Can't organize projects

8. **Quick Access Tools Inactive**
   - Need: Tool routing and deep linking
   - Impact: Tools not accessible

9. **No Auto-Refresh**
   - Need: WebSocket or polling for preview
   - Impact: Manual refresh required

10. **No Deployment Status**
    - Need: Build progress tracking
    - Impact: No feedback during deploy

11. **Settings Incomplete**
    - Need: Full settings menu implementation
    - Impact: Can't configure app

12. **No Usage Tracking**
    - Need: Usage API and display
    - Impact: Users don't know limits

13. **No Logout**
    - Need: Auth logout flow
    - Impact: Can't switch accounts

14. **Rollback Not Functional**
    - Need: Checkpoint restore API
    - Impact: Time travel blocked

15. **Changes View Missing**
    - Need: File diff UI
    - Impact: Can't review code changes

16. **No Tool Descriptions**
    - Need: Tool metadata and help
    - Impact: Poor feature discovery

17. **Missing Attachment UI**
    - Need: File picker and display
    - Impact: Can't attach context to prompts

18. **No Workspace Context**
    - Need: Workspace state management
    - Impact: Workspace features broken

### 3.3 Medium (P2) - Polish Items

1. **No Bio Field**
2. **Theme Switcher Missing**
3. **Beta Badges Missing**
4. **No Recent Attachments**
5. **Device Frame Polish**
6. **Missing Video/Docs Links**
7. **Typography Refinement**
8. **Color Palette Enhancement**
9. **No Author Metadata**
10. **Missing Project Last Edited**
11. **No Notification Badges**
12. **Icon Variety Limited**
13. **Spacing Fine-Tuning**
14. **External Links Missing**

### 3.4 Low (P3) - Nice-to-Have

1. **Voice Input**
2. **Enhanced Shadows**
3. **Border Refinements**
4. **Animation Polish**
5. **Haptic Feedback**
6. **QR Code Generation**
7. **Social Share Improvements**
8. **Advanced Filters**

---

## 4. Priority Matrix

### P0: Critical (Must-Have for MVP)

**Data Integration (12 items)**
- [ ] Integrate `api.listProjects()` in AppsScreen
- [ ] Integrate `api.createProject()` in CreateScreen
- [ ] Wire agent run APIs to AgentPane
- [ ] Connect checkpoint APIs to workspace
- [ ] Implement authentication context
- [ ] Integrate publish/deploy APIs
- [ ] Connect preview URL APIs
- [ ] Build ToolsScreen component
- [ ] Add workspace selection
- [ ] Implement domain check API
- [ ] Add search functionality
- [ ] Integrate terminal API

**Estimated Effort:** 5-7 days (overnight implementation feasible with focus)

### P1: High Priority (Significant UX Impact)

**Visual & Functional Polish (18 items)**
- [ ] Add project thumbnail support
- [ ] Implement status badges
- [ ] Add file change tracking
- [ ] Implement work duration tracking
- [ ] Add comprehensive loading states
- [ ] Implement error boundaries
- [ ] Make filter functional
- [ ] Wire quick access tools
- [ ] Add auto-refresh for preview
- [ ] Show deployment status
- [ ] Complete settings menu
- [ ] Add usage tracking UI
- [ ] Implement logout flow
- [ ] Wire rollback functionality
- [ ] Add changes/diff view
- [ ] Add tool descriptions
- [ ] Implement file attachments
- [ ] Add workspace state management

**Estimated Effort:** 3-4 days

### P2: Medium (Polish & Refinement)

**Estimated Effort:** 2-3 days

### P3: Low (Nice-to-Have)

**Estimated Effort:** 1-2 days

---

## 5. API Integration Requirements

### 5.1 Existing APIs to Wire Up

From `/home/kvn/workspace/evolve/repos/opcode/src/lib/api.ts`:

```typescript
// ✅ Already defined - need to integrate:

// Projects
api.listProjects() → AppsScreen
api.createProject(path) → CreateScreen
api.getProjectSessions(projectId) → WorkspaceScreen

// Agent Runs
api.listAgentRuns(agentId) → AgentPane
api.getAgentRun(id) → AgentPane
api.executeAgent(agentId, projectPath, task, model) → CreateScreen
api.listRunningAgentSessions() → WorkspaceScreen
api.getSessionOutput(runId) → AgentPane

// Checkpoints
api.listCheckpoints(sessionId, projectId, projectPath) → AgentPane
api.createCheckpoint(...) → AgentPane
api.restoreCheckpoint(...) → AgentPane
api.getCheckpointDiff(...) → Changes view

// Session
api.loadSessionHistory(sessionId, projectId) → WorkspaceScreen

// Usage
api.getUsageStats() → AccountScreen

// Settings
api.getClaudeSettings() → AccountScreen
api.saveClaudeSettings(settings) → AccountScreen
```

### 5.2 Missing APIs to Implement

```typescript
// Need to add to api.ts:

// Project Metadata
interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  previewImage?: string; // Screenshot URL
  status: 'idle' | 'waiting' | 'running' | 'stopped';
  lastEdited: Date;
  isPublic: boolean;
  author: string;
}

api.getProjectMetadata(projectId): Promise<ProjectMetadata>

// Publishing
interface PublishOptions {
  projectId: string;
  subdomain: string;
  customDomain?: string;
}

api.checkSubdomainAvailability(subdomain: string): Promise<boolean>
api.publishProject(options: PublishOptions): Promise<Deployment>
api.getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>

// Preview
interface ProjectPreview {
  url: string;
  status: 'building' | 'ready' | 'error';
  lastDeployed?: Date;
}

api.getProjectPreview(projectId: string): Promise<ProjectPreview>

// Workspaces
interface Workspace {
  id: string;
  name: string;
  ownerId: string;
}

api.listWorkspaces(): Promise<Workspace[]>
api.getWorkspace(id: string): Promise<Workspace>

// Search
interface SearchResult {
  type: 'file' | 'tool' | 'command';
  name: string;
  path?: string;
  description?: string;
}

api.searchFiles(query: string, projectId?: string): Promise<SearchResult[]>
api.searchTools(query: string): Promise<SearchResult[]>

// User/Auth
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isPro: boolean;
}

api.getCurrentUser(): Promise<User>
api.updateUserProfile(updates: Partial<User>): Promise<User>
api.logout(): Promise<void>
```

---

## 6. Implementation Roadmap

### Phase 1: Critical Data Integration (Days 1-3)
**Goal: Make app functional with real data**

**Day 1: Projects & Auth**
- [ ] Implement user authentication context
- [ ] Wire `api.listProjects()` to AppsScreen
- [ ] Add project thumbnail support
- [ ] Implement status badges
- [ ] Add loading/error states

**Day 2: Agent & Workspace**
- [ ] Wire agent run APIs to AgentPane
- [ ] Connect checkpoint APIs
- [ ] Add file change tracking
- [ ] Implement work duration display
- [ ] Add rollback functionality

**Day 3: Creation & Publishing**
- [ ] Implement project creation flow
- [ ] Add subdomain availability check
- [ ] Wire publishing APIs
- [ ] Connect preview URL APIs
- [ ] Add deployment status

### Phase 2: Feature Completion (Days 4-5)
**Goal: Add missing screens and major features**

**Day 4: Tools & Search**
- [ ] Build ToolsScreen component
- [ ] Implement search functionality
- [ ] Wire quick access tools
- [ ] Add tool routing

**Day 5: Settings & Polish**
- [ ] Complete settings menu
- [ ] Add usage tracking UI
- [ ] Implement logout flow
- [ ] Add workspace selection

### Phase 3: UX Polish (Days 6-7)
**Goal: Match Replit visual quality**

**Day 6: Visual Refinement**
- [ ] Enhance typography
- [ ] Refine color palette
- [ ] Add better loading states
- [ ] Improve error handling
- [ ] Add auto-refresh

**Day 7: Final Polish**
- [ ] Add remaining UI details
- [ ] Implement file attachments
- [ ] Add theme toggle
- [ ] Final testing and bug fixes

---

## 7. Technical Debt & Blockers

### Current Technical Debt
1. **Hardcoded data everywhere** - No separation between UI and data
2. **Missing state management** - Need proper workspace/project state
3. **No error boundaries** - App crashes instead of graceful degradation
4. **Incomplete TypeScript types** - Many `any` types and missing interfaces
5. **No loading states** - Everything assumes instant data
6. **API methods exist but unused** - Good foundation, needs wiring

### Blockers
1. **Backend API gaps** - Some endpoints don't exist yet
2. **Authentication system** - Need proper auth context/hooks
3. **WebSocket infrastructure** - For real-time updates
4. **File system access** - For terminal and file operations
5. **Screenshot generation** - For project thumbnails
6. **Domain management** - For subdomain availability

---

## 8. Success Metrics

### Functional Completeness
- [ ] All 8 screens match Replit functionality
- [ ] All data is live, not hardcoded
- [ ] All buttons/interactions work
- [ ] Error handling comprehensive
- [ ] Loading states everywhere

### Visual Quality
- [ ] 95%+ visual similarity to Replit
- [ ] Smooth animations (60fps)
- [ ] Responsive on all mobile sizes
- [ ] Dark theme properly implemented
- [ ] Icons and typography match

### Performance
- [ ] Initial load < 2s
- [ ] Screen transitions < 300ms
- [ ] API calls < 500ms
- [ ] Preview refresh < 1s
- [ ] No janky scrolling

### User Experience
- [ ] Intuitive navigation
- [ ] Clear feedback on all actions
- [ ] Helpful error messages
- [ ] Offline capability (graceful degradation)
- [ ] Accessibility compliance

---

## 9. Next Steps

### Immediate Actions (Start Tonight)
1. **Create missing API methods** in `api.ts`
2. **Set up auth context** for user management
3. **Wire `listProjects()`** to AppsScreen
4. **Add loading states** to all screens
5. **Build ToolsScreen** component

### Tomorrow's Focus
1. **Agent integration** - Wire all agent run APIs
2. **Checkpoint system** - Make time travel work
3. **Publishing flow** - Complete deploy integration
4. **Preview system** - Live preview URLs
5. **Search** - File and tool search

### End of Week Goals
- All P0 and P1 items complete
- Fully functional app with live data
- 90%+ visual match to Replit
- Ready for internal testing

---

## Appendix: File Reference

### Screens to Modify
- `/src/screens/mobile/AppsScreen.tsx`
- `/src/screens/mobile/CreateScreen.tsx`
- `/src/screens/mobile/AccountScreen.tsx`
- `/src/screens/mobile/WorkspaceScreen.tsx`

### Screens to Create
- `/src/screens/mobile/ToolsScreen.tsx`

### Components to Modify
- `/src/components/mobile/apps/ProjectList.tsx`
- `/src/components/mobile/apps/ProjectCard.tsx`
- `/src/components/mobile/workspace/panes/AgentPane.tsx`
- `/src/components/mobile/workspace/panes/ConsolePane.tsx`
- `/src/components/mobile/workspace/panes/PublishingPane.tsx`
- `/src/components/mobile/workspace/panes/SharePane.tsx`
- `/src/components/mobile/workspace/panes/PreviewPane.tsx`
- `/src/components/mobile/account/ProfileCard.tsx`
- `/src/components/mobile/account/SettingsList.tsx`

### Components to Create
- `/src/components/mobile/workspace/WorkspaceHeader.tsx`
- `/src/components/mobile/apps/StatusBadge.tsx`
- `/src/components/mobile/create/FileAttachment.tsx`
- `/src/components/mobile/create/VoiceInput.tsx`
- `/src/components/mobile/workspace/DeploymentStatus.tsx`
- `/src/components/mobile/account/UsageIndicator.tsx`
- `/src/components/mobile/account/ThemeToggle.tsx`

### API Files
- `/src/lib/api.ts` (add missing methods)
- `/src/stores/workspaceStore.ts` (enhance state)
- `/src/stores/sessionStore.ts` (add user context)

---

**End of Gap Analysis**
