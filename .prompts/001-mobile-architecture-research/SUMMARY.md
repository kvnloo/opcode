# Research Summary: Mobile Architecture

**Tauri 2 mobile with WebSocket SSH bridge is the recommended path for maximum code reuse (95%) and unified desktop+mobile codebase.**

**Version**: v1
**Date**: 2025-12-07

---

## Key Findings

### Platform Strategy
- **Tauri 2.0 mobile is STABLE** (released 2024) and production-ready for iOS + Android
- **95% frontend code reuse** possible - React, Radix UI, Framer Motion, Tailwind all compatible
- **80% Rust backend portable** to mobile with platform-specific adaptations
- **Capacitor is mature fallback** if Tauri mobile has production issues

### Terminal Implementation
- **WebSocket SSH bridge architecture** required (mobile lacks native PTY)
- **xterm.js works on mobile** but requires optimization (limit cols to 80-120)
- **Production proof exists**: Termius, Blink Shell, Pisth all use xterm.js successfully
- **Mobile keyboard challenges** solvable (custom toolbar, disable autocorrect)

### Connection Architectures
- **Direct SSH**: Bridge server connects to remote Linux hosts (standard workflow)
- **Managed containers**: Opcode-hosted ephemeral Claude environments (subscription model)
- **Tailscale VPN**: Mobile→Desktop via Tailscale (no SDK, user installs separately)
- **Hybrid sync**: Multi-device session synchronization (complex but valuable)

### Performance
- **App size**: 3-5MB (Tauri) vs 5-15MB (Capacitor) vs 10-25MB (React Native)
- **Terminal latency**: 100-300ms acceptable (proven by Mosh, existing apps)
- **Android WebView**: Some performance issues reported, needs testing
- **Battery**: Background WebSocket requires careful management

### Competitive Landscape
- **Termius** (cross-platform): Modern SSH client, proven WebSocket architecture
- **Blink Shell** (iOS): Desktop-grade terminal, excellent touch UX reference
- **Fressh** (React Native): Uses Rust SSH + xterm.js (validates our architecture)

---

## Recommended Approach

### Primary Path: Tauri 2 Mobile
**Rationale:**
- Maximum ROI on existing React/Rust investment
- Single codebase for 5 platforms (Linux, macOS, Windows, iOS, Android)
- Preserves open-source AGPL-3.0 licensing
- Active Tauri team committed to mobile parity

**Architecture:**
```
[Mobile App (Tauri + React + xterm.js)]
          ↓ WebSocket
[Bridge Server (Rust/Node.js)]
          ↓ SSH
[Claude Code Process (Remote/Container/Desktop)]
```

**Timeline:** 2-3 week POC → 4-6 week alpha → 2-3 week beta → public release

### Fallback: Capacitor
**When to use:**
- Tauri mobile shows production issues in POC
- Android performance unacceptable
- Need faster MVP path

**Tradeoff:** Lose desktop platform, lose Rust backend benefits, larger app size

### Not Recommended: React Native
**Reason:** ~0% code reuse, complete rewrite, no desktop support, benefits don't justify cost

---

## Decisions Needed

### Critical Path Decisions
1. **Bridge Server Hosting Strategy**
   - [ ] Self-hosted only (users run own bridge)
   - [ ] Managed service (Opcode hosts containers) - requires infrastructure investment
   - [ ] Hybrid (support both)
   - **Recommendation**: Start self-hosted, add managed service if demand exists

2. **Session Synchronization**
   - [ ] Desktop and mobile share sessions (real-time sync via cloud)
   - [ ] Manual export/import only
   - [ ] No synchronization (separate environments)
   - **Recommendation**: Manual export/import for v1, real-time sync in v2

3. **File Access Pattern**
   - [ ] Full remote file system access via SSH
   - [ ] Limited mobile storage with sync
   - [ ] Read-only on mobile
   - **Recommendation**: Full remote access (matches desktop workflow)

4. **Offline Capabilities**
   - [ ] Full offline mode with local Claude Code execution (very complex)
   - [ ] Cached session viewing only
   - [ ] Requires internet (simplest)
   - **Recommendation**: Requires internet for v1, explore offline in future

### Non-Critical Decisions (can defer)
- OAuth vs API key authentication for Claude API
- Biometric app unlock requirement
- Free tier limits for managed service
- Beta testing group size (20-50 recommended)

