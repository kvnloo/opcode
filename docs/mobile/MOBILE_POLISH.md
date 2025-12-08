# Mobile Polish Features

Comprehensive documentation for haptic feedback, performance optimization, and accessibility features in the Opcode mobile app.

## Table of Contents

- [Haptic Feedback](#haptic-feedback)
- [Performance Optimization](#performance-optimization)
- [Accessibility Features](#accessibility-features)
- [Components](#components)
- [Best Practices](#best-practices)

---

## Haptic Feedback

### Overview

The haptic feedback system provides tactile feedback for user interactions, enhancing the mobile experience with appropriate vibration patterns.

### Features

- **Cross-platform support**: Works with Tauri vibration plugin and browser Vibration API
- **Multiple feedback types**: Light, medium, heavy, success, error, selection
- **User preferences**: Respects user's haptic settings
- **Graceful fallback**: Automatically falls back when haptics unavailable

### Usage

#### Basic Usage

```typescript
import { haptics } from '@/lib/mobile/haptics';

// Trigger specific feedback
haptics.light();    // Subtle tap
haptics.medium();   // Standard button press
haptics.heavy();    // Significant action
haptics.success();  // Success pattern
haptics.error();    // Error pattern
haptics.selection(); // Selection change

// Check support and settings
if (haptics.isSupported()) {
  haptics.medium();
}

// Enable/disable
haptics.setEnabled(false);
```

#### React Hook

```typescript
import { useHaptics } from '@/hooks/mobile/useHaptics';

function MyComponent() {
  const { medium, isSupported, isEnabled, setEnabled } = useHaptics();

  return (
    <button onClick={() => {
      medium();
      handleAction();
    }}>
      Click me
    </button>
  );
}
```

#### HapticButton Component

```typescript
import { HapticButton } from '@/components/mobile/common/HapticButton';

function MyComponent() {
  return (
    <HapticButton
      hapticType="heavy"
      onClick={handleSubmit}
      className="bg-blue-600 text-white"
    >
      Submit
    </HapticButton>
  );
}
```

### Feedback Types

| Type | Duration | Intensity | Use Case |
|------|----------|-----------|----------|
| `light` | 10ms | 0.3 | Subtle interactions, hover states |
| `medium` | 15ms | 0.6 | Standard button presses |
| `heavy` | 25ms | 1.0 | Important actions, confirmations |
| `success` | 2 pulses | 0.5-0.7 | Successful operations |
| `error` | 3 pulses | 0.8 | Errors, warnings |
| `selection` | 5ms | 0.4 | Selection changes, toggles |

### Best Practices

1. **Use appropriate feedback types**: Match haptic intensity to action importance
2. **Don't overuse**: Limit to meaningful interactions
3. **Respect preferences**: Always check if haptics are enabled
4. **Provide visual feedback**: Never rely solely on haptics
5. **Test on devices**: Haptic patterns feel different on various devices

---

## Performance Optimization

### Overview

Performance utilities help optimize mobile app performance through lazy loading, debouncing, throttling, and device capability detection.

### Features

- **Lazy loading with retry**: Automatic retry for failed component loads
- **Debounce/Throttle**: Rate-limiting for expensive operations
- **Device capabilities**: Detect network speed, memory, CPU
- **Memory management**: Track and optimize memory usage
- **Bundle tracking**: Monitor load times and sizes

### Usage

#### Debouncing

```typescript
import { debounce } from '@/lib/mobile/performance';

// Debounce search input (waits for user to stop typing)
const handleSearch = debounce((searchTerm: string) => {
  performSearch(searchTerm);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />
```

#### Throttling

```typescript
import { throttle } from '@/lib/mobile/performance';

// Throttle scroll handler (limits execution rate)
const handleScroll = throttle((event) => {
  updateScrollPosition(event.scrollTop);
}, 100);

<div onScroll={handleScroll}>...</div>
```

#### Lazy Loading

```typescript
import { LazyComponent } from '@/components/mobile/common/LazyComponent';

function MyPage() {
  return (
    <LazyComponent
      loadComponent={() => import('./HeavyComponent')}
      maxRetries={3}
      retryDelay={1000}
      onLoad={() => console.log('Loaded!')}
      onError={(error) => console.error('Failed:', error)}
    />
  );
}
```

#### Device Capabilities

```typescript
import { getDeviceCapabilities, isSlowNetwork } from '@/lib/mobile/performance';

const capabilities = getDeviceCapabilities();

if (capabilities.canHandleHighQuality) {
  // Load high-quality assets
} else {
  // Load optimized assets
}

if (capabilities.shouldReduceAnimations) {
  // Disable or simplify animations
}

if (isSlowNetwork()) {
  // Reduce data usage
}
```

#### Image Optimization

```typescript
import { optimizeImage } from '@/lib/mobile/performance';

const imageProps = optimizeImage('/path/to/image.jpg', {
  width: 800,
  height: 600,
  quality: 80,
  format: 'webp'
});

<img {...imageProps} alt="Optimized image" />
```

### Performance Metrics

```typescript
import { bundleTracking, memoryManagement } from '@/lib/mobile/performance';

// Track component load time
const startTime = performance.now();
bundleTracking.trackComponentLoad('MyComponent', startTime);

// Get bundle statistics
const stats = bundleTracking.getBundleStats();
console.log('Total resources:', stats.totalResources);
console.log('Total size:', stats.totalSize);
console.log('Load time:', stats.loadTime);

// Monitor memory usage
const memoryInfo = memoryManagement.getMemoryInfo();
if (memoryInfo && memoryInfo.usage > 80) {
  console.warn('High memory usage:', memoryInfo.usage + '%');
  memoryManagement.requestGarbageCollection();
}
```

### Best Practices

1. **Debounce user input**: Use debounce for search, autocomplete, validation
2. **Throttle scroll/resize**: Use throttle for scroll, resize, mousemove handlers
3. **Lazy load heavy components**: Split code by route and feature
4. **Detect capabilities**: Adapt to device limitations
5. **Monitor performance**: Track load times and memory usage
6. **Optimize for slow networks**: Reduce asset sizes on poor connections

---

## Accessibility Features

### Overview

WCAG 2.1 AA compliant accessibility utilities for screen readers, focus management, and user preferences.

### Features

- **Screen reader announcements**: ARIA live regions
- **Focus management**: Focus trapping, restoration
- **User preferences**: Reduced motion, high contrast, dark mode
- **Keyboard navigation**: Activation keys, arrow navigation
- **Font scaling**: Respects user font size preferences
- **Color contrast**: WCAG contrast checking

### Usage

#### Screen Reader Announcements

```typescript
import { announceToScreenReader } from '@/lib/mobile/accessibility';

// Polite announcement (doesn't interrupt)
announceToScreenReader('Settings saved successfully', 'polite');

// Assertive announcement (interrupts current speech)
announceToScreenReader('Error: Please fix the form', 'assertive');
```

#### Focus Management

```typescript
import { focusManagement } from '@/lib/mobile/accessibility';

// Trap focus in modal
const cleanup = focusManagement.trapFocus(modalElement);

// Return focus to previous element
const previousFocus = focusManagement.getCurrentFocus();
// ... do something ...
focusManagement.returnFocus(previousFocus);

// Move focus to specific element
focusManagement.moveFocusTo('#next-button');
```

#### User Preferences

```typescript
import {
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  getFontScalePreference,
  watchAccessibilityPreferences
} from '@/lib/mobile/accessibility';

// Check preferences
if (prefersReducedMotion()) {
  // Disable or simplify animations
}

if (prefersHighContrast()) {
  // Use high contrast colors
}

const fontScale = getFontScalePreference(); // 1.0 = default, >1.0 = larger

// Watch for changes
const unwatch = watchAccessibilityPreferences({
  onReducedMotionChange: (enabled) => console.log('Reduced motion:', enabled),
  onHighContrastChange: (enabled) => console.log('High contrast:', enabled),
  onDarkModeChange: (enabled) => console.log('Dark mode:', enabled)
});

// Cleanup
unwatch();
```

#### ARIA Utilities

```typescript
import { aria } from '@/lib/mobile/accessibility';

// Set ARIA attributes
aria.setAttributes(element, {
  'label': 'Close dialog',
  'pressed': 'true',
  'expanded': 'false'
});

// Announce states
aria.announceLoading('Loading profile...');
aria.announceSuccess('Profile saved successfully');
aria.announceError('Failed to save profile');

// Label form field
const labelId = aria.labelField(inputElement, 'Email address', true);

// Add description
const descId = aria.describeElement(buttonElement, 'Click to submit form');
```

#### Keyboard Navigation

```typescript
import { keyboard } from '@/lib/mobile/accessibility';

function handleKeyDown(event: KeyboardEvent) {
  if (keyboard.isActivationKey(event)) {
    // Handle Enter or Space
    handleClick();
  }

  if (keyboard.isEscapeKey(event)) {
    // Handle Escape
    closeModal();
  }

  const direction = keyboard.getArrowDirection(event);
  if (direction) {
    // Handle arrow keys
    navigateTo(direction);
  }
}
```

#### Color Contrast Checking

```typescript
import { checkColorContrast } from '@/lib/mobile/accessibility';

const result = checkColorContrast('#000000', '#ffffff');
console.log('Contrast ratio:', result.ratio);        // 21:1
console.log('Passes WCAG AA:', result.passesAA);     // true
console.log('Passes WCAG AAA:', result.passesAAA);   // true

// Check before applying colors
const brandColors = checkColorContrast('#3B82F6', '#ffffff');
if (!brandColors.passesAA) {
  console.warn('Insufficient contrast for accessibility');
}
```

---

## Components

### AccessibleText

Text component with font scaling and high contrast support.

```typescript
import { AccessibleText } from '@/components/mobile/common/AccessibleText';

<AccessibleText variant="h1" weight="bold" align="center">
  Main Heading
</AccessibleText>

<AccessibleText variant="body" scalable highContrast>
  This text scales with user preferences and supports high contrast.
</AccessibleText>

<AccessibleText variant="small" className="text-gray-600">
  Helper text
</AccessibleText>
```

**Props:**

- `variant`: h1-h6, body, small, caption
- `weight`: light, normal, medium, semibold, bold
- `scalable`: Enable user font scaling (default: true)
- `highContrast`: High contrast support (default: true)
- `align`: left, center, right
- `as`: Override HTML element
- `srOnly`: Screen reader only (visually hidden)

### ScreenReaderOnly

Content visible only to screen readers.

```typescript
import { ScreenReaderOnly } from '@/components/mobile/common/AccessibleText';

<ScreenReaderOnly>
  Additional context for screen reader users
</ScreenReaderOnly>
```

### VisuallyHidden

Content hidden until focused (useful for skip links).

```typescript
import { VisuallyHidden } from '@/components/mobile/common/AccessibleText';

<VisuallyHidden>
  <a href="#main-content">Skip to main content</a>
</VisuallyHidden>
```

### HapticButton

Button with built-in haptic feedback.

```typescript
import { HapticButton } from '@/components/mobile/common/HapticButton';

<HapticButton
  hapticType="medium"
  onClick={handleAction}
  disabled={isLoading}
  className="bg-blue-600 text-white"
  aria-label="Submit form"
>
  Submit
</HapticButton>
```

**Props:**

- `hapticType`: light, medium, heavy, success, error, selection (default: medium)
- `disableHaptics`: Disable haptic feedback (default: false)
- All standard button props

### LazyComponent

Lazy-loaded component with retry and error handling.

```typescript
import { LazyComponent } from '@/components/mobile/common/LazyComponent';

<LazyComponent
  loadComponent={() => import('./HeavyComponent')}
  componentProps={{ userId: 123 }}
  loadingSkeleton={<CustomSkeleton />}
  errorFallback={<CustomError />}
  maxRetries={3}
  retryDelay={1000}
  onLoad={() => console.log('Loaded')}
  onError={(error) => console.error(error)}
/>
```

**Props:**

- `loadComponent`: Function returning component import
- `componentProps`: Props for loaded component
- `loadingSkeleton`: Custom loading UI
- `errorFallback`: Custom error UI
- `maxRetries`: Retry attempts (default: 3)
- `retryDelay`: Delay between retries (default: 1000ms)

### TabletLayout

Split-view layout optimized for tablets.

```typescript
import { TabletLayout } from '@/components/mobile/layout/TabletLayout';

<TabletLayout
  sidebar={<NavigationMenu />}
  defaultSidebarWidth={320}
  sidebarPosition="left"
  resizable
  collapsible
  onSidebarWidthChange={(width) => console.log(width)}
  onCollapsedChange={(collapsed) => console.log(collapsed)}
>
  <MainContent />
</TabletLayout>
```

**Props:**

- `sidebar`: Sidebar content
- `defaultSidebarWidth`: Initial width (default: 320px)
- `minSidebarWidth`: Minimum width (default: 240px)
- `maxSidebarWidth`: Maximum width (default: 480px)
- `resizable`: Enable resizing (default: true)
- `collapsible`: Enable collapsing (default: true)
- `sidebarPosition`: left or right (default: left)

---

## Best Practices

### Haptic Feedback

✅ **DO:**
- Use haptics for meaningful interactions
- Match feedback intensity to action importance
- Respect user preferences
- Provide visual feedback alongside haptics
- Test on actual devices

❌ **DON'T:**
- Overuse haptics (creates fatigue)
- Use heavy feedback for minor actions
- Assume haptics work everywhere
- Rely solely on haptics for feedback

### Performance

✅ **DO:**
- Debounce text input handlers
- Throttle scroll/resize handlers
- Lazy load heavy components
- Check device capabilities
- Optimize images for mobile
- Monitor memory usage

❌ **DON'T:**
- Load all components upfront
- Run expensive operations on scroll
- Ignore slow network conditions
- Use large unoptimized images
- Create memory leaks

### Accessibility

✅ **DO:**
- Use semantic HTML
- Provide ARIA labels
- Support keyboard navigation
- Respect user preferences
- Announce dynamic changes
- Maintain 44x44px touch targets
- Ensure WCAG AA contrast (4.5:1)
- Test with screen readers

❌ **DON'T:**
- Use divs for buttons
- Forget focus indicators
- Ignore reduced motion
- Block keyboard navigation
- Use insufficient color contrast
- Make touch targets too small
- Rely on color alone

---

## Examples

See `/src/components/mobile/examples/MobilePolishDemo.tsx` for complete working examples of all features.

Run the demo:

```typescript
import { MobilePolishCompleteDemo } from '@/components/mobile/examples/MobilePolishDemo';

<MobilePolishCompleteDemo />
```

---

## WCAG 2.1 AA Compliance

All components and utilities are designed to meet WCAG 2.1 AA standards:

- ✅ **1.4.3 Contrast (Minimum)**: 4.5:1 contrast ratio for text
- ✅ **1.4.4 Resize text**: Text can be resized up to 200%
- ✅ **1.4.10 Reflow**: Content reflows without horizontal scrolling
- ✅ **1.4.11 Non-text Contrast**: UI components have 3:1 contrast
- ✅ **2.1.1 Keyboard**: All functionality via keyboard
- ✅ **2.4.7 Focus Visible**: Clear focus indicators
- ✅ **2.5.5 Target Size**: Minimum 44x44px touch targets
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA attributes
- ✅ **4.1.3 Status Messages**: Screen reader announcements

---

## Browser Support

- **iOS Safari**: 13+
- **Android Chrome**: 80+
- **Tauri Mobile**: Full support with native plugins

---

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

## Future Enhancements

- [ ] Haptic pattern customization
- [ ] Advanced performance monitoring
- [ ] Accessibility audit tools
- [ ] Gesture-based navigation
- [ ] Voice control support
- [ ] Advanced caching strategies
