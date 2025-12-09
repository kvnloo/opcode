# Autonomous Mobile App Completion Orchestration

## MISSION: ZERO-INTERVENTION COMPLETION

This meta-prompt enables **FULLY AUTONOMOUS** completion of the Opcode Mobile app with **NO human intervention** until all success criteria are met.

---

## ⚠️ IMPORTANT: HOW TO KNOW WHEN DONE ⚠️

**The coordinator will return with one of these statuses:**

| Status | Meaning | Your Action |
|--------|---------|-------------|
| `MISSION COMPLETE - ALL 30 FEATURES VERIFIED` | 100% done | Report success |
| `MAX ITERATIONS REACHED - PARTIAL COMPLETION` | 50 iterations, incomplete | Report partial |
| `INCOMPLETE - CONTINUING IMMEDIATELY` | Still running | **This should NOT be the final output** |

**If the coordinator returns early with:**
- "Results Summary"
- "Key Achievements"
- "Next Steps"
- Any percentage < 100%

**→ THE COORDINATOR FAILED. Re-run the prompt or resume from STATUS.md.**

---

## 🚨 MANDATORY FIRST ACTION - DO THIS IMMEDIATELY 🚨

**YOU MUST SPAWN ONE COORDINATOR AGENT AND NOTHING ELSE.**

Your ONLY job is to execute this single Task tool call. Do NOT:
- Run any bash commands yourself
- Read any files yourself
- Spawn multiple agents yourself
- Output summaries or ask questions
- Do ANYTHING other than spawn the coordinator

**EXECUTE THIS EXACT TASK CALL:**
```
Task(
  description: "Autonomous completion coordinator - runs SPARC orchestrator until 100% complete",
  subagent_type: "task-orchestrator",
  prompt: <COORDINATOR_PROMPT below>
)
```

After spawning the coordinator, your work is DONE. The coordinator will run `/sparc:orchestrator` internally to handle all worker agents and iteration management.

---

## COORDINATOR_PROMPT

Copy this ENTIRE prompt into the Task tool's prompt parameter:

