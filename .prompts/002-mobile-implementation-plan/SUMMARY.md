# Mobile Implementation Plan Summary

**Version**: v1.0
**Date**: 2025-12-07
**Status**: Ready for Execution

---

## Quick Overview

**Goal**: Extend Opcode (Claudia) to iOS and Android using Tauri 2.0 Mobile with 95% code reuse.

**Approach**: 7-phase implementation with 15-agent parallel execution over 8-10 weeks.

**Architecture**: Tauri 2.0 Mobile + WebSocket SSH Bridge for terminal functionality.

---

## Executive Decision

✅ **PRIMARY PATH: Tauri 2.0 Mobile**
- Maximum code reuse (95% frontend, 80% backend)
- Single codebase for desktop + mobile
- Proven mobile support (stable since 2024)

⚠️ **FALLBACK: Capacitor**
- If Tauri mobile shows critical issues in Phase 1
- Battle-tested alternative with 80% code reuse

❌ **NOT RECOMMENDED: React Native**
- Requires complete rewrite (~0% code reuse)
- Benefits don't justify cost for terminal app

---

## 7 Phases at a Glance

| Phase | Duration | Agents | Focus | Key Deliverables |
|-------|----------|--------|-------|------------------|
| **1. Foundation** | 2 weeks | 6 | Build system, platform detection | Tauri mobile config, platform hooks |
| **2. Mobile UI** | 1 week | 7 | Bottom nav, swipeable panes | Mobile layout system, touch components |
| **3. Mobile Screens** | 1 week | 6 | Apps, Create, Account screens | Screen implementations, file browser |
| **4. Terminal & Connection** | 2 weeks | 8 | SSH bridge, mobile terminal | WebSocket bridge, xterm.js terminal |
| **5. Agent Execution** | 1 week | 7 | Agent UI, progress tracking | Mobile agent view, background execution |
| **6. Polish & Performance** | 1 week | 8 | Haptics, optimization, accessibility | Performance tuning, error handling |
| **7. CI/CD & Distribution** | 2 weeks | 6 | App Store prep, beta testing | CI/CD pipeline, store listings |

**Total**: 8-10 weeks, 15 agents utilized across phases

---

## Phase Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Mobile UI) ←─────┐
    ↓                      │
Phase 3 (Screens)          │
    ↓                      │
Phase 4 (Terminal) ←───────┘
    ↓
Phase 5 (Agent Execution)
    ↓
Phase 6 (Polish)
    ↓
Phase 7 (Distribution)
```

---

## Critical Success Factors

### Technical
- [ ] Tauri mobile build system works reliably
- [ ] xterm.js performance >30fps on mid-range devices
- [ ] WebSocket SSH bridge protocol stable
- [ ] All existing features functional on mobile

### User Experience
- [ ] Terminal rendering smooth and responsive
- [ ] Touch gestures intuitive
- [ ] Connection modes (SSH, Tailscale, Web) easy to set up
- [ ] Agent execution visible with progress tracking

### Quality
- [ ] <5% crash rate
- [ ] 4.0+ App Store/Play Store rating
- [ ] App launch time <3 seconds
- [ ] APK/IPA size <50MB

---

## Key Architectural Decisions

### 1. WebSocket SSH Bridge Architecture
**Problem**: Mobile platforms don't support native PTY (pseudo-terminal) due to sandboxing.

**Solution**: WebSocket bridge server that translates between mobile WebSocket and SSH.

```
[Mobile App] ←WebSocket→ [Bridge Server] ←SSH→ [Remote Host/Container]
    ↓                           ↓                      ↓
