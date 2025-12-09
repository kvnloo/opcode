# Demo Project Workaround

## Problem
The project creation flow on Android is broken - infinite loading when trying to create a new project through the Create screen.

## Solution
Added a "Demo Project" button to bypass the broken creation flow and navigate directly to workspace with mock data.

## Implementation

### Files Changed

1. **src/screens/mobile/CreateScreen.tsx**
   - Added `Rocket` icon import
   - Added `useWorkspaceStore` import
   - Added `handleLoadDemoProject()` function that:
     - Creates mock project data
     - Calls `setProject()` in workspace store
     - Dispatches `navigate-to-apps` event
   - Added prominent orange button in header: "🚨 Dev: Load Demo Project (Bypass Broken Creation)"

2. **src/App.tsx**
   - Added event listener for `navigate-to-apps` custom event
   - Switches to 'apps' tab when event is fired
   - This shows the AppsScreen, which detects the project in workspaceStore and displays WorkspaceScreen

## How to Use

1. Open the app on Android
2. Navigate to the "Create" tab
3. Click the orange button: "🚨 Dev: Load Demo Project (Bypass Broken Creation)"
4. App will automatically switch to "Apps" tab and show WorkspaceScreen with demo project

## What You Can Test

Once in the workspace, you can test:
- ✅ Workspace screen navigation
- ✅ Console pane
- ✅ Agent pane (including chat, streaming, agent responses)
- ✅ Deploy pane
- ✅ Share pane
- ✅ Preview pane
- ✅ Tools overlay (9 additional panes: Storage, Auth, DevTools, Integrations, KV Store, Multiplayer, Secrets, Security, Workflows)
- ✅ Bottom toolbar navigation between panes
- ✅ Back navigation to apps list

## Mock Project Data

```javascript
{
  id: 'demo-project-' + Date.now(),
  name: 'Demo Project (Workaround)',
  path: '/demo/project/path'
}
```

## Notes

- This is a **temporary workaround** - the button is clearly marked as dev/debug
- The button has high visibility (orange color, emoji) so it's obvious it's not production code
- No changes to production logic - purely additive workaround
- TypeScript compilation passes with no errors
- Quick to remove once proper creation flow is fixed

## Next Steps

Once the project creation flow is fixed:
1. Remove the demo button from CreateScreen.tsx
2. Remove the event listener from App.tsx
3. Remove the `navigate-to-apps` event dispatch
