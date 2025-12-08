# Mobile Architecture Documentation

This document describes the architecture of Opcode mobile, including platform detection, layout systems, navigation patterns, and component organization.

## Overview

Opcode mobile uses a responsive, platform-aware architecture that adapts the UI based on device type (mobile, tablet, desktop) while maintaining code reuse across platforms.

```
┌─────────────────────────────────────────────────────────┐
│                    Opcode Application                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │         Platform Detection Layer               │     │
│  │  (usePlatform, useOrientation, useBreakpoint) │     │
│  └──────────────┬─────────────────────────────────┘     │
│                 │                                        │
│         ┌───────┴──────┬──────────┐                     │
│         │              │          │                      │
│    ┌────▼─────┐  ┌────▼────┐ ┌──▼──────┐               │
│    │  Mobile  │  │ Tablet  │ │ Desktop │               │
│    │  Layout  │  │ Layout  │ │ Layout  │               │
│    └────┬─────┘  └────┬────┘ └──┬──────┘               │
│         │              │          │                      │
│    ┌────▼──────────────▼──────────▼─────┐               │
│    │      Shared Component Layer        │               │
│    │  (Chat, Files, Settings, etc.)     │               │
│    └────────────────────────────────────┘               │
│                                                          │
│    ┌────────────────────────────────────┐               │
│    │      Tauri Backend (Rust)          │               │
│    │  (File system, SSH, Native APIs)   │               │
│    └────────────────────────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Platform Detection Flow

### Detection Hierarchy

```
User opens app
    │
    ▼
┌─────────────────────────┐
│  Detect Platform Type   │
│  (mobile/tablet/desktop)│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Detect Capabilities    │
│  (touch, orientation)   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Select Layout System   │
│  (bottom nav, sidebar)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Render Appropriate UI  │
└─────────────────────────┘
```

### Platform Detection Implementation

**usePlatform Hook**
```typescript
export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTauri: false,
    os: 'unknown',
  });

  useEffect(() => {
    const detect = async () => {
      const isTauri = window.__TAURI__ !== undefined;
      const userAgent = navigator.userAgent;
      const width = window.innerWidth;

      // Tauri mobile detection
      if (isTauri) {
        const platform = await invoke('get_platform');
        setPlatform({
          isMobile: platform === 'android' || platform === 'ios',
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
          isTauri: true,
          os: platform,
        });
        return;
      }

      // Web fallback
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;

      setPlatform({
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        isTauri: false,
        os: 'web',
      });
    };

    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, []);

  return platform;
}
```

### Breakpoints

```typescript
export const BREAKPOINTS = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1023px
  desktop: 1024,  // 1024px+
} as const;
```

## Layout System

### Mobile Layout (< 768px)

```
┌─────────────────────────────────┐
│  MobileHeader                   │
│  ┌─────────┐  [Title]  ⚙       │
│  │  ☰      │                    │
│  └─────────┘                    │
├─────────────────────────────────┤
│                                 │
│                                 │
│    Active Screen Content        │
│    (ChatScreen, FilesScreen,    │
│     SettingsScreen)             │
│                                 │
│                                 │
├─────────────────────────────────┤
│  BottomNav                      │
│  [💬 Chat] [📁 Files] [⚙ Settings] │
└─────────────────────────────────┘
```

**Features:**
- Full-screen content area
- Bottom navigation for primary actions
- Hamburger menu for secondary navigation
- Swipeable panes between screens
- Modal dialogs for settings/actions

### Tablet Layout (768px - 1023px)

```
┌─────────────────────────────────────────────┐
│  TabletHeader                               │
│  [☰] [Title]              [Actions] ⚙      │
├──────────┬──────────────────────────────────┤
│          │                                  │
│  Sidebar │                                  │
│          │    Main Content Area             │
│  Nav     │    (Adaptive Panes)              │
│  Items   │                                  │
│          │                                  │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  Optional Bottom Bar (for quick actions)    │
└─────────────────────────────────────────────┘
```

**Features:**
- Persistent sidebar (collapsible)
- Larger content area
- Side-by-side panes when space allows
- Optional bottom bar for contextual actions

### Desktop Layout (>= 1024px)

```
┌──────────────────────────────────────────────────────┐
│  CustomTitlebar                                      │
│  ●●●  [Title]              [Window Controls] ▭ × │
├────────┬─────────────────────────────────────────────┤
│        │                                             │
│ Side   │   Main Content (Multi-pane)                │
│ bar    │   ┌──────────┬──────────┬──────────┐       │
│        │   │  Pane 1  │  Pane 2  │  Pane 3  │       │
│ Nav    │   │          │          │          │       │
│ Items  │   │  Chat    │  Files   │  Preview │       │
│        │   │          │          │          │       │
│        │   └──────────┴──────────┴──────────┘       │
│        │                                             │
└────────┴─────────────────────────────────────────────┘
```

**Features:**
- Custom titlebar with traffic lights
- Persistent sidebar
- Multi-pane layout (up to 3 columns)
- Resizable panes
- Advanced keyboard shortcuts

## Navigation Patterns

### Mobile Navigation

**Bottom Navigation Bar**
```typescript
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  screen: React.ComponentType;
}

