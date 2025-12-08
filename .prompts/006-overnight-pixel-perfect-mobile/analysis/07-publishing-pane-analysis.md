# Workspace Publishing Pane Analysis

## Screenshot Reference
File: Screenshot_20251207_125042_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Vertical scroll form layout
- **Background**: #0F1419
- **Content**: Publishing configuration screen

### Header Section

#### Top Bar
- **Height**: ~56px
- **Background**: #0F1419
- **Border bottom**: 1px solid #2D3748
- **Layout**: Horizontal flex, space-between
- **Padding**: 12px 16px

##### Left Section
- **Back button**: Arrow left icon (24x24px, white)

##### Center Section
- **Publishing badge**:
  - Icon: Rocket/upload icon (20x20px, #2EA043)
  - Text: "Publishing" (16px, white)
  - Gap: 8px
  - Layout: Horizontal flex, centered

##### Right Section
- **Menu button**: Three dots (24x24px, white)

### Content Area

#### Page Title
```
PageTitle {
  padding: 24px 16px 16px

  Text {
    font-size: 24px
    font-weight: 600
    color: #FFFFFF
  }
}
```

**Title**: "Publish your app"

#### Section: Primary URL

##### Section Label
```
SectionLabel {
  padding: 16px 16px 8px

  Title {
    font-size: 14px
    font-weight: 600
    color: #FFFFFF
    margin-bottom: 4px
  }

  Description {
    font-size: 13px
    line-height: 1.4
    color: #6E7681
  }
}
```

**Label**: "Primary URL"
**Description**: "You can add your own custom domain after publishing your app."

##### URL Input Field
```
URLInput {
  margin: 0 16px
  padding: 12px
  background: #1E2835
  border: 1px solid #2D3748
  border-radius: 8px
  display: flex
  align-items: center
  gap: 0

  Input {
    flex: 1
    background: transparent
    border: none
    font-size: 14px
    color: #FFFFFF
    font-family: "SF Mono", Monaco, Consolas, monospace

    &::placeholder {
      color: #6E7681
    }
  }

  Domain {
    font-size: 14px
    color: #6E7681
    font-family: "SF Mono", Monaco, Consolas, monospace
  }
}
```

**Placeholder**: "hex-conquest--veeman961"
**Domain suffix**: ".replit.app"

##### Availability Status
```
AvailabilityStatus {
  display: flex
  align-items: center
  gap: 6px
  padding: 8px 16px

  Icon {
    width: 16px
    height: 16px
    color: #2EA043
  }

  Text {
    font-size: 13px
    color: #2EA043
  }
}
```

**Status**: "✓ Available" (green)

### Upgrade Promotional Card

#### Container
```
UpgradeCard {
  margin: 16px
  padding: 20px
  background: #1E2835
  border: 2px solid #0969DA
  border-radius: 12px

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
      font-weight: 600
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
      gap: 10px

      Icon {
        width: 20px
        height: 20px
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
    height: 48px
    background: #0969DA
    border-radius: 8px
    display: flex
    align-items: center
    justify-content: center
    gap: 8px
    cursor: pointer
    position: relative

    Badge {
      position: absolute
      top: -8px
      right: 16px
      background: #2EA043
      color: #FFFFFF
      font-size: 11px
      padding: 4px 8px
      border-radius: 4px
      font-weight: 600
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

**Title**: "Limited time offer: Free '.com' domain"

**Description**: "Upgrade to Core and get a free .com domain for your App! Plus persistent publishing, backend support, powerful models, and more."

**Features**:
1. "🔗 Free '.com' domain up to $13"
2. "💵 Monthly credits for Replit Agent"
3. "🚀 Publish and persist live apps"
4. "⚡ Access powerful models and more"

**CTA Button**: "Upgrade now" with "Free domain included" badge

### Information Sections

#### Expandable FAQ Items
```
FAQItem {
  padding: 16px
  background: transparent
  border-bottom: 1px solid #1E2835
  cursor: pointer

  Header {
    display: flex
    align-items: center
    justify-content: space-between

    LeftContent {
      display: flex
      align-items: center
      gap: 12px

      Icon {
        width: 20px
        height: 20px
        color: #F59E0B
      }

      Question {
        font-size: 15px
        font-weight: 500
        color: #FFFFFF
      }
    }

    ChevronIcon {
      width: 20px
      height: 20px
      color: #6E7681
      transform: rotate(0deg) // expanded = rotate(180deg)
    }
  }

  Content {
    padding: 12px 0 0 32px

    Text {
      font-size: 14px
      line-height: 1.5
      color: #E2E8F0
      margin-bottom: 8px
    }
  }
}
```

#### FAQ 1: "What does publishing do?"
```
Content {
  Icon: Globe (20x20px, color varies)

  Description:
    "Publishing your app makes it available for anyone to use

    Your friends and users around the world can visit your app through your primary URL."
}
```

#### FAQ 2: "Costs are included in Core subscriptions"
```
Content {
  Icon: Dollar sign (20x20px)

  Description:
    "Costs vary depending on the type of technology used to publish your app."
}
```

### Bottom Action Buttons

#### Container
```
BottomActions {
  padding: 16px
  display: flex
  gap: 12px

  SecondaryButton {
    flex: 1
    height: 48px
    background: transparent
    border: 1px solid #2D3748
    border-radius: 8px
    display: flex
    align-items: center
    justify-content: center
    gap: 6px
    cursor: pointer

    Icon {
      width: 20px
      height: 20px
      color: #FFFFFF
    }

    Text {
      font-size: 14px
      color: #FFFFFF
    }
  }

  TertiaryButton {
    flex: 1
    height: 48px
    background: transparent
    border: 1px solid #2D3748
    border-radius: 8px
    display: flex
    align-items: center
    justify-content: center
    gap: 6px
    cursor: pointer

    Icon {
      width: 20px
      height: 20px
      color: #FFFFFF
    }

    Text {
      font-size: 14px
      color: #FFFFFF
    }
  }
}
```

**Buttons**:
1. "Watch video" (with play icon)
2. "Learn more" (with book icon)

## Bottom Navigation Bar

### Container
- **Height**: ~64px
- **Background**: #0F1419
- **Border top**: 1px solid #2D3748

### Navigation Items
1. File icon
2. Monitor icon
3. Agent icon (purple dots)
4. **Upload/publish icon (active, #2EA043)**
5. Git icon
6. Panels icon

### Active State
- **Icon color**: #2EA043 (green)
- **Indicator**: 2px line, #2EA043

## Color Palette

### Backgrounds
- Primary: #0F1419
- Card/elevated: #1E2835
- Border: #2D3748

### Text
- Primary: #FFFFFF
- Secondary: #E2E8F0
- Tertiary: #6E7681

### Accents
- Primary blue: #0969DA
- Success green: #2EA043
- Warning yellow: #F59E0B

### Status Colors
- Available: #2EA043
- Unavailable: #DA3633

## Typography

### Font Sizes
- Page title: 24px
- Section title: 14px
- Body: 14px
- Small: 13px
- Tiny: 11px

### Font Weights
- Semibold: 600
- Medium: 500
- Regular: 400

### Line Heights
- Tight: 1.3
- Normal: 1.5

### Font Families
- Body: System font
- Monospace: "SF Mono", Monaco, Consolas

## Spacing

### Section Spacing
- Page title: 24px top, 16px bottom
- Section margin: 16px
- Card margin: 16px
- FAQ item padding: 16px

### Element Gaps
- Icon to text: 8-12px
- Feature list: 12px
- Button gap: 12px

### Padding
- Screen horizontal: 16px
- Card: 20px
- Input: 12px
- Button: 12px vertical, 24px horizontal

## Component Specifications

### URL Input Component
```
URLInputField {
  padding: 12px
  background: #1E2835
  border: 1px solid #2D3748
  border-radius: 8px
  display: flex
  align-items: center
  transition: border-color 150ms

  &:focus-within {
    border-color: #0969DA
  }

  input {
    flex: 1
    background: transparent
    border: none
    outline: none
    font-size: 14px
    color: #FFFFFF
    font-family: monospace
  }

  .domain {
    font-size: 14px
    color: #6E7681
    font-family: monospace
    user-select: none
  }
}
```

### Feature List Item
```
FeatureItem {
  display: flex
  align-items: flex-start
  gap: 10px

  .icon {
    width: 20px
    height: 20px
    flex-shrink: 0
    margin-top: 2px
  }

  .text {
    font-size: 14px
    line-height: 1.4
    color: #FFFFFF
  }
}
```

### Expandable Section
```
ExpandableSection {
  border-bottom: 1px solid #1E2835
  cursor: pointer
  transition: background 150ms

  &:active {
    background: #1E2835
  }

  .header {
    display: flex
    justify-content: space-between
    align-items: center
    padding: 16px
  }

  .content {
    max-height: 0
    overflow: hidden
    transition: max-height 300ms ease

    &.expanded {
      max-height: 500px
    }
  }
}
```

## Interactive States

### Input Field
- **Default**: Border #2D3748
- **Focus**: Border #0969DA
- **Error**: Border #DA3633

### Buttons
- **Hover**: Brightness +5%
- **Active**: Background darken, scale 0.98
- **Disabled**: Opacity 0.4

### Expandable Items
- **Collapsed**: Chevron points down
- **Expanded**: Chevron points up
- **Transition**: 200ms ease

## Accessibility

### Focus Indicators
- **Color**: #0969DA
- **Width**: 2px
- **Offset**: 2px

### Touch Targets
- **Minimum**: 44x44px
- Buttons: 48px height
- FAQ items: 56px minimum

### ARIA Labels
- Input: "Enter subdomain"
- Expandable: aria-expanded attribute
- Buttons: Descriptive labels
