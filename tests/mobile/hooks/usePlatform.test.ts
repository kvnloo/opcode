import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlatform, useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/mobile/usePlatform';
import {
  mockTauriPlatform,
  setWindowDimensions,
  setUserAgent,
  MOBILE_WIDTH,
  TABLET_WIDTH,
  DESKTOP_WIDTH,
  USER_AGENTS,
} from '../setup';

describe('usePlatform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to desktop by default
    setWindowDimensions(DESKTOP_WIDTH, 768);
    setUserAgent(USER_AGENTS.DESKTOP_CHROME);
  });

  describe('Desktop detection', () => {
    it('should detect desktop platform by default', async () => {
      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('desktop');
      });
    });

    it('should detect desktop with desktop user agent', async () => {
      setUserAgent(USER_AGENTS.DESKTOP_CHROME);
      setWindowDimensions(DESKTOP_WIDTH, 768);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('desktop');
      });
    });
  });

  describe('Mobile detection', () => {
    it('should detect mobile platform with iOS user agent', async () => {
      setUserAgent(USER_AGENTS.MOBILE_IOS);
      setWindowDimensions(MOBILE_WIDTH, 667);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });

    it('should detect mobile platform with Android user agent', async () => {
      setUserAgent(USER_AGENTS.MOBILE_ANDROID);
      setWindowDimensions(MOBILE_WIDTH, 667);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });
  });

  describe('Tablet detection', () => {
    it('should detect tablet platform with iPad user agent and tablet width', async () => {
      setUserAgent(USER_AGENTS.TABLET_IPAD);
      setWindowDimensions(TABLET_WIDTH, 1024);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });
    });

    it('should detect tablet when mobile user agent with large screen', async () => {
      setUserAgent(USER_AGENTS.MOBILE_IOS);
      setWindowDimensions(TABLET_WIDTH, 1024);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });
    });
  });

  describe('Resize handling', () => {
    it('should update platform on window resize from desktop to mobile', async () => {
      setUserAgent(USER_AGENTS.MOBILE_IOS);
      setWindowDimensions(DESKTOP_WIDTH, 768);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });

      // Resize to mobile
      setWindowDimensions(MOBILE_WIDTH, 667);

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });

    it('should update platform on window resize from mobile to tablet', async () => {
      setUserAgent(USER_AGENTS.MOBILE_ANDROID);
      setWindowDimensions(MOBILE_WIDTH, 667);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });

      // Resize to tablet
      setWindowDimensions(TABLET_WIDTH, 1024);

      await waitFor(() => {
        expect(result.current).toBe('tablet');
      });
    });
  });

  describe('Tauri integration', () => {
    it('should use Tauri platform API when available on iOS', async () => {
      mockTauriPlatform.mockResolvedValue('ios');
      setWindowDimensions(MOBILE_WIDTH, 667);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(mockTauriPlatform).toHaveBeenCalled();
        expect(result.current).toBe('mobile');
      });
    });

    it('should use Tauri platform API when available on Android', async () => {
      mockTauriPlatform.mockResolvedValue('android');
      setWindowDimensions(MOBILE_WIDTH, 667);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(mockTauriPlatform).toHaveBeenCalled();
        expect(result.current).toBe('mobile');
      });
    });

    it('should detect tablet via Tauri with larger screen', async () => {
      mockTauriPlatform.mockResolvedValue('ios');
      setWindowDimensions(TABLET_WIDTH, 1024);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(mockTauriPlatform).toHaveBeenCalled();
        expect(result.current).toBe('tablet');
      });
    });

    it('should fallback to user agent detection when Tauri fails', async () => {
      mockTauriPlatform.mockRejectedValue(new Error('Platform API unavailable'));
      setUserAgent(USER_AGENTS.MOBILE_IOS);
      setWindowDimensions(MOBILE_WIDTH, 667);

      const { result } = renderHook(() => usePlatform());

      await waitFor(() => {
        expect(result.current).toBe('mobile');
      });
    });
  });
});

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWindowDimensions(DESKTOP_WIDTH, 768);
    setUserAgent(USER_AGENTS.DESKTOP_CHROME);
  });

  it('should return true for mobile platform', async () => {
    setUserAgent(USER_AGENTS.MOBILE_IOS);
    setWindowDimensions(MOBILE_WIDTH, 667);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return true for tablet platform', async () => {
    setUserAgent(USER_AGENTS.TABLET_IPAD);
    setWindowDimensions(TABLET_WIDTH, 1024);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false for desktop platform', async () => {
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

describe('useIsTablet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWindowDimensions(DESKTOP_WIDTH, 768);
    setUserAgent(USER_AGENTS.DESKTOP_CHROME);
  });

  it('should return true for tablet platform', async () => {
    setUserAgent(USER_AGENTS.TABLET_IPAD);
    setWindowDimensions(TABLET_WIDTH, 1024);

    const { result } = renderHook(() => useIsTablet());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false for mobile platform', async () => {
    setUserAgent(USER_AGENTS.MOBILE_IOS);
    setWindowDimensions(MOBILE_WIDTH, 667);

    const { result } = renderHook(() => useIsTablet());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return false for desktop platform', async () => {
    const { result } = renderHook(() => useIsTablet());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

describe('useIsDesktop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWindowDimensions(DESKTOP_WIDTH, 768);
    setUserAgent(USER_AGENTS.DESKTOP_CHROME);
  });

  it('should return true for desktop platform', async () => {
    const { result } = renderHook(() => useIsDesktop());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false for mobile platform', async () => {
    setUserAgent(USER_AGENTS.MOBILE_IOS);
    setWindowDimensions(MOBILE_WIDTH, 667);

    const { result } = renderHook(() => useIsDesktop());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return false for tablet platform', async () => {
    setUserAgent(USER_AGENTS.TABLET_IPAD);
    setWindowDimensions(TABLET_WIDTH, 1024);

    const { result } = renderHook(() => useIsDesktop());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