const navItems: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, screen: ChatScreen },
  { id: 'files', label: 'Files', icon: FileText, screen: FilesScreen },
  { id: 'settings', label: 'Settings', icon: Settings, screen: SettingsScreen },
];
```

**Swipe Gestures**
- Swipe left/right to navigate between adjacent screens
- Swipe down to refresh (pull-to-refresh)
- Long press for contextual menus

**Modal Stack**
```
Screen
  └─ Modal (overlay)
      └─ Sheet (bottom sheet)
          └─ Dialog (alert)
```

### Tablet Navigation

**Hybrid Approach**
- Sidebar for primary navigation
- Tabs for secondary navigation within sections
- Contextual actions in header/bottom bar

### Desktop Navigation

**Traditional Desktop Pattern**
- Sidebar for primary navigation
- Tabs within content area
- Keyboard shortcuts for power users
- Right-click context menus

## Connection Modes

Opcode supports three connection modes, each with platform-specific UI adaptations:

### 1. Local Mode

```
User Device (Mobile/Desktop)
    │
    ▼
┌─────────────────────┐
│  Opcode Frontend    │
│  (React + Tauri)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Tauri Backend      │
│  (Local Rust)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Local File System  │
└─────────────────────┘
```

**Mobile Adaptation:**
- Access local device files
- Camera integration (code scanning)
- Share sheet integration

### 2. Tailscale SSH Mode

```
Mobile Device                    Remote Server
    │                                 │
    ▼                                 ▼
┌─────────────┐    Tailscale     ┌──────────┐
│   Opcode    │◄────────────────►│   SSH    │
│   Mobile    │   (encrypted)    │  Server  │
└─────────────┘                  └────┬─────┘
                                      │
                                      ▼
                                 ┌──────────┐
                                 │  Remote  │
                                 │   Files  │
                                 └──────────┘
```

**Mobile Adaptation:**
- Tailscale auth flow (deep links)
- Connection status indicator
- Offline queueing for commands
- Low-bandwidth mode

### 3. Claude Web Mode

```
Mobile Device                    Claude API
    │                                 │
    ▼                                 ▼