```
You are the AUTONOMOUS COMPLETION COORDINATOR for Opcode Mobile.

## 🚨 CRITICAL ANTI-STOP RULES 🚨

**READ THIS FIRST - VIOLATION = MISSION FAILURE:**

1. **NEVER output "Results Summary", "Summary", "Key Achievements", or "Next Steps"** until completion = 100%
2. **NEVER use phrases like "completed successfully" or "session completed"** until 100%
3. **AFTER EVERY ITERATION**, you MUST output this EXACT format and IMMEDIATELY continue:

\`\`\`
=== ITERATION {N}/50 ===
Verified: {X}/30 ({percent}%)
Status: INCOMPLETE - CONTINUING IMMEDIATELY
\`\`\`

4. **The ONLY valid stop conditions are:**
   - Verified = 30/30 (100%) → Output "MISSION COMPLETE"
   - Iteration = 50 → Output "MAX ITERATIONS REACHED"

5. **If you feel like stopping early**: YOU ARE WRONG. Read STATUS.md, count verified features, continue.

## YOUR MISSION
Run `/sparc:orchestrator` in a LOOP until 30/30 features are VERIFIED.

## EXECUTION LOOP (YOU MUST IMPLEMENT THIS)

\`\`\`
iteration = 0
while iteration < 50:
    iteration += 1

    # Run orchestrator for ONE iteration
    /sparc:orchestrator --task "<ITERATION_TASK below>"

    # Read STATUS.md and count VERIFIED features
    verified_count = count_verified_in_status_file()

    # OUTPUT MANDATORY CHECKPOINT (copy exactly)
    print(f"=== ITERATION {iteration}/50 ===")
    print(f"Verified: {verified_count}/30 ({verified_count/30*100:.1f}%)")

    # CHECK COMPLETION
    if verified_count == 30:
        print("Status: MISSION COMPLETE - ALL 30 FEATURES VERIFIED")
        break  # ONLY valid exit
    else:
        print("Status: INCOMPLETE - CONTINUING IMMEDIATELY")
        # DO NOT STOP - continue loop

# If we exit at iteration 50 without 100%:
print("Status: MAX ITERATIONS REACHED - PARTIAL COMPLETION")
\`\`\`

## ITERATION_TASK (pass this to each /sparc:orchestrator call)

"Execute ONE iteration of Opcode Mobile verification:

CRITICAL: BEFORE TESTING - Audit and fix stub tests:
0. TEST_AUDITOR (tester) - Audit and improve stub tests:
   - Read tests/e2e/android/panes/*.spec.ts
   - Identify stubs (only visibility checks)
   - For each stub:
     a. Read component source file
     b. Analyze what feature should do
     c. Write functional Appium tests with real interactions
     d. Add missing data-testid if needed
   - Run: npm run wdio on improved tests to verify

AGENTS (spawn all 5 in parallel):
1. TEST_AGENT (tester) - Run actual WebdriverIO tests:
   - Run: npm run wdio -- --spec tests/e2e/android/{feature}.spec.ts
   - Capture exit code (0 = pass, non-zero = fail)
   - Take screenshot AFTER test completes
   - Compute checksum of screenshot
   - Run: /ui:uied-analysis to compare components/layout to reference
   - Report: {exit_code, checksum, uied_match_percent}
2. FIX_AGENT (coder) - Fix all BROKEN features
3. BUILD_AGENT (coder) - Ensure builds pass
4. VERIFY_AGENT (tester) - Independent verification:
   - CANNOT read TEST_AGENT's results
   - Run SAME tests independently: npm run wdio
   - Capture exit code and checksum
   - Run UIED analysis independently
   - Feature is VERIFIED only if BOTH agents agree

SHARED STATE:
- Progress file: claudedocs/04-planning/STATUS.md
- Screenshots: claudedocs/06-testing/visual-evidence/
- References: claudedocs/reference-images/
- Checksums: claudedocs/06-testing/checksums.log

VERIFICATION RULES:
- Feature is VERIFIED only if ALL true:
  1. Exit code = 0 (from BOTH TEST_AGENT and VERIFY_AGENT)
  2. Functional tests pass (not just visibility checks)
  3. Screenshot checksum is unique (not duplicate of other features)
  4. UIED component/layout match > 85% to reference
  5. Both agents independently confirm above

ANTI-HALLUCINATION CHECKS:
- Only trust exit codes, not self-reported status
- Checksums prevent duplicate screenshots
- UIED provides objective component comparison
- Independent validator prevents lies

AFTER THIS ITERATION:
- Update STATUS.md with new statuses
- Return JSON: {tested: N, fixed: N, verified: N, broken: N}
- DO NOT output summaries or recommendations
- DO NOT say 'completed' - just return the counts

STALL RECOVERY (if no progress):
rm -rf node_modules && npm install && npm run build"

## WHAT YOU MUST DO

1. Start iteration counter at 0
2. Run /sparc:orchestrator with ITERATION_TASK
3. Read STATUS.md, count VERIFIED features
4. Output the MANDATORY CHECKPOINT format
5. If verified < 30: IMMEDIATELY run next iteration (no delay, no summary)
6. If verified = 30: Output MISSION COMPLETE
7. If iteration = 50: Output MAX ITERATIONS REACHED

## FORBIDDEN ACTIONS (will cause mission failure)

❌ Outputting "Results Summary" before 100%
❌ Outputting "Next Steps" or recommendations before 100%
❌ Using words: "successfully completed", "session ended", "final report"
❌ Stopping after any iteration where verified < 30
❌ Asking for human input or confirmation
❌ Suggesting "estimated time" or "remaining iterations"
❌ Any output that sounds like a conclusion before 30/30
```

---

## WORKER AGENT PROMPTS (Reference for SPARC)

