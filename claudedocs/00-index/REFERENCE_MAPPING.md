# Reference Image Mapping

**Generated:** 2025-12-09
**Total Images:** 30 reference images + 8 test screenshots
**Purpose:** Map reference screenshots to components for visual verification

---

## Summary Statistics

- **REFERENCE_COUNT:** 30 reference images
- **MAPPED_FEATURES:** 26 features (Main Screens: 3, Workspace Panes: 7, Tool Panes: 14, Overlays: 2)
- **MISSING_REFERENCES:** 4 features (Git Pane, Database Pane, Connection Manager, Bottom Navigation)
- **TEST_SCREENSHOTS:** 8 images (showing various UI states)

---

## Main Screens (3 references)

| Reference Image | Component | Screen Path | Notes |
|-----------------|-----------|-------------|-------|
| `replit-apps-home-screen.png` | AppsScreen | `src/screens/mobile/AppsScreen.tsx` | Project list, search, filters |
| `replit-create-screen.png` | CreateScreen | `src/screens/mobile/CreateScreen.tsx` | Template selection, project setup |
| `replit-account-screen.png` | AccountScreen | `src/screens/mobile/AccountScreen.tsx` | User profile, settings |

---

## Workspace Toolbar Panes (7 references)

| Reference Image | Component | Component Path | Notes |
|-----------------|-----------|----------------|-------|
| `replit-agent-pane-main-view.png` | AgentPane | `src/components/mobile/workspace/panes/AgentPane.tsx` | AI assistant view |
| `replit-agent-pane-with-tools-overlay.png` | AgentPane + ToolsOverlay | Multiple components | Shows overlay integration |
| `replit-console-terminal-pane.png` | ConsolePane | `src/components/mobile/workspace/panes/ConsolePane.tsx` | Console output |
| `replit-shell-terminal-pane.png` | ShellPane | `src/components/mobile/workspace/panes/ShellPane.tsx` | Terminal shell |
| `replit-preview-pane-game.png` | PreviewPane | `src/components/mobile/workspace/panes/PreviewPane.tsx` | Live preview/game |
| `replit-publishing-pane.png` | PublishingPane | `src/components/mobile/workspace/panes/PublishingPane.tsx` | Deployment UI |
| `replit-publishing-pane-full.png` | PublishingPane | `src/components/mobile/workspace/panes/PublishingPane.tsx` | Expanded publishing view |

---

## Tool Panes (14 references)

| Reference Image | Component | Component Path | Notes |
|-----------------|-----------|----------------|-------|
| `replit-app-storage-pane.png` | AppStoragePane | `src/components/mobile/workspace/panes/AppStoragePane.tsx` | Object storage UI |
| `replit-assistant-chat-pane.png` | AssistantPane | `src/components/mobile/workspace/panes/AssistantPane.tsx` | AI chat interface |
| `replit-auth-users-pane.png` | AuthUsersPane | `src/components/mobile/workspace/panes/AuthUsersPane.tsx` | User management |
| `replit-developer-tools-pane.png` | DevToolsPane | `src/components/mobile/workspace/panes/DevToolsPane.tsx` | Dev tools panel |
| `replit-integrations-pane.png` | IntegrationsPane | `src/components/mobile/workspace/panes/IntegrationsPane.tsx` | Third-party integrations |
| `replit-key-value-store-pane.png` | KeyValueStorePane | `src/components/mobile/workspace/panes/KeyValueStorePane.tsx` | Key-value database |
| `replit-multiplayer-pane.png` | MultiplayerPane | `src/components/mobile/workspace/panes/MultiplayerPane.tsx` | Collaboration UI |
| `replit-secrets-env-vars-pane.png` | SecretsPane | `src/components/mobile/workspace/panes/SecretsPane.tsx` | Environment variables |
| `replit-security-scanner-pane.png` | SecurityScannerPane | `src/components/mobile/workspace/panes/SecurityScannerPane.tsx` | Security analysis |
| `replit-user-settings-pane.png` | UserSettingsPane | `src/components/mobile/workspace/panes/UserSettingsPane.tsx` | User preferences |
| `replit-workflows-pane.png` | WorkflowsPane | `src/components/mobile/workspace/panes/WorkflowsPane.tsx` | Automation workflows |