┌─────────────┐      HTTPS       ┌──────────┐
│   Opcode    │◄────────────────►│  Claude  │
│   Mobile    │                  │   API    │
└─────────────┘                  └──────────┘
```

**Mobile Adaptation:**
- OAuth flow (mobile-optimized)
- Token persistence (secure storage)
- Request/response queueing
- Streaming response UI

## Component Mapping

### Desktop → Mobile Adaptations

| Desktop Component | Mobile Adaptation | Key Changes |
|------------------|-------------------|-------------|
| Sidebar | Bottom Nav + Hamburger | Collapsed by default |
| Multi-pane layout | Swipeable screens | One pane visible at a time |
| Titlebar | Mobile Header | Simplified actions |
| Context menu (right-click) | Long-press menu | Touch-optimized |
| Hover tooltips | Tap-to-reveal | No hover on touch |
| Keyboard shortcuts | Gesture shortcuts | Touch-based |
| File tree | Nested lists + breadcrumbs | Hierarchical navigation |
| Split editor | Tabbed editor | One file at a time |
| Status bar | Toast notifications | Less persistent |

### Shared Components

Components that work across all platforms (with minor styling):

- **Chat interface** - Message list, input field
- **File browser** - List/grid view toggle
- **Settings panels** - Form inputs
- **Connection status** - Indicator badge
- **Loading states** - Spinners, skeletons
- **Error boundaries** - Error screens

## State Management

### Platform-Aware State

```typescript
interface AppState {
  platform: Platform;
  navigation: NavigationState;
  connection: ConnectionState;
  ui: UIState;
}

interface NavigationState {
  activeScreen: string;        // Mobile: current screen
  activePane: string[];         // Tablet/Desktop: active panes
  history: string[];            // Navigation history
  modal: ModalState | null;    // Active modal/sheet
}

interface UIState {
  sidebarOpen: boolean;         // Desktop/Tablet
  bottomNavVisible: boolean;    // Mobile
  orientation: 'portrait' | 'landscape';
  theme: 'light' | 'dark';
}
```

### Cross-Platform Persistence

```typescript
// Use Tauri's storage on native, localStorage on web
const storage = window.__TAURI__
  ? tauriStore
  : webLocalStorage;

// Persist navigation state
await storage.set('navigation', navigationState);
```

## Performance Considerations

### Mobile Optimizations

**Lazy Loading**
```typescript
const ChatScreen = lazy(() => import('./screens/ChatScreen'));
const FilesScreen = lazy(() => import('./screens/FilesScreen'));

<Suspense fallback={<LoadingScreen />}>
  <ChatScreen />
</Suspense>
```

**Virtualized Lists**
```typescript
import { VirtualList } from '@/mobile/components/VirtualList';

<VirtualList
  items={files}
  renderItem={(file) => <FileItem file={file} />}
  itemHeight={60}
/>
```

**Image Optimization**
```typescript
<img
  src={thumbnail}
  loading="lazy"
  decoding="async"
  alt="Preview"
/>
```

### Tablet Optimizations

- Preload adjacent screens
- Use CSS containment
- Optimize animations (60fps)

### Desktop Optimizations

- Virtualize large file trees
- Debounce search inputs
- Use web workers for heavy computation

## Accessibility

### Touch Accessibility

- Minimum 44x44px touch targets
- Sufficient spacing between interactive elements
- Visual feedback for all touch interactions

### Screen Reader Support

```tsx
<button
  aria-label="Open settings"
  aria-pressed={isOpen}
  role="button"
>
  <Settings aria-hidden="true" />
</button>
```

### Keyboard Navigation

- Focus management for modals
- Logical tab order
- Keyboard shortcuts (desktop)

## Testing Strategy

### Platform-Specific Testing

**Mobile Tests**
```bash
# Run on Android emulator
cargo tauri android dev

# Run on iOS simulator
cargo tauri ios dev
```

**Browser Tests**
```bash
# Mobile viewport
npm run test:mobile

# Tablet viewport
npm run test:tablet
```

### Cross-Platform Tests

- Unit tests for shared components
- Integration tests for navigation flows
- E2E tests for critical user journeys

## Future Enhancements

- **Offline support** - Service workers for web, local cache for native
- **Sync** - Cross-device state synchronization
- **Widgets** - Home screen widgets (mobile)
- **Notifications** - Push notifications for remote events
- **Shortcuts** - Siri shortcuts, Android intents
- **Handoff** - Continue work across devices

## Resources

- [Tauri Mobile Guide](https://tauri.app/v2/guides/building/mobile/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Mobile Design Patterns](https://mobbin.com/browse/ios/apps)
- [Material Design Mobile](https://material.io/design/platform-guidance)
