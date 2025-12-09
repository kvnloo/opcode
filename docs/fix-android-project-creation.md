# Android Project Creation Fix

## Problem
The project creation flow was broken on Android:
- User enters description and taps "Continue" → infinite loading
- Tauri invoke fails silently
- Works on desktop but not mobile

## Root Cause
**File System Path Issue**: The `create_ai_project` Rust command was using `dirs::home_dir()` which:
- Works on desktop platforms (Linux, macOS, Windows)
- Fails silently on Android (returns `None` or inaccessible path)
- Android requires app-specific storage paths for security

## Solution

### 1. Backend Fix (Rust)
**File**: `src-tauri/src/commands/ai_project.rs`

**Changed**:
```rust
// OLD - Doesn't work on Android
let home_dir = dirs::home_dir()
    .ok_or("Could not find home directory")?;
let projects_dir = home_dir.join(".claude").join("projects");

// NEW - Android compatible
let app_data_dir = app_handle
    .path()
    .app_data_dir()
    .map_err(|e| format!("Could not access app data directory: {}", e))?;
let projects_dir = app_data_dir.join("projects");
```

**Why**: `app_handle.path().app_data_dir()` returns:
- Desktop: `~/.local/share/com.opcode.dev/` (or equivalent)
- Android: `/data/data/com.opcode.dev/files/` (app-specific storage)

### 2. Frontend Error Handling (TypeScript)
**File**: `src/screens/mobile/CreateScreen.tsx`

**Improvements**:
1. Enhanced error extraction and logging
2. Platform-specific error hints
3. Better error UI display (multi-line support)
4. Console logging for debugging

```typescript
// Enhanced error handling
catch (err) {
  console.error('Project creation failed:', err);

  let errorMessage = 'Failed to create project';

  if (typeof err === 'string') {
    errorMessage = err;
  } else if (err instanceof Error) {
    errorMessage = err.message;
  } else if (err && typeof err === 'object' && 'message' in err) {
    errorMessage = String((err as any).message);
  }

  // Add platform-specific hints
  if (errorMessage.includes('permission') || errorMessage.includes('access')) {
    errorMessage += '\n\nThis may be a file permission issue on Android.';
  }

  setError(errorMessage);
  setStep('template');
}
```

3. Improved error display UI:
```tsx
{error && (
  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
    <p className="text-sm text-destructive whitespace-pre-line">{error}</p>
  </div>
)}
```

## Testing Checklist

### Desktop
- [ ] Create project with Next.js template
- [ ] Create project with Express API template
- [ ] Create project with React Native template
- [ ] Create project with Fullstack template
- [ ] Verify files created in `~/.local/share/com.opcode.dev/projects/`

### Android
- [ ] Create project with each template
- [ ] Verify no infinite loading
- [ ] Check error messages display properly
- [ ] Verify files created in app-specific storage
- [ ] Check console logs via `adb logcat`

## Expected Behavior

### Success Flow
1. User enters project description
2. Taps "Continue" → analysis completes
3. Selects template and enters project name
4. Taps "Create Project" → progress bar shows 0-100%
5. Success screen appears with "Project created!"

### Error Flow
1. If creation fails → returns to template selection
2. Error message displayed in red box
3. Console logs show detailed error
4. User can retry with different name/template

## Additional Notes

### Android Storage Paths
- App data dir: `/data/data/com.opcode.dev/files/`
- Projects: `/data/data/com.opcode.dev/files/projects/{project-name}/`
- No permissions needed for app-specific storage

### Desktop Storage Paths
- Linux: `~/.local/share/com.opcode.dev/projects/`
- macOS: `~/Library/Application Support/com.opcode.dev/projects/`
- Windows: `%APPDATA%\com.opcode.dev\projects\`

### Debugging Commands
```bash
# Check Android logs
adb logcat -s opcode:V

# List created projects on Android
adb shell ls -la /data/data/com.opcode.dev/files/projects/

# Check desktop projects
ls -la ~/.local/share/com.opcode.dev/projects/
```

## Related Files
- `src-tauri/src/commands/ai_project.rs` - Backend creation logic
- `src/screens/mobile/CreateScreen.tsx` - Frontend UI component
- `src-tauri/src/commands/agents.rs` - Similar pattern for reference
- `src-tauri/src/claude_binary.rs` - Similar pattern for reference

## Future Improvements
1. Add file size validation before creation
2. Implement project deletion functionality
3. Add project import/export for sharing
4. Show storage usage information
5. Add project templates management
