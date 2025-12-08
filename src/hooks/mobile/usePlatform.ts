import { useState, useEffect } from 'react';

export type Platform = 'desktop' | 'mobile' | 'tablet';

export function usePlatform(): Platform {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('desktop');

  useEffect(() => {
    async function detectPlatform() {
      // Check if running in Tauri
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        try {
          const { platform } = await import('@tauri-apps/plugin-os');
          const os = await platform();
          if (os === 'ios' || os === 'android') {
            const isTablet = window.innerWidth >= 768;
            setCurrentPlatform(isTablet ? 'tablet' : 'mobile');
            return;
          }
        } catch (e) {
          // OS plugin not available, continue with fallback
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
