# Swipeable Pane System

A mobile-friendly swipeable navigation system for workspace views, inspired by Replit mobile's interface.

## Overview

The swipeable pane system provides a smooth, intuitive way to navigate between different workspace views on mobile devices. Users can swipe left/right to move between panes or tap indicators to jump directly to a specific view.

## Components

### `SwipeablePane`

Individual pane component with enter/exit animations.

**Props:**
- `children`: Content to display in the pane
- `paneId`: Unique identifier for the pane
- `isActive`: Whether this pane is currently visible
- `direction`: Animation direction ('left' | 'right')

**Features:**
- Smooth slide animations using framer-motion
- Configurable animation timing (spring physics)
- Opacity transitions for smooth visual flow

### `PaneContainer`

Container component that manages multiple swipeable panes.

**Props:**
- `activePane`: Currently active pane ID
- `onPaneChange`: Callback when pane changes
- `children`: Object with content for each pane (files, editor, terminal, chat)

**Features:**
- Drag-based swipe detection
- Velocity-aware gesture recognition
- Visual indicators showing current pane
- Click-to-navigate on indicators

**Constants:**
- `SWIPE_THRESHOLD`: 50px - minimum swipe distance
- `PANE_ORDER`: ['files', 'editor', 'terminal', 'chat']

## Hooks

### `useSwipeNavigation<T>`

Reusable hook for implementing swipe navigation in custom components.

**Options:**
- `items`: Array of navigation items
- `initialItem`: Starting item (optional)
- `threshold`: Swipe distance threshold (default: 50)
- `velocityThreshold`: Swipe velocity threshold (default: 500)

**Returns:**
- `currentItem`: Current active item
- `currentIndex`: Index of current item
- `direction`: Current swipe direction
- `goTo(item)`: Navigate to specific item
- `goNext()`: Navigate to next item
- `goPrevious()`: Navigate to previous item
- `handleDragEnd()`: Handler for framer-motion drag events
- `canGoNext`: Boolean indicating if next navigation is possible
- `canGoPrevious`: Boolean indicating if previous navigation is possible

## Usage Examples

### Basic Implementation

```typescript
import { PaneContainer, WorkspacePane } from '@/components/mobile/workspace';
import { useState } from 'react';

function Workspace() {
  const [activePane, setActivePane] = useState<WorkspacePane>('editor');

  return (
    <PaneContainer
      activePane={activePane}
      onPaneChange={setActivePane}
    >
      {{
        files: <FilesView />,
        editor: <CodeEditor />,
        terminal: <Terminal />,
        chat: <AIChat />,
      }}
    </PaneContainer>
  );
}
```

### Custom Navigation with Hook

```typescript
import { useSwipeNavigation } from '@/hooks/mobile';

function CustomWorkspace() {
  const {
    currentItem,
    goTo,
    goNext,
    goPrevious,
    canGoNext,
    canGoPrevious,
  } = useSwipeNavigation({
    items: ['files', 'editor', 'terminal', 'chat'],
    initialItem: 'editor',
  });

  return (
    <div>
      <div className="navigation">
        <button onClick={goPrevious} disabled={!canGoPrevious}>
          Previous
        </button>
        <span>{currentItem}</span>
        <button onClick={goNext} disabled={!canGoNext}>
          Next
        </button>
      </div>

      <PaneContainer
        activePane={currentItem}
        onPaneChange={goTo}
      >
        {/* ... pane content ... */}
      </PaneContainer>
    </div>
  );
}
```

### With Bottom Navigation

```typescript
function MobileWorkspace() {
  const [activePane, setActivePane] = useState<WorkspacePane>('editor');

  return (
    <div className="mobile-layout">
      <PaneContainer
        activePane={activePane}
        onPaneChange={setActivePane}
      >
        {/* ... pane content ... */}
      </PaneContainer>

      <BottomNav activePane={activePane} onChange={setActivePane} />
    </div>
  );
}
```

## Gesture Detection

The system uses framer-motion's drag functionality to detect swipes:

1. **Threshold-based**: Requires minimum 50px swipe distance
2. **Velocity-aware**: Fast swipes (>500px/s) trigger even with less distance
3. **Direction-specific**: Horizontal swipes only (vertical scrolling preserved)
4. **Elastic feedback**: Visual feedback during drag with elastic boundaries

## Animation Configuration

Animations use spring physics for natural feel:

```typescript
{
  type: 'spring',
  stiffness: 300,    // How "tight" the spring feels
  damping: 30,       // How quickly motion settles
}
```

