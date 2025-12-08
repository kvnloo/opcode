# Create Screen Analysis

## Screenshot Reference
File: Screenshot_20251207_124540_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Centered vertical layout with fixed bottom navigation
- **Background**: #0F1419 (dark theme)
- **Content**: Center-aligned with max-width constraint

### Header Section
- **Height**: ~56px
- **Background**: Transparent
- **Elements**:
  - Left: Workspace indicator bubble (48x48px, #2D3748)
    - Text: "VE" (16px, white, centered)
    - Adjacent: "veeman961's workspace" (14px, #6E7681)
  - Right: Three-dot menu (24x24px)

## Main Content Area

### Welcome Message
- **Layout**: Center-aligned, vertical stack
- **Spacing**: 32px from top
- **Elements**:
  - Greeting: "Hi veeman961," (18px, #FFFFFF)
  - Question: "what do you want to make?" (18px, #FFFFFF)
  - Line height: 1.5
  - Gap between lines: 4px

### Mode Selector Tabs
- **Position**: Below welcome message (24px gap)
- **Layout**: Horizontal flex, left-aligned
- **Background**: Transparent
- **Gap**: 12px between tabs

#### Tab Structure (Build/Design)
```
Tab {
  padding: 12px 20px
  border-radius: 8px
  background: #1E2835 (inactive) / #0969DA (active)
  border: 1px solid #2D3748 (inactive) / transparent (active)

  Icon {
    width: 20px
    height: 20px
    margin-right: 8px
  }

  Text {
    font-size: 14px
    font-weight: 500
    color: #6E7681 (inactive) / #FFFFFF (active)
  }

  Beta Badge {
    background: #0969DA
    color: #FFFFFF
    font-size: 11px
    padding: 2px 6px
    border-radius: 4px
    margin-left: 8px
  }
}
```

### Input Area

#### Text Input Field
- **Width**: Full width minus padding (32px total horizontal padding)
- **Height**: ~280px (multiline textarea)
- **Background**: #1E2835
- **Border**: 1px solid #2D3748
- **Border radius**: 12px
- **Padding**: 16px
- **Placeholder**: "Describe the idea you want to build..." (14px, #6E7681)

#### Recent Project Chip (within input)
- **Position**: Bottom left of input area
- **Layout**: Horizontal flex
- **Background**: #0F1419
- **Border**: 1px solid #2D3748
- **Border radius**: 8px
- **Padding**: 8px 12px
- **Elements**:
  - Terminal icon (16x16px)
  - Text: "setup-opcode-mobile_17..." (12px, #FFFFFF, truncated)
  - Close button (16x16px, #6E7681)

#### Input Actions Bar
- **Position**: Below text input (12px gap)
- **Layout**: Horizontal flex, space-between
- **Height**: 44px

##### Left Actions
- Attachment icon (24x24px, #6E7681)
- Microphone icon (24x24px, #6E7681)
- Gap: 16px

##### Right Actions
- Magic wand icon (24x24px, #6E7681, disabled state)
- "Creating App..." button
  - Background: #0969DA
  - Color: #FFFFFF
  - Padding: 10px 20px
  - Border radius: 8px
  - Font size: 14px
  - Font weight: 500
  - Has loading spinner (16x16px)

### Project Type Selector

#### Container
- **Position**: Below input area (20px gap)
- **Layout**: Horizontal scroll/flex
- **Gap**: 12px between items

#### Type Options
1. **Web app**
2. **Mobile app** (selected)
3. **Data app**
4. **3D Game**
5. More (indicated by right arrow)

#### Type Button Structure
```
TypeButton {
  padding: 12px 20px
  border-radius: 8px
  border: 2px solid #2D3748 (inactive) / #0969DA (active)
  background: transparent (inactive) / transparent (active)

  Icon {
    width: 20px
    height: 20px
    margin-right: 8px
  }

  Text {
    font-size: 14px
    font-weight: 500
    color: #6E7681 (inactive) / #FFFFFF (active)
  }

  Beta Badge {
    background: #0969DA
    color: #FFFFFF
    font-size: 11px
    padding: 2px 6px
    border-radius: 4px
    margin-left: 8px
  }
}
```

### Help Text
- **Position**: Below type selector (16px gap)
- **Color**: #6E7681
- **Font size**: 12px
- **Text**: "Native apps for iPhones and Android phones. Built with React Native (Expo)."

### Bottom CTA Section
- **Position**: Bottom of screen, above navigation
- **Padding**: 24px
- **Layout**: Center-aligned

#### CTA Text
- "Start creating for free" (14px, #6E7681)
- Link: "Join Replit Core" (14px, #0969DA, underlined)
- Gap: 4px

## Bottom Navigation

### Container
- **Height**: ~80px (includes safe area)
- **Background**: #0F1419
- **Border top**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-evenly

### Navigation Items
1. Apps (folder icon)
2. **Create (plus icon, active)**
3. Account (user icon)

### Active State
- **Icon color**: #FFFFFF
- **Text color**: #FFFFFF
- **Bottom indicator**: 2px line, #0969DA

## Color Palette

### Backgrounds
- Primary: #0F1419
- Secondary: #1E2835
- Tertiary: #2D3748
- Overlay: #0F1419E6

### Text
- Primary: #FFFFFF
- Secondary: #6E7681
- Tertiary: #4A5568
- Link: #0969DA

### Accents
- Primary blue: #0969DA
- Success green: #2EA043
- Warning: #D29922

### Borders
- Default: #2D3748
- Active: #0969DA
- Subtle: #1E2835

## Typography

### Font Sizes
- Greeting: 18px
- Body: 14px
- Small: 12px
- Caption: 11px

### Font Weights
- Medium: 500
- Regular: 400

### Line Heights
- Tight: 1.3
- Normal: 1.5

## Spacing

### Gaps
- Section spacing: 24px
- Element spacing: 12-16px
- Inline spacing: 8px
- Tight spacing: 4px

### Padding
- Screen: 16px horizontal
- Input: 16px
- Button: 10-12px vertical, 20px horizontal
- Tab: 12px vertical, 20px horizontal

## Component Specifications

### Mode Tab Component
```
ModeTab {
  display: flex
  align-items: center
  gap: 8px
  padding: 12px 20px
  border-radius: 8px
  cursor: pointer
  transition: all 150ms

  &.inactive {
    background: #1E2835
    border: 1px solid #2D3748
    color: #6E7681
  }

  &.active {
    background: #0969DA
    border: 1px solid transparent
    color: #FFFFFF
  }

  Icon {
    width: 20px
    height: 20px
  }

  Text {
    font-size: 14px
    font-weight: 500
  }

  Badge {
    background: #0969DA (or lighter variant)
    color: #FFFFFF
    font-size: 11px
    padding: 2px 6px
    border-radius: 4px
    margin-left: 8px
  }
}
```

### Project Type Button
```
ProjectTypeButton {
  display: flex
  align-items: center
  gap: 8px
  padding: 12px 20px
  border-radius: 8px
  cursor: pointer
  transition: all 150ms

  &.inactive {
    background: transparent
    border: 2px solid #2D3748
    color: #6E7681
  }

  &.active {
    background: transparent
    border: 2px solid #0969DA
    color: #FFFFFF
  }

  Icon {
    width: 20px
    height: 20px
  }

  Text {
    font-size: 14px
    font-weight: 500
  }
}
```

## Interactive States

### Input Field
- **Focus**: Border color changes to #0969DA
- **Error**: Border color #DA3633
- **Disabled**: Background #1E2835, opacity 0.5

### Buttons
- **Hover**: Brightness +10%
- **Active**: Scale 0.98
- **Loading**: Show spinner, disable interaction

### Tabs
- **Transition**: 150ms ease-in-out
- **Hover**: Brightness +5%

## Accessibility

### Focus Indicators
- 2px solid outline, color #0969DA
- Offset: 2px

### Touch Targets
- Minimum: 44x44px
- Buttons: 44px height minimum

### ARIA Labels
- Tabs: role="tab", aria-selected
- Input: aria-label="Describe your idea"
- Type buttons: role="radio", aria-checked
