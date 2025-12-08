export type PlatformType = 'desktop' | 'mobile' | 'tablet';
export type OSType = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown';

export interface PlatformInfo {
  platform: PlatformType;
  os: OSType;
  isTouchDevice: boolean;
  screenSize: { width: number; height: number };
  pixelRatio: number;
}

export async function detectPlatformInfo(): Promise<PlatformInfo> {
  let os: OSType = 'unknown';
  let platform: PlatformType = 'desktop';

  // Check Tauri first
  if (typeof window !== 'undefined' && (window as any).__TAURI__) {
    try {
      const { platform: tauriPlatform } = await import('@tauri-apps/plugin-os');
      const osName = await tauriPlatform();
      

      os = osName as OSType;

      if (osName === 'ios' || osName === 'android') {
        platform = window.innerWidth >= 768 ? 'tablet' : 'mobile';
      }
    } catch {
      // Fallback
    }
  }

  // Fallback detection
  if (os === 'unknown') {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios';
    else if (/Android/i.test(ua)) os = 'android';
    else if (/Mac/i.test(ua)) os = 'macos';
    else if (/Windows/i.test(ua)) os = 'windows';
    else if (/Linux/i.test(ua)) os = 'linux';

    if (os === 'ios' || os === 'android') {
      platform = window.innerWidth >= 768 ? 'tablet' : 'mobile';
    }
  }

  return {
    platform,
    os,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenSize: { width: window.innerWidth, height: window.innerHeight },
    pixelRatio: window.devicePixelRatio || 1
  };
}

export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isTabletDevice(): boolean {
  return isMobileDevice() && window.innerWidth >= 768;
}
