# Mobile Performance Optimization Guide

Comprehensive guide for optimizing Opcode mobile app performance.

## Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3s
- **Bundle Size**: < 500KB (gzipped)
- **Frame Rate**: 60fps (16.67ms per frame)

## Core Optimization Tools

### 1. Bundle Analyzer

Tracks component sizes and identifies optimization opportunities.

```typescript
import { bundleAnalyzer, useBundleAnalysis } from '@/lib/mobile/optimization';

// Enable in development
useBundleAnalysis(true);

// Manual analysis
const report = bundleAnalyzer.generateReport();
console.log(report);

// Track size history
bundleAnalyzer.trackSizeHistory('main-bundle');

// Detect regressions
const hasRegression = bundleAnalyzer.detectRegressions('main-bundle', 0.1); // 10% threshold
```

#### Features
- Identifies large dependencies (>50KB)
- Suggests code splitting points
- Tracks bundle size over time
- Detects size regressions
- Generates optimization reports

### 2. Image Optimizer

Optimizes images with lazy loading, format detection, and caching.

```typescript
import { imageOptimizer } from '@/lib/mobile/optimization';

// Optimize image
const optimized = await imageOptimizer.optimizeImage({
  src: '/images/hero.jpg',
  width: 1200,
  format: 'auto', // Detects WebP/AVIF support
  lazy: true,
  placeholder: 'blur',
});

// Use optimized image
<img
  src={optimized.placeholder}
  data-src={optimized.src}
  data-srcset={optimized.srcSet}
  alt="Hero image"
/>

// Lazy load with Intersection Observer
imageOptimizer.lazyLoad(imgElement);

// Preload critical images
await imageOptimizer.preloadImages([
  '/images/logo.png',
  '/images/hero.jpg',
]);
```

#### Features
- Automatic WebP/AVIF format detection
- Responsive srcSet generation
- Blur placeholder generation
- Shimmer placeholder support
- LRU cache with size limits (50MB default)
- Lazy loading with Intersection Observer

### 3. Memory Manager

Manages component cleanup, cache limits, and memory pressure.

```typescript
import { memoryManager, MemoryAwareCache } from '@/lib/mobile/optimization';

// Create cache with memory limits
const cache = new MemoryAwareCache({
  maxSize: 100, // Max 100 entries
  maxAge: 5 * 60 * 1000, // 5 minutes
  onEvict: (key, value) => console.log('Evicted:', key),
});

// Monitor memory pressure
memoryManager.startMonitoring((pressure) => {
  if (pressure.level === 'critical') {
    cache.clear();
  }
});

// Register cleanup callbacks
const cleanup = memoryManager.registerCleanup(() => {
  // Cleanup logic
});

// Component cleanup helper
const componentCleanup = memoryManager.createComponentCleanup();
componentCleanup.register(() => clearInterval(intervalId));

// React hook
useComponentCleanup(); // Auto-cleanup on unmount
```

#### Features
- LRU cache with memory limits
- Memory pressure detection
- Automatic cleanup triggers
- Component lifecycle helpers
- Debounce/throttle with cleanup
- AbortController management

### 4. Virtual List

Efficiently renders large lists by virtualizing off-screen items.

```tsx
import { VirtualList, useItemHeight } from '@/components/mobile/common/VirtualList';

function MessageList({ messages }) {
  const [getHeight, setHeight] = useItemHeight(messages);

  return (
    <VirtualList
      items={messages}
      itemHeight={getHeight}
      renderItem={(msg, idx) => (
        <MessageItem
          message={msg}
          onHeightChange={(h) => setHeight(idx, h)}
        />
      )}
      overscan={3}
      onEndReached={() => loadMore()}
      onRefresh={async () => await refresh()}
      refreshing={isRefreshing}
    />
  );
}
```

#### Features
- Only renders visible items
- Variable height support
- Pull-to-refresh
- Infinite scroll
- Smooth 60fps scrolling
- Overscan for smoother scrolling

### 5. Intersection Observer Hook

Provides lazy loading triggers and visibility tracking.

```tsx
import {
  useIntersectionObserver,
  useLazyImage,
  useScrollAnimation,
  useInfiniteScroll,
} from '@/hooks/mobile/useIntersectionObserver';

// Basic lazy loading
function LazyImage({ src }) {
  const { ref, isIntersecting } = useIntersectionObserver();
  return <img ref={ref} src={isIntersecting ? src : placeholder} />;
}

// Lazy image with loading states
function OptimizedImage({ src }) {
  const { ref, src: imageSrc, isLoaded, hasError } = useLazyImage(src, placeholder);
  return <img ref={ref} src={imageSrc} className={isLoaded ? 'loaded' : 'loading'} />;
}

// Scroll animations
function AnimatedCard() {
  const { ref, className } = useScrollAnimation('animate-fade-in');
  return <div ref={ref} className={className}>Content</div>;
}

// Infinite scroll
function InfiniteList() {
  const { ref } = useInfiniteScroll(() => loadMore(), {
    enabled: hasMore,
    hasMore,
  });
  return (
    <div>
      {items.map(item => <Item key={item.id} {...item} />)}
      <div ref={ref} />
    </div>
  );
}
```

#### Features
- Element visibility detection
- Lazy image loading with states
- Scroll-triggered animations
- Infinite scroll support
- Multiple element tracking
- Visibility percentage tracking

### 6. Performance Monitor

Tracks Core Web Vitals and generates performance reports.