These prompts define what each worker agent should do. SPARC orchestrator uses these internally.

### TEST_AGENT_PROMPT
```
You are TEST_AGENT. Run WebdriverIO/Appium E2E tests.

For each feature assigned to you:
1. Identify the test file: tests/e2e/android/{category}/{feature}.spec.ts
2. Check if test is a stub (only visibility checks):
   - If stub: FIRST run TEST_AUDITOR to improve it
   - If functional: proceed to step 3
3. Run the test: npm run wdio -- --spec tests/e2e/android/{category}/{feature}.spec.ts
4. Capture exit code:
   - $? = 0 → PASS
   - $? != 0 → FAIL
5. After test completes, take screenshot:
   adb exec-out screencap -p > claudedocs/06-testing/visual-evidence/{feature}_{timestamp}.png
6. Compute checksum:
   CHECKSUM=$(md5sum screenshot.png | cut -d' ' -f1)
7. Check for duplicates:
   if grep -q "$CHECKSUM" claudedocs/06-testing/checksums.log; then
     STATUS="DUPLICATE_SCREENSHOT_FAILED"
   fi
8. Run UIED analysis:
   /ui:uied-analysis {screenshot} {reference} --compare-components
9. ONLY report exit codes and checksums:
   - DO NOT self-assess "WORKING" or "BROKEN"
   - DO NOT claim "verified" based on your judgment
   - ONLY report: {exit_code, checksum, uied_match_percent}

TEST IMPROVEMENT (if stub detected):
- Read component source: src/components/mobile/workspace/panes/{Pane}.tsx
- Analyze what the feature should do
- Write functional Appium tests:
  describe('{Feature}', () => {
    it('should perform user workflow', async () => {
      await $('[data-testid="element"]').click();
      await $('[data-testid="input"]').setValue('value');
      await expect($('[data-testid="result"]')).toBeDisplayed();
    });
  });
- Add data-testid to components if missing
- Run test to verify it works

CRITICAL RULES:
- NO manual ADB tap coordinates
- ALL interactions via Appium: $('[data-testid="..."]').click()
- Exit codes are ground truth, not your assessment
- Checksums prevent duplicate screenshots

Return a JSON report:
{
  "feature": "feature_name",
  "exit_code": 0 or non-zero,
  "checksum": "md5hash",
  "uied_match_percent": 0.0-100.0,
  "test_type": "functional" or "stub_improved",
  "evidence": "path/to/screenshot.png"
}
```

### FIX_AGENT_PROMPT
```
You are FIX_AGENT. Fix broken features identified by TEST_AGENT.

For each broken feature:
1. Read the test failure report
2. Identify root cause:
   - Missing data-testid → Add to component
   - Missing functionality → Implement it
   - Visual mismatch → Adjust styling
   - Navigation broken → Fix routing
3. Make the fix in the appropriate file
4. Ensure TypeScript compiles: npx tsc --noEmit
5. Report what was fixed

Critical patterns to add:
- data-testid="screen-{name}" on screen containers
- data-testid="pane-{name}" on pane containers
- data-testid="btn-{action}" on buttons
- data-testid="input-{name}" on inputs
- data-testid="tab-{name}" on navigation tabs

Return a JSON report:
{
  "feature": "feature_name",
  "files_modified": ["path1", "path2"],
  "fix_description": "what was fixed",
  "ready_for_verify": true
}
```

### BUILD_AGENT_PROMPT
```
You are BUILD_AGENT. Ensure the app compiles and builds.

Steps:
1. cd src-tauri && cargo check
   - If fails, fix Rust errors
2. cd .. && npm run build
   - If fails, fix TypeScript errors
3. npm run tauri android build -- --debug
   - If fails, analyze gradle/NDK errors
4. Verify APK exists at expected path

Error recovery:
- TypeScript errors: Fix type issues, add missing imports
- Rust errors: Fix borrow checker issues, add derives
- Gradle errors: ./gradlew clean in src-tauri/gen/android
- NDK errors: Verify NDK_HOME environment variable

Return a JSON report:
{
  "build_status": "SUCCESS|FAILED",
  "apk_path": "path/to/apk if success",
  "errors_fixed": ["list of errors fixed"],
  "blocking_error": "description if still failing"
}
```

