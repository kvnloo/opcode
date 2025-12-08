# Workspace Architecture

Mobile workspace screen architecture for Opcode, based on Replit mobile design patterns.

## Component Hierarchy

```
WorkspaceScreen
├── ProjectHeader
│   ├── BackButton
│   ├── ProjectTitle
│   └── OptionsMenu
├── QuickAccessBar
│   ├── SecretsButton
│   ├── DatabaseButton
│   ├── AuthButton
│   └── NewTabButton
├── WorkspacePaneContainer (Swipeable)
│   ├── ConsolePane
│   │   ├── LogsList
│   │   ├── FilterButtons
│   │   └── ClearButton
│   ├── AgentPane
│   │   ├── AgentHeader (Status, Duration)
│   │   ├── TasksList
│   │   │   └── TaskItem (Title, Progress, Status)
│   │   └── AgentControls (Pause, Resume, Stop)
│   ├── DeployPane
│   │   ├── SubdomainInput
│   │   ├── AvailabilityIndicator
│   │   ├── PublishButton
│   │   └── PublishedUrlDisplay
│   ├── SharePane
│   │   ├── ShareLinkDisplay
│   │   ├── QRCodeGenerator
│   │   ├── SocialShareButtons
│   │   └── PermissionsSettings
│   └── PreviewPane
│       ├── DeviceFrameSelector
│       ├── WebViewContainer
│       ├── RefreshButton
│       └── URLBar
├── WorkspaceToolbar (6 icons)
│   ├── StopButton
│   ├── ConsoleButton
│   ├── AgentButton
│   ├── DeployButton
│   ├── ShareButton
│   └── PreviewButton
└── ToolsOverlay (Modal)
    ├── ToolsGrid (18 tools)
    │   ├── FilesCategory
    │   │   ├── Files
    │   │   ├── NewFile
    │   │   ├── NewFolder
    │   │   └── Upload
    │   ├── DevCategory
    │   │   ├── Terminal
    │   │   ├── Search
    │   │   ├── Packages
    │   │   └── Settings
    │   ├── BackendCategory
    │   │   ├── Secrets
    │   │   ├── Database
    │   │   ├── Auth
    │   │   └── Storage
    │   ├── CollabCategory
    │   │   ├── Threads
    │   │   └── History
    │   ├── TestingCategory
    │   │   ├── Debugger
    │   │   └── Performance
    │   └── AICategory
    │       ├── AIAssistant
    │       └── Workflows
    └── CloseButton
```

## State Management with Zustand

### Store Structure

```typescript
// stores/workspaceStore.ts
import { create } from 'zustand';
import { WorkspaceState, WorkspaceActions } from '@/lib/mobile/workspace/types';

interface WorkspaceStore extends WorkspaceState, WorkspaceActions {}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  // Initial state
  activePane: 'console',
  isToolsOverlayOpen: false,
  isRunning: false,

  console: {
    logs: [],
    isRunning: false,
    autoScroll: true,
    filter: 'all',
  },

  agent: {
    status: 'idle',
    tasks: [],
    currentTask: null,
    duration: 0,
  },

  preview: {
    url: null,
    deviceFrame: 'mobile',
    isLoading: false,
    refreshKey: 0,
  },

  publishing: {
    subdomain: '',
    isAvailable: false,
    status: 'idle',
  },

  tools: [...], // 18 tools configuration
  quickAccessTools: [
    { id: 'secrets', label: 'Secrets', icon: 'key' },
    { id: 'database', label: 'Database', icon: 'database' },
    { id: 'auth', label: 'Auth', icon: 'shield' },
    { id: 'new_tab', label: 'New Tab', icon: 'plus' },
  ],

  // Actions
  setActivePane: (pane) => set({ activePane: pane }),

  addConsoleLog: (log) => set((state) => ({
    console: {
      ...state.console,
      logs: [...state.console.logs, {
        ...log,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      }],
    },
  })),

  clearConsole: () => set((state) => ({
    console: { ...state.console, logs: [] },
  })),

  startAgent: async (prompt) => {
    set((state) => ({
      agent: {
        ...state.agent,
        status: 'running',
        sessionId: crypto.randomUUID(),
      },
    }));
    // API call to start agent
  },

  toggleToolsOverlay: () => set((state) => ({
    isToolsOverlayOpen: !state.isToolsOverlayOpen,
  })),

  // ... other actions
}));
```

