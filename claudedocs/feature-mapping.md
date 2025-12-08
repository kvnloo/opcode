# Feature Mapping: Original Plan vs Opcode

## What Opcode Already Has ✅

| Original Plan Feature | Opcode Equivalent | Status | Notes |
|----------------------|-------------------|--------|-------|
| Project Management | `ProjectBrowser` component | ✅ Complete | Scans `~/.claude/projects/` |
| Session History | Session list with first messages | ✅ Complete | Timestamps, metadata |
| Code Editor | Not yet (terminal-focused) | ⚠️ Partial | Can add Monaco WebView |
| Terminal | Built-in terminal component | ✅ Complete | xterm.js ready |
| File Browser | File listing from sessions | ✅ Complete | Tree view included |
| Agent System | CC Agents with custom prompts | ✅ Complete | Background execution |
| Usage Dashboard | Full analytics with charts | ✅ Complete | Cost tracking, tokens |
| MCP Server Management | Server registry + import | ✅ Complete | Claude Desktop import |
| Session Versioning | Timeline & Checkpoints | ✅ Complete | Fork, restore, diff |
| CLAUDE.md Editor | Built-in markdown editor | ✅ Complete | Live preview |

## What Needs to Be Built 🔨

| Feature | Priority | Effort | Description |
|---------|----------|--------|-------------|
| **Mobile Layout** | P0 | Medium | Bottom nav, swipeable panes |
| **Responsive Wrappers** | P0 | Low | Adapt existing components |
| **Tailscale SSH Mode** | P0 | High | WebSocket SSH bridge |
| **Claude Web API Mode** | P1 | High | OAuth + API integration |
| **Mobile Terminal** | P0 | Medium | Touch-optimized xterm |
| **Code Keyboard** | P1 | Low | Special character toolbar |
| **Mobile Code Editor** | P1 | Medium | Touch-friendly Monaco |
| **Haptic Feedback** | P2 | Low | Native feel |
| **Push Notifications** | P2 | Medium | Task completion alerts |
| **Offline Queue** | P3 | High | Queue commands when offline |

## Architecture Comparison

### Original Plan (React Native)
```
┌──────────────────────────────────────────┐
│           React Native + Expo             │
├──────────────────────────────────────────┤
│  WebView (xterm.js) │ WebView (Monaco)   │
├──────────────────────────────────────────┤
│          Native SSH / WebSocket          │
└──────────────────────────────────────────┘
```

### Adapted Plan (Tauri 2 Mobile)
```
┌──────────────────────────────────────────┐
│     React + Vite (existing opcode)       │
├──────────────────────────────────────────┤
│         Tauri WebView Container          │
├──────────────────────────────────────────┤
│       Rust Backend (existing + new)      │
├───────────────┬──────────────────────────┤
│   iOS (WKWebView)  │  Android (WebView2) │
└───────────────────────────────────────────┘
```

## Code Reuse Estimate

| Layer | Reusable | Needs Modification | New Code |
|-------|----------|-------------------|----------|
| UI Components | 60% | 30% | 10% |
| Rust Backend | 80% | 15% | 5% |
| Styling (Tailwind) | 70% | 25% | 5% |
| Business Logic | 90% | 8% | 2% |

**Overall: ~75% code reuse from opcode**

## Key Files to Modify in Opcode

### Frontend (src/)
```
src/
├── App.tsx                 # Add platform detection, mobile routes
├── components/
│   ├── existing/           # Make responsive
│   │   ├── ProjectBrowser.tsx
│   │   ├── SessionList.tsx
│   │   ├── AgentManager.tsx
│   │   └── Terminal.tsx
│   └── mobile/             # NEW
│       ├── MobileLayout.tsx
│       ├── BottomNavigation.tsx
│       ├── SwipeablePane.tsx
│       └── CodeKeyboard.tsx
├── hooks/
│   └── usePlatform.ts      # NEW
└── layouts/
    ├── DesktopLayout.tsx   # Extract from App.tsx
    └── MobileLayout.tsx    # NEW
```

### Backend (src-tauri/)
```
src-tauri/
├── src/
│   ├── commands/
│   │   ├── mod.rs          # Add mobile module
│   │   └── mobile/         # NEW
│   │       ├── tailscale.rs
│   │       ├── ssh_bridge.rs
│   │       └── claude_web.rs
│   ├── lib.rs              # Add mobile commands
│   └── mobile/             # NEW (platform-specific)
│       ├── mod.rs
│       ├── ios.rs
│       └── android.rs
├── Cargo.toml              # Add mobile targets + deps
└── tauri.conf.json         # Mobile bundle config
```

## Migration Path

### Week 1-2: Foundation
1. Fork opcode
2. Add Tauri mobile targets
3. Create `usePlatform` hook
4. Wrap `App.tsx` with platform detection

### Week 2-3: Mobile UI
1. Create `MobileLayout.tsx`
2. Create `BottomNavigation.tsx`
3. Make `Terminal.tsx` responsive
4. Add `CodeKeyboard.tsx`

### Week 3-4: Connection Modes
1. Implement Tailscale SSH bridge (Rust)
2. Add Claude Web API integration
3. Create `ConnectionManager.tsx`
4. Test on both platforms

### Week 4-5: Integration
1. Make all existing components responsive
2. Mobile-specific screens
3. Gesture handling
4. Performance optimization

### Week 5-6: Polish
1. Haptic feedback
2. Push notifications
3. Testing matrix
4. Store submission prep

## Quick Wins (Start Here)

1. **Add platform hook** - 10 lines, immediate value
2. **Bottom navigation** - Standard mobile pattern
3. **Responsive Terminal** - Already WebView-based
4. **Dark theme** - Opcode already dark by default

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tauri mobile is beta | Medium | Fallback to Capacitor |
| PTY on mobile | High | WebSocket SSH bridge |
| AGPL license | Medium | Keep open source or negotiate |
| Performance on old phones | Medium | Optimize bundle, lazy load |
| App Store approval | Low | Follow guidelines, no JIT |
