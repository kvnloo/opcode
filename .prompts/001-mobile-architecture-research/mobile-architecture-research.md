# Mobile Architecture Research Findings

<metadata>
  <research_date>2025-12-07</research_date>
  <confidence>HIGH</confidence>
  <sources_consulted>
    - [Tauri 2.0 Stable Release](https://v2.tauri.app/blog/tauri-20/)
    - [Tauri Mobile Alpha Announcement](https://v2.tauri.app/blog/tauri-mobile-alpha/)
    - [Tauri 2 iOS Feedback Discussion](https://github.com/tauri-apps/tauri/discussions/10197)
    - [Tauri Mobile Issues #3884](https://github.com/tauri-apps/tauri/issues/3884)
    - [Tauri vs Capacitor Performance Discussion](https://github.com/tauri-apps/tauri/discussions/9958)
    - [xterm.js Mobile Performance Issues](https://github.com/xtermjs/xterm.js/issues/4597)
    - [xterm.js Mobile Support Issue](https://github.com/xtermjs/xterm.js/issues/1101)
    - [react-native-ssh-sftp Library](https://github.com/shaqian/react-native-ssh-sftp)
    - [Fressh Mobile SSH Client](https://fressh.dev/)
    - [Capacitor WebView Documentation](https://ionicframework.com/docs/core-concepts/webview)
    - [Ionic Performance Guide](https://ionic.io/blog/ionic-capacitor-the-best-path-for-performance)
    - [Tailscale iOS Documentation](https://tailscale.com/kb/1020/install-ios)
    - [Claude API Integration Guide](https://www.blackmoreops.com/claude-api-integration-complete-tutorial-guide/)
    - [wstunnel GitHub Project](https://github.com/erebe/wstunnel)
    - [Termius Modern SSH Client](https://termius.com/index.html)
    - [Blink Shell for iOS](https://blink.sh/)
  </sources_consulted>
</metadata>

## Executive Summary

Extending Opcode (Claudia) to mobile platforms presents a strategic opportunity with three viable architectural paths. Based on comprehensive research into Tauri 2.0 mobile capabilities, alternative frameworks (Capacitor, React Native), terminal implementations, and connection architectures, **the recommended approach is a phased strategy starting with Tauri 2.0 mobile for maximum code reuse, with Capacitor as a production-ready fallback.**

**Key Findings:**
- Tauri 2.0 has **stable mobile support** (released 2024) for iOS and Android with 100% frontend code reuse
- Terminal implementation on mobile requires **WebSocket SSH bridge architecture** due to WebView limitations
- Mobile SSH clients like Termius, Blink Shell prove **production viability** of terminal apps
- xterm.js works on mobile but has **performance challenges** requiring optimization
- Tailscale lacks mobile SDK but has **native apps** that could enable VPN workflows
- Claude API mobile integration is **straightforward** with standard HTTP authentication

**Risk Assessment:** Medium-Low. Tauri 2 mobile is stable but lacks desktop feature parity. Mobile terminal UX requires careful design for touch interfaces. WebSocket bridge adds architectural complexity but is proven in production apps.

---

## Platform Strategy Analysis

### Option 1: Tauri 2 Mobile (RECOMMENDED PRIMARY)

**Status:** Stable release (2024), production-ready for new mobile apps

**Strengths:**
- **100% Frontend Code Reuse**: React components, UI, state management work unchanged
- **Unified Codebase**: Desktop + Mobile from single codebase (5 platforms total)
- **Rust Backend**: Existing Tauri Rust commands portable to mobile
- **Plugin System**: Native iOS (Swift) and Android (Kotlin) integration via plugins
- **Small App Size**: ~600KB base due to system WebView usage
- **Active Development**: Tauri team committed to mobile feature parity in minor releases
- **Native Performance**: Leverages platform WebView (WKWebView on iOS, WebView on Android)

**Limitations:**
- **Feature Gaps**: Not all desktop plugins available on mobile yet
- **No Global Shortcuts**: Mobile OS restrictions prevent desktop features like global shortcuts, menu bar, system tray
- **Window API Limitations**: Many desktop window methods don't work on mobile
- **Development Experience**: Team acknowledges DX needs improvement vs desktop
- **iOS Development**: Requires macOS + Xcode (development constraint)
- **Build Complexity**: Xcode integration can be "much harder than expected" for mixed native/Rust codebases
- **Large APK Size**: Some users report 45MB Android packages (optimization needed)

**Mobile-Specific APIs Available:**
- Notifications
- Dialogs
- NFC
- Barcode scanning
- Biometric authentication
- Clipboard
- Deep linking

**Architecture Fit for Opcode:**
```
✅ Perfect Fit:
- React UI components (95% reusable)
- Framer Motion animations
- State management (Zustand)
- Radix UI components (touch-optimized)
- API layer structure

⚠️ Requires Adaptation:
- Custom titlebar → Native mobile headers
- Desktop window controls → Mobile gestures
- File system access → Scoped mobile storage
- Process spawning → Background task APIs
- Terminal PTY → WebSocket bridge

❌ Not Available:
- Global shortcuts
- System tray
- Window transparency effects
- Multi-window management
```

**Recommendation:** **Start here.** Tauri 2 mobile offers the fastest path to mobile with maximum code reuse. Existing React codebase can be deployed to mobile with terminal functionality via WebSocket bridge. Accept mobile feature limitations as platform constraints.

---

### Option 2: Capacitor Wrapper (FALLBACK/PARALLEL)

**Status:** Mature, production-proven, widely adopted

**Strengths:**
- **Battle-Tested**: Used by thousands of production apps since 2018
- **Excellent Documentation**: Ionic ecosystem provides extensive guides
- **Plugin Ecosystem**: Vast library of community plugins
- **Performance**: Better than expected - "outperforms React Native for UI rendering"
- **WebView Consistency**: More optimized than raw WebView implementations
- **Ionic Framework Integration**: Optional UI component library for mobile-optimized design
- **JavaScript-Only**: No Rust required, simpler for web developers
- **Fast JavaScript**: "Access to fastest JavaScript engines available on mobile"

**Limitations:**
- **Android Performance Issues**: Some developers report jank/stutter on Android devices (Pixel 6 Pro examples)
- **WebView Problem**: Android issues may be WebView-specific, not Capacitor-solvable
- **App Size**: Larger than Tauri (500KB-5MB typical JavaScript bundle)
- **No Desktop**: Separate codebase needed for desktop (vs Tauri's unified approach)
- **Plugin Quality**: Varies across community plugins

**Performance Optimization Requirements:**
- Tree-shaking and code splitting to reduce JS bundle
- Bundling and minification
- Virtual scrolling for lists
- Careful animation optimization on Android
- 500KB-5MB JavaScript typical (vs Tauri's ~600KB total)

**Architecture Fit for Opcode:**
```
✅ Perfect Fit:
- React + TypeScript codebase (100% compatible)
- Web APIs and libraries
- Standard HTTP/WebSocket communication
- Progressive Web App potential

⚠️ Requires Adaptation:
- Lose desktop platform (Tauri-only)
- Lose Rust backend benefits
- Need JavaScript-based SSH client
- Android performance tuning required

❌ Not Available:
- Desktop platforms without separate implementation
- Rust-level system integration
```

**Recommendation:** **Use as fallback if Tauri mobile proves problematic** or **parallel development** to hedge risk. Capacitor is the safe, proven choice if Tauri 2 mobile has unexpected issues in production. Could also serve as faster MVP path while Tauri mobile matures.

---

### Option 3: React Native Port (NOT RECOMMENDED)

**Status:** Mature ecosystem, different architecture

**Strengths:**
- **Native UI Components**: True native rendering (not WebView)
- **Smooth Animations**: Native UI thread provides best animation performance
- **Large Ecosystem**: Massive library of packages and community support
- **Mature Platform**: Battle-tested in production for 10+ years
- **Expo Improvements**: 2025 Expo is "no longer just a beginner's playground"

**Limitations:**
- **Complete Rewrite Required**: ~0% code reuse from existing React codebase
- **Different Component Model**: React Native components ≠ React DOM components
- **No Desktop Support**: Would need separate desktop app entirely
- **Bridge Overhead**: JavaScript-to-native bridge introduces latency
- **Fragmentation**: Need separate code for iOS/Android platform differences
- **Larger App Size**: Larger than Tauri, smaller than Capacitor
- **CSS Limitations**: Different styling approach (StyleSheet, no traditional CSS)

**Architecture Fit for Opcode:**
```
❌ Major Rewrite Required:
- All React components must be rewritten
- No Radix UI (web-only)
- No Framer Motion (limited RN support)
- Different navigation patterns
- Different state management patterns
- Different API integration approaches

✅ Could Preserve:
- Business logic (with modifications)
- API communication layer (adapted)
- State management concepts
```

**Recommendation:** **Not recommended.** The benefits (native UI performance) don't justify the complete rewrite cost when Opcode's core value is the terminal/Claude interface, not native UI components. Tauri and Capacitor both preserve the existing React investment.

---

## Component Reuse Analysis

### Existing Opcode Architecture (Desktop)

**Frontend:**
- **Framework**: React 18 + TypeScript
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **State**: Zustand
- **Styling**: Tailwind CSS 4.1
- **Terminal**: Custom WebSocket-based session viewer
- **API Layer**: Tauri commands to Rust backend

**Backend (Tauri Rust):**
- Claude Code process spawning and management
- Session checkpointing and state management
- Agent execution framework
- MCP (Model Context Protocol) server integration
- File system operations (scoped to $HOME)
- SQLite database for settings/sessions
- SSH/shell command execution via Rust

### Code Reuse Matrix by Platform

| Component Category | Tauri 2 Mobile | Capacitor | React Native |
|-------------------|----------------|-----------|--------------|
| **React Components** | 95% | 95% | 0% (rewrite) |
| **Radix UI** | 90% (touch adapt) | 90% (touch adapt) | 0% (no support) |
| **Framer Motion** | 95% | 95% | 40% (limited) |
| **Tailwind CSS** | 100% | 100% | 0% (different styling) |
| **Zustand State** | 100% | 100% | 80% (adapted) |
| **API Layer** | 60% (adapt Tauri commands) | 10% (rewrite for Capacitor plugins) | 10% (rewrite) |
| **Rust Backend** | 80% (mobile-compatible commands) | 0% (no Rust) | 0% (no Rust) |
| **Business Logic** | 90% | 85% | 70% (adapted) |

**Key Insight:** Tauri 2 mobile preserves the most existing investment, especially the Rust backend logic.

---

## Terminal/PTY Architecture for Mobile

### Challenge: Native PTY Not Available on Mobile

Desktop Opcode spawns actual Claude Code processes with native PTY (pseudo-terminal). Mobile platforms **do not support native PTY** in the same way due to sandboxing restrictions.

### Solution: WebSocket SSH Bridge Architecture

**Proven Pattern** (used by production mobile SSH clients like Termius, Blink Shell):

```
[Mobile App] ←WebSocket→ [Bridge Server] ←SSH→ [Remote Host/Container]
    ↓                           ↓                      ↓
xterm.js                    wstunnel/             Claude Code
rendering                   Chisel/custom          process
```

**Architecture Components:**

1. **Frontend (Mobile App)**
   - **xterm.js** for terminal rendering and input handling
   - WebSocket client for real-time communication
   - Touch-optimized keyboard (special keys, shortcuts)
   - Session state management

2. **Bridge Server** (Rust or Node.js)
   - WebSocket server accepting mobile connections
   - SSH client to remote hosts or local containers
   - Protocol translation (WebSocket ↔ SSH)
   - Authentication/session management
   - Optional: Cloudflare tunnel for NAT traversal

3. **Backend (Remote/Container)**
   - Claude Code process running in Linux container or remote server
   - Standard SSH daemon
   - File system access
   - Full PTY support

**Deployment Options:**

**Option A: Self-Hosted Bridge Server**
- User runs bridge server on their VPS/home server
- Mobile app connects to user's bridge
- Full control, privacy
- Requires user technical setup

**Option B: Managed Bridge Service**
- Opcode provides hosted bridge infrastructure
- Users authenticate to bridge service
- Bridge spawns isolated Claude Code containers per user
- Simplest UX, subscription model potential
- Example: Railway, Fly.io, AWS Fargate for container orchestration

**Option C: Hybrid (Tailscale)**
- User's desktop/server runs bridge + Claude Code
- Tailscale VPN creates secure mobile → desktop tunnel
- Mobile app connects via Tailscale IP
- No port forwarding, NAT-busting
- Limitation: **No Tailscale mobile SDK** - would require user to install Tailscale app separately and configure

### xterm.js on Mobile: Known Issues and Solutions

**Performance Issues:**
- **Problem**: Android WebView very slow with `cols > 200` (seconds-level delay)
- **Solution**: Limit terminal columns to 80-120 for mobile screens (natural fit)
- **Problem**: Long text history causes backspace issues with predictive keyboards
- **Solution**: Change textarea to `<input type="password">` to disable prediction

**Keyboard Handling:**
- **Problem**: Inconsistent `term.onData` events between iOS and Android
- **Solution**: Use latest xterm.js (@xterm/xterm) with mobile-specific event handlers
- **Problem**: Smart keyboards (autocorrect, prediction) cause confusing behavior
- **Solution**: Disable via `autocomplete="off"` and `type="password"` attributes

**Touch Optimization:**
- Add custom touch keyboard with ESC, Ctrl, Tab, Arrow keys
- Implement swipe gestures for common actions
- Larger touch targets for buttons/controls
- Example: [Blink Shell](https://blink.sh/) has excellent mobile keyboard UX

**Production Proof:**
- **Pisth** (iOS SSH client) uses xterm.js successfully
- **Termius** (cross-platform) has smooth terminal rendering
- **Blink Shell** (iOS) is "desktop grade terminal" with xterm.js

---

## Connection Modes Architecture

### Mode 1: Direct SSH to Remote Server

```
[Mobile App (xterm.js)] →WebSocket→ [Bridge Server] →SSH→ [Remote Linux Server]
                                                              ↓
                                                        [Claude Code Process]
                                                        [User's Project Files]
```

**Use Case:** Developer working on remote VPS, cloud VM, or work server

**Pros:**
- Standard SSH workflow
- Existing server infrastructure
- File persistence on remote
- Can use existing SSH keys

**Cons:**
- Requires remote server
- Network latency affects responsiveness
- Data usage on cellular

---

### Mode 2: Containerized Claude Code (Managed Service)

```
[Mobile App] →WebSocket→ [Opcode Bridge Service] →Container→ [Ephemeral Claude Environment]
                              ↓                                      ↓
                         [Load Balancer]                       [Isolated FS]
                         [Auth/Billing]                        [Session State]
                         [Container Orchestration]             [Claude Code Binary]
```

**Use Case:** User without server, wants instant mobile experience

**Pros:**
- Zero setup for user
- Opcode controls environment (consistent Claude version, tools)
- Subscription revenue model
- Automatic scaling
- Session checkpointing to cloud storage

**Cons:**
- Requires Opcode to run infrastructure
- Cost per user (container runtime)
- Data stored on Opcode servers (privacy concern)
- Network latency still a factor

**Implementation:**
- Railway, Fly.io, or AWS Fargate for container orchestration
- Rust bridge server for WebSocket handling
- S3/R2 for session persistence
- Stripe for billing

---

### Mode 3: Tailscale VPN to Desktop

```
[Mobile App] →Tailscale VPN→ [User's Desktop/Server] →Local→ [Claude Code Process]
                                      ↓
                                [Bridge Server (localhost)]
                                [Full File Access]
```

**Use Case:** Developer wants to access their desktop/laptop development environment from mobile

**Pros:**
- Direct access to user's files
- No cloud server required
- Zero latency (LAN-like)
- Maximum privacy

**Cons:**
- Requires desktop/server always running
- User must set up Tailscale on both devices
- **No Tailscale SDK**: User installs Tailscale app separately, Opcode app connects via Tailscale IP
- More complex user setup

**Implementation Path:**
1. User installs Tailscale on desktop and mobile (separate app)
2. Desktop runs Opcode bridge server (new component)
3. Mobile Opcode app discovers desktop via Tailscale IP (manual config or mDNS)
4. WebSocket connection over Tailscale network

---

### Mode 4: Hybrid (Local + Remote Sync)

```
[Mobile App] →WebSocket→ [Bridge Server] →SSH→ [Remote Linux Server]
                              ↓                       ↓
                         [Session Sync]         [Git Repo Sync]
                              ↓                       ↓
                         [Local Desktop] ←Sync→ [Cloud Storage]
```

**Use Case:** Work across mobile, desktop, and remote environments seamlessly

**Pros:**
- Flexibility across devices
- Session continuity
- Offline-capable (with sync)

**Cons:**
- Complex synchronization logic
- Potential sync conflicts
- Multiple authentication flows

---

## UI/UX Patterns for Mobile

### Challenges

1. **No Custom Titlebar**
   - Desktop: Custom traffic lights, transparent title bar
   - Mobile: Native navigation bars, status bars
   - **Solution**: Use platform-native headers, bottom tab navigation

2. **Touch vs Mouse**
   - Desktop: Hover states, right-click context menus, drag-and-drop
   - Mobile: Touch gestures, long-press, swipe actions
   - **Solution**: Redesign interactions for touch (e.g., swipe to delete sessions, long-press for context menu)

3. **Screen Size**
   - Desktop: Multi-column layouts, sidebars, large terminal area
   - Mobile: Single column, collapsible panels, full-screen terminal
   - **Solution**: Responsive layouts, bottom sheet patterns, full-screen modes

4. **Keyboard**
   - Desktop: Full keyboard, shortcuts
   - Mobile: On-screen keyboard, limited screen space when visible
   - **Solution**: Custom keyboard accessory view with ESC, Ctrl, Tab, Arrows (like Blink Shell)

### Design Patterns

**Navigation:**
- Bottom tab bar: Chat | Sessions | Agents | Settings
- Swipe gestures for navigation
- Full-screen terminal mode (hide UI)

**Terminal Interface:**
```
┌─────────────────────────────┐
│ [< Back]  Session Name   [⚙]│ ← Native header
├─────────────────────────────┤
│                             │
│   Terminal Output Area      │ ← xterm.js rendering
│   (full height)             │
│                             │
│                             │
├─────────────────────────────┤
│ [ESC][Ctrl][Tab][↑][↓][←][→]│ ← Custom keyboard toolbar
├─────────────────────────────┤
│ [Soft Keyboard Area]        │ ← System keyboard
└─────────────────────────────┘
```

**Session Management:**
- Card-based list (swipe to delete, tap to resume)
- Pull-to-refresh for session list
- Long-press for checkpoint/fork options

**Settings:**
- Native mobile settings patterns
- Section headers, grouped controls
- Toggle switches, picker wheels

### Responsive Component Adaptation

| Desktop Component | Mobile Adaptation |
|------------------|-------------------|
| CustomTitlebar | Native mobile header |
| Multi-window tabs | Bottom tab navigation + modal stack |
| Sidebar | Bottom sheet or slide-over panel |
| Hover tooltips | Long-press or info buttons |
| Right-click menus | Long-press action sheets |
| Drag-and-drop | Swipe gestures + explicit actions |
| Keyboard shortcuts | Gesture shortcuts + on-screen buttons |

---

## Performance Considerations

### App Size

| Platform | Expected Size | Optimizations |
|----------|--------------|---------------|
| Tauri 2 Mobile | 600KB-5MB | System WebView, tree-shaking |
| Capacitor | 5-15MB | Code splitting, lazy loading |
| React Native | 10-25MB | Hermes engine, modular architecture |

**Opcode-Specific Factors:**
- xterm.js bundle: ~500KB
- Framer Motion: ~50KB (tree-shakeable)
- Radix UI: ~100KB (only used components)
- App logic: ~1-2MB
- **Total estimate (Tauri)**: 3-5MB

### Runtime Performance

**JavaScript Performance:**
- Capacitor: "Access to fastest JavaScript engines" (V8/JavaScriptCore)
- Tauri: System WebView (WKWebView on iOS = JavaScriptCore, Chrome WebView on Android = V8)
- Recommendation: Both excellent, optimize JS bundle size regardless

**Terminal Rendering:**
- xterm.js performance: 60fps possible on modern devices
- Limit terminal columns (80-120) for mobile
- Use xterm.js canvas renderer (default, fastest)
- Debounce rapid updates during large outputs

**Network Performance:**
- WebSocket latency: ~20-100ms (WiFi), ~100-300ms (LTE)
- Optimize for intermittent connections (reconnection logic)
- Buffer commands during network disruption
- Visual feedback for connection state

**Battery Life:**
- WebSocket keepalive: Use platform background task APIs
- Terminal rendering: Pause when app backgrounded
- Network optimization: Batch updates, compress data

### Memory Management

**Mobile Constraints:**
- iOS: 1-2GB typical app memory limit (device dependent)
- Android: Varies widely, 512MB-2GB safe targets
- Terminal history: Limit to 1000 lines (configurable)
- Session state: Serialize to disk, don't hold all in memory
- Image previews: Lazy load, thumbnail caching

---

## Open Source Strategy

### Current Opcode License: AGPL-3.0

**Implications for Mobile:**
- Mobile app binaries can be distributed via App Store/Play Store
- AGPL requires source code availability for network-accessed services
- If offering managed bridge service, **must open-source the bridge server**
- Users can self-host to avoid AGPL network requirements

### Recommended Licensing Approach

**Option A: Dual Licensing**
- Open-source mobile app (AGPL-3.0) for self-hosters
- Proprietary managed service offering (subscription)
- Users choose: run own infrastructure (free, AGPL) or pay for managed service

**Option B: Bridge Server Apache 2.0/MIT**
- Mobile app: AGPL-3.0 (matches desktop)
- Bridge server: Permissive license (Apache 2.0 or MIT)
- Allows commercial bridge services without AGPL obligations
- Maximizes adoption by removing network service AGPL friction

**Option C: Full Open Source**
- Everything AGPL-3.0
- Monetize via support, enterprise features, hosted service
- Strongest open-source community alignment

**Recommendation:** **Option B** provides best balance:
- Preserves AGPL for core app (community contributions)
- Enables commercial bridge services ecosystem
- Users can self-host without restrictions
- Allows Opcode to offer managed service competitively

### Community Contribution Strategy

**Mobile-Specific Contributions Needed:**
- Touch-optimized UI components
- Mobile keyboard accessory views
- Platform-specific plugins (NFC, biometrics)
- Bridge server implementations (Rust, Node.js)
- Documentation for self-hosting bridge
- Cloud deployment templates (Railway, Fly.io, AWS)

**Potential Monetization:**
- Managed bridge service ($9-19/month)
- Enterprise mobile features (MDM, SSO)
- Priority support for mobile deployments
- Custom bridge server hosting

---

## Risk Assessment

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Tauri mobile immaturity | Medium | Use Capacitor as fallback, wait for Tauri feature parity |
| xterm.js mobile performance | Medium | Optimize column width, test on low-end devices, use canvas renderer |
| WebSocket bridge complexity | Medium | Use proven libraries (wstunnel, Chisel), extensive testing |
| iOS App Store approval | Low | Similar apps exist (Termius, Blink Shell), follow guidelines |
| Android performance issues | Medium | Extensive Android device testing, performance profiling |
| Network connectivity | Low | Implement robust reconnection logic, offline mode |

### Business Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Managed service infrastructure cost | Medium | Start with self-hosted only, add service incrementally |
| User adoption (mobile vs desktop) | Low | Desktop remains primary, mobile is bonus |
| Competitor mobile apps | Low | Differentiation via Claude Code integration uniqueness |
| App Store maintenance | Low | Automated CI/CD for releases |

### Security Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Bridge server vulnerabilities | High | Security audits, rate limiting, authentication |
| API key leakage | High | Secure storage (iOS Keychain, Android Keystore) |
| Man-in-the-middle attacks | Medium | Enforce TLS for all WebSocket connections |
| Container escape (managed service) | Medium | Use hardened container runtime, principle of least privilege |

---

## Open Questions

1. **Desktop/Mobile Session Synchronization**
   - Should desktop and mobile share session history?
   - Real-time sync or manual export/import?
   - Conflict resolution strategy?

2. **Offline Capabilities**
   - Can mobile app work offline at all?
   - Local Claude Code execution feasible on mobile?
   - What features require internet connectivity?

3. **File Management**
   - How to handle file uploads/downloads in mobile terminal?
   - Integration with iOS Files app / Android file picker?
   - Git repository cloning/syncing workflow?

4. **Authentication Flow**
   - OAuth for Claude API on mobile?
   - Biometric authentication for app unlock?
   - SSH key management on mobile?

5. **Monetization Model**
   - Managed bridge service pricing?
   - Free tier limits?
   - Enterprise licensing model?

6. **Beta Testing Strategy**
   - TestFlight (iOS) + Google Play Internal Testing (Android)?
   - How many beta testers needed?
   - Feedback collection mechanism?

---

## Assumptions

1. **Tauri 2 Mobile** will continue to receive feature parity updates as promised by the team
2. **Users are comfortable** with WebSocket bridge architecture (proven pattern in existing apps)
3. **xterm.js performance** issues can be mitigated with optimization and column limiting
4. **App Store approval** will not block terminal/SSH functionality (precedent: Termius, Blink Shell, Prompt)
5. **Bridge server** can be implemented in Rust (using existing expertise) or Node.js (faster initial iteration)
6. **Network latency** of 100-300ms is acceptable for terminal interactions (proven by Mosh, Termius)
7. **Self-hosting** will be primary deployment initially (avoids infrastructure costs)
8. **Mobile screen size** is sufficient for terminal UX with proper design (proven by existing apps)

---

## Dependencies

### Technical Dependencies

**Tauri 2 Mobile Path:**
- Tauri 2.0+ with stable mobile support ✅ (available now)
- Rust 1.70+ ✅
- Xcode (iOS development) ✅ (macOS requirement)
- Android Studio / Android SDK ✅
- System WebView (iOS 13+, Android 7+) ✅

**Bridge Server:**
- WebSocket library (tokio-tungstenite for Rust or ws for Node.js)
- SSH client library (ssh2 crate for Rust or ssh2 npm for Node.js)
- Container runtime (Docker, Podman) for managed service
- Cloud platform (Railway, Fly.io, AWS) for managed service

**Frontend:**
- xterm.js (@xterm/xterm) ✅
- React 18+ ✅
- Existing Opcode component library ✅

### External Service Dependencies

**Optional (for managed service):**
- Container orchestration platform (Railway, Fly.io, AWS Fargate)
- Object storage (S3, R2) for session persistence
- Authentication service (Clerk, Auth0, or custom)
- Payment processing (Stripe)

**Optional (for Tailscale mode):**
- User's Tailscale account and mobile app
- mDNS/Bonjour for local device discovery

---

## Next Steps

### Phase 1: Proof of Concept (2-3 weeks)

1. **Tauri Mobile Scaffold**
   - Create new Tauri mobile project
   - Port minimal Opcode UI (session list, terminal view)
   - Test on iOS simulator and Android emulator
   - Verify React component compatibility

2. **WebSocket Bridge Prototype**
   - Build minimal Rust WebSocket server
   - Integrate SSH client library
   - Test WebSocket ↔ SSH protocol translation
   - Deploy to local development environment

3. **xterm.js Mobile Testing**
   - Integrate xterm.js in mobile WebView
   - Test keyboard input on physical iOS and Android devices
   - Measure rendering performance
   - Implement mobile keyboard toolbar

4. **Decision Point**: Tauri mobile viable? → Continue | → Pivot to Capacitor

### Phase 2: Alpha Development (4-6 weeks)

1. **Core Features**
   - Session management (create, resume, delete)
   - Claude Code integration via bridge
   - File browser (basic)
   - Settings screen

2. **Bridge Server Hardening**
   - Authentication/authorization
   - Rate limiting
   - Connection pooling
   - Error handling and recovery

3. **Mobile UX Polish**
   - Touch-optimized UI components
   - Gesture navigation
   - Custom keyboard accessories
   - Responsive layouts

4. **Testing**
   - Unit tests for critical paths
   - Integration tests for bridge
   - Manual testing on 5+ device types
   - Performance profiling

### Phase 3: Beta Release (2-3 weeks)

1. **App Store Preparation**
   - iOS: App Store Connect setup, TestFlight
   - Android: Google Play Console, internal testing
   - Screenshots, descriptions, privacy policy

2. **Documentation**
   - Self-hosting bridge server guide
   - Mobile app user guide
   - Architecture documentation
   - Contributing guidelines

3. **Beta Testing**
   - 20-50 beta testers
   - Feedback collection (in-app + Discord/forum)
   - Bug tracking and triage
   - Performance metrics collection

### Phase 4: Public Release (Ongoing)

1. **App Store Submission**
   - iOS App Store review
   - Google Play Store review
   - Address any review feedback

2. **Managed Service (Optional)**
   - Infrastructure setup (Railway/Fly.io/AWS)
   - Billing integration (Stripe)
   - Support channels (email, chat)
   - Monitoring and alerting

3. **Community Building**
   - Announce on social media, Hacker News, Reddit
   - Create tutorials and demo videos
   - Engage with user feedback
   - Iterate based on usage data

### Success Metrics

- **Adoption**: 1,000+ mobile installs in first 3 months
- **Performance**: <5% crash rate, 4.0+ App Store rating
- **Engagement**: 30%+ weekly active users
- **Revenue** (if managed service): $5K+ MRR by month 6

---

## Conclusion

Extending Opcode to mobile is **technically feasible** with **Tauri 2 mobile as the recommended path** due to maximum code reuse and unified codebase. The primary technical challenge is implementing a WebSocket SSH bridge for terminal functionality, which is a proven pattern in production apps. Mobile UX requires thoughtful design for touch interfaces, but existing apps demonstrate viability. The phased approach allows validation of Tauri mobile with a Capacitor fallback, minimizing risk while maximizing code reuse.

**Recommended Action:** Proceed with Phase 1 (Proof of Concept) using Tauri 2 mobile + WebSocket bridge prototype. Decision point after 2-3 weeks to continue or pivot to Capacitor.