### State Slices Pattern

For better organization, split the store into slices:

```typescript
// stores/slices/consoleSlice.ts
export const createConsoleSlice = (set) => ({
  console: {
    logs: [],
    isRunning: false,
    autoScroll: true,
    filter: 'all',
  },
  addConsoleLog: (log) => set((state) => ({
    console: {
      ...state.console,
      logs: [...state.console.logs, {
        ...log,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      }],
    },
  })),
  // ... other console actions
});

// stores/slices/agentSlice.ts
export const createAgentSlice = (set) => ({
  agent: {
    status: 'idle',
    tasks: [],
    currentTask: null,
    duration: 0,
  },
  startAgent: async (prompt) => {
    // ... implementation
  },
  // ... other agent actions
});

// stores/workspaceStore.ts
import { create } from 'zustand';
import { createConsoleSlice } from './slices/consoleSlice';
import { createAgentSlice } from './slices/agentSlice';

export const useWorkspaceStore = create((set, get) => ({
  ...createConsoleSlice(set, get),
  ...createAgentSlice(set, get),
  // ... other slices
}));
```

## Pane Switching Mechanism

### Swipeable Container Implementation

```typescript
// components/mobile/workspace/WorkspacePaneContainer.tsx
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const PANE_ORDER: WorkspacePane[] = ['console', 'agent', 'deploy', 'share', 'preview'];

export function WorkspacePaneContainer() {
  const { activePane, setActivePane } = useWorkspaceStore();
  const translateX = useSharedValue(0);

  const currentIndex = PANE_ORDER.indexOf(activePane);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const velocity = e.velocityX;
      const threshold = 50;

      if (Math.abs(velocity) > threshold) {
        // Swipe left -> next pane
        if (velocity < 0 && currentIndex < PANE_ORDER.length - 1) {
          setActivePane(PANE_ORDER[currentIndex + 1]);
        }
        // Swipe right -> previous pane
        else if (velocity > 0 && currentIndex > 0) {
          setActivePane(PANE_ORDER[currentIndex - 1]);
        }
      }

      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {activePane === 'console' && <ConsolePane />}
        {activePane === 'agent' && <AgentPane />}
        {activePane === 'deploy' && <DeployPane />}
        {activePane === 'share' && <SharePane />}
        {activePane === 'preview' && <PreviewPane />}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Toolbar Synchronization

```typescript
// components/mobile/workspace/WorkspaceToolbar.tsx
export function WorkspaceToolbar() {
  const { activePane, setActivePane, isRunning, stopProject } = useWorkspaceStore();

  const buttons: Array<{ pane: WorkspacePane; icon: string; label: string }> = [
    { pane: 'console', icon: 'terminal', label: 'Console' },
    { pane: 'agent', icon: 'cpu', label: 'Agent' },
    { pane: 'deploy', icon: 'upload', label: 'Deploy' },
    { pane: 'share', icon: 'share', label: 'Share' },
    { pane: 'preview', icon: 'eye', label: 'Preview' },
  ];

  return (
    <View style={styles.toolbar}>
      <IconButton
        icon="stop-circle"
        label="Stop"
        onPress={stopProject}
        disabled={!isRunning}
        variant="danger"
      />

      {buttons.map(({ pane, icon, label }) => (
        <IconButton
          key={pane}
          icon={icon}
          label={label}
          onPress={() => setActivePane(pane)}
          isActive={activePane === pane}
        />
      ))}
    </View>
  );
}
```

## Navigation Flow

### From AppsScreen to WorkspaceScreen

```typescript
// screens/AppsScreen.tsx
import { useNavigation } from '@react-navigation/native';

