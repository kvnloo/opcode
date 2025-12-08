# Replit Mobile UI Analysis - Pixel-Perfect Specifications

## Overview
This directory contains comprehensive UIED (UI Element Detection) analysis of 8 Replit mobile app screenshots, providing exact specifications for pixel-perfect recreation.

## Analysis Files

### Individual Screen Analyses
1. **01-apps-screen-analysis.md** - Apps/Home screen with app cards and navigation
2. **02-create-screen-analysis.md** - Create screen with project type selection
3. **03-account-screen-analysis.md** - Account/profile screen with settings
4. **04-agent-pane-analysis.md** - Workspace Agent chat interface
5. **05-console-pane-analysis.md** - Workspace Console pane with terminal
6. **06-preview-pane-analysis.md** - Workspace Preview pane with browser controls
7. **07-publishing-pane-analysis.md** - Publishing configuration screen
8. **08-share-pane-analysis.md** - Tools and files search interface

### Unified Design System
- **00-design-tokens.json** - Complete design token system with colors, typography, spacing, and component specifications

## What's Included in Each Analysis

Each screen analysis document contains:

### 1. Layout Structure
- Grid/flexbox layout specifications
- Container dimensions and positioning
- Safe area handling
- Scroll behavior

### 2. Color Palette
- Exact hex codes for all colors
- Background variations
- Text color hierarchy
- Accent and status colors
- Border colors

### 3. Typography
- Font families (system fonts + monospace)
- Font sizes (11px - 48px scale)
- Font weights (400, 500, 600, 700)
- Line heights
- Letter spacing

### 4. Spacing System
- Base 4px unit system
- Vertical rhythm (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- Horizontal padding
- Element gaps
- Section margins

### 5. Component Specifications
- Detailed component structure (JSX-like pseudo-code)
- Dimensions and measurements
- State variations (default, hover, active, disabled)
- Interactive behaviors
- Animation timing

### 6. Interactive States
- Hover effects
- Active/tap states
- Focus indicators
- Loading states
- Disabled states
- Transition timings

### 7. Accessibility
- Focus ring specifications
- Minimum touch targets (44x44px)
- Contrast ratios (WCAG AA/AAA)
- ARIA attributes
- Screen reader considerations
- Semantic HTML recommendations

## Design Token System (00-design-tokens.json)

### Color Categories
- **Backgrounds**: Primary (#0F1419), Secondary (#1E2835), Tertiary (#2D3748)
- **Text**: Primary white, Secondary gray variations
- **Accents**: Blue (#0969DA), Green (#2EA043), Purple (#8B5CF6), Cyan (#06B6D4)
- **Status**: Success, Warning, Error, Info colors
- **Borders**: Default, Subtle, Active, Focus states

### Typography Scale
- **Font Families**: System sans-serif, SF Mono monospace
- **Sizes**: xs (11px) → 6xl (48px)
- **Weights**: Regular (400) → Bold (700)
- **Line Heights**: Tight (1.2) → Loose (1.75)

### Spacing Scale
- **Base Unit**: 4px
- **Scale**: 0 (0px) → 20 (80px)
- **Semantic**: Screen padding, section spacing, element gaps

### Components
- **Button Heights**: sm (32px) → xl (56px)
- **Input Heights**: sm (32px) → md (44px)
- **Icon Sizes**: xs (16px) → lg (32px)
- **Avatar Sizes**: sm (32px) → xl (96px)
- **Touch Targets**: Minimum 44px

### Animations
- **Durations**: instant (100ms) → slower (500ms)
- **Easings**: ease, ease-in, ease-out, ease-in-out
- **Scales**: active (0.98), hover (1.02)

## Key UI Patterns

### Navigation
- **Bottom Tab Bar**: 64px height, 6 items, active indicators
- **Header**: 56px height, back button + title + actions

### Cards
- **Border Radius**: 12-16px
- **Padding**: 16-20px
- **Border**: 1px solid #2D3748
- **Background**: #1E2835

### Inputs
- **Height**: 40-44px
- **Padding**: 8-12px
- **Border**: 1px solid #2D3748
- **Focus**: Border color #0969DA

### Buttons
- **Primary**: #0969DA background, white text
- **Secondary**: Transparent background, border
- **Height**: 44-48px
- **Border Radius**: 8px

### Message Threads
- **Padding**: 16px
- **Gap**: 8-16px between messages
- **Collapsible sections**: Chevron indicators
- **Status indicators**: Icons with colors

## Color Usage Guidelines

### Background Hierarchy
1. **#0F1419**: App background, primary surface
2. **#1E2835**: Cards, elevated surfaces, inputs
3. **#2D3748**: Tertiary surfaces, borders, dividers

### Text Hierarchy
1. **#FFFFFF**: Primary text, headings, active items
2. **#E2E8F0**: Secondary text, body content
3. **#6E7681**: Tertiary text, placeholders, captions
4. **#4A5568**: Muted text, disabled states

### Accent Usage
- **#0969DA**: Primary actions, links, focus states
- **#2EA043**: Success, publishing, availability
- **#8B5CF6**: Agent features, special tools
- **#F59E0B**: Warnings, highlights, game elements

## Implementation Notes

### Responsive Behavior
- Mobile-first design (320px minimum)
- Touch-friendly targets (44x44px minimum)
- Safe area handling for iOS notches
- Horizontal padding: 16px standard

### Performance
- Use CSS transforms for animations (translate, scale)
- Avoid layout thrashing (batch reads/writes)
- Lazy load preview content
- Optimize icon rendering (SVG preferred)

### Accessibility
- 2px focus rings with 2px offset
- Color contrast: WCAG AA minimum (4.5:1)
- Semantic HTML with ARIA labels
- Keyboard navigation support
- Screen reader announcements

### Dark Theme
All specifications are for dark theme (primary theme in Replit mobile). Colors are optimized for OLED displays with true blacks.

## Usage

These specifications can be used to:
1. Build pixel-perfect React Native components
2. Create design system documentation
3. Generate Tailwind/CSS configuration
4. Validate existing implementations
5. Train design-to-code AI models

## Measurements

All measurements are in pixels (px) unless otherwise specified. Convert to rem/em as needed:
- Base: 16px = 1rem
- Example: 12px = 0.75rem, 24px = 1.5rem

## Next Steps

1. **Component Library**: Build reusable React Native components
2. **Theme Provider**: Implement design token system
3. **Storybook**: Create interactive component documentation
4. **Testing**: Visual regression testing for pixel accuracy
5. **Validation**: Compare with actual app using screenshot overlay

## Questions & Clarifications

For any ambiguous specifications:
1. Refer to design tokens first
2. Check similar patterns in other screens
3. Default to closest standard measurement
4. Prioritize accessibility requirements

---

**Analysis Date**: 2025-12-07
**Source**: Replit Mobile App Screenshots
**Purpose**: Pixel-perfect mobile UI recreation
