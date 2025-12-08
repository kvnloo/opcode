# Mobile Development Contributing Guide

Guidelines for contributing to Opcode mobile development.

## Code Organization

### Directory Structure

```
src/
├── mobile/                    # Mobile-specific components
│   ├── components/           # Reusable mobile UI components
│   │   ├── BottomNav.tsx    # Bottom navigation bar
│   │   ├── TabBar.tsx       # Tab navigation
│   │   ├── MobileHeader.tsx # Mobile header with actions
│   │   └── ...
│   ├── layouts/             # Mobile layout components
│   │   ├── MobileLayout.tsx # Main mobile layout wrapper
│   │   └── TabletLayout.tsx # Tablet-optimized layout
│   ├── screens/             # Full-screen mobile views
│   │   ├── ChatScreen.tsx   # Chat interface
│   │   ├── FilesScreen.tsx  # File browser
│   │   └── ...
│   ├── hooks/               # Mobile-specific hooks
│   │   ├── usePlatform.ts   # Platform detection
│   │   ├── useOrientation.ts # Screen orientation
│   │   └── ...
│   └── utils/               # Mobile utilities
│       ├── platform.ts      # Platform helpers
│       └── gestures.ts      # Touch gesture handlers
├── components/              # Desktop components (adapt for mobile)
├── shared/                  # Shared utilities
└── desktop/                 # Desktop-specific (if needed)
```

### Component Naming Conventions

**Mobile Components**
- Prefix mobile-only components with `Mobile`: `MobileHeader.tsx`
- Use descriptive names: `BottomNav.tsx` not `Nav.tsx`
- Screen components end with `Screen`: `ChatScreen.tsx`

**Responsive Components**
- Components that adapt use base names: `ChatView.tsx`
- Use platform detection inside: `const { isMobile } = usePlatform()`

**Layout Components**
- Layout wrappers: `MobileLayout.tsx`, `TabletLayout.tsx`
- Pane components: `ChatPane.tsx`, `FilesPane.tsx`

### File Naming
- Components: PascalCase (`MobileHeader.tsx`)
- Hooks: camelCase with `use` prefix (`usePlatform.ts`)
- Utilities: camelCase (`platform.ts`)
- Styles: Match component name (`MobileHeader.module.css`)

## Component Development

### Platform Detection Pattern

```typescript
import { usePlatform } from '@/mobile/hooks/usePlatform';

export function AdaptiveComponent() {
  const { isMobile, isTablet, isDesktop } = usePlatform();

  if (isMobile) {
    return <MobileView />;
  }

  if (isTablet) {
    return <TabletView />;
  }

  return <DesktopView />;
}
```

### Responsive Styles

**Use CSS Media Queries**
```css
/* Base (mobile-first) */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

**Tailwind Responsive Classes**
```tsx
<div className="p-4 md:p-8 lg:p-12">
  {/* Mobile: p-4, Tablet: p-8, Desktop: p-12 */}
</div>
```

### Touch Interactions

**Use Touch-Friendly Targets**
```tsx
// Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px]">
  <Icon />
</button>
```

**Handle Touch Gestures**
```tsx
import { useSwipe } from '@/mobile/hooks/useSwipe';

function SwipeablePane() {
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: () => goToNext(),
    onSwipeRight: () => goToPrevious(),
  });

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {content}
    </div>
  );
}
```

## Testing Requirements

### Unit Tests

**Test Platform Variants**
```typescript
import { render } from '@testing-library/react';
import { PlatformProvider } from '@/mobile/contexts/PlatformContext';

describe('AdaptiveComponent', () => {
  it('renders mobile view on mobile', () => {
    const { getByTestId } = render(
      <PlatformProvider value={{ isMobile: true }}>
        <AdaptiveComponent />
      </PlatformProvider>
    );
    expect(getByTestId('mobile-view')).toBeInTheDocument();
  });

  it('renders desktop view on desktop', () => {
    const { getByTestId } = render(
      <PlatformProvider value={{ isMobile: false }}>
        <AdaptiveComponent />
      </PlatformProvider>
    );
    expect(getByTestId('desktop-view')).toBeInTheDocument();
  });
});
```

**Test Touch Interactions**
```typescript
import { fireEvent } from '@testing-library/react';