**Additional Tool Panes (Not in screenshots yet):**
- `replit-database-pane.png` → DatabasePane.tsx ❌ **MISSING**
- `replit-git-pane.png` → GitPane.tsx ❌ **MISSING**

---

## Overlays & Navigation (2 references)

| Reference Image | Component | Component Path | Notes |
|-----------------|-----------|----------------|-------|
| `replit-tools-menu-overlay.png` | ToolsOverlay | `src/components/mobile/workspace/ToolsOverlay.tsx` | Tools menu modal |

**Missing Navigation References:**
- Bottom Navigation ❌ **MISSING** (BottomNavigation.tsx)
- Connection Manager ❌ **MISSING** (ConnectionManager.tsx)

---

## Test Screenshots (Current State - 8 images)

| Screenshot | Purpose | Status | Date |
|------------|---------|--------|------|
| `mobile-ui-app-running.png` | Full app running | In development | Dec 9 09:03 |
| `mobile-ui-verified.png` | Verified UI state | Latest verified | Dec 9 10:37 |
| `mobile-debug-fixed.png` | Debug view fixed | Fixed state | Dec 9 09:18 |
| `mobile-ui-platform-fixed.png` | Platform fixes | Fixed state | Dec 9 09:09 |
| `mobile-ui-fixed.png` | UI fixes | Fixed state | Dec 9 09:02 |
| `mobile-ui-fixed-unlocked.png` | Unlocked state | Fixed state | Dec 9 09:02 |
| `mobile-ui-fresh.png` | Fresh install | Initial state | Dec 9 09:03 |
| `mobile-ui-unlocked-app.png` | Unlocked app | Running | Dec 9 09:04 |

---

## Missing Reference Images (4 features)

These features exist in code but lack reference images for visual comparison:

1. **GitPane** (`src/components/mobile/workspace/panes/GitPane.tsx`)
   - Need: `replit-git-pane.png`
   - Impact: Cannot verify git integration UI

2. **DatabasePane** (`src/components/mobile/workspace/panes/DatabasePane.tsx`)
   - Need: `replit-database-pane.png`
   - Impact: Cannot verify database browser UI

3. **Connection Manager** (`src/components/mobile/connection/ConnectionManager.tsx`)
   - Need: `replit-connection-manager.png`
   - Impact: Cannot verify connection states UI

4. **Bottom Navigation** (`src/components/mobile/navigation/BottomNavigation.tsx`)
   - Need: `replit-bottom-navigation.png`
   - Impact: Cannot verify navigation UI states

---

## Coverage Analysis

### ✅ Well-Covered Components (26/30)
- All main screens have references
- Most workspace panes have references
- Tool panes comprehensively covered
- Overlay patterns documented

### ⚠️ Partial Coverage (2/30)
- GitPane: Component exists, no reference
- DatabasePane: Component exists, no reference

### ❌ Missing Coverage (2/30)
- Connection Manager: Critical for app functionality
- Bottom Navigation: Core navigation component

---

## Visual Verification Workflow

For each reference image:

1. **Navigate to Feature**
   ```bash
   # Launch app
   adb shell am start -n com.opcode.mobile/.MainActivity

   # Navigate to screen/pane
   adb shell input tap {x} {y}
   ```

2. **Capture Screenshot**
   ```bash
   adb exec-out screencap -p > claudedocs/screenshots/$(date +%s)_feature.png
   ```

3. **Compare to Reference**
   ```python
   from PIL import Image
   import imagehash

   screenshot = Image.open('screenshot.png')
   reference = Image.open('reference.png')

   diff = imagehash.phash(screenshot) - imagehash.phash(reference)
   # diff < 5 = MATCH
   # diff 5-15 = PARTIAL
   # diff > 15 = MISMATCH
   ```