### VERIFY_AGENT_PROMPT
```
You are VERIFY_AGENT. Verify that fixes actually work.

For each feature marked as FIXING:
1. Ensure latest code is built (check with BUILD_AGENT)
2. Run the same test that originally failed
3. If passes → Mark as VERIFIED
4. If fails → Mark as BROKEN (fix didn't work)
5. Check for regressions in other features

Return a JSON report:
{
  "feature": "feature_name",
  "verification_status": "VERIFIED|STILL_BROKEN|REGRESSION",
  "evidence": "path/to/screenshot.png",
  "regressions": ["list of features that regressed"]
}
```

## PROGRESS FILE FORMAT

The file at claudedocs/04-planning/STATUS.md tracks all features:

| Feature | Status | Evidence | Tests | Last Updated |
|---------|--------|----------|-------|--------------|
| Apps Home Screen | NOT_TESTED | - | 0/0 | - |

Status values: NOT_TESTED, TESTING, WORKING, BROKEN, FIXING, VERIFIED, REGRESSION

After each iteration, update:
1. Individual feature rows with new status and evidence
2. Summary metrics at bottom (Features Complete: X/30, Overall: X%)
3. Last Updated timestamp

## COMPLETION CRITERIA

Stop the loop ONLY when ALL of these are true:
1. All 30 features have Status = VERIFIED
2. All 7 reference images match within 5% pixel difference
3. Build passes with no warnings
4. No regressions in final verification

## STALL RECOVERY

If completion percentage doesn't increase for 3 iterations:
1. Log "STALL DETECTED"
2. Force clean rebuild: rm -rf node_modules && npm install && npm run build
3. Reboot device: adb reboot && adb wait-for-device
4. Reset all BROKEN features to NOT_TESTED
5. Continue loop

## OUTPUT FORMAT

**MANDATORY after EACH iteration (copy exactly):**
```
=== ITERATION {N}/50 ===
Verified: {X}/30 ({percent}%)
Status: INCOMPLETE - CONTINUING IMMEDIATELY
```

**ONLY when verified = 30/30:**
```
=== ITERATION {N}/50 ===
Verified: 30/30 (100%)
Status: MISSION COMPLETE - ALL 30 FEATURES VERIFIED

[NOW you may output a summary]
```

**ONLY when iteration = 50 and verified < 30:**
```
=== ITERATION 50/50 ===
Verified: {X}/30 ({percent}%)
Status: MAX ITERATIONS REACHED - PARTIAL COMPLETION

[NOW you may output a summary]
```

## CRITICAL RULES (ENFORCED)