**Enter/Exit variants:**
- Enter from right: `x: '100%'` → `x: 0`
- Enter from left: `x: '-100%'` → `x: 0`
- Exit to right: `x: 0` → `x: '100%'`
- Exit to left: `x: 0` → `x: '-100%'`
- Opacity: `0` → `1` on enter, `1` → `0` on exit

## Accessibility

- **Keyboard navigation**: Arrow keys can be added to navigate panes
- **ARIA labels**: Each indicator has descriptive label
- **Focus management**: Active pane receives focus
- **Screen readers**: Announce pane changes

### Example Accessibility Enhancement

```typescript
<button
  onClick={() => goTo(pane)}
  aria-label={`Go to ${pane} pane`}
  aria-current={activePane === pane ? 'true' : 'false'}
>
  {pane}
</button>
```

## Performance Considerations

1. **Lazy rendering**: Only active pane is mounted
2. **Animation optimization**: Use GPU-accelerated transforms
3. **Touch handling**: Proper touch-action CSS for smooth scrolling
4. **Memory management**: Unmount inactive panes to reduce memory

### Touch Optimization

```css
.touch-pan-y {
  touch-action: pan-y; /* Allow vertical scroll, prevent horizontal */
}
```

## Customization

### Custom Pane Types

```typescript
type CustomPane = 'dashboard' | 'settings' | 'profile';

const customPanes: CustomPane[] = ['dashboard', 'settings', 'profile'];

const { currentItem, goTo } = useSwipeNavigation({
  items: customPanes,
  initialItem: 'dashboard',
});
```

### Custom Thresholds

```typescript
const { handleDragEnd } = useSwipeNavigation({
  items: panes,
  threshold: 100,        // Require longer swipe
  velocityThreshold: 800, // Require faster velocity
});
```

### Custom Animations

```typescript
const customVariants = {
  enter: { x: '100%', opacity: 0, scale: 0.95 },
  center: { x: 0, opacity: 1, scale: 1 },
  exit: { x: '-100%', opacity: 0, scale: 0.95 },
};
```

## Integration with Mobile Layout

The swipeable pane system works seamlessly with the mobile layout structure:

```
┌─────────────────────────────┐
│        Top Bar              │
├─────────────────────────────┤
│                             │
│   Swipeable Pane Content    │
│   (Files/Editor/Terminal)   │
│                             │
│    [Pane Indicators]        │
├─────────────────────────────┤
│    Bottom Navigation        │
└─────────────────────────────┘
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PaneContainer } from './PaneContainer';

test('changes pane on swipe', () => {
  const onPaneChange = jest.fn();
  render(
    <PaneContainer activePane="editor" onPaneChange={onPaneChange}>
      {/* ... */}
    </PaneContainer>
  );

  // Simulate swipe gesture
  const container = screen.getByRole('region');
  fireEvent.drag(container, { clientX: -100 });

  expect(onPaneChange).toHaveBeenCalledWith('terminal');
});
```

### E2E Tests

```typescript
test('user can swipe between workspace views', async () => {
  await page.goto('/workspace');

  // Swipe left
  await page.touchscreen.swipe({ x: 300, y: 400 }, { x: 100, y: 400 });
  await expect(page.locator('[data-pane="terminal"]')).toBeVisible();

  // Swipe right
  await page.touchscreen.swipe({ x: 100, y: 400 }, { x: 300, y: 400 });
  await expect(page.locator('[data-pane="editor"]')).toBeVisible();
});
```

## Browser Support

- **iOS Safari**: Full support (iOS 13+)
- **Chrome Mobile**: Full support
- **Firefox Mobile**: Full support
- **Samsung Internet**: Full support

Requires:
- Touch events support
- CSS transforms
- Framer Motion compatible browser

## Future Enhancements

1. **Vertical swiping**: Support for vertical pane stacks
2. **Custom gestures**: Pinch to zoom, two-finger swipe
3. **Haptic feedback**: Vibration on pane change (iOS/Android)
4. **Persistence**: Remember last active pane
5. **Transitions**: Custom transition animations per pane
6. **Nested panes**: Support for hierarchical pane structures

## Related Components

- `BottomNavigation`: Bottom tab bar for pane selection
- `ResponsiveWrapper`: Handles mobile/desktop responsive behavior
- `MobileLayout`: Overall mobile application layout

## References

- [Framer Motion Drag](https://www.framer.com/motion/gestures/#drag)
- [Touch Action CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- [React Native Swipeable](https://github.com/software-mansion/react-native-gesture-handler)