---

## Blockers

### Hard Blockers (Must Resolve)
None identified. All technical challenges have proven solutions.

### Soft Blockers (Reduce Risk)
1. **Tauri mobile device testing needed** - verify iOS/Android performance on real devices
   - **Mitigation**: POC phase includes extensive device testing

2. **Android WebView performance uncertainty** - some apps report jank
   - **Mitigation**: Test early on low-end Android devices, Capacitor fallback ready

3. **Bridge server infrastructure costs** - managed service could be expensive
   - **Mitigation**: Start with self-hosted only, no infrastructure required

---

## Risks (Medium-Low Overall)

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Tauri mobile missing features | Medium | Feature gaps vs desktop | Accept platform limitations, document clearly |
| xterm.js mobile performance | Medium | Slow/janky terminal | Optimize cols, use canvas renderer, test extensively |
| App Store rejection | Low | Delayed launch | Follow guidelines, similar apps exist |
| Bridge server complexity | Medium | Development time | Use proven libraries (wstunnel), extensive testing |
| User adoption slow | Low | Less ROI | Desktop remains primary, mobile is bonus |

**Overall Assessment**: Risks are manageable with standard engineering practices. No show-stoppers identified.

---

## Next Step

**ACTION: Begin Phase 1 POC (2-3 weeks)**

### Week 1: Tauri Mobile Scaffold + xterm.js Integration
- [ ] Create Tauri 2 mobile project with iOS + Android targets
- [ ] Port minimal Opcode UI (session list, single terminal view)
- [ ] Integrate xterm.js in mobile WebView
- [ ] Test on iOS simulator, Android emulator, 2 physical devices
- [ ] Document compatibility issues

### Week 2: WebSocket Bridge Prototype
- [ ] Build minimal Rust WebSocket server (tokio-tungstenite)
- [ ] Integrate SSH client (ssh2 crate)
- [ ] Implement WebSocket ↔ SSH protocol translation
- [ ] Test end-to-end: Mobile app → Bridge → Local SSH server
- [ ] Measure latency and performance

### Week 3: Decision Point & Refinement
- [ ] Test mobile keyboard input thoroughly (iOS/Android)
- [ ] Measure xterm.js rendering performance on 5+ devices
- [ ] Evaluate Tauri mobile build process and DX
- [ ] Document all issues and limitations
- [ ] **DECISION**: Continue with Tauri mobile OR pivot to Capacitor

**Success Criteria:**
- ✅ Basic terminal I/O working on iOS and Android
- ✅ xterm.js rendering at 30+ fps on mid-range devices
- ✅ WebSocket bridge handles 10+ concurrent connections
- ✅ No critical Tauri mobile blockers discovered

**Failure Criteria (pivot to Capacitor):**
- ❌ xterm.js performance <20 fps on Android
- ❌ Critical Tauri mobile bugs blocking basic functionality
- ❌ Build process too complex or unstable
- ❌ iOS/Android platform APIs inadequate for requirements

---

## Resources

### Documentation
- [Tauri 2.0 Mobile Docs](https://v2.tauri.app/develop/)
- [xterm.js Documentation](https://xtermjs.org/docs/)
- [wstunnel GitHub](https://github.com/erebe/wstunnel)
- [Capacitor Docs](https://capacitorjs.com/) (fallback reference)

### Reference Apps
- [Blink Shell](https://blink.sh/) - iOS terminal UX inspiration
- [Termius](https://termius.com/) - Cross-platform architecture reference
- [Fressh](https://fressh.dev/) - React Native + Rust SSH example

### Community
- [Tauri Discord](https://discord.com/invite/tauri) - Mobile support channel
- [xterm.js GitHub Issues](https://github.com/xtermjs/xterm.js/issues) - Mobile performance discussions

---

## Open Questions for Phase 1 POC

1. Can Tauri mobile access iOS Keychain / Android Keystore for secure SSH key storage?
2. What's the actual xterm.js fps on Pixel 6 Pro and iPhone 12 (common mid-range devices)?
3. Does Tauri mobile support background WebSocket connections (app backgrounded)?
4. What's the realistic bridge server resource usage (RAM, CPU) per connection?
5. Can we implement mDNS for local bridge discovery on LAN?

**Note**: These questions will be answered during POC execution and documented in findings.