1. ❌ **NEVER output summaries, tables, or "Next Steps" before 30/30 verified**
2. ❌ **NEVER use "completed successfully" or "session ended" before 30/30**
3. ❌ **NEVER stop the loop when verified < 30 and iteration < 50**
4. ❌ **NEVER ask for human input or confirmation**
5. ✅ **ALWAYS output the exact checkpoint format after each iteration**
6. ✅ **ALWAYS immediately continue to next iteration if verified < 30**
7. ✅ **ALWAYS read STATUS.md to count verified features (don't guess)**
8. ✅ **ALWAYS spawn all 4 workers in parallel each iteration**

## ANTI-PATTERN DETECTION

If your output contains ANY of these before 30/30, YOU HAVE FAILED:
- "Results Summary"
- "Key Achievements"
- "Next Steps"
- "Estimated time remaining"
- "Successfully completed"
- Tables showing progress percentages
- Recommendations or suggestions
- Anything that sounds like a conclusion

**The ONLY acceptable mid-loop output is the checkpoint format above.**
```

---

## WHY THIS STRUCTURE WORKS

1. **Main context stays clean** - Only spawns one coordinator, then waits
2. **Coordinator owns the loop** - All iteration logic is in coordinator's prompt
3. **Worker agents are stateless** - Each iteration spawns fresh workers
4. **Progress file is shared state** - All agents read/write to same file
5. **Explicit stop conditions** - Only 100% complete or MAX_ITERATIONS
6. **Anti-summary rules** - Prevents premature "done" signals that stop the loop
7. **Mandatory checkpoint format** - Forces structured output that doesn't trigger completion
8. **Forbidden word list** - Explicit blocklist of phrases that signal completion

## FEATURE CHECKLIST (30 features)

### Core Infrastructure (4)
- [ ] Rust Backend Compilation
- [ ] Android APK Build
- [ ] Tauri WebView Bridge
- [ ] data-testid Coverage

### Main Screens (4)
- [ ] Apps Home Screen
- [ ] Create Screen
- [ ] Account Screen
- [ ] Workspace Screen

### Toolbar Panes (5)
- [ ] Console Pane
- [ ] Agent Pane
- [ ] Deploy/Publishing Pane
- [ ] Share Pane
- [ ] Preview Pane

### Tool Panes (14)
- [ ] App Storage Pane
- [ ] Auth Users Pane
- [ ] Dev Tools Pane
- [ ] Integrations Pane
- [ ] Key-Value Store Pane
- [ ] Multiplayer Pane
- [ ] Secrets Pane
- [ ] Security Scanner Pane
- [ ] Workflows Pane
- [ ] Assistant Pane
- [ ] Shell Pane
- [ ] User Settings Pane
- [ ] Git Pane
- [ ] Database Pane

### Navigation (3)
- [ ] Bottom Navigation
- [ ] Tools Overlay
- [ ] Pane Back Navigation

## FEATURE → FILE MAPPING

### Main Screens
| Feature | Component | File Path | Reference Image |
|---------|-----------|-----------|-----------------|
| Apps Home Screen | AppsScreen | `src/screens/mobile/AppsScreen.tsx` | `replit-apps-home-screen.png` |
| Create Screen | CreateScreen | `src/screens/mobile/CreateScreen.tsx` | `replit-create-screen.png` |
| Account Screen | AccountScreen | `src/screens/mobile/AccountScreen.tsx` | `replit-account-screen.png` |
| Workspace Screen | WorkspaceScreen | `src/screens/mobile/WorkspaceScreen.tsx` | `replit-agent-pane-main-view.png` |

### Toolbar Panes
| Feature | Component | File Path | Reference Image |
|---------|-----------|-----------|-----------------|
| Agent Pane | AgentPane | `src/components/mobile/workspace/panes/AgentPane.tsx` | `replit-agent-pane-main-view.png` |
| Console Pane | ConsolePane | `src/components/mobile/workspace/panes/ConsolePane.tsx` | `replit-console-terminal-pane.png` |
| Shell Pane | ShellPane | `src/components/mobile/workspace/panes/ShellPane.tsx` | `replit-shell-terminal-pane.png` |
| Preview Pane | PreviewPane | `src/components/mobile/workspace/panes/PreviewPane.tsx` | `replit-preview-pane-game.png` |
| Publishing Pane | PublishingPane | `src/components/mobile/workspace/panes/PublishingPane.tsx` | `replit-publishing-pane.png` |
| Share Pane | SharePane | `src/components/mobile/workspace/panes/SharePane.tsx` | - |

### Tool Panes
| Feature | Component | File Path | Reference Image |
|---------|-----------|-----------|-----------------|
| App Storage Pane | AppStoragePane | `src/components/mobile/workspace/panes/AppStoragePane.tsx` | `replit-app-storage-pane.png` |
| Assistant Pane | AssistantPane | `src/components/mobile/workspace/panes/AssistantPane.tsx` | `replit-assistant-chat-pane.png` |
| Auth Users Pane | AuthUsersPane | `src/components/mobile/workspace/panes/AuthUsersPane.tsx` | `replit-auth-users-pane.png` |
| Database Pane | DatabasePane | `src/components/mobile/workspace/panes/DatabasePane.tsx` | - |
| Dev Tools Pane | DevToolsPane | `src/components/mobile/workspace/panes/DevToolsPane.tsx` | `replit-developer-tools-pane.png` |
| Git Pane | GitPane | `src/components/mobile/workspace/panes/GitPane.tsx` | - |
| Integrations Pane | IntegrationsPane | `src/components/mobile/workspace/panes/IntegrationsPane.tsx` | `replit-integrations-pane.png` |
| Key-Value Store Pane | KeyValueStorePane | `src/components/mobile/workspace/panes/KeyValueStorePane.tsx` | `replit-key-value-store-pane.png` |
| Multiplayer Pane | MultiplayerPane | `src/components/mobile/workspace/panes/MultiplayerPane.tsx` | `replit-multiplayer-pane.png` |
| Secrets Pane | SecretsPane | `src/components/mobile/workspace/panes/SecretsPane.tsx` | `replit-secrets-env-vars-pane.png` |
| Security Scanner Pane | SecurityScannerPane | `src/components/mobile/workspace/panes/SecurityScannerPane.tsx` | `replit-security-scanner-pane.png` |
| User Settings Pane | UserSettingsPane | `src/components/mobile/workspace/panes/UserSettingsPane.tsx` | `replit-user-settings-pane.png` |
| Workflows Pane | WorkflowsPane | `src/components/mobile/workspace/panes/WorkflowsPane.tsx` | `replit-workflows-pane.png` |

### Navigation & Overlays
| Feature | Component | File Path | Reference Image |
|---------|-----------|-----------|-----------------|
| Bottom Navigation | BottomNavigation | `src/components/mobile/navigation/BottomNavigation.tsx` | - |
| Tools Overlay | ToolsOverlay | `src/components/mobile/workspace/ToolsOverlay.tsx` | `replit-tools-menu-overlay.png` |
| Connection Manager | ConnectionManager | `src/components/mobile/connection/ConnectionManager.tsx` | - |

### Quick Lookup (YAML format for agents)
```yaml
screens:
  AppsScreen: {file: "src/screens/mobile/AppsScreen.tsx", ref: "replit-apps-home-screen.png"}
  CreateScreen: {file: "src/screens/mobile/CreateScreen.tsx", ref: "replit-create-screen.png"}
  AccountScreen: {file: "src/screens/mobile/AccountScreen.tsx", ref: "replit-account-screen.png"}
  WorkspaceScreen: {file: "src/screens/mobile/WorkspaceScreen.tsx", ref: "replit-agent-pane-main-view.png"}

toolbar_panes:
  AgentPane: {file: "src/components/mobile/workspace/panes/AgentPane.tsx", ref: "replit-agent-pane-main-view.png"}
  ConsolePane: {file: "src/components/mobile/workspace/panes/ConsolePane.tsx", ref: "replit-console-terminal-pane.png"}
  ShellPane: {file: "src/components/mobile/workspace/panes/ShellPane.tsx", ref: "replit-shell-terminal-pane.png"}
  PreviewPane: {file: "src/components/mobile/workspace/panes/PreviewPane.tsx", ref: "replit-preview-pane-game.png"}
  PublishingPane: {file: "src/components/mobile/workspace/panes/PublishingPane.tsx", ref: "replit-publishing-pane.png"}
  SharePane: {file: "src/components/mobile/workspace/panes/SharePane.tsx", ref: null}

tool_panes:
  AppStoragePane: {file: "src/components/mobile/workspace/panes/AppStoragePane.tsx", ref: "replit-app-storage-pane.png"}
  AssistantPane: {file: "src/components/mobile/workspace/panes/AssistantPane.tsx", ref: "replit-assistant-chat-pane.png"}
  AuthUsersPane: {file: "src/components/mobile/workspace/panes/AuthUsersPane.tsx", ref: "replit-auth-users-pane.png"}
  DatabasePane: {file: "src/components/mobile/workspace/panes/DatabasePane.tsx", ref: null}
  DevToolsPane: {file: "src/components/mobile/workspace/panes/DevToolsPane.tsx", ref: "replit-developer-tools-pane.png"}
  GitPane: {file: "src/components/mobile/workspace/panes/GitPane.tsx", ref: null}
  IntegrationsPane: {file: "src/components/mobile/workspace/panes/IntegrationsPane.tsx", ref: "replit-integrations-pane.png"}
  KeyValueStorePane: {file: "src/components/mobile/workspace/panes/KeyValueStorePane.tsx", ref: "replit-key-value-store-pane.png"}
  MultiplayerPane: {file: "src/components/mobile/workspace/panes/MultiplayerPane.tsx", ref: "replit-multiplayer-pane.png"}
  SecretsPane: {file: "src/components/mobile/workspace/panes/SecretsPane.tsx", ref: "replit-secrets-env-vars-pane.png"}
  SecurityScannerPane: {file: "src/components/mobile/workspace/panes/SecurityScannerPane.tsx", ref: "replit-security-scanner-pane.png"}
  UserSettingsPane: {file: "src/components/mobile/workspace/panes/UserSettingsPane.tsx", ref: "replit-user-settings-pane.png"}
  WorkflowsPane: {file: "src/components/mobile/workspace/panes/WorkflowsPane.tsx", ref: "replit-workflows-pane.png"}

navigation:
  BottomNavigation: {file: "src/components/mobile/navigation/BottomNavigation.tsx", ref: null}
  ToolsOverlay: {file: "src/components/mobile/workspace/ToolsOverlay.tsx", ref: "replit-tools-menu-overlay.png"}
  ConnectionManager: {file: "src/components/mobile/connection/ConnectionManager.tsx", ref: null}
```

## REFERENCE IMAGES

Located in `claudedocs/reference-images/`:
- replit-apps-home-screen.png
- replit-create-screen.png
- replit-account-screen.png
- replit-agent-pane-main-view.png
- replit-agent-pane-with-tools-overlay.png
- replit-console-terminal-pane.png
- replit-shell-terminal-pane.png
- replit-preview-pane-game.png
- replit-publishing-pane.png
- replit-publishing-pane-full.png
- replit-app-storage-pane.png
- replit-assistant-chat-pane.png
- replit-auth-users-pane.png
- replit-developer-tools-pane.png
- replit-integrations-pane.png
- replit-key-value-store-pane.png
- replit-multiplayer-pane.png
- replit-secrets-env-vars-pane.png
- replit-security-scanner-pane.png
- replit-user-settings-pane.png
- replit-workflows-pane.png
- replit-tools-menu-overlay.png

**Missing references (4):** GitPane, DatabasePane, BottomNavigation, ConnectionManager

## EXECUTION

```bash
# Option 1: Run this prompt (recommended)
/run-prompt 010-autonomous-completion

# Option 2: Direct SPARC orchestrator invocation
/sparc:orchestrator --agents 4 --topology mesh --max-iterations 50 --task "<paste COORDINATOR_PROMPT>"

# Option 3: Manual Task tool (fallback)
Task("SPARC coordinator", "sparc-coord", "<paste COORDINATOR_PROMPT>")
```

**What happens:**
1. Main context launches `/sparc:orchestrator`
2. SPARC orchestrator spawns 4 worker agents (TEST, FIX, BUILD, VERIFY)
3. Workers execute in parallel with mesh topology coordination
4. Orchestrator collects results, updates progress, checks completion
5. Loop continues until 100% verified or 50 iterations
6. Main context stays clean - all work delegated to SPARC system
