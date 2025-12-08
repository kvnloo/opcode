# Mobile Swipeable Panes - Integration Guide

## Quick Start

This guide shows how to integrate the swipeable pane system into the mobile workspace.

## Step 1: Import Components

```typescript
import { PaneContainer, WorkspacePane } from '@/components/mobile/workspace';
import { useSwipeNavigation } from '@/hooks/mobile';
```

## Step 2: Set Up State

```typescript
const [activePane, setActivePane] = useState<WorkspacePane>('editor');
```

## Step 3: Create Pane Content Components

```typescript
// Create your pane content components
function FilesView() {
  return <div>File browser content</div>;
}

function CodeEditorView() {
  return <div>Code editor content</div>;
}

function TerminalView() {
  return <div>Terminal content</div>;
}

function ChatView() {
  return <div>AI chat content</div>;
}
```

## Step 4: Implement PaneContainer

```typescript
function MobileWorkspace() {
  const [activePane, setActivePane] = useState<WorkspacePane>('editor');

  return (
    <div className="h-screen w-full">
      <PaneContainer
        activePane={activePane}
        onPaneChange={setActivePane}
      >
        {{
          files: <FilesView />,
          editor: <CodeEditorView />,
          terminal: <TerminalView />,
          chat: <ChatView />,
        }}
      </PaneContainer>
    </div>
  );
}
```

## Integration with Existing Mobile Components

### With BottomNavigation

```typescript
import { BottomNavigation } from '@/components/mobile/navigation';

function MobileWorkspace() {
  const [activePane, setActivePane] = useState<WorkspacePane>('editor');

  return (
    <div className="h-screen flex flex-col">
      {/* Main content with swipeable panes */}
      <div className="flex-1">
        <PaneContainer
          activePane={activePane}
          onPaneChange={setActivePane}
        >
          {{
            files: <FilesView />,
            editor: <CodeEditorView />,
            terminal: <TerminalView />,
            chat: <ChatView />,
          }}
        </PaneContainer>
      </div>

      {/* Bottom navigation */}
      <BottomNavigation
        activeView={activePane}
        onViewChange={(view) => setActivePane(view as WorkspacePane)}
      />
    </div>
  );
}
```

### With ResponsiveWrapper

```typescript
import { ResponsiveWrapper } from '@/components/mobile/common';

function WorkspacePage() {
  return (
    <ResponsiveWrapper>
      {({ isMobile }) =>
        isMobile ? <MobileWorkspace /> : <DesktopWorkspace />
      }
    </ResponsiveWrapper>
  );
}
```

## Advanced Usage

### Custom Hook for Enhanced Control

```typescript
function AdvancedMobileWorkspace() {
  const {
    currentItem: activePane,
    currentIndex,
    direction,
    goTo,
    goNext,
    goPrevious,
    canGoNext,
    canGoPrevious,
  } = useSwipeNavigation({
    items: ['files', 'editor', 'terminal', 'chat'] as WorkspacePane[],
    initialItem: 'editor',
    threshold: 50,
    velocityThreshold: 500,
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Custom header with navigation controls */}
      <header className="flex items-center justify-between p-4 border-b">
        <button
          onClick={goPrevious}
          disabled={!canGoPrevious}
          className="p-2 disabled:opacity-50"
        >
          ← Back
        </button>

        <h1 className="font-semibold capitalize">{activePane}</h1>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          className="p-2 disabled:opacity-50"
        >
          Next →
        </button>
      </header>

      {/* Swipeable content */}
      <div className="flex-1">
        <PaneContainer
          activePane={activePane}
          onPaneChange={goTo}
        >
          {{
            files: <FilesView />,
            editor: <CodeEditorView />,
            terminal: <TerminalView />,
            chat: <ChatView />,
          }}
        </PaneContainer>
      </div>

      {/* Progress indicator */}
      <div className="p-2 text-center text-sm text-muted-foreground">
        {currentIndex + 1} of 4
      </div>
    </div>
  );
}
```

### Keyboard Navigation

```typescript
import { useEffect } from 'react';

function KeyboardNavigableWorkspace() {
  const { goNext, goPrevious, canGoNext, canGoPrevious } = useSwipeNavigation({
    items: ['files', 'editor', 'terminal', 'chat'] as WorkspacePane[],
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrevious) {
        goPrevious();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious, canGoNext, canGoPrevious]);

  // ... rest of component
}
```

### State Persistence

```typescript
import { useEffect } from 'react';

function PersistentWorkspace() {
  const [activePane, setActivePane] = useState<WorkspacePane>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('workspace-active-pane');
    return (saved as WorkspacePane) || 'editor';
  });

  useEffect(() => {
    // Save to localStorage when changed
    localStorage.setItem('workspace-active-pane', activePane);
  }, [activePane]);

  return (
    <PaneContainer
      activePane={activePane}
      onPaneChange={setActivePane}
    >
      {/* ... pane content ... */}
    </PaneContainer>
  );
}
```