export function AppsScreen() {
  const navigation = useNavigation();

  const openProject = (projectId: string) => {
    navigation.navigate('Workspace', {
      projectId,
      initialPane: 'console',
      autoStart: true,
    });
  };

  return (
    <ProjectsList onProjectSelect={openProject} />
  );
}

// screens/WorkspaceScreen.tsx
import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';

export function WorkspaceScreen() {
  const route = useRoute();
  const { projectId, initialPane, autoStart } = route.params;
  const { setActivePane, startProject } = useWorkspaceStore();

  useEffect(() => {
    // Load project data
    loadProject(projectId);

    // Set initial pane
    if (initialPane) {
      setActivePane(initialPane);
    }

    // Auto-start project
    if (autoStart) {
      startProject();
    }
  }, [projectId]);

  return (
    <View style={styles.screen}>
      <ProjectHeader />
      <QuickAccessBar />
      <WorkspacePaneContainer />
      <WorkspaceToolbar />
      <ToolsOverlay />
    </View>
  );
}
```

## 6-Icon Toolbar Layout

### Fixed Bottom Toolbar

```typescript
// styles/workspace.ts
export const toolbarStyles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 8, // Safe area for home indicator
  },

  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  buttonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
  },

  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },

  icon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },

  label: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },

  labelActive: {
    color: '#6366f1',
  },
});
```

### Icon Mapping

| Position | Icon | Label | Action | Color |
|----------|------|-------|--------|-------|
| 1 | stop-circle | Stop | stopProject() | Red (#ef4444) |
| 2 | terminal | Console | setActivePane('console') | Gray/Indigo |
| 3 | cpu | Agent | setActivePane('agent') | Gray/Indigo |
| 4 | upload | Deploy | setActivePane('deploy') | Gray/Indigo |
| 5 | share | Share | setActivePane('share') | Gray/Indigo |
| 6 | eye | Preview | setActivePane('preview') | Gray/Indigo |

## ToolsOverlay Integration

### Modal Implementation

```typescript
// components/mobile/workspace/ToolsOverlay.tsx
import { Modal, Pressable, ScrollView } from 'react-native';

