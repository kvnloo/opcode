# Workspace Share Pane Analysis

## Screenshot Reference
File: Screenshot_20251207_125046_Replit.png

## Layout Structure

### Overall Layout
- **Type**: Tools and files search interface
- **Background**: #0F1419
- **Content**: Search with categorized list items

### Header Section

#### Top Bar
- **Height**: ~56px
- **Background**: #0F1419
- **Border bottom**: 1px solid #2D3748
- **Layout**: Horizontal flex, right-aligned
- **Padding**: 12px 16px

##### Right Section
- **Close button**: "Close" text button (14px, white)
- **Alignment**: Right

#### Search Input
```
SearchInput {
  padding: 16px
  background: #0F1419

  InputContainer {
    padding: 10px 12px
    background: #1E2835
    border: 1px solid #2D3748
    border-radius: 8px
    display: flex
    align-items: center

    Input {
      flex: 1
      background: transparent
      border: none
      font-size: 14px
      color: #FFFFFF

      &::placeholder {
        color: #6E7681
      }
    }
  }
}
```

**Placeholder**: "Search for tools and files"

## Content Sections

### Section Structure
```
Section {
  padding: 16px 0

  Header {
    padding: 8px 16px

    Title {
      font-size: 12px
      font-weight: 600
      color: #6E7681
      text-transform: uppercase
      letter-spacing: 0.5px
    }
  }
}
```

### Section: SEARCH
Contains two search options

#### Search Item Component
```
SearchItem {
  padding: 12px 16px
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
    align-items: flex-start
    gap: 12px
    flex: 1

    Icon {
      width: 20px
      height: 20px
      color: #6E7681
      flex-shrink: 0
      margin-top: 2px
    }

    TextContent {
      flex: 1

      Title {
        font-size: 15px
        font-weight: 500
        color: #FFFFFF
        margin-bottom: 4px
      }

      Description {
        font-size: 13px
        line-height: 1.4
        color: #6E7681
      }
    }
  }

  RightContent {
    ChevronIcon {
      width: 20px
      height: 20px
      color: #6E7681
      flex-shrink: 0
    }
  }
}
```

**Items**:
1. **Search**
   - Icon: Magnifying glass
   - Title: "Search"
   - Description: "Search through your files"

2. **Files**
   - Icon: Document/file
   - Title: "Files"
   - Description: "Find a file"

### Section: TOOLS
Contains multiple tool options

#### Tool Item Component
Structure same as SearchItem

**Items**:

