# Workspace Console Pane Analysis

## Screenshot Reference
File: Screenshot_20251207_124607_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Terminal/console interface with chat overlay
- **Background**: #0F1419 (dark theme)
- **Content**: Mixed chat interface with upgrade card

### Header Section

#### Top Bar
- **Height**: ~56px
- **Background**: #0F1419
- **Border bottom**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-between
- **Padding**: 12px 16px

##### Navigation Elements
- **Left**: Back/undo icon (24x24px, white)
- **Center**: Agent badge (purple dots icon + "Agent" text)
- **Right**: Comment/chat icon (24x24px, white), Menu dots (24x24px, white)

## Content Area

### Chat Message Thread

#### Agent Status Message
```
StatusMessage {
  padding: 12px 16px
  background: transparent
  margin-bottom: 8px

  Text {
    font-size: 14px
    line-height: 1.5
    color: #FFFFFF
  }
}
```
**Content**: "Task 1 is complete. Let me continue with the remaining tasks. I'll work on tasks 2 and 3 in parallel since they're both visual enhancements:"

#### Collapsible Task Section

##### Task Header (Collapsed)
```
TaskHeader {
  display: flex
  align-items: center
  padding: 12px 16px
  background: #1E2835
  border-radius: 12px
  border: 1px solid #2D3748
  margin: 8px 0
  cursor: pointer

  ExpandIcon {
    width: 20px
    height: 20px
    color: #6E7681
    transform: rotate(0deg) // expanded = rotate(-90deg)
    margin-right: 12px
  }

  Title {
    font-size: 14px
    color: #FFFFFF
    flex: 1
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

**Task Title**: "Make unit movement animations smooth"
**Progress**: "0 / 8"

##### Task Content (Expanded)
- **Background**: #1E2835
- **Border radius**: 12px
- **Padding**: 16px
- **Border**: 1px solid #2D3748

###### Task Details Card
```
TaskCard {
  padding: 16px
  background: transparent

  SubtaskHeader {
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 12px

    Icon {
      width: 16px
      height: 16px
      color: #6E7681
      animation: spin 1s linear infinite
    }

    Text {
      font-size: 13px
      color: #FFFFFF
    }
  }

  TaskDescription {
    padding: 12px
    background: #0F1419
    border-radius: 8px
    margin: 12px 0

    Label {
      font-size: 12px
      color: #6E7681
      text-transform: uppercase
      letter-spacing: 0.5px
      margin-bottom: 8px
    }

    Content {
      font-size: 14px
      line-height: 1.5
      color: #FFFFFF
    }
  }

  ShowMoreButton {
    display: flex
    align-items: center
    gap: 4px
    padding: 8px 0
    color: #6E7681
    font-size: 13px
    cursor: pointer

    Icon {
      width: 16px
      height: 16px
    }
  }
}
```

###### File Edit Indicator
```
FileEdit {
  display: flex
  align-items: center
  gap: 8px
  padding: 8px 12px
  background: #0F1419
  border-radius: 6px
  margin: 8px 0

  Icon {
    width: 16px
    height: 16px
    color: #6E7681
  }

  FilePath {
    font-size: 13px
    color: #FFFFFF
    font-family: "SF Mono", Monaco, Consolas, monospace
  }
}
```

**Example**: "Edited client/src/lib/stores/useHexConquest.ts"

###### Error Status Message
```
ErrorStatus {
  padding: 12px
  background: transparent
  margin: 8px 0

  Text {
    font-size: 14px
    color: #FFFFFF
  }
}
```

**Example**: "Agent encountered an error while running, we are investigating the issue."

#### Timestamp with Status
```
Timestamp {
  display: flex
  align-items: center
  gap: 8px
  padding: 8px 0
  margin: 12px 0

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

**Example**: "✓ 3 minutes ago"
**Content**: "Add smooth unit movement animations and floating damage numbers"

#### Action Buttons Row
```
ActionButtons {
  display: flex
  gap: 12px
  padding: 8px 0
  margin: 12px 0
  flex-wrap: wrap

  Button {
    display: flex
    align-items: center
    gap: 6px
    padding: 8px 12px
    background: #1E2835
    border: 1px solid #2D3748
    border-radius: 6px
    cursor: pointer
    transition: background 150ms

    &:active {
      background: #2D3748
    }

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

**Buttons**:
1. "Rollback here" (with rollback icon)
2. "Changes" (with code icon)
3. "View preview" (with eye icon)

#### Expandable Section
```
ExpandableSection {
  padding: 12px
  background: #1E2835
  border-radius: 8px
  margin: 8px 0
  cursor: pointer

  Header {
    display: flex
    align-items: center
    gap: 8px

    Icon {
      width: 16px
      height: 16px
      color: #6E7681
    }

    Text {
      font-size: 13px
      color: #FFFFFF
      flex: 1
    }

    ChevronIcon {
      width: 16px
      height: 16px
      color: #6E7681
    }
  }
}
```

**Example**: "⏱ Worked for 3 minutes"

### Upgrade Card (Promotional)

#### Container
```
UpgradeCard {
  padding: 20px
  background: #1E2835
  border: 2px solid #0969DA
  border-radius: 12px
  margin: 16px

  Header {
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 12px

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
    gap: 10px
    margin-bottom: 16px

    Feature {
      display: flex
      align-items: flex-start
      gap: 8px

      Icon {
        width: 18px
        height: 18px
        color: #0969DA
        flex-shrink: 0
        margin-top: 2px
      }

      Text {
        font-size: 14px
        line-height: 1.4
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
    transition: background 150ms

    &:active {
      background: #0860CA
    }

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

**Content**:
- **Title**: "Upgrade to Core"
- **Description**: "You've reached your Starter usage limit. Upgrade to Core to make, launch, and scale your apps."
- **Features**:
  - "💵 $25 Monthly credits for Replit Agent"
  - "🚀 Publish and host your apps"
  - "🤖 Access powerful models and more"
- **CTA**: "Upgrade now" button

## Bottom Navigation Bar

### Container
- **Height**: ~64px
- **Background**: #0F1419
- **Border top**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-evenly
- **Padding**: 8px 16px

### Navigation Items (6 total)
```
NavItem {
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  flex: 1
  min-width: 48px
  cursor: pointer

  Icon {
    width: 24px
    height: 24px
    margin-bottom: 4px
  }

  &.inactive {
    Icon {
      color: #6E7681
    }
  }

  &.active {
    Icon {
      color: #8B5CF6
    }

    Indicator {
      width: 32px
      height: 2px
      background: #8B5CF6
      border-radius: 1px
      margin-top: 4px
    }
  }
}
```

**Items** (left to right):
1. File/folder icon
2. Monitor/screen icon
3. **Agent icon (purple dots, active)**
4. Upload/share icon
5. Git branch icon
6. Panels/layout icon

**Active indicator**: Purple line under Agent icon

## Color Palette

### Backgrounds
- Primary: #0F1419
- Card/elevated: #1E2835
- Tertiary: #2D3748
- Input: #0F1419

### Text
- Primary: #FFFFFF
- Secondary: #6E7681
- Tertiary: #4A5568

### Accents
- Primary blue: #0969DA
- Agent purple: #8B5CF6
- Success green: #2EA043
- Warning: #D29922
- Error: #DA3633

### Borders
- Default: #2D3748
- Active: #0969DA
- Subtle: #1E2835

## Typography

### Font Sizes
- Title: 16px
- Body: 14px
- Small: 13px
- Caption: 12px

### Font Weights
- Medium: 500
- Regular: 400

### Line Heights
- Tight: 1.3
- Normal: 1.5

### Font Families
- Body: System font
- Code: "SF Mono", Monaco, Consolas, monospace

## Spacing

### Vertical Rhythm
- Message spacing: 8-12px
- Section spacing: 16px
- Card padding: 16-20px

### Horizontal Padding
- Screen: 16px
- Card: 16-20px
- Inline elements: 8-12px

### Gaps
- Icon-to-text: 8px
- Button spacing: 12px
- Feature list: 10px

## Interactive States

### Buttons
- **Hover**: Brightness +5%
- **Active**: Background #2D3748, scale 0.98
- **Transition**: 150ms ease

### Expandable Sections
- **Collapsed**: Chevron points right
- **Expanded**: Chevron points down
- **Animation**: 200ms ease-in-out

### Task Loading States
- **Spinner**: Rotating icon
- **Duration**: 1s linear infinite

## Accessibility

### Focus Indicators
- **Color**: #0969DA
- **Width**: 2px
- **Offset**: 2px

### Touch Targets
- **Minimum**: 44x44px
- Buttons: 40-44px height
- Nav items: 64px height

### ARIA Labels
- Expandable sections: aria-expanded
- Buttons: Descriptive labels
- Status indicators: Proper roles
