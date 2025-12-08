# Apps/Home Screen Analysis

## Screenshot Reference
File: Screenshot_20251207_124526_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Vertical scroll layout with fixed bottom navigation
- **Background**: Dark theme (#0F1419 / #1C2333)
- **Safe areas**: Standard mobile padding (16px horizontal)

### Header Section
- **Height**: ~56px
- **Background**: Same as body background
- **Layout**: Horizontal flex
- **Elements**:
  - Left: Back button icon (24x24px)
  - Center: "Apps" title (white, 20px, medium weight)
  - Right: No action button in this view

### "All Apps" Section
- **Height**: ~72px
- **Background**: Slightly lighter than body (#1E2835)
- **Border radius**: 12px
- **Padding**: 16px horizontal, 20px vertical
- **Layout**: Horizontal space-between
  - Left: Folder icon (20x20px) + "All Apps" text (16px, white)
  - Right: Chevron right icon (20x20px, #6E7681)

## App Cards

### Card Container
- **Margin**: 16px between cards
- **Border radius**: 16px
- **Background**: #1E2835 (card background)
- **Padding**: 16px
- **Border**: 1px solid #2D3748 (subtle)

### Card Header
- **Layout**: Horizontal flex, space-between
- **Elements**:
  - Left: App title (18px, white, medium weight)
  - Right: Three-dot menu icon (20x20px)

### Card Preview Section
- **Aspect ratio**: ~16:9
- **Background**: #0F1419
- **Border radius**: 8px
- **Margin**: 12px 0
- **Content**: Embedded preview or placeholder
  - "Waiting for you" text (14px, #6E7681)
  - Screenshot/preview image

### Card Footer
- **Layout**: Horizontal flex, left-aligned
- **Elements**:
  - Globe icon (16x16px)
  - "Public" text (14px, white)
  - Spacing: 8px gap between icon and text

### App Metadata
- **Username**: (14px, #6E7681)
- **Position**: Below app title
- **Margin**: 4px top

## Bottom Navigation

### Container
- **Height**: ~80px (includes safe area)
- **Background**: #0F1419
- **Border top**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-evenly

### Navigation Items (3 total)
1. **Apps** (active)
2. **Create**
3. **Account**

### Item Structure
- **Size**: ~60px width
- **Spacing**: Even distribution
- **Elements**:
  - Icon (24x24px)
  - Label (12px)
  - Gap: 4px between icon and text

### Active State
- **Icon color**: White (#FFFFFF)
- **Text color**: White (#FFFFFF)
- **Indicator**: Optional bottom border (2px, blue #0969DA)

### Inactive State
- **Icon color**: #6E7681
- **Text color**: #6E7681

## Color Palette

### Backgrounds
- Primary background: #0F1419
- Card background: #1E2835
- Border color: #2D3748
- Overlay/Modal: #0F1419E6 (90% opacity)

### Text Colors
- Primary text: #FFFFFF
- Secondary text: #6E7681
- Tertiary text: #4A5568

### Accent Colors
- Primary blue: #0969DA
- Success green: #2EA043
- Warning yellow: #D29922
- Error red: #DA3633

### Interactive States
- Hover: Lighten by 10%
- Active: #0969DA
- Disabled: #4A5568

## Typography

### Font Family
- Primary: System font (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Monospace: "SF Mono", Monaco, Consolas

### Font Sizes
- Large title: 24px
- Title: 20px
- Headline: 18px
- Body: 16px
- Subheadline: 14px
- Caption: 12px

### Font Weights
- Bold: 600
- Medium: 500
- Regular: 400

### Line Heights
- Tight: 1.2
- Normal: 1.5
- Relaxed: 1.75

## Spacing System

### Base Unit: 4px

### Scale
- 4px (1x)
- 8px (2x)
- 12px (3x)
- 16px (4x) - Standard padding
- 20px (5x)
- 24px (6x)
- 32px (8x)
- 48px (12x)

## Component Specifications

### App Card Component
```
AppCard {
  width: 100%
  background: #1E2835
  border-radius: 16px
  padding: 16px
  border: 1px solid #2D3748

  Header {
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 12px

    Title {
      font-size: 18px
      font-weight: 500
      color: #FFFFFF
    }

    MenuButton {
      width: 20px
      height: 20px
      color: #6E7681
    }
  }

  Preview {
    aspect-ratio: 16/9
    background: #0F1419
    border-radius: 8px
    margin: 12px 0

    Placeholder {
      font-size: 14px
      color: #6E7681
      text-align: center
    }
  }

  Footer {
    display: flex
    align-items: center
    gap: 8px

    Icon {
      width: 16px
      height: 16px
      color: #6E7681
    }

    Text {
      font-size: 14px
      color: #FFFFFF
    }
  }
}
```

## Interactive Elements

### Touch Targets
- Minimum size: 44x44px
- Cards: Full card tappable
- Icons: 44x44px touch area (even if icon is smaller)

### Gestures
- Tap: Navigate to app
- Long press: Show context menu
- Swipe: Scroll list

### Animations
- Card tap: Scale 0.98, duration 150ms
- Navigation: Slide transition 300ms
- Loading: Skeleton shimmer

## Accessibility

### Contrast Ratios
- White on dark background: 21:1 (WCAG AAA)
- Secondary text: 7:1 (WCAG AA)
- Border contrast: 3:1

### Semantic HTML
- Cards: `<article>` or `<div role="article">`
- Navigation: `<nav>` with proper ARIA labels
- Buttons: Proper `<button>` elements with labels

### Screen Reader
- Card announces: "App name, username, public, button"
- Navigation items: "Apps, selected" or "Create, button"
