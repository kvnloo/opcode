# App Store Assets

This directory contains all visual assets required for App Store (iOS) and Google Play Store (Android) submissions.

---

## Directory Structure

```
assets/app-store/
├── README.md                          # This file
├── icons/                             # App icons
│   ├── ios/
│   │   ├── AppIcon.appiconset/       # iOS App Icon set (Xcode format)
│   │   │   ├── icon-1024.png         # 1024x1024 (App Store)
│   │   │   ├── icon-20@2x.png        # 40x40 (iPhone Notification)
│   │   │   ├── icon-20@3x.png        # 60x60 (iPhone Notification)
│   │   │   ├── icon-29@2x.png        # 58x58 (iPhone Settings)
│   │   │   ├── icon-29@3x.png        # 87x87 (iPhone Settings)
│   │   │   ├── icon-40@2x.png        # 80x80 (iPhone Spotlight)
│   │   │   ├── icon-40@3x.png        # 120x120 (iPhone Spotlight)
│   │   │   ├── icon-60@2x.png        # 120x120 (iPhone App)
│   │   │   ├── icon-60@3x.png        # 180x180 (iPhone App)
│   │   │   ├── icon-76.png           # 76x76 (iPad App)
│   │   │   ├── icon-76@2x.png        # 152x152 (iPad App)
│   │   │   ├── icon-83.5@2x.png      # 167x167 (iPad Pro)
│   │   │   └── Contents.json         # Asset catalog metadata
│   │   └── icon-source.png           # Source file (1024x1024 minimum)
│   │
│   └── android/
│       ├── ic_launcher.png           # 512x512 (Play Console)
│       ├── adaptive-icon/
│       │   ├── foreground.png        # 432x432 (108dp @ xxxhdpi)
│       │   └── background.png        # 432x432 (108dp @ xxxhdpi)
│       └── icon-source.png           # Source file (1024x1024 minimum)
│
├── screenshots/                       # App screenshots
│   ├── phone/
│   │   ├── ios/
│   │   │   ├── 6.9-inch/             # iPhone 16 Pro Max
│   │   │   │   ├── 01-editor.png     # 1320x2868
│   │   │   │   ├── 02-projects.png
│   │   │   │   ├── 03-terminal.png
│   │   │   │   ├── 04-settings.png
│   │   │   │   └── 05-themes.png
│   │   │   │
│   │   │   ├── 6.7-inch/             # iPhone 15 Plus
│   │   │   │   └── [same structure]  # 1290x2796
│   │   │   │
│   │   │   ├── 6.5-inch/             # iPhone XS Max
│   │   │   │   └── [same structure]  # 1242x2688
│   │   │   │
│   │   │   └── 5.5-inch/             # iPhone 8 Plus
│   │   │       └── [same structure]  # 1242x2208
│   │   │
│   │   └── android/
│   │       ├── 01-editor.png         # 1080x1920 (16:9 or 9:16)
│   │       ├── 02-projects.png
│   │       ├── 03-terminal.png
│   │       ├── 04-settings.png
│   │       └── 05-themes.png
│   │
│   └── tablet/
│       ├── ios/
│       │   ├── 13-inch/              # iPad Pro 13" (6th gen)
│       │   │   └── [screenshots]     # 2064x2752
│       │   │
│       │   ├── 12.9-inch/            # iPad Pro 12.9" (5th gen)
│       │   │   └── [screenshots]     # 2048x2732
│       │   │
│       │   └── 11-inch/              # iPad Pro 11" (4th gen)
│       │       └── [screenshots]     # 1668x2388
│       │
│       └── android/
│           ├── 7-inch/
│           │   └── [screenshots]     # 1200x1920 or similar
│           │
│           └── 10-inch/
│               └── [screenshots]     # 1600x2560 or similar
│
├── feature-graphic/                   # Google Play only
│   ├── feature-graphic.png           # 1024x500
│   ├── feature-graphic-source.psd    # Source file (Photoshop)
│   └── feature-graphic-source.ai     # Source file (Illustrator)
│
└── preview-video/                     # Optional app preview videos
    ├── ios/
    │   ├── preview-6.9-inch.mov      # 1320x2868, 15-30 sec, H.264
    │   └── preview-subtitles.srt     # Subtitles file
    │
    └── android/
        └── promo-video-youtube-id.txt # YouTube video ID or URL

```

---

## Asset Requirements

### App Icons

#### iOS App Icon
**Required Size**: 1024 x 1024 pixels
**Format**: PNG (24-bit, no transparency)
**Color Space**: sRGB or Display P3
**Purpose**: App Store listing and all device sizes

