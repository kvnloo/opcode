#!/bin/bash
# Claude Code Mobile - Opcode Fork Setup Script
# Run this to initialize the mobile development environment

set -e

echo "🚀 Claude Code Mobile - Setup Script"
echo "====================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${BLUE}Checking prerequisites...${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "  ✅ $1 found"
        return 0
    else
        echo -e "  ❌ $1 not found"
        return 1
    fi
}

MISSING_DEPS=0
check_command "git" || MISSING_DEPS=1
check_command "rustc" || MISSING_DEPS=1
check_command "cargo" || MISSING_DEPS=1
check_command "bun" || { check_command "npm" || MISSING_DEPS=1; }
check_command "claude" || echo -e "  ⚠️  Claude Code CLI not found (optional for development)"

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "\n${YELLOW}Please install missing dependencies:${NC}"
    echo "  - Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "  - Bun: curl -fsSL https://bun.sh/install | bash"
    echo "  - Claude CLI: https://claude.ai/code"
    exit 1
fi

# Clone opcode
echo -e "\n${BLUE}Cloning opcode repository...${NC}"
if [ -d "opcode-mobile" ]; then
    echo "  Directory 'opcode-mobile' already exists. Skipping clone."
else
    git clone https://github.com/winfunc/opcode.git opcode-mobile
fi

cd opcode-mobile

# Install Tauri CLI with mobile support
echo -e "\n${BLUE}Installing Tauri CLI...${NC}"
cargo install tauri-cli --version "^2.0.0"

# Install frontend dependencies
echo -e "\n${BLUE}Installing frontend dependencies...${NC}"
if command -v bun &> /dev/null; then
    bun install
else
    npm install
fi

# Create mobile branch
echo -e "\n${BLUE}Creating mobile feature branch...${NC}"
git checkout -b feature/mobile-support 2>/dev/null || git checkout feature/mobile-support

# Initialize mobile targets
echo -e "\n${BLUE}Initializing mobile targets...${NC}"

echo -e "\n${YELLOW}Android Setup:${NC}"
echo "  Requires: Android Studio with SDK & NDK"
echo "  Run: cargo tauri android init"

echo -e "\n${YELLOW}iOS Setup:${NC}"
echo "  Requires: macOS with Xcode"
echo "  Run: cargo tauri ios init"

# Create mobile-specific directories
echo -e "\n${BLUE}Creating mobile directory structure...${NC}"
mkdir -p src/components/mobile
mkdir -p src/hooks/mobile
mkdir -p src/lib/mobile
mkdir -p src/layouts
mkdir -p src-tauri/src/commands/mobile

# Create platform detection hook
cat > src/hooks/usePlatform.ts << 'EOF'
import { useState, useEffect } from 'react';

export type Platform = 'desktop' | 'mobile' | 'tablet';

export function usePlatform(): Platform {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('desktop');
  
  useEffect(() => {
    async function detectPlatform() {
      // Check if running in Tauri
      if (window.__TAURI__) {
        try {
          const { platform } = await import('@tauri-apps/plugin-os');
          const os = await platform();
          if (os === 'ios' || os === 'android') {
            const isTablet = window.innerWidth >= 768;
            setCurrentPlatform(isTablet ? 'tablet' : 'mobile');
            return;
          }
        } catch (e) {
          // OS plugin not available
        }
      }
      
      // Fallback: detect via user agent and screen size
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        const isTablet = window.innerWidth >= 768;
        setCurrentPlatform(isTablet ? 'tablet' : 'mobile');
      } else {
        setCurrentPlatform('desktop');
      }
    }
    
    detectPlatform();
    
    // Re-check on resize (for responsive testing)
    const handleResize = () => detectPlatform();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return currentPlatform;
}

export function useIsMobile(): boolean {
  const platform = usePlatform();
  return platform === 'mobile' || platform === 'tablet';
}
EOF

# Create responsive wrapper component
cat > src/components/mobile/ResponsiveWrapper.tsx << 'EOF'
import React from 'react';
import { usePlatform, Platform } from '@/hooks/usePlatform';

interface ResponsiveWrapperProps {
  mobile: React.ReactNode;
  tablet?: React.ReactNode;
  desktop: React.ReactNode;
}

export function ResponsiveWrapper({ mobile, tablet, desktop }: ResponsiveWrapperProps) {
  const platform = usePlatform();
  
  switch (platform) {
    case 'mobile':
      return <>{mobile}</>;
    case 'tablet':
      return <>{tablet || mobile}</>;
    case 'desktop':
    default:
      return <>{desktop}</>;
  }
}
EOF

echo -e "  ✅ Created src/hooks/usePlatform.ts"
echo -e "  ✅ Created src/components/mobile/ResponsiveWrapper.tsx"

# Update package.json with mobile scripts
echo -e "\n${BLUE}Adding mobile scripts to package.json...${NC}"
if command -v bun &> /dev/null; then
    # Use bun to update package.json
    bun --eval "
const pkg = require('./package.json');
pkg.scripts = {
  ...pkg.scripts,
  'mobile:android:dev': 'tauri android dev',
  'mobile:android:build': 'tauri android build',
  'mobile:ios:dev': 'tauri ios dev',
  'mobile:ios:build': 'tauri ios build',
};
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"
    echo "  ✅ Added mobile scripts"
fi

# Summary
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Install Android Studio (for Android development)"
echo "     https://developer.android.com/studio"
echo ""
echo "  2. Initialize Android target:"
echo "     cd opcode-mobile && cargo tauri android init"
echo ""
echo "  3. (macOS only) Initialize iOS target:"
echo "     cargo tauri ios init"
echo ""
echo "  4. Start development:"
echo "     bun run mobile:android:dev  # or"
echo "     bun run mobile:ios:dev"
echo ""
echo "  5. Read the full adaptation plan:"
echo "     cat ../claude-code-mobile-opcode-adaptation.md"
echo ""
echo -e "${BLUE}Happy coding! 🎉${NC}"