xterm.js                    Rust/Node.js          Claude Code
rendering                   translation            process
```

**Proven Pattern**: Used by production apps like Termius, Blink Shell, Fressh.

### 2. Platform Detection System
**Hook**: `usePlatform()` detects iOS, Android, macOS, Windows, Linux.

**Responsive**: Components adapt based on platform (mobile vs desktop vs tablet).

**Code Reuse**: Desktop components wrapped with mobile adapters.

### 3. Connection Modes
**Mode 1 - Direct SSH**: Bridge connects to user's remote server
**Mode 2 - Managed Containers**: Opcode-hosted ephemeral Claude environments (future)
**Mode 3 - Tailscale VPN**: Mobile→Desktop via Tailscale tunnel
**Mode 4 - Hybrid**: Multi-device sync (future)

---

## Agent Specialization Strategy

### Parallel Execution Pattern
Each phase utilizes 6-8 agents working concurrently on independent task groups.

**Example (Phase 1)**:
- `devops-architect` → Mobile build configuration
- `system-architect` → Platform detection hooks
- `frontend-architect` → Layout system design
- `backend-dev` → Rust mobile commands
- `technical-writer` → Architecture documentation
- `planner` → Phase 2-7 detailed breakdown

**Coordination**: All agents spawned via Claude Code's Task tool in single message for parallel execution.

---

## Code Reuse Breakdown

| Component | Desktop Code | Mobile Adaptation | Reuse % |
|-----------|--------------|-------------------|---------|
| React Components | 100% | Add responsive wrappers | 95% |
| Radix UI | 100% | Touch-optimize | 90% |
| Framer Motion | 100% | Mobile gestures | 95% |
| Tailwind CSS | 100% | Mobile breakpoints | 100% |
| Zustand State | 100% | No changes | 100% |
| Rust Backend | 100% | Add mobile commands | 80% |
| Business Logic | 100% | Minimal adaptation | 90% |

**Overall**: ~95% frontend, ~80% backend code reuse.

---

## File Structure Overview

### New Directories
```
opcode/
├── src/
│   ├── components/mobile/        # Mobile-specific components
│   ├── screens/mobile/            # Mobile screens
│   ├── layouts/                   # Layout wrappers
│   ├── hooks/mobile/              # Mobile hooks
│   └── lib/mobile/                # Mobile utilities
├── src-tauri/src/
│   ├── commands/mobile/           # Mobile Rust commands
│   └── mobile/                    # iOS/Android platform code
├── bridge-server/                 # Standalone SSH bridge (Rust)
├── tests/mobile/                  # Mobile tests
├── docs/mobile/                   # Mobile documentation
└── store-assets/                  # App Store/Play Store assets
```

**Total New Files**: ~120 files across 7 phases.

---

## Risk Assessment & Mitigation

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Tauri mobile immaturity | Medium | Low | Capacitor fallback ready |
| xterm.js performance | Medium | Medium | Limit cols to 80-120, optimize |
| App Store rejection | Low | Low | Follow guidelines, reference similar apps |
| Bridge complexity | Medium | Low | Use proven libraries, extensive testing |
| User adoption | Low | Medium | Desktop primary, mobile value-add |

**Overall Risk**: Medium-Low (manageable with standard engineering practices).

---

## Decision Points

### Phase 1 (End of Week 2)
**Evaluate**: Tauri mobile build stability, platform detection, iOS/Android compatibility.

**Decision**:
- ✅ Continue with Tauri mobile
- ⚠️ Pivot to Capacitor if critical blockers found

### Phase 4 (End of Week 6)
**Evaluate**: WebSocket bridge stability, xterm.js performance, connection modes.

**Decision**:
- ✅ Proceed to agent execution
- ⚠️ Re-architect if terminal performance unacceptable

### Phase 6 (End of Week 8)
**Evaluate**: Performance benchmarks, accessibility, user testing feedback.

**Decision**:
- ✅ Launch beta
- ⚠️ Additional polish iteration if quality below standards

---

## Launch Checklist

### Technical
- [ ] iOS build succeeds on CI/CD
- [ ] Android build succeeds on CI/CD
- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met (30fps terminal, <3s launch)
- [ ] Code review complete

### Store Preparation
- [ ] App Store listing complete (description, screenshots, video)
- [ ] Play Store listing complete (description, screenshots, video)
- [ ] Privacy policy published
- [ ] Code signing configured

### Beta Testing
- [ ] 20-50 beta testers recruited
- [ ] TestFlight build distributed (iOS)
- [ ] Play Store internal track live (Android)
- [ ] Feedback collected and addressed

### Documentation
- [ ] User guide complete
- [ ] Getting started guide published
- [ ] FAQ created
- [ ] Troubleshooting guide ready

---

## Key Resources

### Documentation (to be created)
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/README.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/architecture.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/terminal-bridge.md`
- `/home/kvn/workspace/evolve/repos/opcode/docs/mobile/development-guide.md`