**Design Guidelines**:
- No transparency or rounded corners (applied automatically)
- Avoid text in icon (especially small text)
- Recognizable at small sizes
- Consistent with brand identity
- No Apple hardware in icon
- Follow [Apple's App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

**Tool Recommendations**:
- [App Icon Generator](https://appicon.co/) - Generates all sizes from 1024x1024
- [IconKitchen](https://icon.kitchen/) - iOS and Android icon generator
- Xcode Asset Catalog - Manages icon sizes automatically

#### Android App Icon
**Required Size**: 512 x 512 pixels
**Format**: PNG (32-bit with transparency allowed)
**Purpose**: Google Play Console

**Adaptive Icon** (Recommended):
- **Foreground Layer**: 432 x 432 pixels (108dp @ xxxhdpi)
  - Safe zone: Center 264 x 264 pixels (66dp)
  - Content should fit within safe zone
- **Background Layer**: 432 x 432 pixels (108dp @ xxxhdpi)
  - Solid color or simple pattern
  - No transparency

**Design Guidelines**:
- Icon layers should not be pre-masked
- Avoid placing critical elements in outer 20%
- Test with different mask shapes (circle, squircle, rounded square)
- Follow [Material Design Icon Guidelines](https://material.io/design/iconography/product-icons.html)

---

### Screenshots

#### iOS Screenshots

**Required Device Sizes** (at least one required, all recommended):
- **6.9" Display** (iPhone 16 Pro Max): 1320 x 2868 pixels
- **6.7" Display** (iPhone 15 Plus): 1290 x 2796 pixels
- **6.5" Display** (iPhone XS Max): 1242 x 2688 pixels
- **5.5" Display** (iPhone 8 Plus): 1242 x 2208 pixels

**iPad Sizes** (optional):
- **13" Display** (iPad Pro 6th gen): 2064 x 2752 pixels
- **12.9" Display** (iPad Pro 5th gen): 2048 x 2732 pixels
- **11" Display** (iPad Pro 4th gen): 1668 x 2388 pixels

**Requirements**:
- Minimum: 3 screenshots (same device size)
- Maximum: 10 screenshots per device size
- Format: PNG or JPEG (no transparency)
- Orientation: Portrait or Landscape (consistent per set)
- Status bar: Can be included or hidden

**Best Practices**:
1. **First screenshot is most important** - Most visible in search results
2. **Show core functionality** - Highlight unique features
3. **Use text overlays** - Explain features (keep text minimal and readable)
4. **Consistent style** - Use same design template across screenshots
5. **Localize** - Create screenshots for each supported language
6. **Real content** - Avoid placeholder text, use realistic examples

**Screenshot Scenes** (Recommended for Opcode):
1. **Main Editor** - Show syntax highlighting and code editing
2. **File Browser** - Project/folder navigation interface
3. **Terminal Integration** - Built-in terminal with command execution
4. **Multi-tab Editing** - Multiple files open simultaneously
5. **Theme Customization** - Dark/light themes and color schemes
6. **Settings** - Preferences and configuration options
7. **Git Integration** - Version control features (if applicable)

#### Android Screenshots

**Requirements**:
- Minimum: 2 screenshots
- Maximum: 8 screenshots (phone), 8 (tablet)
- Format: PNG or JPEG (24-bit, no transparency)
- Aspect Ratio: 16:9 or 9:16
- Minimum Dimension: 320 pixels
- Maximum Dimension: 3840 pixels

**Recommended Size**: 1080 x 1920 pixels (portrait) or 1920 x 1080 (landscape)

**Best Practices**:
- Same principles as iOS (see above)
- Use device frames to add context (optional)
- Highlight Material Design adherence
- Show Android-specific features (widgets, notifications)

---

### Feature Graphic (Google Play Only)

**Size**: 1024 x 500 pixels
**Format**: PNG or JPEG (24-bit)
**Purpose**: Displayed prominently in Play Store listing

**Design Guidelines**:
- Include app name or logo
- Showcase key visual or feature
- Use high-quality graphics
- Avoid text smaller than 12pt
- Ensure readability on mobile devices
- Can be promotional or informational
- No references to Google branding

**Design Tips**:
- Use brand colors and fonts
- Include call-to-action (e.g., "Download Now", "Try Today")
- Test on different screen sizes
- Keep design simple and uncluttered
- Use high-contrast elements

---

### App Preview Video (Optional)

#### iOS App Preview
**Format**: .mov, .m4v, or .mp4
**Resolution**: Same as screenshot requirements for each device
**Duration**: 15-30 seconds
**File Size**: Up to 500 MB
**Codec**: H.264 or ProRes
**Frame Rate**: 30 fps or higher

**Requirements**:
- Must represent actual app footage (no mockups)
- Portrait or landscape orientation
- No external branding or advertising
- Audio optional but recommended
- Captions recommended for accessibility

**Structure**:
```
0:00-0:03 - App logo/branding (optional)
0:03-0:10 - Core feature demonstration #1
0:10-0:18 - Core feature demonstration #2
0:18-0:25 - Unique selling point
0:25-0:30 - Call to action / app name
```

#### Android Promo Video
**Platform**: YouTube
**Requirement**: Provide YouTube URL in Play Console
**Duration**: 30 seconds to 2 minutes recommended
**Format**: Any YouTube-supported format

**Best Practices**:
- Similar structure to iOS preview
- Can be more promotional than iOS
- Include spoken narration or captions
- Show app in action
- Highlight benefits, not just features
- End with clear call-to-action

---

## Creating Assets

### Tools and Software

**Graphic Design**:
- [Figma](https://www.figma.com/) - Free, collaborative, browser-based
- [Adobe Photoshop](https://www.adobe.com/products/photoshop.html) - Industry standard
- [Adobe Illustrator](https://www.adobe.com/products/illustrator.html) - Vector graphics
- [Sketch](https://www.sketch.com/) - macOS only, popular for UI design
- [Affinity Designer](https://affinity.serif.com/designer/) - One-time purchase alternative

**Screenshot Tools**:
- [Fastlane Screenshot](https://docs.fastlane.tools/actions/snapshot/) - Automated iOS screenshots
- [Screener](https://play.google.com/store/apps/details?id=de.toastcode.screener) - Android screenshot framing
- [AppLaunchpad](https://theapplaunchpad.com/) - Screenshot templates
- [PlaceIt](https://placeit.net/) - Device mockups and templates

**Video Editing**:
- [iMovie](https://www.apple.com/imovie/) - Free, macOS/iOS
- [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) - Free, professional-grade
- [Adobe Premiere Pro](https://www.adobe.com/products/premiere.html) - Industry standard
- [Final Cut Pro](https://www.apple.com/final-cut-pro/) - macOS only, professional

**Icon Generators**:
- [App Icon Generator](https://appicon.co/)
- [IconKitchen](https://icon.kitchen/)
- [MakeAppIcon](https://makeappicon.com/)
- [Ape Tools App Icon Generator](https://apetools.webprofusion.com/tools/imagegorilla)

### Workflow

#### 1. Design in High Resolution
- Start with largest required size
- Use vector graphics when possible
- Maintain source files (PSD, AI, Sketch)
- Keep layers organized

#### 2. Export for Each Platform
- iOS: Use Xcode Asset Catalog or export all sizes
- Android: Export adaptive icon layers separately
- Maintain folder structure (see above)

#### 3. Optimize File Sizes
- Use image compression tools (TinyPNG, ImageOptim)
- Balance quality and file size
- Ensure colors are accurate (sRGB color space)

#### 4. Review and Test
- Preview on actual devices
- Check readability at small sizes
- Validate dimensions and formats
- Test in App Store Connect / Play Console

---

## Screenshot Capture Process

### iOS (Using Xcode Simulator)

**Steps**:
1. Open Xcode → Window → Devices and Simulators
2. Select target device (e.g., iPhone 16 Pro Max)
3. Launch app in simulator
4. Navigate to desired screen
5. Clean up status bar:
   - Features → Set Time (e.g., 9:41 AM)
   - Features → Toggle Appearance (light/dark)
   - Features → Trigger Status Bar (clean)
6. Capture screenshot:
   - File → New Screenshot
   - Or keyboard: Cmd + S
7. Save to `assets/app-store/screenshots/phone/ios/[device-size]/`

**Automated Approach** (Fastlane):
```ruby
# Fastfile
snapshot(
  devices: [
    "iPhone 16 Pro Max",
    "iPhone 15 Plus",
    "iPad Pro (12.9-inch) (6th generation)"
  ],
  languages: ["en-US", "es-ES"],
  output_directory: "./assets/app-store/screenshots",
  clear_previous_screenshots: true
)
```

### Android (Using Emulator or Device)

**Steps**:
1. Open Android Studio → AVD Manager
2. Launch emulator (e.g., Pixel 7 Pro)
3. Launch app
4. Navigate to desired screen
5. Clean status bar:
   - Settings → Developer options → Demo mode
   - Or use ADB: `adb shell settings put global sysui_demo_allowed 1`
6. Capture screenshot:
   - Camera button in emulator toolbar
   - Or keyboard: Ctrl + S (Windows/Linux), Cmd + S (macOS)
7. Save to `assets/app-store/screenshots/phone/android/`

**Device Frames** (Optional):
- Use Google's Device Art Generator
- Or Screenshot Framer apps
- Adds context and professionalism

---

## Localization

### Supported Languages

**Tier 1** (High Priority):
- English (United States)
- Spanish (Spain, Latin America)
- French (France)
- German (Germany)
- Chinese (Simplified, Traditional)
- Japanese
- Korean

**Tier 2** (Secondary):
- Portuguese (Brazil)
- Italian
- Russian
- Dutch
- Turkish
- Arabic

### Localizing Assets

**Screenshots**:
1. Capture base screenshots (English)
2. Translate text overlays using translation service
3. Replace text in design tool (Photoshop, Figma)
4. Export localized versions
5. Organize in language-specific folders:
   ```
   screenshots/phone/ios/6.9-inch/en-US/
   screenshots/phone/ios/6.9-inch/es-ES/
   screenshots/phone/ios/6.9-inch/fr-FR/
   ```

**App Icon**:
- Generally NOT localized (universal design)
- Exceptions: Text-based icons or region-specific branding

**Feature Graphic**:
- Localize text if included
- Use culturally appropriate imagery
- Test with native speakers

---

## Quality Checklist

Before submission, verify:

### Icons
- [ ] No transparency (iOS) or correct adaptive layers (Android)
- [ ] Meets minimum size requirements (1024x1024 iOS, 512x512 Android)
- [ ] Recognizable at small sizes
- [ ] Consistent with brand guidelines
- [ ] No text or small details that become illegible

### Screenshots
- [ ] Minimum 3 screenshots for iOS, 2 for Android
- [ ] Correct dimensions for each device size
- [ ] High-quality, crisp images (no pixelation)
- [ ] Real app content (no placeholders)
- [ ] Text overlays readable on mobile screens
- [ ] Consistent design theme across all screenshots
- [ ] Localized for target markets

### Feature Graphic (Android)
- [ ] Correct size (1024x500)
- [ ] High-quality graphics
- [ ] Text readable at small sizes
- [ ] Represents app accurately
- [ ] No Google branding

### Preview Video (Optional)
- [ ] Correct format and resolution
- [ ] Within duration limits (15-30 sec iOS, 30-120 sec Android)
- [ ] Shows actual app footage
- [ ] Audio clear and professional (if included)
- [ ] Captions for accessibility

---

## File Naming Conventions

**Consistency is key**. Use clear, descriptive names:

### Icons
```
icon-1024.png                  # iOS App Store icon
icon-60@3x.png                 # iOS 180x180 icon
ic_launcher.png                # Android launcher icon
ic_launcher_foreground.png     # Android adaptive foreground
ic_launcher_background.png     # Android adaptive background
```

### Screenshots
```
01-editor.png                  # First screenshot (main editor)
02-projects.png                # Second screenshot (projects view)
03-terminal.png                # Third screenshot (terminal)
04-settings.png                # Fourth screenshot (settings)
05-themes.png                  # Fifth screenshot (themes)
```

**Numbering**:
- Use leading zeros (01, 02, ..., 10) for proper sorting
- Order represents display order in store
- Use descriptive names (not just "screenshot1.png")

### Localized Assets
```
en-US/01-editor.png            # English (US)
es-ES/01-editor.png            # Spanish (Spain)
fr-FR/01-editor.png            # French (France)
```

---

## Version Control

**Do**:
- Commit source files (PSD, AI, Sketch, Figma links)
- Commit final exported assets (PNG, JPG)
- Use Git LFS for large binary files (optional)
- Tag releases with version numbers

**Don't**:
- Commit intermediate/temporary files
- Include personal credentials or API keys
- Forget to update assets when app UI changes

**Example `.gitattributes` for Git LFS**:
```
*.psd filter=lfs diff=lfs merge=lfs -text
*.ai filter=lfs diff=lfs merge=lfs -text
*.sketch filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
```

---

## Resources and References

### Official Guidelines
- [Apple App Store Marketing Guidelines](https://developer.apple.com/app-store/marketing/guidelines/)
- [Apple Human Interface Guidelines - App Icon](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Google Play Store Listing Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Android App Icon Guidelines](https://developer.android.com/google-play/resources/icon-design-specifications)
- [Material Design - Product Icons](https://material.io/design/iconography/product-icons.html)

### Tools
- [Figma](https://www.figma.com/)
- [Sketch](https://www.sketch.com/)
- [Adobe Creative Cloud](https://www.adobe.com/creativecloud.html)
- [Fastlane](https://fastlane.tools/)
- [ImageOptim](https://imageoptim.com/)
- [TinyPNG](https://tinypng.com/)

### Inspiration
- [AppSites](https://appsites.com/) - App landing page inspiration
- [Mobbin](https://mobbin.com/) - Mobile design patterns
- [Pttrns](https://pttrns.com/) - iOS UI patterns
- [Android Niceties](https://androidniceties.tumblr.com/) - Android design inspiration

---

**Maintained By**: Opcode Design Team
**Last Updated**: 2025-12-07
**Version**: 1.0.0

For questions or asset requests, contact: design@yourdomain.com