export function ToolsOverlay() {
  const { isToolsOverlayOpen, tools, toggleToolsOverlay, openTool } = useWorkspaceStore();

  const toolCategories = {
    files: tools.filter(t => t.category === 'files'),
    dev: tools.filter(t => t.category === 'dev'),
    backend: tools.filter(t => t.category === 'backend'),
    collab: tools.filter(t => t.category === 'collab'),
    testing: tools.filter(t => t.category === 'testing'),
    ai: tools.filter(t => t.category === 'ai'),
  };

  return (
    <Modal
      visible={isToolsOverlayOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={toggleToolsOverlay}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Tools</Text>
          <IconButton icon="x" onPress={toggleToolsOverlay} />
        </View>

        <ScrollView style={styles.content}>
          {Object.entries(toolCategories).map(([category, categoryTools]) => (
            <View key={category} style={styles.category}>
              <Text style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>

              <View style={styles.toolsGrid}>
                {categoryTools.map((tool) => (
                  <Pressable
                    key={tool.id}
                    style={styles.toolButton}
                    onPress={() => {
                      openTool(tool.id);
                      toggleToolsOverlay();
                    }}
                  >
                    <Icon name={tool.icon} size={32} />
                    <Text style={styles.toolLabel}>{tool.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
```

### Tool Activation Flow

```
User taps tool icon
  ↓
toggleToolsOverlay() opens modal
  ↓
User selects tool from 18-tool grid
  ↓
openTool(toolId) called
  ↓
Tool-specific navigation or modal
  ↓
toggleToolsOverlay() closes main overlay
```

## Quick Access Bar

### Top Bar Implementation

```typescript
// components/mobile/workspace/QuickAccessBar.tsx
export function QuickAccessBar() {
  const { quickAccessTools, openTool } = useWorkspaceStore();

  return (
    <View style={styles.quickBar}>
      {quickAccessTools.map((tool) => (
        <IconButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          onPress={() => openTool(tool.id)}
          size="small"
        />
      ))}
    </View>
  );
}
```

### Default Quick Access Tools

1. **Secrets** - Environment variable management
2. **Database** - Database viewer and editor
3. **Auth** - Authentication settings
4. **New Tab** - Open additional workspace tab

## Performance Optimizations

### Lazy Loading Panes

```typescript
// Lazy load heavy components
const ConsolePane = lazy(() => import('./panes/ConsolePane'));
const AgentPane = lazy(() => import('./panes/AgentPane'));
const PreviewPane = lazy(() => import('./panes/PreviewPane'));

// Preload adjacent panes for smooth swipe
useEffect(() => {
  const currentIndex = PANE_ORDER.indexOf(activePane);
  const preloadPanes = [
    PANE_ORDER[currentIndex - 1],
    PANE_ORDER[currentIndex + 1],
  ].filter(Boolean);

  preloadPanes.forEach(preloadComponent);
}, [activePane]);
```

### WebView Optimization

```typescript
// Preview pane WebView configuration
<WebView
  source={{ uri: previewUrl }}
  cacheEnabled={true}
  cacheMode="LOAD_CACHE_ELSE_NETWORK"
  startInLoadingState={true}
  renderLoading={() => <LoadingSpinner />}
  onShouldStartLoadWithRequest={(request) => {
    // Handle deep links
    return true;
  }}
/>
```

## Integration Points

### Project Execution Service

```typescript
// services/projectExecutionService.ts
export class ProjectExecutionService {
  async start(projectId: string) {
    // Start development server
    // Initialize console stream
    // Enable hot reload
  }

  async stop(projectId: string) {
    // Stop server
    // Close console stream
    // Clean up resources
  }

  subscribeToLogs(callback: (log: ConsoleLog) => void) {
    // WebSocket connection for real-time logs
  }
}
```

### Agent Communication

```typescript
// services/agentService.ts
export class AgentService {
  async startTask(prompt: string, projectId: string) {
    const response = await fetch('/api/agent/start', {
      method: 'POST',
      body: JSON.stringify({ prompt, projectId }),
    });

    return response.json();
  }

  subscribeToTaskUpdates(sessionId: string, callback: (task: Task) => void) {
    // Server-sent events for task progress
    const eventSource = new EventSource(`/api/agent/stream/${sessionId}`);
    eventSource.onmessage = (event) => {
      callback(JSON.parse(event.data));
    };
  }
}
```

## File Locations

```
src/lib/mobile/workspace/
├── types.ts                    # Type definitions (created)
├── store.ts                    # Zustand store
├── slices/
│   ├── consoleSlice.ts
│   ├── agentSlice.ts
│   ├── previewSlice.ts
│   └── publishingSlice.ts
└── hooks/
    ├── useConsole.ts
    ├── useAgent.ts
    └── usePreview.ts

components/mobile/workspace/
├── WorkspaceScreen.tsx         # Main screen
├── WorkspaceToolbar.tsx        # 6-icon bottom toolbar
├── WorkspacePaneContainer.tsx  # Swipeable container
├── QuickAccessBar.tsx          # Top quick access
├── ToolsOverlay.tsx            # 18-tool modal
└── panes/
    ├── ConsolePane.tsx
    ├── AgentPane.tsx
    ├── DeployPane.tsx
    ├── SharePane.tsx
    └── PreviewPane.tsx

services/
├── projectExecutionService.ts
├── agentService.ts
└── publishingService.ts

docs/mobile/
└── WORKSPACE_ARCHITECTURE.md   # This file (created)
```

## Next Steps

1. Implement Zustand store with slices pattern
2. Build WorkspaceScreen with navigation setup
3. Create individual pane components
4. Implement swipe gestures with react-native-reanimated
5. Build ToolsOverlay modal with 18-tool grid
6. Set up WebSocket connections for real-time updates
7. Integrate with backend execution services
8. Add error boundaries and loading states
9. Implement persistence for workspace state
10. Add analytics tracking for workspace interactions
