# Workspace Agent Pane Analysis

## Screenshot Reference
File: Screenshot_20251207_124556_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Chat/conversation interface with fixed header and footer
- **Background**: #0F1419
- **Content**: Scrollable message area

### Header Section

#### Top Bar
- **Height**: ~56px
- **Background**: #0F1419
- **Border bottom**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-between
- **Padding**: 12px 16px

##### Left Section
- **Back button**: X icon (24x24px, white)
- **Position**: Left aligned

##### Center Section
- **Project title**: "Hex Conquest" (18px, white, medium weight)
- **Position**: Center aligned

##### Right Section
- **Menu button**: Three dots (24x24px, white)
- **Position**: Right aligned

#### Agent Indicator
- **Position**: Below top bar, centered
- **Height**: 48px
- **Padding**: 12px 16px
- **Layout**: Horizontal flex, centered
- **Background**: Transparent

##### Agent Badge
- **Icon**: Grid of purple dots (24x24px, #8B5CF6)
- **Text**: "Agent" (14px, white)
- **Gap**: 8px between icon and text
- **Background**: Transparent

## Message Area

### Message Thread Container
- **Padding**: 16px
- **Gap**: 16px between messages
- **Background**: #0F1419

### Message Types

#### 1. Task Header Message
```
TaskHeader {
  display: flex
  align-items: flex-start
  padding: 12px 16px
  background: #1E2835
  border-radius: 12px
  border-left: 3px solid #6E7681

  ExpandIcon {
    width: 20px
    height: 20px
    color: #6E7681
    transform: rotate(-90deg) // collapsed state
  }

  Title {
    font-size: 14px
    color: #FFFFFF
    flex: 1
    margin-left: 12px
  }

  Progress {
    font-size: 12px
    color: #6E7681
    margin-right: 8px
  }

  StatusIcon {
    width: 20px
    height: 20px
    color: #6E7681
  }
}
```

#### 2. Agent Text Message
```
AgentMessage {
  padding: 12px 16px
  background: transparent

  Text {
    font-size: 14px
    line-height: 1.5
    color: #FFFFFF
  }
}
```

#### 3. Task Detail Card
```
TaskCard {
  padding: 16px
  background: #1E2835
  border-radius: 12px
  border: 1px solid #2D3748
  margin: 8px 0

  Header {
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 12px

    Icon {
      width: 16px
      height: 16px
      color: #6E7681
    }

    Label {
      font-size: 12px
      color: #6E7681
      text-transform: uppercase
      letter-spacing: 0.5px
    }

    ExpandIcon {
      width: 16px
      height: 16px
      color: #6E7681
      margin-left: auto
    }
  }

  Content {
    font-size: 14px
    line-height: 1.5
    color: #FFFFFF
  }

  ShowMore {
    display: flex
    align-items: center
    gap: 4px
    color: #6E7681
    font-size: 13px
    margin-top: 8px
    cursor: pointer

    Icon {
      width: 16px
      height: 16px
    }
  }
}
```

#### 4. File Edit Indicator
```
FileEdit {
  display: flex
  align-items: center
  gap: 8px
  padding: 8px 12px
  background: #1E2835
  border-radius: 6px
  border-left: 3px solid #2EA043
  margin: 8px 0

  Icon {
    width: 16px
    height: 16px
    color: #2EA043
  }

  Text {
    font-size: 13px
    color: #FFFFFF
    font-family: monospace
  }
}
```

#### 5. Status Update Message
```
StatusMessage {
  padding: 12px 16px
  background: transparent

  Text {
    font-size: 14px
    color: #FFFFFF
  }
}
```

#### 6. Timestamp Message
```
Timestamp {
  display: flex
  align-items: center
  gap: 8px
  padding: 8px 0

  Icon {
    width: 16px
    height: 16px
    color: #2EA043
  }

  Text {
    font-size: 12px
    color: #6E7681
  }
}
```

#### 7. Action Button Row
```
ActionRow {
  display: flex
  gap: 12px
  padding: 8px 0

  Button {
    display: flex
    align-items: center
    gap: 6px
    padding: 8px 12px
    background: #1E2835
    border: 1px solid #2D3748
    border-radius: 6px
    cursor: pointer

    Icon {
      width: 16px
      height: 16px
      color: #6E7681
    }

    Text {
      font-size: 13px
      color: #FFFFFF
    }
  }
}
```

#### 8. Upgrade Card (Promotional)
```
UpgradeCard {
  padding: 20px
  background: #1E2835
  border: 2px solid #0969DA
  border-radius: 12px
  margin: 16px 0

  Header {
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 16px

    Icon {
      width: 24px
      height: 24px
      color: #FFFFFF
    }

    Title {
      font-size: 16px
      font-weight: 500
      color: #FFFFFF
    }
  }

  Description {
    font-size: 14px
    line-height: 1.5
    color: #FFFFFF
    margin-bottom: 16px
  }

  FeatureList {
    display: flex
    flex-direction: column
    gap: 12px
    margin-bottom: 16px

    Feature {
      display: flex
      align-items: flex-start
      gap: 8px

      Icon {
        width: 20px
        height: 20px
        color: #0969DA
        flex-shrink: 0
      }

      Text {
        font-size: 14px
        color: #FFFFFF
      }
    }
  }

  CTAButton {
    width: 100%
    padding: 12px 20px
    background: #0969DA
    border-radius: 8px
    display: flex
    align-items: center
    justify-content: center
    gap: 8px
    cursor: pointer

    Icon {
      width: 20px
      height: 20px
      color: #FFFFFF
    }

    Text {
      font-size: 14px
      font-weight: 500
      color: #FFFFFF
    }
  }
}
```

### Sidebar Tools Panel

#### Container
- **Width**: 48px
- **Position**: Fixed left edge
- **Background**: #0F1419
- **Border right**: 1px solid #2D3748

#### Tool Icons (Vertical Stack)
- **Size**: 24x24px each
- **Padding**: 12px vertical between icons
- **Color**: #6E7681 (inactive), #FFFFFF (active)

##### Tools List
1. Settings gear (top)
2. Refresh/sync
3. Separator line (#2D3748, 1px, 32px wide)
4. Search icon
5. Database icon
6. Auth/user icon
7. Plus/add icon

## Bottom Search Bar

### Container
- **Height**: 64px
- **Background**: #0F1419
- **Border top**: 1px solid #2D3748
- **Padding**: 12px 16px
- **Layout**: Horizontal flex

### Search Input
- **Background**: #1E2835
- **Border**: 1px solid #2D3748
- **Border radius**: 8px
- **Height**: 40px
- **Padding**: 8px 12px
- **Flex**: 1 (takes available space)

#### Input Elements
- **Folder icon**: Left (20x20px, #6E7681)
- **Placeholder**: "Search..." (14px, #6E7681)
- **Search icon**: Right (20x20px, #6E7681)

### Close Button
- **Size**: 40x40px
- **Background**: Transparent
- **Border**: 1px solid #2D3748
- **Border radius**: 8px
- **Icon**: X (20x20px, white)
- **Position**: Right of search input (12px gap)

## Color Palette

### Backgrounds
- Primary: #0F1419
- Card/Message: #1E2835
- Elevated: #2D3748

### Text
- Primary: #FFFFFF
- Secondary: #6E7681
- Success: #2EA043

### Accents
- Primary blue: #0969DA
- Agent purple: #8B5CF6
- Success green: #2EA043
- Border: #2D3748

### Status Colors
- Success: #2EA043
- Warning: #D29922
- Error: #DA3633
- Info: #0969DA

## Typography

### Font Sizes
- Title: 18px
- Body: 14px
- Small: 13px
- Caption: 12px
- Tiny: 11px

### Font Weights
- Medium: 500
- Regular: 400

### Line Heights
- Tight: 1.3
- Normal: 1.5
- Relaxed: 1.6

### Monospace
- Code/file paths: "SF Mono", Monaco, Consolas

## Spacing

### Message Spacing
- Between messages: 16px
- Card padding: 16px
- Inline elements: 8px
- Icon gaps: 4-8px

### Container Padding
- Screen horizontal: 16px
- Card padding: 16-20px
- Input padding: 8-12px

## Component Specifications

### Collapsible Task Component
- **Collapsed state**: Shows title and progress only
- **Expanded state**: Shows full content
- **Animation**: 200ms ease-in-out
- **Indicator**: Chevron rotation

### Action Buttons
- **Touch target**: 44x44px minimum
- **Ripple effect**: On tap
- **Disabled state**: Opacity 0.4

## Accessibility

### Focus Indicators
- **Color**: #0969DA
- **Width**: 2px
- **Offset**: 2px

### Screen Reader
- Messages: Read in chronological order
- Status updates: Announced as "Agent status: ..."
- Buttons: Proper labels ("View changes", "Rollback")

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate
- Escape to close modals
