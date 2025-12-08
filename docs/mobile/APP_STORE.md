# App Store Submission Guide

## Table of Contents
- [iOS App Store](#ios-app-store)
- [Google Play Store](#google-play-store)
- [Required Assets](#required-assets)
- [Metadata Templates](#metadata-templates)
- [App Store Optimization](#app-store-optimization)

---

## iOS App Store

### Apple Developer Account Requirements
- **Enrollment**: Apple Developer Program membership ($99/year)
- **Account Type**: Individual or Organization
- **Two-Factor Authentication**: Required for account security
- **Tax and Banking**: Required for paid apps or in-app purchases
- **Agreements**: Accept Apple Developer Program License Agreement

### App Store Connect Setup

#### 1. Create App Record
```
App Store Connect > My Apps > + (New App)
- Platform: iOS
- Name: Opcode
- Primary Language: English (US)
- Bundle ID: Select from dropdown (configured in Xcode)
- SKU: Unique identifier (e.g., opcode-mobile-001)
```

#### 2. App Information
- **Name**: Opcode (30 characters max)
- **Subtitle**: Professional code editor for mobile (30 characters max)
- **Category**: Primary - Developer Tools
- **Secondary Category**: Productivity (optional)
- **Content Rights**: Own or licensed all rights

#### 3. Pricing and Availability
- **Price**: Free (or set price tier)
- **Availability**: All territories or select specific countries
- **Pre-orders**: Optional, available 2-180 days before release

#### 4. App Privacy
- **Privacy Policy URL**: https://yourdomain.com/privacy
- **Data Collection**: Complete privacy questionnaire
- **Privacy Nutrition Labels**: Required (see Privacy Policy section)

### Required Metadata and Screenshots

#### App Preview and Screenshots
**iPhone Screenshots** (Required - at least 3, up to 10):
- 6.9" Display (iPhone 16 Pro Max): 1320 x 2868 pixels
- 6.7" Display (iPhone 15 Plus): 1290 x 2796 pixels
- 6.5" Display (iPhone XS Max): 1242 x 2688 pixels
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 pixels

**iPad Screenshots** (Optional but recommended):
- 13" Display (iPad Pro 6th gen): 2064 x 2752 pixels
- 12.9" Display (iPad Pro 5th gen): 2048 x 2732 pixels
- 11" Display (iPad Pro 4th gen): 1668 x 2388 pixels

**App Preview Video** (Optional):
- Format: .mov, .m4v, or .mp4
- Resolution: Same as screenshot requirements
- Duration: 15-30 seconds
- Size: Up to 500 MB

#### App Description
- **Promotional Text**: 170 characters (updateable without new version)
- **Description**: 4000 characters max
- **Keywords**: 100 characters (comma-separated)
- **Support URL**: Required
- **Marketing URL**: Optional

### Review Guidelines Compliance

#### Technical Requirements
- **Completeness**: App must be fully functional
- **Crashes**: No crashes during review
- **Links**: All links must work
- **Placeholder Content**: Not acceptable
- **Demo Account**: Provide if login required
- **Beta Features**: Should not be mentioned

#### Content Requirements
- **User-Generated Content**: Moderation required
- **No Misleading Content**: Accurate descriptions
- **Age Rating**: Complete questionnaire accurately
- **Intellectual Property**: Respect copyright and trademarks
- **Privacy**: Comply with privacy laws (GDPR, CCPA)

#### Design Guidelines
- **Human Interface Guidelines**: Follow Apple's HIG
- **App Icon**: Required, no transparency
- **Launch Screen**: Required, not a splash screen
- **UI Elements**: Native or custom that feel native

### TestFlight Beta Testing

#### Internal Testing
- Up to 100 internal testers
- No review required
- Immediate distribution
- Automatically notified of new builds

#### External Testing
- Up to 10,000 external testers
- Beta App Review required (1-2 days)
- Public link or email invitations
- 90-day testing period per build

#### Setup Process
```
1. App Store Connect > TestFlight
2. Upload build via Xcode or Transporter
3. Provide test information and notes
4. Add testers (internal or external groups)
5. Distribute build
```

---

## Google Play Store

### Google Play Console Setup

#### 1. Create Developer Account
- **Fee**: One-time $25 registration fee
- **Account Type**: Personal or Organization
- **Verification**: Identity verification required
- **Payment Profile**: Required for paid apps

#### 2. Create Application
```
Google Play Console > All apps > Create app
- App name: Opcode
- Default language: English (United States)
- App or game: App
- Free or paid: Free
- Declarations: Accept Developer Program Policies
```

#### 3. Dashboard Setup
Complete all setup tasks:
- **App access**: Declare if login required
- **Ads**: Declare if app contains ads
- **Content rating**: Complete questionnaire
- **Target audience**: Select age groups
- **News app**: Declare if news app
- **COVID-19 contact tracing**: Declare if applicable
- **Data safety**: Complete data safety form

### Required Assets and Descriptions

#### App Icon
- **Format**: PNG (32-bit)
- **Size**: 512 x 512 pixels
- **Requirements**:
  - No transparency
  - No rounded corners (applied automatically)
  - Safe area: avoid important elements in outer 10%

#### Feature Graphic
- **Size**: 1024 x 500 pixels
- **Format**: PNG or JPEG
- **Purpose**: Displayed in store listings
- **Design**: High-quality, represents app purpose

#### Screenshots
**Phone Screenshots** (Required - 2 minimum, 8 maximum):
- Aspect ratio: 16:9 or 9:16
- Minimum dimension: 320 pixels
- Maximum dimension: 3840 pixels
- Format: PNG or JPEG (no transparency)

**7-inch Tablet Screenshots** (Optional):
- Same requirements as phone

**10-inch Tablet Screenshots** (Optional):
- Same requirements as phone

**Wear OS Screenshots** (If applicable)
**TV Screenshots** (If applicable)

#### Promo Video (Optional)
- **YouTube URL**: Link to promotional video
- **Purpose**: Showcased in store listing
- **Duration**: 30 seconds to 2 minutes recommended

### Content Rating Questionnaire

#### Categories Assessed
- Violence
- Sexual content
- Profanity
- Controlled substances
- Gambling
- User interaction features
- Location sharing
- Personal information sharing

#### Rating Systems
- ESRB (North America)
- PEGI (Europe)
- USK (Germany)
- ClassInd (Brazil)
- Generic (other regions)

**For Opcode** (likely ratings):
- Everyone or Everyone 10+
- No objectionable content
- May have user interaction (code sharing)

### Release Tracks

#### Internal Testing
- Up to 100 testers
- No review required
- Immediate deployment
- Can be promoted to other tracks

#### Closed Testing
- Up to 100 lists of testers
- No size limit per list
- Email-based or link-based invitations
- Faster review process

#### Open Testing
- Anyone can join
- Optional maximum testers limit
- Public opt-in link
- Standard review process

#### Production
- Available to all users in selected countries
- Full Google Play review
- Staged rollout available (1% to 100%)
- Release to specific countries

### Android App Bundle (AAB) Requirements

#### Why AAB Instead of APK
- **Smaller Downloads**: Only necessary code/resources delivered
- **Dynamic Delivery**: On-demand features
- **Required**: For apps over 150 MB
- **Mandatory**: As of August 2021 for new apps

#### Building AAB
```bash
# For React Native
cd android
./gradlew bundleRelease

# Output location
android/app/build/outputs/bundle/release/app-release.aab
```

#### Signing Configuration
```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## Required Assets

### Comprehensive Asset Checklist

#### Icons
- **iOS App Icon**:
  - 1024 x 1024 pixels (App Store)
  - No transparency, no rounded corners
  - Multiple sizes for devices (handled by Xcode)

- **Android App Icon**:
  - 512 x 512 pixels (Play Console)
  - Adaptive icon: 108 x 108 dp canvas
  - Foreground layer: 72 x 72 dp safe zone
  - Background layer: solid color or pattern

#### Screenshots (All Platforms)

**Phone Screenshots** (Both platforms):
```
Recommended scenes:
1. Main code editor interface
2. Project/file browser
3. Terminal/console integration
4. Settings/preferences
5. Syntax highlighting showcase
6. Multi-file editing
7. Git integration (if applicable)
8. Theme customization
```

**Tablet Screenshots** (Optional but recommended):
- Show multi-panel layouts
- Demonstrate tablet-optimized features
- Highlight productivity improvements

#### Feature Graphic (Google Play Only)
- **Size**: 1024 x 500 pixels
- **Design Elements**:
  - App name/logo
  - Key visual representing functionality
  - No text smaller than 12pt
  - High contrast for visibility

#### App Preview Video (Optional)

**Recommended Structure** (30 seconds):
```
0:00-0:05 - App logo/branding
0:05-0:10 - Primary feature showcase
0:10-0:20 - Key features demonstration
0:20-0:25 - Value proposition
0:25-0:30 - Call to action/download prompt
```

**Technical Specs**:
- Resolution: 1080p minimum
- Frame rate: 30 fps minimum
- Format: H.264 codec recommended
- Audio: Optional but recommended
- Captions: Recommended for accessibility

### Supporting Documentation

#### Privacy Policy URL
- **Hosting**: Must be publicly accessible HTTPS URL
- **Content**: See PRIVACY_POLICY.md
- **Updates**: Notify users of material changes
- **Accessibility**: Available in app and on website

#### Support Email
- **Format**: Professional email address
- **Responsiveness**: Monitor regularly
- **Auto-responder**: Set up automated acknowledgment
- **Examples**:
  - support@yourdomain.com
  - opcode-support@yourdomain.com

#### Support URL (Optional)
- **Content**: FAQ, documentation, tutorials
- **Examples**:
  - https://yourdomain.com/support
  - https://docs.yourdomain.com
  - https://opcode.yourdomain.com/help

#### Marketing URL (Optional)
- **Purpose**: Main product website
- **Content**: Features, pricing, testimonials
- **Example**: https://opcode.yourdomain.com

---

## Metadata Templates

### App Name and Subtitle

#### iOS
**App Name** (30 characters max):
```
Opcode
```

**Subtitle** (30 characters max):
```
Code Editor for Developers
```
or
```
Professional Mobile IDE
```

#### Android
**App Name** (50 characters max):
```
Opcode - Code Editor
```

### App Descriptions

#### Short Description (Google Play - 80 characters)
```
Professional code editor with syntax highlighting, Git integration, and terminal.
```

#### Full Description (4000 characters iOS, 4000 characters Android)

```markdown
# Opcode - Professional Code Editor for Mobile

Transform your mobile device into a powerful development environment with Opcode, the professional-grade code editor designed for developers on the go.

## KEY FEATURES

### Powerful Code Editing
• Syntax highlighting for 50+ programming languages
• Intelligent code completion and suggestions
• Multi-cursor editing and selection
• Find and replace with regex support
• Code folding and bracket matching
• Customizable themes (light, dark, and custom)

### Project Management
• Open entire folders and projects
• File tree navigation with search
• Multiple tabs for efficient multitasking
• Git integration for version control
• Quick file switching with fuzzy search

### Terminal Integration
• Built-in terminal emulator
• Run commands and scripts directly
• SSH support for remote development
• Command history and autocomplete

### Developer Tools
• Markdown preview and rendering
• JSON/XML formatting and validation
• Diff viewer for file comparison
• Snippet library for code templates
• Regular expression tester

### Customization
• Configurable keyboard shortcuts
• Adjustable font size and family
• Custom color schemes
• Editor preferences and settings
• Extension support (coming soon)

### Performance
• Fast and responsive editing
• Efficient memory usage
• Works offline (no internet required)
• Auto-save and crash recovery
• Large file support

## PERFECT FOR

✓ Mobile app developers
✓ Web developers
✓ Students learning to code
✓ System administrators
✓ DevOps engineers
✓ Anyone who codes on the go

## SUPPORTED LANGUAGES

JavaScript, TypeScript, Python, Java, Kotlin, Swift, Go, Rust, C, C++, C#, PHP, Ruby, HTML, CSS, SCSS, SQL, Shell, Bash, PowerShell, Markdown, JSON, XML, YAML, and many more.

## WHY OPCODE?

Unlike simple text editors, Opcode provides a complete development environment optimized for mobile devices. Whether you're fixing a critical bug, reviewing code, or working on a side project, Opcode gives you the tools you need to be productive anywhere.

## PRIVACY & SECURITY

• All data stored locally on your device
• No cloud sync required (optional)
• Open source and transparent
• No ads or tracking
• Secure file access permissions

## GET STARTED

Download Opcode today and experience professional code editing on your mobile device. Join thousands of developers who trust Opcode for their mobile development needs.

---

Support: support@yourdomain.com
Website: https://opcode.yourdomain.com
Privacy Policy: https://yourdomain.com/privacy
Terms of Service: https://yourdomain.com/terms
```

### Keywords (iOS - 100 characters, comma-separated)

```
code editor,IDE,programming,developer,syntax highlighting,git,terminal,mobile,coding,javascript,python,java,html,css,markdown,text editor,code,dev tools,software
```

**Strategy**:
- Include primary function keywords (code editor, IDE)
- Add popular language names
- Include developer-focused terms
- Avoid competitor names
- Use singular and plural variations sparingly
- Research competitor keywords with ASO tools

### What's New (Release Notes)

**Template for Version Updates**:

```markdown
Version 1.0.1 - Bug Fixes and Improvements

• Fixed syntax highlighting for TypeScript files
• Improved terminal performance on large outputs
• Added keyboard shortcut customization
• Fixed file browser sorting issues
• Improved autocomplete accuracy
• Performance optimizations and bug fixes

As always, thanks for using Opcode! Please rate us if you enjoy the app.
```

**Best Practices**:
- Lead with most important changes
- Use bullet points for readability
- Keep it concise (iOS: 4000 chars, Android: 500 chars)
- Include call-to-action (rate/review)
- Update with every release

### Promotional Text (iOS - 170 characters, updateable)

```
🚀 New: Terminal themes and SSH support! Professional code editing with 50+ languages, Git integration, and powerful developer tools.
```

**Usage**:
- Highlight newest features
- Time-sensitive promotions
- Seasonal messaging
- Can be updated without app submission

---

## App Store Optimization

### Research and Analysis

#### Competitor Analysis
**Identify competitors**:
- Analyze their keywords
- Study their screenshots
- Review their descriptions
- Check their ratings/reviews
- Monitor their updates

**Tools**:
- App Annie
- Sensor Tower
- Mobile Action
- AppTweak

#### Keyword Research

**Steps**:
1. Brainstorm relevant terms
2. Use ASO tools to find search volume
3. Analyze competitor keywords
4. Identify low-competition opportunities
5. Test and iterate

**Metrics to Track**:
- Search volume
- Competition level
- Relevance score
- Current ranking
- Conversion rate

### Optimization Strategies

#### Visual Assets
- **A/B Testing**: Test different screenshot orders
- **Localization**: Create region-specific assets
- **Seasonal Updates**: Refresh for holidays/events
- **First Screenshot**: Most important, highest impact
- **Text Overlays**: Highlight key features on screenshots

#### Descriptions
- **Front-load Keywords**: First 250 characters crucial
- **Feature Lists**: Scannable bullet points
- **Social Proof**: Mention user counts, ratings
- **Clear CTA**: Tell users what to do
- **Regular Updates**: Refresh based on feedback

#### Ratings and Reviews

**Strategies to Improve**:
- In-app review prompts (at optimal moments)
- Respond to all reviews professionally
- Address negative feedback quickly
- Encourage satisfied users to rate
- Fix reported issues in updates

**Best Times to Ask for Reviews**:
- After successful task completion
- After multiple sessions (7-14 days)
- Never on first launch
- Not after errors or crashes

### Localization

#### Priority Markets
**Tier 1** (High priority):
- English (US, UK, Australia)
- Chinese (Simplified, Traditional)
- Japanese
- Korean
- German
- French
- Spanish (Spain, Latin America)

**Tier 2** (Secondary):
- Portuguese (Brazil)
- Russian
- Italian
- Dutch
- Turkish
- Arabic

#### Localization Scope
- App name (if appropriate)
- Description and keywords
- Screenshots (with localized text overlays)
- In-app content
- Support resources

### Performance Metrics

#### Key Performance Indicators

**Visibility**:
- Keyword rankings
- Search impressions
- Browse impressions
- Category ranking

**Conversion**:
- Store page views
- Install rate
- Screenshots view rate
- Video play rate

**Engagement**:
- Retention (D1, D7, D30)
- Session length
- Active users (DAU, MAU)
- Feature usage

**Quality**:
- Crash rate
- Average rating
- Review sentiment
- Uninstall rate

#### Tools for Tracking
- App Store Connect Analytics
- Google Play Console Statistics
- Third-party ASO platforms
- Firebase Analytics
- Custom analytics implementation

---

## Submission Checklist

### Pre-Submission
- [ ] App fully tested on physical devices
- [ ] All features working as described
- [ ] Privacy policy created and hosted
- [ ] Support email set up and monitored
- [ ] All required assets created
- [ ] Metadata written and reviewed
- [ ] Screenshots captured and optimized
- [ ] Demo account created (if needed)
- [ ] Review notes prepared

### iOS Submission
- [ ] App Store Connect record created
- [ ] Build uploaded via Xcode/Transporter
- [ ] Build selected for release
- [ ] App information completed
- [ ] Pricing and availability set
- [ ] App privacy details provided
- [ ] Age rating completed
- [ ] Review information provided
- [ ] Submit for review

### Android Submission
- [ ] Google Play Console app created
- [ ] All dashboard tasks completed
- [ ] Content rating received
- [ ] Data safety form completed
- [ ] Store listing completed
- [ ] AAB uploaded to chosen track
- [ ] Release notes added
- [ ] Countries selected
- [ ] Submit for review

### Post-Submission
- [ ] Monitor review status daily
- [ ] Respond to rejection reasons quickly
- [ ] Check crash reports
- [ ] Monitor user reviews
- [ ] Track download/installation metrics
- [ ] Prepare for next iteration

---

## Common Rejection Reasons and Solutions

### iOS Common Rejections

**2.1 - App Completeness**
- Issue: Broken features, placeholder content
- Solution: Thoroughly test all features, remove placeholders

**2.3 - Accurate Metadata**
- Issue: Screenshots don't match app, misleading descriptions
- Solution: Ensure accuracy in all marketing materials

**3.1 - Payments**
- Issue: Using third-party payment systems
- Solution: Use In-App Purchase for digital goods

**4.0 - Design**
- Issue: Poor UI, doesn't follow HIG
- Solution: Follow Apple Human Interface Guidelines

**5.1 - Privacy**
- Issue: Missing privacy policy, improper data handling
- Solution: Provide privacy policy, request permissions properly

### Android Common Rejections

**Inappropriate Content**
- Issue: Violates content policies
- Solution: Review and comply with content policies

**Intellectual Property**
- Issue: Copyright/trademark infringement
- Solution: Remove infringing content, obtain licenses

**Malicious Behavior**
- Issue: Suspicious permissions, code obfuscation
- Solution: Only request necessary permissions, explain usage

**Privacy Policy**
- Issue: Missing or inaccessible privacy policy
- Solution: Provide valid HTTPS URL to privacy policy

**Broken Functionality**
- Issue: Crashes, non-functional features
- Solution: Test thoroughly, fix all crashes

---

## Resources and Links

### Official Documentation
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Android App Quality Guidelines](https://developer.android.com/docs/quality-guidelines)

### Tools
- [Xcode](https://developer.apple.com/xcode/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)
- [Android Studio](https://developer.android.com/studio)

### ASO Tools
- [App Annie](https://www.appannie.com/)
- [Sensor Tower](https://sensortower.com/)
- [Mobile Action](https://www.mobileaction.co/)
- [AppTweak](https://www.apptweak.com/)
- [TheTool](https://thetool.io/)

### Community
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Android Developers](https://developer.android.com/community)
- [Stack Overflow](https://stackoverflow.com/)
- [Reddit - r/iOSProgramming](https://reddit.com/r/iOSProgramming)
- [Reddit - r/androiddev](https://reddit.com/r/androiddev)

---

**Last Updated**: 2025-12-07
**Version**: 1.0.0
**Maintained By**: Opcode Development Team
