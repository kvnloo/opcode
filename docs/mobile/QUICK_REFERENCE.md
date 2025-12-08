# Mobile Polish - Quick Reference

Quick reference guide for haptics, performance, and accessibility features.

## 🎯 Quick Start

All required dependencies are already in package.json. No additional packages needed.

## 🔊 Haptics

```typescript
import { haptics } from '@/lib/mobile/haptics';

haptics.light();      // Subtle tap
haptics.medium();     // Standard press
haptics.heavy();      // Important action
haptics.success();    // Success pattern
haptics.error();      // Error pattern
haptics.selection();  // Selection change
```

## ⚡ Performance

```typescript
import { debounce, throttle } from '@/lib/mobile/performance';

const search = debounce((term) => performSearch(term), 300);
const scroll = throttle((e) => updatePosition(e), 100);
```

## ♿ Accessibility

```typescript
import { announceToScreenReader } from '@/lib/mobile/accessibility';

announceToScreenReader('Action completed', 'polite');
```

## 📚 Full Documentation

See /docs/mobile/MOBILE_POLISH.md for complete documentation.
