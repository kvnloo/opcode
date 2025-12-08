# Account Screen Analysis

## Screenshot Reference
File: Screenshot_20251207_124550_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Vertical scroll list with sections
- **Background**: #0F1419
- **Safe areas**: Standard mobile padding

### Profile Header

#### Avatar Section
- **Size**: 96x96px
- **Border radius**: 50% (full circle)
- **Background**: #2D3748
- **Position**: Top center
- **Margin**: 32px top, 16px bottom
- **Content**: Initials "VE" (32px, white, medium weight)

#### User Info
- **Layout**: Vertical stack, center-aligned
- **Spacing**: 8px between elements

##### Username
- **Text**: "veeman961" (20px, white, medium weight)
- **Margin bottom**: 8px

##### Handle
- **Text**: "@veeman961" (14px, #6E7681)
- **Icon**: "@" symbol prefix
- **Margin bottom**: 4px

##### Email
- **Text**: "veeman961@gmail.com" (14px, #6E7681)
- **Icon**: Envelope icon (16x16px)
- **Gap**: 8px between icon and text
- **Margin bottom**: 4px

##### Bio Placeholder
- **Text**: "You don't have a bio yet..." (14px, #6E7681)
- **Margin bottom**: 24px

#### CTA Button
- **Width**: Full width minus 32px padding
- **Height**: 48px
- **Background**: #0969DA
- **Border radius**: 8px
- **Padding**: 12px 24px
- **Margin**: 16px horizontal, 24px bottom

##### Button Content
- **Icon**: Star icon (20x20px, white)
- **Text**: "Join Replit Core" (16px, white, medium weight)
- **Gap**: 8px between icon and text
- **Alignment**: Centered

## Settings Sections

### Section Structure
Each section has:
- **Header**: Uppercase label (11px, #6E7681, bold, letter-spacing: 0.5px)
- **Padding**: 8px vertical above items
- **Background**: Transparent

### List Items

#### Standard Item
```
ListItem {
  height: 56px
  padding: 16px
  background: transparent
  border-bottom: 1px solid #1E2835
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
      color: #6E7681
    }

    Text {
      font-size: 16px
      color: #FFFFFF
    }
  }

  RightContent {
    ChevronRight {
      width: 20px
      height: 20px
      color: #6E7681
    }
  }
}
```

### Section: PROFILE
1. **Usage**
   - Icon: Gauge/speedometer (20x20px, #6E7681)
   - Text: "Usage" (16px, white)
   - Chevron: Right arrow

2. **Edit Profile**
   - Icon: Pencil (20x20px, #6E7681)
   - Text: "Edit Profile" (16px, white)
   - Chevron: Right arrow

### Section: THEME
1. **Theme - Dark**
   - Icon: Moon (20x20px, #6E7681)
   - Text: "Theme - Dark" (16px, white)
   - Chevron: Right arrow

### Section: REPLIT TEAMS
1. **Get Teams**
   - Icon: People (20x20px, #6E7681)
   - Text: "Get Teams" (16px, white)
   - External link icon (16x16px, #6E7681)

### Section: NOTIFICATIONS
1. **Notifications**
   - Icon: Bell (20x20px, #6E7681)
   - Text: "Notifications" (16px, white)
   - Chevron: Right arrow

### Section: SUPPORT
1. **Help**
   - Icon: Question mark circle (20x20px, #6E7681)
   - Text: "Help" (16px, white)
   - No chevron

2. **Docs**
   - Icon: Book (20x20px, #6E7681)
   - Text: "Docs" (16px, white)
   - External link icon (16x16px, #6E7681)

### Section: OTHER
1. **About**
   - Icon: Info circle (20x20px, #6E7681)
   - Text: "About" (16px, white)
   - Chevron: Right arrow

2. **Manage Account**
   - Icon: User settings (20x20px, #6E7681)
   - Text: "Manage Account" (16px, white)
   - Chevron: Right arrow

3. **Log Out**
   - Icon: Log out arrow (20x20px, #DA3633)
   - Text: "Log Out" (16px, #DA3633)
   - No chevron
   - Special styling: Red/destructive color

## Bottom Navigation

### Container
- **Height**: ~80px
- **Background**: #0F1419
- **Border top**: 1px solid #2D3748

### Navigation Items
1. Apps
2. Create
3. **Account (active)**

### Active State
- **Icon**: White (#FFFFFF)
- **Text**: White (#FFFFFF)
- **Indicator**: Optional bottom line

## Color Palette

### Backgrounds
- Primary: #0F1419
- Card/Section: #1E2835
- Avatar: #2D3748

### Text
- Primary: #FFFFFF
- Secondary: #6E7681
- Destructive: #DA3633

### Accents
- Primary CTA: #0969DA
- Destructive: #DA3633

### Borders
- Subtle divider: #1E2835
- Section divider: #2D3748

## Typography

### Font Sizes
- Large: 20px (username)
- Body: 16px (list items)
- Small: 14px (email, handle)
- Caption: 11px (section headers)

### Font Weights
- Bold: 600 (section headers)
- Medium: 500 (username, buttons)
- Regular: 400 (body text)

### Letter Spacing
- Section headers: 0.5px
- Body: 0px

## Spacing

### Vertical Rhythm
- Profile header: 32px top padding
- Avatar to username: 16px
- Username to handle: 8px
- Handle to email: 4px
- Email to bio: 4px
- Bio to button: 24px
- Section header to items: 8px
- Between sections: 24px

### Horizontal Padding
- Screen: 16px
- List items: 16px
- Button: 24px

## Component Specifications

### Avatar Component
```
Avatar {
  width: 96px
  height: 96px
  border-radius: 50%
  background: #2D3748
  display: flex
  align-items: center
  justify-content: center

  Initials {
    font-size: 32px
    font-weight: 500
    color: #FFFFFF
  }
}
```

### Section Header Component
```
SectionHeader {
  font-size: 11px
  font-weight: 600
  color: #6E7681
  text-transform: uppercase
  letter-spacing: 0.5px
  padding: 8px 16px
  margin-top: 24px
}
```

### Settings Item Component
```
SettingsItem {
  height: 56px
  padding: 16px
  background: transparent
  border-bottom: 1px solid #1E2835
  display: flex
  align-items: center
  justify-content: space-between
  cursor: pointer
  transition: background 150ms

  &:active {
    background: #1E2835
  }

  LeftContent {
    display: flex
    align-items: center
    gap: 12px

    Icon {
      width: 20px
      height: 20px
      color: #6E7681

      &.destructive {
        color: #DA3633
      }
    }

    Text {
      font-size: 16px
      color: #FFFFFF

      &.destructive {
        color: #DA3633
      }
    }
  }

  RightContent {
    Icon {
      width: 20px
      height: 20px
      color: #6E7681
    }
  }
}
```

### Primary CTA Button
```
PrimaryCTA {
  width: 100%
  height: 48px
  background: #0969DA
  border-radius: 8px
  padding: 12px 24px
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
    font-size: 16px
    font-weight: 500
    color: #FFFFFF
  }
}
```

## Interactive States

### List Items
- **Hover**: Background #1E2835
- **Active/Tap**: Background #1E2835, opacity 0.8
- **Transition**: 150ms ease

### CTA Button
- **Hover**: Background lighten 5%
- **Active**: Background darken 5%, scale 0.98
- **Transition**: 150ms ease

## Accessibility

### Focus Indicators
- **Color**: #0969DA
- **Width**: 2px
- **Offset**: 2px

### Touch Targets
- **Minimum**: 44x44px
- List items: 56px height (exceeds minimum)
- Button: 48px height (exceeds minimum)

### Semantic Structure
- Profile info: `<section>` with heading
- Settings lists: `<nav>` with proper ARIA
- Destructive action: Proper warning role

### Screen Reader
- Avatar: "User avatar, VE"
- List items: "Usage, navigate to usage settings"
- Destructive: "Log out, warning, button"
