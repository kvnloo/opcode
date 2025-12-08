# Design Tokens Integration

## Summary
Successfully converted the design tokens from JSON to CSS custom properties and integrated them into the mobile application's styling system.

## Files Created

### 1. `/src/styles/mobile-tokens.css`
Comprehensive CSS custom properties file containing all design tokens organized into categories:

#### Color System
- **Backgrounds**: 9 background colors (primary, secondary, tertiary, elevated, card, input, overlay, app preview, app card)
- **Text**: 6 text colors (primary, secondary, tertiary, muted, disabled, code)
- **Borders**: 6 border colors (default, subtle, active, focus, error, card)
- **Accents**: 10 accent colors (primary, success, warning, error, agent, assistant, gold, etc.)
- **Icons**: 11 icon colors (default, active, agent, assistant, success, error, etc.)
- **Status**: 6 status colors (success, warning, error, info, available, unavailable)
- **Navigation**: 4 navigation colors (active, inactive, indicator, agent indicator)

#### Typography System
- **Font Families**: Sans-serif and monospace stacks
- **Font Sizes**: 11 sizes from xs (11px) to 6xl (48px)
- **Font Weights**: 4 weights (regular: 400, medium: 500, semibold: 600, bold: 700)
- **Line Heights**: 5 options (tight: 1.2, snug: 1.3, normal: 1.5, relaxed: 1.6, loose: 1.75)
- **Letter Spacing**: 5 options (tight, normal, wide, wider, widest)

#### Spacing System
- **Scale**: 13 spacing values from 0px to 80px (based on 4px grid)

#### Visual Design
- **Border Radius**: 7 values (none, sm: 4px, base: 6px, md: 8px, lg: 12px, xl: 16px, full: 9999px)
- **Shadows**: 7 shadow levels (none, sm, base, md, lg, xl, button, button-active)
- **Transitions**: 5 duration values + 5 easing functions
- **Z-Index**: 8 layer values (base: 0 to tooltip: 1600)

#### Component Specifications
- **Header**: Height (56px), padding
- **Navigation**: Height (64px), item height (48px), icon size (24px), indicator height (2px)
- **Button**: 5 height sizes (sm: 32px to xl: 56px), 4 padding sizes, border radius
- **Input**: 3 height sizes, padding, border radius, border width
- **Card**: Padding (16px), border radius (12px), border width (1px)
- **Avatar**: 4 sizes (sm: 32px to xl: 96px)
- **Icon**: 4 sizes (xs: 16px to lg: 32px)
- **Touch Target**: Minimum size (44px)

#### Layout System
- **Max Width**: 4 breakpoint sizes (sm: 320px to xl: 1024px)
- **Padding**: Screen padding (16px), section padding (24px)
- **Gap**: 4 gap sizes (tight: 4px to loose: 16px)

#### Animation System
- **Duration**: 5 speed options (instant: 100ms to slower: 500ms)
- **Scale**: Active (0.98), hover (1.02)
- **Opacity**: Disabled (0.4), muted (0.6), hover (0.8)

