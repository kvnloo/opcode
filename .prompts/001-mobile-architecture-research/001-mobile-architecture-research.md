# Mobile Architecture Research - Opcode Mobile Extension

## Objective
Research and analyze the optimal architecture for extending the existing Opcode (Claudia) desktop application to mobile platforms (iOS/Android), using Replit Mobile as the UX inspiration. This research will inform the comprehensive implementation plan.

## Context

### Existing Codebase Analysis Required
The opcode repository at `/home/kvn/workspace/evolve/repos/opcode/` contains:
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Tauri 2 + Rust
- **State Management**: Zustand
- **UI Components**: Radix UI primitives
- **Key Features**: Project management, session history, CC Agents, usage dashboard, MCP server management, timeline & checkpoints

### Replit Mobile Reference (Screenshots Analyzed)
**Main Navigation (3-tab bottom bar):**
1. **Apps** - Project cards with previews, public/private indicators, "All Apps" filter
2. **Create** - AI build/design interface, template selection (Web, Mobile, Data, 3D), file attachments, voice input
3. **Account** - Profile, usage, theme, notifications, teams, help

**In-App Workspace (6 screens):**
1. Agent execution with task progress (0/8), rollback, changes, preview
2. Task details with file edits, timestamps
3. Live preview with browser controls
4. Publishing/deployment workflow
5. Tools menu (Agent, Assistant, Console, Database, Git, Shell, etc.)
6. Search for tools and files

### Key Research Questions

1. **Mobile Platform Strategy**
   - Tauri 2 Mobile (beta) vs Capacitor wrapper vs React Native port
   - Code reuse percentage for each approach
   - Native API access requirements (SSH, file system, notifications)

2. **Terminal/PTY on Mobile**
   - WebSocket SSH bridge architecture
   - xterm.js on mobile WebView performance
   - Tailscale VPN integration patterns

3. **Mobile UI Patterns**
   - Bottom navigation vs hamburger menu
   - Swipe gestures for pane switching
   - Touch-optimized code input (virtual keyboard toolbar)
   - Split view for tablets

4. **Offline/Connection Modes**
   - Tailscale SSH for remote dev machine access
   - Claude Code Web API mode (Pro/Max plans)
   - Offline command queue architecture

5. **Performance Considerations**
   - Bundle size optimization for mobile
   - Memory management for code editor
   - Battery consumption during long sessions

6. **Open Source Best Practices**
   - AGPL-3.0 compliance for mobile distribution
   - Community contribution guidelines
   - CI/CD for mobile builds (GitHub Actions)

## Requirements

### Research Scope
1. **Deep dive into Tauri 2 Mobile** - Current beta status, iOS/Android support, limitations
2. **Analyze existing opcode components** - Identify which can be reused vs rebuilt
3. **Research mobile development patterns** - Best practices for coding apps on mobile
4. **Investigate connection architectures** - SSH bridging, WebSocket, API modes
5. **Review competing solutions** - How other mobile IDEs solve these problems

### Sources to Consult
- Tauri v2 official documentation (mobile support)
- Replit mobile app architecture (public docs/blogs)
- React Native vs Capacitor comparisons
- xterm.js mobile performance discussions
- Tailscale documentation for mobile VPN

### Use Web Search
Use `/sc:research` or WebSearch to gather current (2025) best practices for:
- Tauri 2 mobile production readiness
- Mobile code editor implementations
- SSH client libraries for mobile apps
- Open source mobile app distribution best practices

## Output Specification

Save research output to: `.prompts/001-mobile-architecture-research/mobile-architecture-research.md`

### Required Structure

```markdown
# Mobile Architecture Research Findings

<metadata>
  <research_date>YYYY-MM-DD</research_date>
  <confidence>HIGH|MEDIUM|LOW</confidence>
  <sources_consulted>
    - [source_name](url)
  </sources_consulted>
</metadata>

## Executive Summary
[2-3 paragraph summary of key findings]

## Platform Strategy Analysis

### Option 1: Tauri 2 Mobile
<finding confidence="HIGH|MEDIUM|LOW">
[Analysis with pros/cons/risks]
</finding>

### Option 2: Capacitor Wrapper
<finding confidence="HIGH|MEDIUM|LOW">
[Analysis]
</finding>

### Option 3: React Native Port
<finding confidence="HIGH|MEDIUM|LOW">
[Analysis]
</finding>

### Recommendation
<recommendation>
[Clear recommendation with justification]
</recommendation>

## Component Reuse Analysis
[Table mapping existing components to mobile adaptations needed]

## Terminal/PTY Architecture
[Research on mobile terminal implementations]

## Connection Modes
[Tailscale SSH, Claude Web API, offline patterns]

## UI/UX Patterns
[Mobile-specific patterns from Replit analysis]

## Performance Considerations
[Bundle size, memory, battery findings]

## Open Source Strategy
[AGPL compliance, community, CI/CD]

## Risk Assessment
<risks>
  <risk severity="HIGH|MEDIUM|LOW">
    [Risk description and mitigation]
  </risk>
</risks>

<open_questions>
  - [Question requiring further investigation]
</open_questions>

<assumptions>
  - [Assumption made during research]
</assumptions>

<dependencies>
  - [External dependency for implementation]
</dependencies>

## Next Steps
[Prioritized list of follow-up research or immediate actions]
```

### SUMMARY.md Creation
Also create `.prompts/001-mobile-architecture-research/SUMMARY.md`:

```markdown
# Research Summary: Mobile Architecture

**[One-liner: Substantive description of key finding]**

**Version**: v1
**Date**: YYYY-MM-DD

## Key Findings
- [Actionable takeaway 1]
- [Actionable takeaway 2]
- [Actionable takeaway 3]

## Recommended Approach
[Brief recommendation]

## Decisions Needed
- [Decision point 1]
- [Decision point 2]

## Blockers
- [Any external blockers]

## Next Step
[Concrete forward action - create plan prompt]
```

## Verification Checklist
Before completing, verify:
- [ ] All research questions addressed with evidence
- [ ] Sources cited with URLs where applicable
- [ ] Confidence levels assigned to findings
- [ ] Risks identified and assessed
- [ ] Clear recommendation provided
- [ ] SUMMARY.md created with actionable insights

## Success Criteria
- Research covers all major architecture decisions
- Findings supported by current documentation and best practices
- Clear path forward for planning phase
- Open questions identified for further investigation
- SUMMARY.md provides quick human-readable overview