### External References
- [Tauri 2.0 Mobile Docs](https://v2.tauri.app/develop/)
- [xterm.js Documentation](https://xtermjs.org/docs/)
- [Blink Shell](https://blink.sh/) - iOS terminal UX reference
- [Termius](https://termius.com/) - Cross-platform architecture reference

---

## Success Metrics

### 3 Months Post-Launch
- 1,000+ installs (iOS + Android combined)
- 4.0+ App Store rating
- 4.0+ Play Store rating
- 30%+ weekly active users
- <5% crash rate

### 6 Months Post-Launch
- 5,000+ installs
- Feature parity with desktop (within mobile platform constraints)
- Managed bridge service live (optional)
- Real-time session sync implemented (optional)

---

## Next Immediate Steps

### 1. Environment Setup (Day 1)
```bash
# Install Tauri CLI 2.0+
cargo install tauri-cli --version "^2.0.0"

# Initialize mobile targets
cd /home/kvn/workspace/evolve/repos/opcode
cargo tauri android init
cargo tauri ios init

# Create feature branch
git checkout -b feature/mobile-support
```

### 2. Agent Spawning (Day 1-2)
Use Claude Code's Task tool to spawn 6 agents for Phase 1:
- `devops-architect` - Mobile build configuration
- `system-architect` - Platform detection
- `frontend-architect` - Layout system
- `backend-dev` - Rust mobile commands
- `technical-writer` - Documentation
- `planner` - Detailed task breakdown

### 3. Phase 1 Execution (Week 1-2)
All agents work concurrently on independent task groups.
Daily sync to resolve dependencies and blockers.

---

## Open Questions (Resolve During Implementation)

### Critical (must resolve in Phase 1-2)
1. Bridge server hosting: self-hosted only or managed service?
   - **Recommendation**: Self-hosted v1, managed service post-launch
2. Session sync: real-time or manual export/import?
   - **Recommendation**: Manual for v1, real-time in v2
3. Offline mode: supported or internet-required?
   - **Recommendation**: Internet-required for v1

### Non-Critical (can defer)
1. OAuth vs API key for Claude API on mobile
2. Biometric app unlock (optional security)
3. Widget support for home screens
4. Handoff between iOS and macOS

---

## Budget & Timeline

### Timeline
- **Phase 1-2**: Weeks 1-3 (Foundation + Mobile UI)
- **Phase 3-4**: Weeks 3-6 (Screens + Terminal)
- **Phase 5-6**: Weeks 6-8 (Agent Execution + Polish)
- **Phase 7**: Weeks 8-10 (CI/CD + Distribution)

**Total**: 8-10 weeks for full implementation and launch.

### Resource Allocation
- **15 agents** utilized across phases (6-8 per phase in parallel)
- **Primary focus**: Mobile-specific features (terminal, connection modes)
- **Secondary focus**: UI polish and performance

### Infrastructure Costs
- **Development**: $0 (self-hosted, local development)
- **CI/CD**: $0 (GitHub Actions free tier sufficient)
- **Testing**: $0 (emulators + TestFlight/Play Store internal testing)
- **Distribution**: $0 (App Store free with Apple Developer account, Play Store $25 one-time)

**Note**: Managed bridge service (if implemented post-launch) would incur cloud hosting costs.

---

## Conclusion

This plan provides a comprehensive, phase-by-phase roadmap for extending Opcode to mobile platforms using Tauri 2.0 with maximum code reuse. The 15-agent parallel execution strategy optimizes development speed while maintaining quality through systematic testing and review.

**Key Strengths**:
- 95% code reuse minimizes development time
- WebSocket SSH bridge is proven architecture
- Parallel agent execution maximizes efficiency
- Clear phase dependencies and decision points
- Comprehensive testing and quality gates

**Execution Readiness**: ✅ Ready to begin Phase 1 immediately.

**Recommended Action**: Proceed with Phase 1 (Foundation) setup and agent spawning.

---

**For detailed implementation instructions, see**: `/home/kvn/workspace/evolve/repos/opcode/.prompts/002-mobile-implementation-plan/mobile-implementation-plan.md`