it('handles swipe gesture', () => {
  const onSwipe = jest.fn();
  const { container } = render(<SwipeablePane onSwipe={onSwipe} />);

  fireEvent.touchStart(container, { touches: [{ clientX: 100, clientY: 0 }] });
  fireEvent.touchMove(container, { touches: [{ clientX: 50, clientY: 0 }] });
  fireEvent.touchEnd(container);

  expect(onSwipe).toHaveBeenCalledWith('left');
});
```

### Visual Testing

**Test Responsive Breakpoints**
```typescript
describe('Responsive Layout', () => {
  it('displays bottom nav on mobile', () => {
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    const { getByTestId } = render(<MobileLayout />);
    expect(getByTestId('bottom-nav')).toBeVisible();
  });

  it('displays sidebar on desktop', () => {
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    const { getByTestId } = render(<MobileLayout />);
    expect(getByTestId('sidebar')).toBeVisible();
  });
});
```

### Integration Tests

**Test Navigation Flows**
```typescript
import { screen, fireEvent } from '@testing-library/react';

it('navigates between tabs', async () => {
  render(<MobileApp />);

  // Start on chat tab
  expect(screen.getByTestId('chat-screen')).toBeVisible();

  // Tap files tab
  fireEvent.click(screen.getByText('Files'));
  expect(screen.getByTestId('files-screen')).toBeVisible();

  // Tap settings tab
  fireEvent.click(screen.getByText('Settings'));
  expect(screen.getByTestId('settings-screen')).toBeVisible();
});
```

## Pull Request Checklist

### Before Submitting

- [ ] Code follows mobile naming conventions
- [ ] Components are placed in correct directories
- [ ] Platform detection is implemented correctly
- [ ] Touch targets are minimum 44x44px
- [ ] Responsive styles tested at all breakpoints
- [ ] Unit tests added for new components
- [ ] Integration tests added for new flows
- [ ] Visual testing performed on mobile/tablet/desktop
- [ ] Documentation updated (if architecture changed)
- [ ] TypeScript types are correct and complete

### Testing Checklist

- [ ] Tested on Android emulator/device
- [ ] Tested on iOS simulator/device (if available)
- [ ] Tested in mobile browser (Chrome DevTools mobile view)
- [ ] Tested portrait and landscape orientations
- [ ] Tested on different screen sizes (phone/tablet)
- [ ] Tested touch interactions (tap, swipe, long-press)
- [ ] Tested keyboard interactions (for forms)
- [ ] Verified no console errors or warnings

### Performance Checklist

- [ ] No unnecessary re-renders
- [ ] Large lists virtualized
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size checked (< 500KB increase)
- [ ] No memory leaks (useEffect cleanup)
- [ ] Smooth 60fps animations

## Code Review Guidelines

### What Reviewers Look For

**Architecture**
- Is platform detection used correctly?
- Are components organized logically?
- Is code reusable and maintainable?

**UX**
- Are touch targets large enough?
- Do gestures feel natural?
- Is navigation intuitive?

**Performance**
- Are lists virtualized?
- Are images optimized?
- Are re-renders minimized?

**Testing**
- Are all code paths tested?
- Are edge cases covered?
- Are tests maintainable?

### Review Response Time
- Simple PRs (< 100 lines): 1 business day
- Medium PRs (100-500 lines): 2-3 business days
- Large PRs (> 500 lines): Break into smaller PRs if possible

## Common Patterns

### Bottom Navigation
```tsx
import { BottomNav } from '@/mobile/components/BottomNav';

<BottomNav
  items={[
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]}
  activeId={activeTab}
  onItemClick={setActiveTab}
/>
```

### Swipeable Panes
```tsx
import { SwipeablePanes } from '@/mobile/components/SwipeablePanes';

<SwipeablePanes
  panes={[
    { id: 'chat', content: <ChatPane /> },
    { id: 'files', content: <FilesPane /> },
  ]}
  activeId={activePane}
  onPaneChange={setActivePane}
/>
```

### Mobile Modals
```tsx
import { MobileModal } from '@/mobile/components/MobileModal';

<MobileModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Settings"
  fullScreen // Optional: full-screen on mobile
>
  <SettingsContent />
</MobileModal>
```

## Getting Help

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions
- Review [SETUP.md](./SETUP.md) for environment issues
- Search existing issues: https://github.com/your-org/opcode/issues
- Ask in #mobile-dev Discord channel
- Tag @mobile-team in PRs for review

## Resources

- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Mobile UX Guidelines](https://material.io/design/platform-guidance/android-bars.html)
- [Touch Target Sizes](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile Performance Best Practices](https://web.dev/mobile/)