1. **Agent**
   - Icon: Grid of dots (purple, #8B5CF6)
   - Title: "Agent"
   - Description: "Agent can make changes, review its work, and debug itself automatically."

2. **Assistant**
   - Icon: Sparkle/magic wand (cyan, #06B6D4)
   - Title: "Assistant"
   - Description: "Assistant answers questions, refines code, and makes precise edits."

3. **Publishing**
   - Icon: Rocket/upload (green, #2EA043)
   - Title: "Publishing"
   - Description: "Publish a live, stable, public version of your App, unaffected by the changes you make in the workspace"

4. **App Storage**
   - Icon: Database/storage (blue, #0969DA)
   - Title: "App Storage"
   - Description: "App Storage is Replit's built-in object storage that lets your app easily host and save uploads like images, videos, and documents."

5. **Auth**
   - Icon: User/profile (gray, #6E7681)
   - Title: "Auth"
   - Description: "Let users log in to your App using a prebuilt login page"

6. **Console**
   - Icon: Terminal/code (yellow, #F59E0B)
   - Title: "Console"
   - Description: "View the terminal output after running your code"

7. **Database**
   - Icon: Database/cylinder (blue, #3B82F6)
   - Title: "Database"
   - Description: "Stores structured data such as user profiles, game scores, and product catalogs."

8. **Developer**
   - Icon: Code brackets (gray, #6E7681)
   - Title: "Developer"

9. **Git**
   - Icon: Git branch (green, #2EA043)
   - Title: "Git"
   - Description: "Version control for your App"

10. **Integrations**
    - Icon: Layers/stack (gray, #6E7681)
    - Title: "Integrations"
    - Description: "Connect to Replit-native and external services"

11. **Multiplayer**
    - Icon: Multiple users (gray, #6E7681)
    - Title: "Multiplayer"
    - Description: "Invite real-time collaborators and manage access to your App"

12. **Preview**
    - Icon: Monitor/screen (gray, #6E7681)
    - Title: "Preview"
    - Description: "Preview your App"

13. **Replit Key-Value Store**
    - Icon: Grid/table (purple, #8B5CF6)
    - Title: "Replit Key-Value Store"
    - Description: "Free, easy-to-use key-value store suitable for unstructured data, caching, session management, fast lookups, and flexible data models"

14. **Secrets**
    - Icon: Lock (gray, #6E7681)
    - Title: "Secrets"
    - Description: "Store sensitive information (like API keys) securely in your App"

15. **Security Scanner**
    - Icon: Shield (gray, #6E7681)
    - Title: "Security Scanner"
    - Description: "Scan your app for vulnerabilities"

16. **Shell**
    - Icon: Terminal/command (gray, #6E7681)
    - Title: "Shell"
    - Description: "Directly access your App through a command line interface (CLI)"

17. **User Settings**
    - Icon: Settings gear (gray, #6E7681)
    - Title: "User Settings"
    - Description: "Configure personal editor preferences and workspace settings which apply to all Apps"

18. **Workflows**
    - Icon: Play/triangle (green, #2EA043)
    - Title: "Workflows"
    - Description: "Configure different ways to run your App"

## Color Palette

### Backgrounds
- Primary: #0F1419
- Secondary: #1E2835
- Border: #2D3748
- Hover: #1E2835

### Text
- Primary: #FFFFFF
- Secondary: #6E7681
- Section headers: #6E7681

### Icon Colors (by category)
- Agent: #8B5CF6 (purple)
- Assistant: #06B6D4 (cyan)
- Publishing: #2EA043 (green)
- App Storage: #0969DA (blue)
- Auth: #6E7681 (gray)
- Console: #F59E0B (yellow)
- Database: #3B82F6 (blue)
- Git: #2EA043 (green)
- Key-Value Store: #8B5CF6 (purple)
- Workflows: #2EA043 (green)
- Default tools: #6E7681 (gray)

## Typography

### Font Sizes
- Section header: 12px
- Item title: 15px
- Item description: 13px
- Placeholder: 14px

### Font Weights
- Section header: 600
- Item title: 500
- Item description: 400

### Line Heights
- Title: 1.2
- Description: 1.4

### Letter Spacing
- Section header: 0.5px

## Spacing

### Vertical Rhythm
- Section padding: 16px top
- Section header padding: 8px 16px
- Item padding: 12px 16px
- Description margin: 4px top

### Horizontal Spacing
- Screen padding: 16px
- Icon gap: 12px
- Content gap: 4px

## Component Specifications

### Search Input Component
```
SearchInputComponent {
  padding: 16px

  .input-container {
    padding: 10px 12px
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

      &::placeholder {
        color: #6E7681
      }
    }
  }
}
```

### Tool List Item
```
ToolItem {
  padding: 12px 16px
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

  .left-content {
    display: flex
    gap: 12px
    flex: 1
    align-items: flex-start

    .icon {
      width: 20px
      height: 20px
      flex-shrink: 0
      margin-top: 2px
    }

    .text-content {
      flex: 1

      .title {
        font-size: 15px
        font-weight: 500
        color: #FFFFFF
        margin-bottom: 4px
      }

      .description {
        font-size: 13px
        line-height: 1.4
        color: #6E7681
      }
    }
  }

  .right-content {
    .chevron {
      width: 20px
      height: 20px
      color: #6E7681
      flex-shrink: 0
    }
  }
}
```

### Section Header
```
SectionHeader {
  padding: 8px 16px

  .title {
    font-size: 12px
    font-weight: 600
    color: #6E7681
    text-transform: uppercase
    letter-spacing: 0.5px
  }
}
```

## Interactive States

### Search Input
- **Default**: Border #2D3748
- **Focus**: Border #0969DA
- **Typing**: Border #0969DA

### List Items
- **Default**: Transparent background
- **Hover**: Background #1E2835
- **Active/Tap**: Background #1E2835, opacity 0.8
- **Transition**: 150ms ease

## Accessibility

### Focus Indicators
- **Color**: #0969DA
- **Width**: 2px
- **Offset**: 2px

### Touch Targets
- **Minimum**: 44x44px
- List items: 56-72px height (exceeds minimum)
- Search input: 44px height

### Semantic HTML
- Search: `<input type="search">`
- Sections: `<section>` with headings
- List items: `<button>` or `<a>` with proper labels

### Screen Reader
- Section headers: Announced as headings
- List items: "Tool name, description, button"
- Search: "Search for tools and files, search input"

### Keyboard Navigation
- Tab: Navigate through items
- Enter/Space: Activate item
- Escape: Close panel
