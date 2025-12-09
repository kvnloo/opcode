# Safe Area Quick Reference

## Problem Solved
Android status bar was overlapping with UI content. This has been fixed with edge-to-edge display configuration and CSS safe area insets.

## What Was Added/Changed

### 1. HTML Viewport Meta Tag (index.html)
```html
<!-- Added viewport-fit=cover -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

### 2. Android Theme Configuration
**Files**:
- `src-tauri/gen/android/app/src/main/res/values/themes.xml`
- `src-tauri/gen/android/app/src/main/res/values-night/themes.xml`

Added to `<style name="Theme.claudia">`:
```xml
<item name="android:windowDrawsSystemBarBackgrounds">true</item>
<item name="android:fitsSystemWindows">false</item>
<item name="android:windowTranslucentStatus">false</item>
<item name="android:windowLightStatusBar">false</item>
```

## CSS Classes Available (Already in Project)

Use these classes in your components:

```tsx
// Top padding (for headers)
<div className="mobile-safe-area-top">
  Header content here
</div>

// Bottom padding (for bottom nav)
<div className="mobile-safe-area-bottom">
  Navigation here
</div>

// All sides (notches/cutouts)
<div className="mobile-safe-area-inset">
  Full screen content here
</div>

// Left/right padding (for side notches)
<div className="mobile-safe-area-left">
  Content with left padding
</div>

<div className="mobile-safe-area-right">
  Content with right padding
</div>
```

## CSS Variables (Raw)

If needed, use the CSS variables directly:

```css
.my-component {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

## Common Use Cases

### Fixed Header
```tsx
<header className="mobile-safe-area-top fixed top-0 w-full">
  {/* Header always below status bar */}
</header>
```

### Bottom Navigation
```tsx
<nav className="mobile-safe-area-bottom fixed bottom-0 w-full">
  {/* Nav always above system navigation bar */}
</nav>
```

### Full Screen Editor
```tsx
<div className="mobile-safe-area-inset h-full w-full">
  {/* Content with all safe area padding */}
</div>
```

## Testing

### Build & Test
```bash
# Build for Android
npm run tauri build --target aarch64-linux-android

# Install on device
adb install src-tauri/gen/android/target/aarch64-linux-android/release/opcode.apk

# Test:
# 1. Open app
# 2. Verify no overlap with status bar
# 3. Test in light and dark themes
# 4. Test on different notch/cutout styles
```

### Debugging
If safe areas aren't working:
1. Check `viewport-fit=cover` is in meta tag
2. Verify Android theme XML has the new properties
3. Check component uses `mobile-safe-area-*` classes
4. Clear build cache: `rm -rf src-tauri/gen/android/build`

## Browser Support

- ✅ iOS 11+
- ✅ Android 7+ (with gradual API level improvements 10+)
- ✅ Web browsers (Chrome, Safari, Edge)
- ✅ Graceful fallback (safe areas just return 0 if not available)

## Performance

- Zero runtime cost
- CSS variables resolved at browser load time
- No JavaScript required
- No layout reflows or DOM manipulation

## References

- `/src/styles/mobile-tokens.css` - All CSS safe area classes defined here
- `/index.html` - Viewport configuration
- `src-tauri/gen/android/app/src/main/res/values/themes.xml` - Light theme
- `src-tauri/gen/android/app/src/main/res/values-night/themes.xml` - Dark theme
