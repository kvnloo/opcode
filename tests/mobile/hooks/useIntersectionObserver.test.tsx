import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
/**
 * Tests for useIntersectionObserver hook and related hooks
 * Tests visibility detection, lazy loading, animations, and infinite scroll
 */

import { renderHook, waitFor, act, render } from '@testing-library/react';
import { useEffect } from 'react';
import {
  useIntersectionObserver,
  useLazyImage,
  useScrollAnimation,
  useInfiniteScroll,
  useMultipleIntersectionObserver,
  useVisibilityPercentage,
} from '@/hooks/mobile/useIntersectionObserver';

// Create spy functions for IntersectionObserver methods
const mockObserveFn = vi.fn();
const mockUnobserveFn = vi.fn();
const mockDisconnectFn = vi.fn();
const mockTakeRecordsFn = vi.fn(() => []);

let mockObserver: MockIntersectionObserver | null = null;

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

    // Store this instance globally for test access
    mockObserver = this;
  }

  observe = (target: Element) => {
    mockObserveFn(target);
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
  };

  unobserve = (target: Element) => {
    mockUnobserveFn(target);
  };

  disconnect = () => {
    mockDisconnectFn();
  };

  takeRecords = () => {
    return mockTakeRecordsFn();
  };

  // Helper to trigger intersection
  triggerIntersection(isIntersecting: boolean, ratio: number = 1) {
    const targets = mockObserveFn.mock.calls.map((call) => call[0]);
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

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    mockObserver = null;
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;
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
      const TestComponent = () => {
        const { ref } = useIntersectionObserver();
        return <div ref={ref as any} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      expect(mockObserveFn).toHaveBeenCalledWith(element);
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
      const TestComponent = () => {
        const { ref } = useIntersectionObserver({ threshold: 0.5 });
        return <div ref={ref as any} />;
      };

      render(<TestComponent />);

      expect(mockObserver?.thresholds).toEqual([0.5]);
    });

    test('should respect root option', () => {
      const root = document.createElement('div');
      const TestComponent = () => {
        const { ref } = useIntersectionObserver({ root });
        return <div ref={ref as any} />;
      };

      render(<TestComponent />);

      expect(mockObserver?.root).toBe(root);
    });

    test('should respect rootMargin option', () => {
      const TestComponent = () => {
        const { ref } = useIntersectionObserver({ rootMargin: '10px' });
        return <div ref={ref as any} />;
      };

      render(<TestComponent />);

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

      expect(mockDisconnectFn).toHaveBeenCalled();

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

      expect(mockDisconnectFn).not.toHaveBeenCalled();

      act(() => {
        mockObserver?.triggerIntersection(true);
      });

      await waitFor(() => {
        expect(result.current.isIntersecting).toBe(true);
      });

      expect(mockDisconnectFn).toHaveBeenCalled();
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

      expect(mockDisconnectFn).toHaveBeenCalled();
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

      expect(mockDisconnectFn).toHaveBeenCalled();
    });
  });
});

describe('useLazyImage', () => {
  beforeEach(() => {
    mockObserver = null;
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;

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
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;
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
    const TestComponent = () => {
      const { ref } = useScrollAnimation('animate-fade-in');
      return <div ref={ref as any} />;
    };

    render(<TestComponent />);

    expect(mockObserver?.thresholds).toEqual([0.3]);
  });

  test('should respect custom threshold', () => {
    const TestComponent = () => {
      const { ref } = useScrollAnimation('animate-fade-in', { threshold: 0.5 });
      return <div ref={ref as any} />;
    };

    render(<TestComponent />);

    expect(mockObserver?.thresholds).toEqual([0.5]);
  });
});

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    mockObserver = null;
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;
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
    const TestComponent = () => {
      const { ref } = useInfiniteScroll(onLoadMore);
      return <div ref={ref as any} />;
    };

    render(<TestComponent />);

    expect(mockObserver?.rootMargin).toBe('100px');
  });
});

describe('useMultipleIntersectionObserver', () => {
  beforeEach(() => {
    mockObserver = null;
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;
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

    expect(mockObserveFn).toHaveBeenCalledTimes(3);
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
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;
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
    const TestComponent = () => {
      const { ref } = useVisibilityPercentage();
      return <div ref={ref as any} />;
    };

    render(<TestComponent />);

    expect(mockObserver?.thresholds.length).toBe(101);
    expect(mockObserver?.thresholds[0]).toBe(0);
    expect(mockObserver?.thresholds[50]).toBe(0.5);
    expect(mockObserver?.thresholds[100]).toBe(1);
  });
});