```typescript
import {
  performanceMonitor,
  usePerformanceMonitor,
  markPerformance,
  measurePerformance,
} from '@/lib/mobile/optimization';

// React hook for component tracking
function ExpensiveComponent() {
  const cleanup = usePerformanceMonitor('ExpensiveComponent');
  useEffect(() => cleanup, [cleanup]);
  // Component logic
}

// Manual measurements
performanceMonitor.measureComponentLoad('Dashboard', startTime);
performanceMonitor.measureApiCall('/api/data', startTime);
performanceMonitor.measureRender(() => {
  // Render logic
});

// Generate report
const report = performanceMonitor.generateReport();
console.log('Performance Score:', report.overallScore);

// Performance marks
markPerformance('data-fetch-start');
await fetchData();
markPerformance('data-fetch-end');
const duration = measurePerformance('data-fetch', 'data-fetch-start', 'data-fetch-end');

// Send to analytics
await performanceMonitor.sendToAnalytics('/api/analytics/performance');
```

#### Features
- Core Web Vitals tracking (FCP, LCP, FID, CLS, TTFB, TTI)
- Custom metric tracking
- Performance scoring (0-100)
- Automated recommendations
- Analytics integration
- Development console logging

## Mobile-Specific Tailwind Utilities

### Safe Area Support

```tsx
// Respect device notches and safe areas
<div className="safe-top">Content below notch</div>
<div className="safe-bottom">Content above home indicator</div>
<div className="safe-all">Full safe area padding</div>
```

### Touch Targets

```tsx
// iOS: 44x44px minimum
<button className="touch-target">Tap me</button>

// Android: 48x48px minimum
<button className="touch-target-android">Tap me</button>
```

### Performance Utilities

```tsx
// GPU acceleration for smooth animations
<div className="gpu-accelerate animate-slide-up">Animated content</div>

// Smooth scrolling
<div className="scroll-smooth-mobile overflow-auto">Scrollable content</div>

// Active state for touch
<button className="active-scale">Press me</button>

// Disable text selection
<div className="no-select">Non-selectable text</div>
```

### Loading States

```tsx
// Shimmer effect (light mode)
<div className="shimmer h-20 w-full rounded" />

// Shimmer effect (dark mode)
<div className="shimmer-dark h-20 w-full rounded" />
```

### Responsive Variants

```tsx
// Orientation-specific styles
<div className="portrait:flex-col landscape:flex-row">Content</div>

// Device-specific styles
<div className="ios:rounded-xl android:rounded-lg">Content</div>

// Touch-specific styles
<button className="touch:text-lg no-touch:text-base">Button</button>

// Reduced motion support
<div className="motion-safe:animate-fade-in motion-reduce:opacity-100">Content</div>
```

## Optimization Checklist

### Bundle Size
- [ ] Code splitting for routes and heavy components
- [ ] Tree shaking enabled
- [ ] Dead code elimination
- [ ] Minification and compression
- [ ] Bundle analysis integrated
- [ ] Dynamic imports for non-critical code

### Images
- [ ] WebP/AVIF format support
- [ ] Responsive images with srcSet
- [ ] Lazy loading below fold
- [ ] Blur placeholders for LCP images
- [ ] Image cache management
- [ ] Preload critical images

### Rendering
- [ ] Virtual lists for long lists (>50 items)
- [ ] React.memo for expensive components
- [ ] useMemo/useCallback for heavy computations
- [ ] Debounce/throttle event handlers
- [ ] Avoid layout thrashing
- [ ] CSS containment for isolated sections

### Memory
- [ ] Component cleanup on unmount
- [ ] Event listener cleanup
- [ ] Timer/interval cleanup
- [ ] AbortController for cancelled requests
- [ ] Cache size limits
- [ ] Memory pressure monitoring

### Network
- [ ] API request caching
- [ ] Debounced search/autocomplete
- [ ] Request deduplication
- [ ] Progressive enhancement
- [ ] Service worker for offline support

### CSS/Styling
- [ ] Critical CSS inlined
- [ ] Unused CSS purged
- [ ] CSS-in-JS optimized
- [ ] Tailwind JIT mode
- [ ] Reduced motion support
- [ ] Dark mode optimization

## Performance Testing

```bash
# Build production bundle
npm run build

# Analyze bundle
npm run analyze

# Lighthouse CI
npm run lighthouse

# Web Vitals
npm run vitals
```

## Monitoring in Production

```typescript
// Initialize performance monitoring
performanceMonitor.startMonitoring((pressure) => {
  if (pressure.level === 'critical') {
    // Alert or cleanup
  }
});

// Send metrics to analytics
setInterval(() => {
  performanceMonitor.sendToAnalytics('/api/analytics/performance');
}, 60000); // Every minute
```

## Common Performance Issues

### Slow First Paint
- Bundle too large → Code split
- Blocking resources → Defer/async
- No preloading → Add preload hints

### Poor LCP
- Large images → Optimize and lazy load
- Slow server → CDN and caching
- Render-blocking CSS → Critical CSS

### High CLS
- No image dimensions → Set width/height
- Dynamic content → Reserve space
- Web fonts → font-display: swap

### Jank/Stuttering
- Long tasks → Break up with setTimeout
- Heavy renders → Virtualize or memo
- Layout thrashing → Batch DOM reads/writes

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Tailwind Performance](https://tailwindcss.com/docs/optimizing-for-production)
- [Mobile Web Best Practices](https://web.dev/mobile/)
