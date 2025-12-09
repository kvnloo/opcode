import { useState, useEffect } from 'react';

export type Platform = 'desktop' | 'mobile' | 'tablet';

export function usePlatform(): Platform {
  // Immediate synchronous detection for mobile platforms
  const getInitialPlatform = (): Platform => {
    if (typeof window === 'undefined') {
      console.log('[usePlatform] Window undefined, defaulting to desktop');
      return 'desktop';
    }

    // PRIMARY: Check user agent first (most reliable in WebView/Tauri context)
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    console.log('[usePlatform] User agent:', ua);
    console.log('[usePlatform] Window dimensions:', width, 'x', window.innerHeight);
    console.log('[usePlatform] Has __TAURI__:', !!(window as any).__TAURI__);
    console.log('[usePlatform] Protocol:', window.location.protocol);

    // Check for mobile/tablet devices via user agent
    const isMobileUA = ua.includes('android') || ua.includes('iphone') || ua.includes('ipod');
    const isTabletUA = ua.includes('ipad');

    // For any mobile/tablet user agent, screen width determines the final platform
    if (isMobileUA || isTabletUA) {
      if (width >= 768) {
        console.log('[usePlatform] ✅ Detected TABLET (mobile/tablet UA at >= 768px width)');
        return 'tablet';
      }
      console.log('[usePlatform] ✅ Detected MOBILE via user agent');
      return 'mobile';
    }

    // SECONDARY: Check if running in Tauri mobile context
    if ((window as any).__TAURI__) {
      // Check for Tauri Android/iOS specific indicators
      const protocol = window.location.protocol;
      if (protocol === 'tauri:' || protocol === 'https:' || protocol === 'http:') {
        // In Tauri mobile, default to mobile if screen width suggests it
        if (width < 768) {
          console.log('[usePlatform] ✅ Detected MOBILE via Tauri + screen width');
          return 'mobile';
        }
      }
    }

    console.log('[usePlatform] ⚠️ Defaulting to DESKTOP');
    return 'desktop';
  };

  const [currentPlatform, setCurrentPlatform] = useState<Platform>(getInitialPlatform);

  useEffect(() => {
    async function detectPlatform() {
      const width = window.innerWidth;

      // Try Tauri OS plugin for more accurate detection (enhancement)
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        try {
          const { platform } = await import('@tauri-apps/plugin-os');
          const os = await platform();
          if (os === 'ios' || os === 'android') {
            const isTablet = width >= 768;
            setCurrentPlatform(isTablet ? 'tablet' : 'mobile');
            return;
          }
        } catch (e) {
          // OS plugin not available, keep initial detection
        }
      }

      // Fallback: re-check user agent and screen size
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = ua.includes('android') || ua.includes('iphone') || ua.includes('ipod');
      const isTabletUA = ua.includes('ipad');

      // For any mobile/tablet user agent, screen width determines the final platform
      if (isMobileUA || isTabletUA) {
        setCurrentPlatform(width >= 768 ? 'tablet' : 'mobile');
      } else {
        setCurrentPlatform('desktop');
      }
    }

    detectPlatform();

    // Re-check on resize
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

export function useIsTablet(): boolean {
  const platform = usePlatform();
  return platform === 'tablet';
}

export function useIsDesktop(): boolean {
  const platform = usePlatform();
  return platform === 'desktop';
}
