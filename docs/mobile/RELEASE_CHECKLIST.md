# Release Checklist for Opcode Mobile

This comprehensive checklist ensures quality and consistency across iOS and Android releases.

---

## Table of Contents
- [Pre-Release](#pre-release)
- [Build](#build)
- [Testing](#testing)
- [Submission](#submission)
- [Post-Release](#post-release)
- [Emergency Hotfix](#emergency-hotfix)

---

## Pre-Release

### Version Management
- [ ] **Version bump** in all configuration files
  - [ ] `package.json` - version field
  - [ ] `src-tauri/tauri.conf.json` - version field
  - [ ] `src-tauri/Cargo.toml` - version field
  - [ ] iOS: `Info.plist` - CFBundleShortVersionString
  - [ ] iOS: `Info.plist` - CFBundleVersion (build number)
  - [ ] Android: `build.gradle` - versionName
  - [ ] Android: `build.gradle` - versionCode

**Version Numbering**:
```
Format: MAJOR.MINOR.PATCH (Semantic Versioning)
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

Build Numbers (iOS/Android):
- Increment for every build submitted
- Never reuse build numbers
```

### Documentation
- [ ] **Changelog updated** (`CHANGELOG.md`)
  - [ ] New features documented
  - [ ] Bug fixes listed
  - [ ] Breaking changes highlighted
  - [ ] Migration guide (if needed)
  - [ ] Contributors acknowledged

- [ ] **Release notes prepared**
  - [ ] User-facing changes only
  - [ ] Clear and concise language
  - [ ] Highlight key improvements
  - [ ] Maximum 500 characters for Android
  - [ ] Maximum 4000 characters for iOS

- [ ] **API documentation updated** (if applicable)
  - [ ] New endpoints documented
  - [ ] Deprecated features marked
  - [ ] Code examples updated

### Code Quality
- [ ] **All tests passing**
  - [ ] Unit tests: `npm test`
  - [ ] Integration tests
  - [ ] E2E tests (if applicable)
  - [ ] No skipped or disabled tests
  - [ ] Code coverage meets threshold (e.g., >80%)

- [ ] **Linting checks pass**
  - [ ] ESLint: `npm run lint`
  - [ ] TypeScript: `npm run typecheck`
  - [ ] Prettier: `npm run format:check`
  - [ ] No warnings or errors

- [ ] **Code review completed**
  - [ ] All PRs reviewed and approved
  - [ ] No outstanding review comments
  - [ ] Architecture decisions documented

### Performance
- [ ] **Performance benchmarks met**
  - [ ] App launch time < 3 seconds
  - [ ] File open time < 500ms (for typical files)
  - [ ] Syntax highlighting render < 200ms
  - [ ] Memory usage within acceptable range
  - [ ] Battery drain acceptable (< 5% per hour active use)

- [ ] **Performance testing completed**
  - [ ] Large file handling (>10MB)
  - [ ] Multiple file tabs (10+ tabs)
  - [ ] Long editing sessions (2+ hours)
  - [ ] Memory leak testing

### Accessibility
- [ ] **Accessibility audit passed**
  - [ ] Screen reader compatibility tested (TalkBack/VoiceOver)
  - [ ] Keyboard navigation functional
  - [ ] Color contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI)
  - [ ] Text scaling supported (up to 200%)
  - [ ] Touch targets minimum 44x44 points
  - [ ] Focus indicators visible
  - [ ] Alternative text for images

- [ ] **Accessibility tools used**
  - [ ] iOS: Xcode Accessibility Inspector
  - [ ] Android: Accessibility Scanner
  - [ ] Manual testing with assistive technologies

### Security
- [ ] **Security review completed**
  - [ ] Dependency audit: `npm audit`
  - [ ] No critical or high vulnerabilities
  - [ ] Outdated dependencies updated
  - [ ] Code obfuscation enabled (for production)
  - [ ] API keys and secrets removed from code
  - [ ] Environment variables properly configured

- [ ] **Security checklist**
  - [ ] HTTPS enforced for all network requests
  - [ ] Certificate pinning implemented (if applicable)
  - [ ] Sensitive data encrypted at rest
  - [ ] Input validation on all user inputs
  - [ ] SQL injection prevention
  - [ ] XSS protection
  - [ ] Authentication tokens secured
  - [ ] File permissions restricted appropriately

- [ ] **Privacy compliance**
  - [ ] Privacy policy reviewed and current
  - [ ] Data collection practices disclosed
  - [ ] User consent mechanisms working
  - [ ] GDPR compliance (if applicable)
  - [ ] CCPA compliance (if applicable)

### Dependencies
- [ ] **Dependencies reviewed**
  - [ ] All dependencies up-to-date (or documented why not)
  - [ ] License compliance verified
  - [ ] Third-party SDK versions compatible
  - [ ] Bundle size optimized

### Assets
- [ ] **App icons updated** (if changed)
  - [ ] iOS: App Icon set complete (all sizes)
  - [ ] Android: Adaptive icon (foreground + background)
  - [ ] High-resolution assets provided

- [ ] **Screenshots current**
  - [ ] Reflect latest UI changes
  - [ ] All required sizes provided
  - [ ] Localized screenshots (if applicable)
  - [ ] Text overlays accurate

---

## Build

### Environment Setup
- [ ] **Build environment prepared**
  - [ ] Clean workspace: `git clean -fdx` (after backing up local changes)
  - [ ] Latest code pulled: `git pull origin main`
  - [ ] Correct branch checked out (e.g., `release/v1.2.3`)
  - [ ] Dependencies installed: `npm ci` (clean install)
  - [ ] Build tools updated (Xcode, Android Studio, Rust, Node.js)

### iOS Build
- [ ] **iOS app built and signed**
  - [ ] Build configuration: Release
  - [ ] Code signing identity: Distribution certificate
  - [ ] Provisioning profile: App Store or Ad Hoc
  - [ ] Bitcode enabled (if required)
  - [ ] Build command: `npm run build:ios` or Xcode Archive
  - [ ] IPA generated successfully

- [ ] **iOS symbols uploaded**
  - [ ] dSYM files generated
  - [ ] Symbols uploaded to Firebase Crashlytics
  - [ ] Symbols uploaded to Sentry (if used)
  - [ ] Symbols archived for future debugging

- [ ] **iOS export options**
  - [ ] Export method: App Store
  - [ ] Team: [Your Team]
  - [ ] Upload symbols: Yes
  - [ ] Compile bitcode: Yes (if required)

### Android Build
- [ ] **Android AAB built and signed**
  - [ ] Build variant: release
  - [ ] Signing config: Release keystore
  - [ ] ProGuard/R8 enabled
  - [ ] Build command: `./gradlew bundleRelease` or `npm run build:android`
  - [ ] AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

- [ ] **Android signing verification**
  - [ ] Keystore password secure
  - [ ] Key alias correct
  - [ ] Signature verified: `jarsigner -verify -verbose -certs app-release.aab`

- [ ] **Android symbols uploaded**
  - [ ] Mapping file generated (ProGuard/R8)
  - [ ] Symbols uploaded to Play Console
  - [ ] Symbols uploaded to Firebase Crashlytics
  - [ ] Mapping file location: `android/app/build/outputs/mapping/release/mapping.txt`

### Build Verification
- [ ] **Build artifacts validated**
  - [ ] File size within expected range
  - [ ] Archive/bundle opens without errors
  - [ ] Version number correct in binary
  - [ ] Build number incremented
  - [ ] No debug symbols in production build

- [ ] **Install test build**
  - [ ] Install on physical device (not emulator/simulator)
  - [ ] App launches successfully
  - [ ] Version displayed correctly in About screen
  - [ ] No crashes on startup

---

## Testing

### Functional Testing
- [ ] **Core features verified**
  - [ ] Create new file/project
  - [ ] Open existing files
  - [ ] Edit and save files
  - [ ] Syntax highlighting working
  - [ ] Code completion functional
  - [ ] Search and replace
  - [ ] Multi-file editing
  - [ ] Settings and preferences
  - [ ] Theme switching

- [ ] **Platform-specific testing**
  - [ ] iOS: Home screen widget (if applicable)
  - [ ] iOS: Share extensions
  - [ ] iOS: Keyboard shortcuts (iPad)
  - [ ] Android: Back button navigation
  - [ ] Android: Share to other apps
  - [ ] Android: File picker integration

### Regression Testing
- [ ] **Previously fixed bugs verified**
  - [ ] Review last 3 releases for fixed issues
  - [ ] Test each fixed bug scenario
  - [ ] No regressions introduced

- [ ] **Critical user flows tested**
  - [ ] New user onboarding
  - [ ] File import/export
  - [ ] Git operations (if applicable)
  - [ ] Terminal usage
  - [ ] Settings migration (if schema changed)

### Device Testing
- [ ] **iOS devices tested**
  - [ ] iPhone (latest model)
  - [ ] iPhone (older model, e.g., iPhone X)
  - [ ] iPad (if supported)
  - [ ] Different iOS versions (minimum supported to latest)

- [ ] **Android devices tested**
  - [ ] Phone (latest flagship)
  - [ ] Phone (budget/mid-range)
  - [ ] Tablet (if supported)
  - [ ] Different Android versions (API 21+ to latest)
  - [ ] Different manufacturers (Samsung, Google, Xiaomi)

### Edge Cases
- [ ] **Stress testing**
  - [ ] Large files (10MB+)
  - [ ] Many files open (20+ tabs)
  - [ ] Long text lines (1000+ characters)
  - [ ] Rapid interactions
  - [ ] Low memory conditions

- [ ] **Network conditions**
  - [ ] Offline functionality
  - [ ] Slow network (3G simulation)
  - [ ] Network interruptions during sync
  - [ ] Background mode behavior

### Beta Testing
- [ ] **TestFlight / Internal Testing track**
  - [ ] Build uploaded to TestFlight (iOS)
  - [ ] Build uploaded to Internal Testing (Android)
  - [ ] Internal testers invited
  - [ ] Tester feedback collected
  - [ ] Critical issues resolved

- [ ] **External beta testing** (optional)
  - [ ] Beta testers recruited
  - [ ] External build distributed
  - [ ] Feedback mechanisms in place
  - [ ] Issues triaged and prioritized

---

## Submission

### Pre-Submission Checklist
- [ ] **App Store Connect / Play Console ready**
  - [ ] App record exists
  - [ ] All required agreements signed
  - [ ] Tax and banking info complete (if paid app)
  - [ ] Contact information current

### iOS Submission
- [ ] **App Store metadata complete**
  - [ ] App name (30 chars max)
  - [ ] Subtitle (30 chars max)
  - [ ] Description (4000 chars max)
  - [ ] Keywords (100 chars, comma-separated)
  - [ ] Promotional text (170 chars)
  - [ ] Support URL
  - [ ] Marketing URL (optional)
  - [ ] Privacy policy URL

- [ ] **App Store screenshots ready**
  - [ ] iPhone 6.9" Display (required)
  - [ ] iPhone 6.7" Display (required)
  - [ ] iPhone 6.5" Display (required)
  - [ ] iPhone 5.5" Display (required)
  - [ ] iPad 12.9" Display (optional)
  - [ ] iPad 11" Display (optional)

- [ ] **App Store details**
  - [ ] App Icon (1024x1024)
  - [ ] Category (Primary + Secondary)
  - [ ] Age rating completed
  - [ ] Privacy nutrition labels completed
  - [ ] App privacy details provided

- [ ] **Build information**
  - [ ] Build selected for release
  - [ ] Export compliance information provided
  - [ ] Advertising identifier usage declared

- [ ] **Review information**
  - [ ] Demo account credentials (if login required)
  - [ ] Review notes with testing instructions
  - [ ] Contact information for reviewer

- [ ] **Release options**
  - [ ] Manual release or Automatic release
  - [ ] Phased release (optional)
  - [ ] Release date set (if scheduled)

- [ ] **Submit for review**
  - [ ] All validations passed
  - [ ] Submission confirmed
  - [ ] Confirmation email received

### Android Submission
- [ ] **Google Play store listing complete**
  - [ ] App name (50 chars max)
  - [ ] Short description (80 chars max)
  - [ ] Full description (4000 chars max)
  - [ ] App icon (512x512)
  - [ ] Feature graphic (1024x500)
  - [ ] Screenshots (Phone, Tablet)
  - [ ] Promo video (YouTube URL, optional)

- [ ] **Store listing details**
  - [ ] App category
  - [ ] Tags (up to 5)
  - [ ] Contact details (email, website, phone)
  - [ ] Privacy policy URL

- [ ] **Content rating**
  - [ ] Questionnaire completed
  - [ ] Ratings certificate received
  - [ ] Appropriate for target audience

- [ ] **App content**
  - [ ] Ads declaration (Yes/No)
  - [ ] In-app purchases declaration
  - [ ] Target audience (age groups)
  - [ ] Content guidelines compliance

- [ ] **Data safety**
  - [ ] Data collection practices disclosed
  - [ ] Data sharing practices disclosed
  - [ ] Security practices described
  - [ ] Data deletion policy explained

- [ ] **Pricing and distribution**
  - [ ] Countries selected
  - [ ] Pricing set (or free)
  - [ ] Device compatibility configured

- [ ] **Release track selected**
  - [ ] Internal testing / Closed testing / Open testing / Production
  - [ ] Staged rollout percentage (if applicable)
  - [ ] Release name and notes

- [ ] **Submit for review**
  - [ ] AAB uploaded
  - [ ] All required fields completed
  - [ ] Release sent for review
  - [ ] Confirmation received

---

## Post-Release

### Monitoring
- [ ] **Monitor review status**
  - [ ] Check status daily
  - [ ] Respond to reviewer questions within 24 hours
  - [ ] Address rejection reasons promptly

- [ ] **Crash monitoring**
  - [ ] Crashlytics / Sentry dashboard reviewed
  - [ ] Crash-free rate monitored (target: >99%)
  - [ ] Critical crashes investigated immediately
  - [ ] Crash trends identified

- [ ] **User reviews**
  - [ ] Check reviews daily (first 3 days)
  - [ ] Respond to negative reviews professionally
  - [ ] Thank users for positive feedback
  - [ ] Identify common issues/requests

- [ ] **Performance metrics**
  - [ ] Download/install rate
  - [ ] Active users (DAU, MAU)
  - [ ] Retention (D1, D7, D30)
  - [ ] Session length and frequency
  - [ ] Feature usage analytics

### Communication
- [ ] **Announce release**
  - [ ] Social media posts (Twitter, LinkedIn, etc.)
  - [ ] Blog post or changelog published
  - [ ] Email to mailing list (if applicable)
  - [ ] Update website with latest version info

- [ ] **Internal communication**
  - [ ] Notify team of successful release
  - [ ] Share metrics and initial feedback
  - [ ] Celebrate milestones

### Follow-Up
- [ ] **Documentation updates**
  - [ ] Help docs updated with new features
  - [ ] FAQ updated with common questions
  - [ ] Video tutorials created (if needed)

- [ ] **Support preparation**
  - [ ] Support team briefed on changes
  - [ ] Known issues documented
  - [ ] Troubleshooting guides updated

- [ ] **Retrospective**
  - [ ] Schedule release retrospective meeting
  - [ ] Document what went well
  - [ ] Identify improvements for next release
  - [ ] Update this checklist if needed

---

## Emergency Hotfix

Use this section for critical bug fixes released outside the normal cycle.

### Preparation
- [ ] **Assess severity**
  - [ ] Impact: Critical / High / Medium
  - [ ] Affected users: All / Subset / Specific scenario
  - [ ] Workaround available: Yes / No

- [ ] **Create hotfix branch**
  - [ ] Branch from production tag: `git checkout -b hotfix/v1.2.4 v1.2.3`
  - [ ] Apply minimal fix (no feature additions)
  - [ ] Update version: `1.2.3` → `1.2.4` (patch increment)

### Testing
- [ ] **Verify fix**
  - [ ] Bug fixed in hotfix branch
  - [ ] No new issues introduced
  - [ ] Existing features unaffected
  - [ ] Automated tests pass

- [ ] **Expedited testing**
  - [ ] Critical user flows tested
  - [ ] Affected scenario verified
  - [ ] Smoke tests on key features
  - [ ] Test on multiple devices (minimum 2)

### Release
- [ ] **Build and submit**
  - [ ] Build iOS and Android
  - [ ] Upload to App Store / Play Console
  - [ ] Request **Expedited Review** (iOS, if critical)
  - [ ] Use **Staged Rollout** (Android, start with 20%)

- [ ] **Fast-track checklist**
  - [ ] Review notes explain urgency
  - [ ] Demo account provided
  - [ ] Clear testing instructions
  - [ ] Contact info for quick questions

### Post-Hotfix
- [ ] **Monitor closely**
  - [ ] Check crash reports hourly (first 24h)
  - [ ] Watch user reviews for new issues
  - [ ] Increase rollout percentage if stable (Android)

- [ ] **Merge back**
  - [ ] Merge hotfix to `main` branch
  - [ ] Merge hotfix to `develop` branch (if using git-flow)
  - [ ] Tag release: `git tag v1.2.4`
  - [ ] Push tags: `git push --tags`

- [ ] **Post-mortem**
  - [ ] Document root cause
  - [ ] Identify prevention measures
  - [ ] Update testing procedures
  - [ ] Share learnings with team

---

## Checklist Tips

### Before You Start
- **Print or copy this checklist** for each release
- **Assign owners** to each section if team-based
- **Estimate time** needed for each phase
- **Block calendar time** for release day

### During Release
- **Check off items** as completed
- **Document issues** encountered
- **Take screenshots** of key steps
- **Keep stakeholders updated**

### After Release
- **Archive completed checklist** with release tag
- **Update this template** based on lessons learned
- **Celebrate** the successful release with your team!

---

## Appendix: Useful Commands

### Version Bump
```bash
# Using npm version
npm version patch  # 1.2.3 → 1.2.4
npm version minor  # 1.2.3 → 1.3.0
npm version major  # 1.2.3 → 2.0.0

# Manual version update
# Edit package.json, tauri.conf.json, Cargo.toml, build.gradle, Info.plist
```

### Build Commands
```bash
# iOS
npm run build:ios
# or
cd ios && xcodebuild archive -workspace Opcode.xcworkspace -scheme Opcode -archivePath build/Opcode.xcarchive

# Android
npm run build:android
# or
cd android && ./gradlew bundleRelease
```

### Testing
```bash
# Run all tests
npm test

# Lint
npm run lint

# Type check
npm run typecheck

# Accessibility audit
# iOS: Xcode → Accessibility Inspector
# Android: adb shell settings put secure enabled_accessibility_services com.google.android.marvin.talkback/.TalkBackService
```

### Dependency Audit
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

---

**Version**: 1.0.0
**Last Updated**: 2025-12-07
**Maintained By**: Opcode Development Team
