# Workspace Preview Pane Analysis

## Screenshot Reference
File: Screenshot_20251207_125036_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Web preview/iframe container with browser controls
- **Background**: #1C2A3A (dark blue-gray)
- **Content**: Full-screen preview area

### Header Section

#### Top Bar
- **Height**: ~56px
- **Background**: #0F1419
- **Border bottom**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-between
- **Padding**: 12px 16px

##### Left Section
- **Back button**: Arrow left icon (24x24px, white)
- **Margin right**: 12px

##### Center Section
- **Publish button**:
  - Icon: Upload/rocket icon (20x20px, #2EA043)
  - Text: "Publish" (14px, white)
  - Gap: 6px
  - Background: Transparent
  - Padding: 6px 12px

- **Preview button** (active):
  - Icon: Monitor icon (20x20px, white)
  - Text: "Preview" (14px, white)
  - Gap: 6px
  - Background: #2D3748
  - Padding: 6px 12px
  - Border radius: 6px

##### Right Section
- **Copy/share button**: Duplicate icon (24x24px, white)
- **Menu button**: Three dots (24x24px, white)
- **Gap**: 12px

### Browser Controls Bar

#### Container
- **Height**: ~48px
- **Background**: #1E2835
- **Border bottom**: 1px solid #2D3748
- **Layout**: Horizontal flex
- **Padding**: 8px 12px

#### Navigation Controls (Left)
```
BrowserControls {
  display: flex
  align-items: center
  gap: 12px

  BackButton {
    width: 32px
    height: 32px
    border-radius: 6px
    background: transparent
    display: flex
    align-items: center
    justify-content: center

    Icon {
      width: 20px
      height: 20px
      color: #6E7681
    }
  }

  ForwardButton {
    width: 32px
    height: 32px
    border-radius: 6px
    background: transparent
    display: flex
    align-items: center
    justify-content: center

    Icon {
      width: 20px
      height: 20px
      color: #6E7681
    }
  }

  RefreshButton {
    width: 32px
    height: 32px
    border-radius: 6px
    background: transparent
    display: flex
    align-items: center
    justify-content: center

    Icon {
      width: 20px
      height: 20px
      color: #FFFFFF
    }
  }
}
```

#### URL Bar
```
URLBar {
  flex: 1
  height: 32px
  background: #0F1419
  border: 1px solid #2D3748
  border-radius: 6px
  padding: 0 12px
  display: flex
  align-items: center
  margin: 0 12px

  Input {
    flex: 1
    background: transparent
    border: none
    font-size: 13px
    color: #FFFFFF

    &::placeholder {
      color: #6E7681
    }
  }
}
```

**URL Content**: "/" (root path)

#### Right Actions
```
BrowserActions {
  display: flex
  align-items: center
  gap: 12px

  GoButton {
    width: 32px
    height: 32px
    border-radius: 6px
    background: transparent
    display: flex
    align-items: center
    justify-content: center

    Icon {
      width: 20px
      height: 20px
      color: #FFFFFF
    }
  }

  ExternalButton {
    display: flex
    align-items: center
    gap: 4px
    padding: 6px 12px
    background: #2D3748
    border-radius: 6px
    cursor: pointer

    Icon {
      width: 16px
      height: 16px
      color: #FFFFFF
    }

    Text {
      font-size: 13px
      color: #FFFFFF
    }
  }
}
```

**Button**: "Open in browser" with external link icon

## Preview Content Area

### Container
- **Background**: #1C2A3A (app background color)
- **Position**: Full available height below browser controls
- **Padding**: None (full bleed)

### App Content (Hex Conquest Game)

#### Game Title Area
```
GameHeader {
  padding: 48px 24px
  text-align: center

  Title {
    font-size: 48px
    font-weight: 700
    color: #F59E0B (orange/gold)
    margin-bottom: 16px
    font-family: System font
  }

  Subtitle {
    font-size: 16px
    color: #94A3B8 (gray)
    font-weight: 400
  }
}
```

**Title**: "Hex Conquest"
**Subtitle**: "A Turn-Based Strategy Game"

#### Info Card
```
InfoCard {
  max-width: 560px
  margin: 0 auto
  padding: 32px 24px
  background: #1E293B (dark blue)
  border-radius: 12px
  border: 1px solid #334155

  CardHeader {
    font-size: 20px
    font-weight: 600
    color: #FFFFFF
    margin-bottom: 20px
    text-align: center
  }

  InstructionList {
    display: flex
    flex-direction: column
    gap: 12px

    Item {
      font-size: 14px
      line-height: 1.6
      color: #E2E8F0
      padding-left: 0
    }
  }
}
```

**Card Title**: "How to Play"

**Instructions**:
1. "Build cities with your Settler unit"
2. "Research technologies to unlock new units and buildings"
3. "Expand your empire and defeat the AI opponent"
4. "Win by capturing all enemy cities or having the most cities after 50 turns"

#### CTA Button
```
StartButton {
  width: 280px
  height: 56px
  margin: 32px auto 0
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%)
  border-radius: 8px
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3)
  transition: all 200ms

  &:active {
    transform: scale(0.98)
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4)
  }

  Text {
    font-size: 18px
    font-weight: 600
    color: #FFFFFF
  }
}
```

**Button Text**: "Start Game"

#### Controls Footer
```
ControlsText {
  margin-top: 24px
  padding: 16px 24px
  text-align: center
  font-size: 12px
  color: #64748B (muted gray)
}
```

**Text**: "Controls: Click to select | Drag to pan | Scroll to zoom"

## Bottom Navigation Bar

### Container
- **Height**: ~64px
- **Background**: #0F1419
- **Border top**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-evenly

### Navigation Items (6 total)
1. File/folder icon
2. **Monitor/screen icon (active, white)**
3. Agent icon (purple dots)
4. Upload icon
5. Git icon
6. Panels icon

### Active State
- **Icon color**: #FFFFFF
- **Indicator**: 2px line below icon (#FFFFFF)
- **Inactive color**: #6E7681

## Color Palette

### Replit UI Colors
- **Header background**: #0F1419
- **Control bar**: #1E2835
- **Border**: #2D3748
- **Text primary**: #FFFFFF
- **Text secondary**: #6E7681
- **Active accent**: #2EA043 (Publish green)

### App Preview Colors (Hex Conquest)
- **Background**: #1C2A3A (dark blue-gray)
- **Card background**: #1E293B (darker blue)
- **Border**: #334155
- **Title**: #F59E0B (orange/gold)
- **Subtitle**: #94A3B8 (gray)
- **Body text**: #E2E8F0 (light gray)
- **Muted text**: #64748B
- **Button gradient**: #F59E0B → #D97706

## Typography

### Replit UI
- **Body**: 14px, regular
- **Small**: 13px, regular
- **Button**: 14px, medium

### App Preview (Hex Conquest)
- **Game title**: 48px, bold
- **Subtitle**: 16px, regular
- **Card title**: 20px, semibold
- **Instructions**: 14px, regular
- **Button**: 18px, semibold
- **Footer**: 12px, regular

## Spacing

### Replit UI
- **Header padding**: 12px 16px
- **Control bar padding**: 8px 12px
- **Element gaps**: 12px

### App Preview
- **Header padding**: 48px 24px
- **Card padding**: 32px 24px
- **List item spacing**: 12px
- **Button margin top**: 32px

## Component Specifications

### Browser Control Button
```
ControlButton {
  width: 32px
  height: 32px
  background: transparent
  border-radius: 6px
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer
  transition: background 150ms

  &:active {
    background: #2D3748
  }

  Icon {
    width: 20px
    height: 20px
    color: #FFFFFF (enabled) / #6E7681 (disabled)
  }
}
```

### URL Input
```
URLInput {
  flex: 1
  height: 32px
  background: #0F1419
  border: 1px solid #2D3748
  border-radius: 6px
  padding: 0 12px
  font-size: 13px
  color: #FFFFFF

  &:focus {
    outline: none
    border-color: #0969DA
  }
}
```

### Preview Container
```
PreviewContainer {
  flex: 1
  background: #1C2A3A
  overflow: auto
  -webkit-overflow-scrolling: touch

  iframe {
    width: 100%
    height: 100%
    border: none
  }
}
```

## Interactive States

### Browser Controls
- **Disabled**: Opacity 0.4, not clickable
- **Enabled**: Full opacity, clickable
- **Active**: Background #2D3748

### Start Game Button
- **Hover**: Slight brightness increase
- **Active**: Scale 0.98, shadow adjustment
- **Transition**: 200ms ease

## Accessibility

### Focus Indicators
- **Color**: #0969DA
- **Width**: 2px
- **Offset**: 2px

### Touch Targets
- **Control buttons**: 32x32px (with 44x44px touch area)
- **Start button**: 280x56px
- **Nav items**: 64px height

### Screen Reader
- Browser controls: "Back", "Forward", "Refresh", "Go"
- URL bar: "Enter URL or path"
- Preview: "Preview iframe" with title