4. **Update Progress**
   ```markdown
   | Feature | Status | Evidence | Visual Match |
   |---------|--------|----------|--------------|
   | AgentPane | VERIFIED | screenshot.png | 98% match |
   ```

---

## Component → Reference Quick Lookup

```yaml
# Quick lookup for testing

screens:
  AppsScreen: "replit-apps-home-screen.png"
  CreateScreen: "replit-create-screen.png"
  AccountScreen: "replit-account-screen.png"
  WorkspaceScreen: "replit-agent-pane-main-view.png"

toolbar_panes:
  AgentPane: "replit-agent-pane-main-view.png"
  ConsolePane: "replit-console-terminal-pane.png"
  PublishingPane: "replit-publishing-pane.png"
  SharePane: null  # No specific reference yet
  PreviewPane: "replit-preview-pane-game.png"

tool_panes:
  AppStoragePane: "replit-app-storage-pane.png"
  AuthUsersPane: "replit-auth-users-pane.png"
  DevToolsPane: "replit-developer-tools-pane.png"
  IntegrationsPane: "replit-integrations-pane.png"
  KeyValueStorePane: "replit-key-value-store-pane.png"
  MultiplayerPane: "replit-multiplayer-pane.png"
  SecretsPane: "replit-secrets-env-vars-pane.png"
  SecurityScannerPane: "replit-security-scanner-pane.png"
  WorkflowsPane: "replit-workflows-pane.png"
  AssistantPane: "replit-assistant-chat-pane.png"
  ShellPane: "replit-shell-terminal-pane.png"
  UserSettingsPane: "replit-user-settings-pane.png"
  GitPane: null  # MISSING
  DatabasePane: null  # MISSING

overlays:
  ToolsOverlay: "replit-tools-menu-overlay.png"
  BottomNavigation: null  # MISSING
  ConnectionManager: null  # MISSING
```

---

## Next Actions for Complete Coverage

1. **Capture Missing References:**
   - Take screenshots of GitPane from actual Replit app
   - Take screenshots of DatabasePane from actual Replit app
   - Capture Connection Manager states
   - Document Bottom Navigation variations

2. **Create SharePane Reference:**
   - SharePane.tsx exists but no dedicated reference
   - May be visible in other screenshots

3. **Document Edge Cases:**
   - Loading states
   - Error states
   - Empty states
   - Offline states

4. **Update Test Suite:**
   - Add visual regression tests for all 30 references
   - Implement pixel-diff comparison
   - Create automated screenshot capture

---

## Automation Script

```python
#!/usr/bin/env python3
"""
Automated visual verification against reference images
"""

import os
from pathlib import Path
from PIL import Image
import imagehash

REFERENCES = {
    "AppsScreen": "replit-apps-home-screen.png",
    "CreateScreen": "replit-create-screen.png",
    "AccountScreen": "replit-account-screen.png",
    "AgentPane": "replit-agent-pane-main-view.png",
    "ConsolePane": "replit-console-terminal-pane.png",
    # ... add all mappings
}

def verify_all_features():
    results = {}
    for component, reference in REFERENCES.items():
        ref_path = Path("claudedocs") / reference
        if not ref_path.exists():
            results[component] = {"status": "NO_REFERENCE", "diff": None}
            continue

        # Capture screenshot of component
        screenshot = capture_component_screenshot(component)

        # Compare
        reference_img = Image.open(ref_path)
        screenshot_img = Image.open(screenshot)

        diff = imagehash.phash(screenshot_img) - imagehash.phash(reference_img)

        if diff <= 5:
            status = "MATCH"
        elif diff <= 15:
            status = "PARTIAL"
        else:
            status = "MISMATCH"

        results[component] = {"status": status, "diff": diff}

    return results

if __name__ == "__main__":
    results = verify_all_features()
    for component, result in results.items():
        print(f"{component}: {result['status']} (diff: {result['diff']})")
```

---

**END OF REFERENCE MAPPING**
