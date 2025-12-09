# Android Project Creation Testing Guide

## Quick Verification Steps

### 1. Build the App
```bash
# Build for Android
npm run tauri android build

# Or for development
npm run tauri android dev
```

### 2. Test on Android Device/Emulator

#### A. Test Happy Path
1. Open app on Android device
2. Navigate to "Create" tab
3. Enter project description: "A mobile task manager app"
4. Tap "Continue" button
5. ✅ **Should**: Show template selection screen (not infinite loading)
6. Select "React Native" template
7. ✅ **Should**: Auto-generate project name
8. Tap "Create Project" button
9. ✅ **Should**: Show progress bar 0→100%
10. ✅ **Should**: Show success screen "Project created!"

#### B. Test Error Display
1. Disconnect internet (if needed for API calls)
2. Try to create project
3. ✅ **Should**: Show clear error message in red box
4. ✅ **Should**: Return to template selection (not stuck on creating)
5. ✅ **Should**: Allow retry

### 3. Verify File Creation

#### Via ADB
```bash
# List app data directory
adb shell ls -la /data/data/com.opcode.dev/files/

# List projects directory
adb shell ls -la /data/data/com.opcode.dev/files/projects/

# List specific project files
adb shell ls -la /data/data/com.opcode.dev/files/projects/my-project/
```

Expected structure:
```
/data/data/com.opcode.dev/files/projects/my-project/
├── project.json
├── package.json
├── src/
│   └── ...
└── ...
```

### 4. Check Logs

```bash
# Monitor app logs in real-time
adb logcat | grep -i opcode

# Or filter for specific errors
adb logcat | grep -E "ERROR|Project creation"
```

Look for:
- ✅ "Project creation started"
- ✅ "Project directory created"
- ❌ Any permission errors
- ❌ Any file system errors

## Detailed Testing Matrix

### Template Testing

| Template | Description | Expected Files | Status |
|----------|-------------|----------------|--------|
| Next.js | Web app | package.json, tsconfig.json, src/app/ | [ ] |
| Express API | Backend API | package.json, src/routes/ | [ ] |
| React Native | Mobile app | package.json, src/screens/ | [ ] |
| Fullstack | Full stack | package.json, prisma/, src/app/ | [ ] |

### Edge Cases

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Empty project name | Leave name blank, tap create | Button disabled | [ ] |
| Duplicate project name | Create project twice with same name | Show error | [ ] |
| Special characters in name | Use name with spaces/symbols | Sanitize or show error | [ ] |
| Very long project name | Use 100+ character name | Truncate or validate | [ ] |
| Network timeout | Simulate slow connection | Show timeout error | [ ] |
| Storage full | Fill device storage | Show storage error | [ ] |

### Platform Comparison

| Feature | Desktop | Android | Notes |
|---------|---------|---------|-------|
| Project creation | ✅ | [ ] Test | Should be identical |
| Error messages | ✅ | [ ] Test | Should show platform hints |
| File paths | `~/.local/share/...` | `/data/data/...` | Different but working |
| Progress indicator | ✅ | [ ] Test | Should animate smoothly |

## Debugging Tips

### Common Issues

#### 1. Infinite Loading
**Symptom**: Progress bar stuck at 0%, app hangs
**Cause**: Tauri invoke failing silently
**Fix**: Check logcat for actual error
```bash
adb logcat | grep -i "invoke\|error"
```

#### 2. Permission Denied
**Symptom**: Error "Failed to create project directory"
**Cause**: App lacks storage permissions
**Fix**: Check AndroidManifest.xml permissions
```bash
adb shell dumpsys package com.opcode.dev | grep permission
```

#### 3. File Not Found
**Symptom**: Error "Could not access app data directory"
**Cause**: Path resolution failure
**Fix**: Verify app_data_dir implementation
```bash
adb shell ls -la /data/data/com.opcode.dev/
```

### Manual Debugging

#### 1. Add Debug Logging (Rust)
```rust
// In ai_project.rs
eprintln!("DEBUG: app_data_dir = {:?}", app_data_dir);
eprintln!("DEBUG: projects_dir = {:?}", projects_dir);
eprintln!("DEBUG: Creating directory...");
```

#### 2. Add Debug Logging (TypeScript)
```typescript
// In CreateScreen.tsx
console.log('DEBUG: Starting project creation');
console.log('DEBUG: name =', projectName);
console.log('DEBUG: template =', selectedTemplate.id);
```

#### 3. Check Tauri Invoke
```typescript
// Test minimal invoke
const test = await invoke('analyze_project_description', {
  description: 'test'
});
console.log('Test result:', test);
```

## Performance Testing

### Metrics to Track

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Analysis time | < 1s | [ ] | Description → templates |
| Creation time | < 3s | [ ] | Button → success screen |
| File write time | < 1s | [ ] | Creating project files |
| UI responsiveness | 60fps | [ ] | No lag during creation |

### Load Testing
1. Create 10 projects sequentially
2. Check storage usage
3. Verify no memory leaks
4. Ensure consistent performance

## Regression Testing

After fix, verify these still work:

- [ ] Desktop project creation
- [ ] Project listing
- [ ] Project opening
- [ ] Claude integration
- [ ] Workspace navigation
- [ ] Tab management

## Sign-off Checklist

Before marking this issue as resolved:

### Functionality
- [ ] Project creation works on Android
- [ ] All 4 templates create successfully
- [ ] Error messages display correctly
- [ ] Success flow completes properly
- [ ] Files created in correct location

### Quality
- [ ] No TypeScript errors
- [ ] No Rust compilation warnings
- [ ] Logs show clear debugging info
- [ ] Error messages are user-friendly
- [ ] UI/UX is smooth and responsive

### Documentation
- [ ] Fix documented in this file
- [ ] Test checklist completed
- [ ] Known issues documented
- [ ] Future improvements noted

### Cross-platform
- [ ] Desktop still works (Linux/Mac/Win)
- [ ] Android works (device + emulator)
- [ ] iOS compatibility checked (if applicable)

## Known Issues / Limitations

1. **Project deletion**: Not yet implemented
2. **Project rename**: Not yet implemented
3. **Storage quota**: No warning when storage low
4. **Template customization**: Templates are hardcoded

## Future Improvements

1. Add progress notifications
2. Implement project backup/restore
3. Add template marketplace
4. Show storage usage in UI
5. Add project import/export
6. Implement project deletion
7. Add project analytics

## Contact

For issues or questions:
- Create issue in GitHub repo
- Tag with `mobile` and `android` labels
- Include logcat output
- Describe steps to reproduce