#### Accessibility
- **Focus Ring**: Width (2px), offset (2px), color (#0969DA)
- **Contrast**: Minimum (4.5:1), enhanced (7:1)

#### Utility Classes Included
- `mobile-tap-highlight`: Touch-friendly tap highlighting
- `mobile-no-select`: Prevent text selection
- `mobile-smooth-scroll`: Enable momentum scrolling
- `mobile-safe-area-*`: Safe area padding for notched devices
- `mobile-touch-target`: Minimum touch target size
- `mobile-gpu-accelerate`: GPU-accelerated animations
- `mobile-active-scale`: Active state scaling effect
- `mobile-hover-scale`: Hover state scaling effect
- Media query support for reduced motion and color scheme preferences

## Files Modified

### 2. `/tailwind.config.mobile.js`
Extended Tailwind configuration with design tokens:

- **Colors**: All mobile color tokens mapped to Tailwind color utilities
- **Border Radius**: All mobile radius tokens
- **Font Families**: Sans-serif and monospace stacks
- **Font Weights**: Regular, medium, semibold, bold
- **Letter Spacing**: All spacing options
- **Z-Index**: All layer values
- **Width/Height**: Component specification tokens
- **Max Width**: Breakpoint sizes
- **Gap**: Gap utilities
- **Transition Duration**: All duration values
- **Transition Timing Functions**: All easing functions
- **Scale**: Active and hover scale values
- **Opacity**: Disabled, muted, hover opacity values

### 3. `/src/styles.css`
Added import statement for mobile-tokens.css:
```css
@import "./styles/mobile-tokens.css";
```

## Usage Examples

### CSS Custom Properties (Direct Usage)
```css
.my-component {
  background-color: var(--mobile-bg-card);
  color: var(--mobile-text-primary);
  border: 1px solid var(--mobile-border-default);
  border-radius: var(--mobile-radius-lg);
  padding: var(--mobile-space-4);
  font-size: var(--mobile-font-size-md);
  font-weight: var(--mobile-font-weight-medium);
  transition: all var(--mobile-transition-base) var(--mobile-transition-ease-out);
}
```

### Tailwind Classes (Utility-First)
```jsx
<div className="bg-mobile-bg-card text-mobile-text-primary border border-mobile-border-default rounded-mobile-lg p-4">
  <h2 className="font-mobile-semibold text-mobile-font-size-xl">Title</h2>
  <button className="h-mobile-button-md bg-mobile-accent-primary hover:bg-mobile-accent-primary-hover rounded-mobile-md">
    Click Me
  </button>
</div>
```

### Component Examples
```jsx
// Header Component
<header className="h-mobile-header bg-mobile-bg-secondary border-b border-mobile-border-subtle">
  <div className="px-4 py-3">
    <h1 className="text-mobile-text-primary font-mobile-semibold">Header</h1>
  </div>
</header>

// Navigation Component
<nav className="h-mobile-nav bg-mobile-bg-card border-t border-mobile-border-default">
  <div className="flex items-center justify-around">
    {navItems.map((item) => (
      <button
        key={item.id}
        className="h-mobile-nav-item flex flex-col items-center gap-mobile-tight mobile-touch-target"
      >
        <Icon className="w-mobile-icon-base h-mobile-icon-base text-mobile-icon-default" />
        <span className="text-mobile-font-size-xs text-mobile-text-tertiary">
          {item.label}
        </span>
      </button>
    ))}
  </div>
</nav>

// Button Component
<button className="h-mobile-button-md px-6 bg-mobile-accent-primary text-mobile-text-primary rounded-mobile-md font-mobile-medium mobile-active-scale">
  Create App
</button>

// Card Component
<div className="bg-mobile-bg-card border border-mobile-border-card rounded-mobile-lg p-mobile-card-padding">
  <h3 className="text-mobile-text-primary font-mobile-semibold mb-2">Card Title</h3>
  <p className="text-mobile-text-secondary text-mobile-font-size-sm">Card content</p>
</div>

// Input Component
<input
  type="text"
  className="w-full h-mobile-input-base bg-mobile-bg-input border border-mobile-border-default rounded-mobile-input-radius px-3 text-mobile-text-primary placeholder:text-mobile-text-muted"
  placeholder="Enter text..."
/>
```

## Design System Consistency

The tokens ensure consistency across the mobile application by:

1. **Unified Color Palette**: All colors sourced from Replit-inspired design tokens
2. **Consistent Spacing**: 4px-based grid system for predictable layouts
3. **Typography Scale**: Harmonious font size progression
4. **Component Sizing**: Standardized component heights and touch targets
5. **Animation Timing**: Consistent transition durations and easing
6. **Accessibility**: Built-in focus ring and contrast ratios
7. **Mobile Optimization**: Safe area insets, touch targets, GPU acceleration

## Benefits

1. **Maintainability**: Single source of truth for design values
2. **Consistency**: Ensures visual cohesion across all mobile screens
3. **Flexibility**: Easy to adjust design system by modifying tokens
4. **Performance**: CSS custom properties are highly performant
5. **Developer Experience**: Clear naming convention and Tailwind integration
6. **Accessibility**: Built-in accessibility considerations
7. **Mobile-First**: Optimized for mobile with safe areas and touch targets

## Next Steps

The design tokens are now ready to be used throughout the mobile application. Components should migrate to using these tokens for consistent styling that matches the Replit-inspired design system.

### Recommended Component Updates
1. Update MobileLayout to use mobile navigation tokens
2. Update button components to use button specification tokens
3. Update input components to use input specification tokens
4. Update card components to use card specification tokens
5. Ensure all touch targets meet minimum size requirements
6. Apply safe area insets to header and navigation components