## Styling Customization

### Custom Animations

```typescript
// In SwipeablePane.tsx, modify the variants:
const customVariants = {
  enter: (dir: string) => ({
    x: dir === 'right' ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95, // Add scale effect
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: string) => ({
    x: dir === 'right' ? '-100%' : '100%',
    opacity: 0,
    scale: 0.95,
  }),
};
```

### Custom Transition Timing

```typescript
// Modify the transition in SwipeablePane.tsx:
transition={{
  type: 'spring',
  stiffness: 400,  // Stiffer = faster
  damping: 25,     // Lower = more bounce
}}
```

### Custom Indicators

```typescript
// Replace the default indicators in PaneContainer.tsx:
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
  {PANE_ORDER.map((pane, index) => (
    <button
      key={pane}
      onClick={() => {
        setDirection(index > currentIndex ? 'right' : 'left');
        onPaneChange(pane);
      }}
      className={`
        h-1 rounded-full transition-all duration-200
        ${activePane === pane ? 'w-8 bg-primary' : 'w-4 bg-muted-foreground/50'}
      `}
      aria-label={`Go to ${pane}`}
    />
  ))}
</div>
```

## Testing

### Unit Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSwipeNavigation } from '@/hooks/mobile';

describe('useSwipeNavigation', () => {
  it('navigates to next item', () => {
    const { result } = renderHook(() =>
      useSwipeNavigation({
        items: ['a', 'b', 'c'],
        initialItem: 'a',
      })
    );

    expect(result.current.currentItem).toBe('a');

    act(() => {
      result.current.goNext();
    });

    expect(result.current.currentItem).toBe('b');
  });

  it('respects navigation boundaries', () => {
    const { result } = renderHook(() =>
      useSwipeNavigation({
        items: ['a', 'b'],
        initialItem: 'b',
      })
    );

    expect(result.current.canGoNext).toBe(false);
    expect(result.current.canGoPrevious).toBe(true);
  });
});
```

### Integration Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PaneContainer } from '@/components/mobile/workspace';

describe('PaneContainer', () => {
  it('changes pane on indicator click', () => {
    const onPaneChange = jest.fn();

    render(
      <PaneContainer activePane="editor" onPaneChange={onPaneChange}>
        {{
          files: <div>Files</div>,
          editor: <div>Editor</div>,
          terminal: <div>Terminal</div>,
          chat: <div>Chat</div>,
        }}
      </PaneContainer>
    );

    const terminalIndicator = screen.getByLabelText('Go to terminal');
    fireEvent.click(terminalIndicator);

    expect(onPaneChange).toHaveBeenCalledWith('terminal');
  });
});
```

## Troubleshooting

### Issue: Swipe not working

**Solution**: Ensure the parent container has proper height:
```css
.workspace-container {
  height: 100vh; /* or specific height */
  overflow: hidden;
}
```

### Issue: Animations feel sluggish

**Solution**: Adjust spring physics in transition:
```typescript
transition={{
  type: 'spring',
  stiffness: 400,  // Increase for faster animation
  damping: 30,     // Adjust for less/more bounce
}}
```

### Issue: Vertical scrolling not working

**Solution**: Ensure touch-action CSS is applied:
```css
.touch-pan-y {
  touch-action: pan-y; /* Allows vertical scroll */
}
```

### Issue: Multiple panes visible at once

**Solution**: Check parent container has `overflow: hidden`:
```typescript
<div className="relative h-full w-full overflow-hidden">
  <PaneContainer ... />
</div>
```

## Performance Tips

1. **Lazy load pane content**: Only render active pane content
2. **Memoize components**: Use React.memo for pane components
3. **Optimize animations**: Use GPU-accelerated transforms only
4. **Debounce state updates**: Prevent excessive re-renders during swipes

```typescript
import { useMemo } from 'react';

function OptimizedPaneContainer() {
  const paneContent = useMemo(() => ({
    files: <FilesView />,
    editor: <CodeEditorView />,
    terminal: <TerminalView />,
    chat: <ChatView />,
  }), []);

  return <PaneContainer>{paneContent}</PaneContainer>;
}
```

## Next Steps

1. Integrate with your existing mobile layout
2. Add custom pane content components
3. Test on actual mobile devices
4. Customize animations and styling
5. Add analytics/tracking for pane navigation

## Resources

- [Swipeable Panes Documentation](./SWIPEABLE_PANES.md)
- [Example Implementation](../examples/SwipeablePaneExample.tsx)
- [Framer Motion Documentation](https://www.framer.com/motion/)
