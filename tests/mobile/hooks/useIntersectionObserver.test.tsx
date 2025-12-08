import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
/**
 * Tests for useIntersectionObserver hook and related hooks
 * Tests visibility detection, lazy loading, animations, and infinite scroll
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useIntersectionObserver,
  useLazyImage,
  useScrollAnimation,
  useInfiniteScroll,
  useMultipleIntersectionObserver,
  useVisibilityPercentage,
} from '@/hooks/mobile/useIntersectionObserver';

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit
  ) {
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0];
  }

  observe = vi.fn((target: Element) => {
    // Immediately call callback with mock entry
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting: false,
      intersectionRatio: 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    };
    this.callback([entry], this);
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  // Helper to trigger intersection
  triggerIntersection(isIntersecting: boolean, ratio: number = 1) {
    const targets = this.observe.mock.calls.map((call) => call[0]);
    targets.forEach((target) => {
      const entry: IntersectionObserverEntry = {
        target,
        isIntersecting,
        intersectionRatio: ratio,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };
      this.callback([entry], this);
    });
  }
}

let mockObserver: MockIntersectionObserver | null = null;

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    mockObserver = null;
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      mockObserver = new MockIntersectionObserver(callback, options);
      return mockObserver;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('should initialize with not intersecting', () => {
      const { result } = renderHook(() => useIntersectionObserver());

      expect(result.current.isIntersecting).toBe(false);
      expect(result.current.ref.current).toBe(null);
    });

    test('should observe element when ref is set', () => {
      const { result } = renderHook(() => useIntersectionObserver());

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      expect(mockObserver?.observe).toHaveBeenCalledWith(element);
    });

    test('should update isIntersecting when element becomes visible', async () => {
      const { result } = renderHook(() => useIntersectionObserver());

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      act(() => {
        mockObserver?.triggerIntersection(true);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(true);
      });
    });

    test('should update isIntersecting when element becomes hidden', async () => {
      const { result } = renderHook(() => useIntersectionObserver());

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      act(() => {
        mockObserver?.triggerIntersection(true);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(true);
      });

      act(() => {
        mockObserver?.triggerIntersection(false);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(false);
      });
    });
  });

  describe('Options', () => {
    test('should respect threshold option', () => {
      renderHook(() => useIntersectionObserver({ threshold: 0.5 }));

      expect(mockObserver?.thresholds).toEqual([0.5]);
    });

    test('should respect root option', () => {
      const root = document.createElement('div');
      renderHook(() => useIntersectionObserver({ root }));

      expect(mockObserver?.root).toBe(root);
    });

    test('should respect rootMargin option', () => {
      renderHook(() => useIntersectionObserver({ rootMargin: '10px' }));

      expect(mockObserver?.rootMargin).toBe('10px');
    });

    test('should call onChange callback', async () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useIntersectionObserver({ onChange })
      );

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      act(() => {
        mockObserver?.triggerIntersection(true);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('freezeOnceVisible', () => {
    test('should stop observing after first intersection', async () => {
      const { result } = renderHook(() =>
        useIntersectionObserver({ freezeOnceVisible: true })
      );

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      act(() => {
        mockObserver?.triggerIntersection(true);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(true);
      });

      expect(mockObserver?.disconnect).toHaveBeenCalled();

      // Further changes should not update state
      act(() => {
        mockObserver?.triggerIntersection(false);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(true); // Still true
      });
    });

    test('should not freeze if not intersecting', async () => {
      const { result } = renderHook(() =>
        useIntersectionObserver({ freezeOnceVisible: true })
      );

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      act(() => {
        mockObserver?.triggerIntersection(false);
      });

      expect(mockObserver?.disconnect).not.toHaveBeenCalled();

      act(() => {
        mockObserver?.triggerIntersection(true);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(true);
      });

      expect(mockObserver?.disconnect).toHaveBeenCalled();
    });
  });

  describe('triggerOnce', () => {
    test('should disconnect after first intersection', async () => {
      const { result } = renderHook(() =>
        useIntersectionObserver({ triggerOnce: true })
      );

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      act(() => {
        mockObserver?.triggerIntersection(true);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(true);
      });

      expect(mockObserver?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Unsupported Environment', () => {
    test('should handle missing IntersectionObserver', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
      (global as any).IntersectionObserver = undefined;

      const { result } = renderHook(() => useIntersectionObserver());

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('IntersectionObserver not supported');
      expect(result.current.isIntersecting).toBe(true); // Fallback

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    test('should disconnect observer on unmount', () => {
      const { result, unmount } = renderHook(() => useIntersectionObserver());

      const element = document.createElement('div');
      act(() => {
        (result.current.ref as any).current = element;
      });

      unmount();

      expect(mockObserver?.disconnect).toHaveBeenCalled();
    });
  });
});

describe('useLazyImage', () => {
  beforeEach(() => {
    mockObserver = null;
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      mockObserver = new MockIntersectionObserver(callback, options);
      return mockObserver;
    });

    // Mock Image
    (global as any).Image = class {
      src = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set _src(value: string) {
        this.src = value;
        // Simulate successful load
        setTimeout(() => this.onload?.(), 0);
      }
    };
  });

  test('should return placeholder initially', () => {
    const { result } = renderHook(() =>
      useLazyImage('image.jpg', 'placeholder.jpg')
    );

    expect(result.current.src).toBe('placeholder.jpg');
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  test('should load image when intersecting', async () => {
    const { result } = renderHook(() =>
      useLazyImage('image.jpg', 'placeholder.jpg')
    );

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    act(() => {
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(result.current.src).toBe('image.jpg');
      expect(result.current.isLoaded).toBe(true);
    });
  });

  test('should handle image load error', async () => {
    (global as any).Image = class {
      src = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set _src(value: string) {
        this.src = value;
        setTimeout(() => this.onerror?.(), 0);
      }
    };

    const { result } = renderHook(() =>
      useLazyImage('image.jpg', 'placeholder.jpg')
    );

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    act(() => {
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(result.current.hasError).toBe(true);
      expect(result.current.isLoaded).toBe(false);
    });
  });
});

describe('useScrollAnimation', () => {
  beforeEach(() => {
    mockObserver = null;
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      mockObserver = new MockIntersectionObserver(callback, options);
      return mockObserver;
    });
  });

  test('should return empty className initially', () => {
    const { result } = renderHook(() =>
      useScrollAnimation('animate-fade-in')
    );

    expect(result.current.className).toBe('');
  });

  test('should apply animation class when intersecting', async () => {
    const { result } = renderHook(() =>
      useScrollAnimation('animate-fade-in')
    );

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    act(() => {
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(result.current.className).toBe('animate-fade-in');
    });
  });

  test('should use default threshold of 0.3', () => {
    renderHook(() => useScrollAnimation('animate-fade-in'));

    expect(mockObserver?.thresholds).toEqual([0.3]);
  });

  test('should respect custom threshold', () => {
    renderHook(() =>
      useScrollAnimation('animate-fade-in', { threshold: 0.5 })
    );

    expect(mockObserver?.thresholds).toEqual([0.5]);
  });
});

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    mockObserver = null;
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      mockObserver = new MockIntersectionObserver(callback, options);
      return mockObserver;
    });
  });

  test('should call onLoadMore when intersecting', async () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onLoadMore));

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    act(() => {
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  test('should not call onLoadMore when disabled', async () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll(onLoadMore, { enabled: false })
    );

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    act(() => {
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });

  test('should not call onLoadMore when hasMore is false', async () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll(onLoadMore, { hasMore: false })
    );

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    act(() => {
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });

  test('should prevent concurrent loading', async () => {
    const onLoadMore = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const { result } = renderHook(() => useInfiniteScroll(onLoadMore));

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    // Trigger multiple times rapidly
    act(() => {
      mockObserver?.triggerIntersection(true);
      mockObserver?.triggerIntersection(true);
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1); // Only once
    });
  });

  test('should use default rootMargin of 100px', () => {
    const onLoadMore = vi.fn();
    renderHook(() => useInfiniteScroll(onLoadMore));

    expect(mockObserver?.rootMargin).toBe('100px');
  });
});

describe('useMultipleIntersectionObserver', () => {
  beforeEach(() => {
    mockObserver = null;
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      mockObserver = new MockIntersectionObserver(callback, options);
      return mockObserver;
    });
  });

  test('should track multiple elements', () => {
    const { result } = renderHook(() =>
      useMultipleIntersectionObserver(3)
    );

    const elements = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
    ];

    act(() => {
      elements.forEach((el, i) => {
        result.current.setRef(i)(el);
      });
    });

    expect(mockObserver?.observe).toHaveBeenCalledTimes(3);
  });

  test('should update intersection state for multiple elements', async () => {
    const { result } = renderHook(() =>
      useMultipleIntersectionObserver(2)
    );

    const elements = [
      document.createElement('div'),
      document.createElement('div'),
    ];

    act(() => {
      elements.forEach((el, i) => {
        result.current.setRef(i)(el);
      });
    });

    act(() => {
      mockObserver?.triggerIntersection(true);
    });

    await waitFor(() => {
      expect(result.current.intersections.get(0)).toBe(true);
      expect(result.current.intersections.get(1)).toBe(true);
    });
  });
});

describe('useVisibilityPercentage', () => {
  beforeEach(() => {
    mockObserver = null;
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      mockObserver = new MockIntersectionObserver(callback, options);
      return mockObserver;
    });
  });

  test('should initialize with 0% visibility', () => {
    const { result } = renderHook(() => useVisibilityPercentage());

    expect(result.current.percentage).toBe(0);
  });

  test('should update percentage based on intersection ratio', async () => {
    const { result } = renderHook(() => useVisibilityPercentage());

    const element = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = element;
    });

    act(() => {
      mockObserver?.triggerIntersection(true, 0.75);
    });

    await waitFor(() => {
      expect(result.current.percentage).toBe(75);
    });
  });

  test('should use 101 threshold steps', () => {
    renderHook(() => useVisibilityPercentage());

    expect(mockObserver?.thresholds.length).toBe(101);
    expect(mockObserver?.thresholds[0]).toBe(0);
    expect(mockObserver?.thresholds[50]).toBe(0.5);
    expect(mockObserver?.thresholds[100]).toBe(1);
  });
});
