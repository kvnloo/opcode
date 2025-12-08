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

let intersectionCallback: IntersectionObserverCallback | null = null;
let mockObserver: MockIntersectionObserver | null = null;
let observedElements = new Map<Element, MockIntersectionObserver>();

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    intersectionCallback = callback;
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0];

    // Store this instance for test access
    mockObserver = this;
  }

  observe = (target: Element) => {
    mockObserveFn(target);
    observedElements.set(target, this);
  };

  unobserve = (target: Element) => {
    mockUnobserveFn(target);
    observedElements.delete(target);
  };

  disconnect = () => {
    mockDisconnectFn();
    observedElements.clear();
  };

  takeRecords = () => {
    return mockTakeRecordsFn();
  };
}

// Helper to trigger intersection for all observed elements
function triggerIntersection(isIntersecting: boolean, ratio: number = isIntersecting ? 1 : 0) {
  observedElements.forEach((observer, target) => {
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting,
      intersectionRatio: ratio,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    };
    if (intersectionCallback) {
      intersectionCallback([entry], observer);
    }
  });
}

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    intersectionCallback = null;
    mockObserver = null;
    observedElements.clear();
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
      const TestComponent = () => {
        const { ref, isIntersecting } = useIntersectionObserver();
        return <div ref={ref as any} data-intersecting={isIntersecting.toString()} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      // Wait for observer to be created
      await waitFor(() => {
        expect(mockObserveFn).toHaveBeenCalledWith(element);
      });

      act(() => {
        triggerIntersection(true);
      });

      await waitFor(() => {
        expect(element.getAttribute('data-intersecting')).toBe('true');
      });
    });

    test('should update isIntersecting when element becomes hidden', async () => {
      const TestComponent = () => {
        const { ref, isIntersecting } = useIntersectionObserver();
        return <div ref={ref as any} data-intersecting={isIntersecting.toString()} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      // Wait for observer to be created
      await waitFor(() => {
        expect(mockObserveFn).toHaveBeenCalledWith(element);
      });

      // First make it visible
      act(() => {
        triggerIntersection(true);
      });

      await waitFor(() => {
        expect(element.getAttribute('data-intersecting')).toBe('true');
      });

      // Then hide it
      act(() => {
        triggerIntersection(false);
      });

      await waitFor(() => {
        expect(element.getAttribute('data-intersecting')).toBe('false');
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

      const TestComponent = () => {
        const { ref } = useIntersectionObserver({ onChange });
        return <div ref={ref as any} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      await waitFor(() => {
        expect(mockObserveFn).toHaveBeenCalledWith(element);
      });

      act(() => {
        triggerIntersection(true);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('freezeOnceVisible', () => {
    test('should stop observing after first intersection', async () => {
      const TestComponent = () => {
        const { ref, isIntersecting } = useIntersectionObserver({ freezeOnceVisible: true });
        return <div ref={ref as any} data-intersecting={isIntersecting.toString()} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      await waitFor(() => {
        expect(mockObserveFn).toHaveBeenCalledWith(element);
      });

      act(() => {
        triggerIntersection(true);
      });

      await waitFor(() => {
        expect(element.getAttribute('data-intersecting')).toBe('true');
      });

      expect(mockDisconnectFn).toHaveBeenCalled();

      // Clear mock to verify no more disconnects
      mockDisconnectFn.mockClear();

      // Further changes should not update state
      act(() => {
        triggerIntersection(false);
      });

      // Should still be true (frozen)
      expect(element.getAttribute('data-intersecting')).toBe('true');
    });

    test('should not freeze if not intersecting', async () => {
      const TestComponent = () => {
        const { ref, isIntersecting } = useIntersectionObserver({ freezeOnceVisible: true });
        return <div ref={ref as any} data-intersecting={isIntersecting.toString()} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      await waitFor(() => {
        expect(mockObserveFn).toHaveBeenCalledWith(element);
      });

      act(() => {
        triggerIntersection(false);
      });

      expect(mockDisconnectFn).not.toHaveBeenCalled();

      act(() => {
        triggerIntersection(true);
      });

      await waitFor(() => {
        expect(element.getAttribute('data-intersecting')).toBe('true');
      });

      expect(mockDisconnectFn).toHaveBeenCalled();
    });
  });

  describe('triggerOnce', () => {
    test('should disconnect after first intersection', async () => {
      const TestComponent = () => {
        const { ref, isIntersecting } = useIntersectionObserver({ triggerOnce: true });
        return <div ref={ref as any} data-intersecting={isIntersecting.toString()} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      await waitFor(() => {
        expect(mockObserveFn).toHaveBeenCalledWith(element);
      });

      act(() => {
        triggerIntersection(true);
      });

      await waitFor(() => {
        expect(element.getAttribute('data-intersecting')).toBe('true');
      });

      expect(mockDisconnectFn).toHaveBeenCalled();
    });
  });

  describe('Unsupported Environment', () => {
    test('should handle missing IntersectionObserver', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
      const originalObserver = (global as any).IntersectionObserver;
      (global as any).IntersectionObserver = undefined;

      const TestComponent = () => {
        const { ref, isIntersecting } = useIntersectionObserver();
        return <div ref={ref as any} data-intersecting={isIntersecting.toString()} />;
      };

      const { container } = render(<TestComponent />);
      const element = container.firstChild as Element;

      expect(consoleWarnSpy).toHaveBeenCalledWith('IntersectionObserver not supported');
      expect(element.getAttribute('data-intersecting')).toBe('true'); // Fallback

      consoleWarnSpy.mockRestore();
      (global as any).IntersectionObserver = originalObserver;
    });
  });

  describe('Cleanup', () => {
    test('should disconnect observer on unmount', async () => {
      const TestComponent = () => {
        const { ref } = useIntersectionObserver();
        return <div ref={ref as any} />;
      };

      const { container, unmount } = render(<TestComponent />);
      const element = container.firstChild as Element;

      await waitFor(() => {
        expect(mockObserveFn).toHaveBeenCalledWith(element);
      });

      unmount();

      expect(mockDisconnectFn).toHaveBeenCalled();
    });
  });
});

describe('useLazyImage', () => {
  beforeEach(() => {
    intersectionCallback = null;
    mockObserver = null;
    observedElements.clear();
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;

    // Mock Image - default successful load
    (global as any).Image = class {
      src = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        // Simulate successful load by default
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
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
    (global as any).Image = class {
      src = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    };

    const TestComponent = () => {
      const { ref, src, isLoaded } = useLazyImage('image.jpg', 'placeholder.jpg');
      return <div ref={ref as any} data-src={src} data-loaded={isLoaded.toString()} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    act(() => {
      triggerIntersection(true);
    });

    await waitFor(() => {
      expect(element.getAttribute('data-src')).toBe('image.jpg');
      expect(element.getAttribute('data-loaded')).toBe('true');
    });
  });

  test('should handle image load error', async () => {
    (global as any).Image = class {
      src = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror();
          }
        }, 0);
      }
    };

    const TestComponent = () => {
      const { ref, hasError, isLoaded } = useLazyImage('image.jpg', 'placeholder.jpg');
      return <div ref={ref as any} data-error={hasError.toString()} data-loaded={isLoaded.toString()} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    act(() => {
      triggerIntersection(true);
    });

    await waitFor(() => {
      expect(element.getAttribute('data-error')).toBe('true');
      expect(element.getAttribute('data-loaded')).toBe('false');
    });
  });
});

describe('useScrollAnimation', () => {
  beforeEach(() => {
    intersectionCallback = null;
    mockObserver = null;
    observedElements.clear();
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
    const TestComponent = () => {
      const { ref, className } = useScrollAnimation('animate-fade-in');
      return <div ref={ref as any} className={className} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    act(() => {
      triggerIntersection(true);
    });

    await waitFor(() => {
      expect(element.className).toBe('animate-fade-in');
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
    intersectionCallback = null;
    mockObserver = null;
    observedElements.clear();
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;
  });

  test('should call onLoadMore when intersecting', async () => {
    const onLoadMore = vi.fn();

    const TestComponent = () => {
      const { ref } = useInfiniteScroll(onLoadMore);
      return <div ref={ref as any} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    act(() => {
      triggerIntersection(true);
    });

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  test('should not call onLoadMore when disabled', async () => {
    const onLoadMore = vi.fn();

    const TestComponent = () => {
      const { ref } = useInfiniteScroll(onLoadMore, { enabled: false });
      return <div ref={ref as any} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    act(() => {
      triggerIntersection(true);
    });

    // Wait a bit to ensure callback is not called
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  test('should not call onLoadMore when hasMore is false', async () => {
    const onLoadMore = vi.fn();

    const TestComponent = () => {
      const { ref } = useInfiniteScroll(onLoadMore, { hasMore: false });
      return <div ref={ref as any} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    act(() => {
      triggerIntersection(true);
    });

    // Wait a bit to ensure callback is not called
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  test('should prevent concurrent loading', async () => {
    const onLoadMore = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const TestComponent = () => {
      const { ref } = useInfiniteScroll(onLoadMore);
      return <div ref={ref as any} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    // Trigger multiple times rapidly
    act(() => {
      triggerIntersection(true);
      triggerIntersection(true);
      triggerIntersection(true);
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
    intersectionCallback = null;
    mockObserver = null;
    observedElements.clear();
    mockObserveFn.mockClear();
    mockUnobserveFn.mockClear();
    mockDisconnectFn.mockClear();
    mockTakeRecordsFn.mockClear();

    (global as any).IntersectionObserver = MockIntersectionObserver;
  });

  test('should track multiple elements', async () => {
    const TestComponent = () => {
      const { setRef } = useMultipleIntersectionObserver(3);
      return (
        <>
          <div ref={setRef(0)} data-index="0" />
          <div ref={setRef(1)} data-index="1" />
          <div ref={setRef(2)} data-index="2" />
        </>
      );
    };

    render(<TestComponent />);

    // Wait for observers to be created
    await waitFor(() => {
      expect(mockObserveFn.mock.calls.length).toBeGreaterThanOrEqual(3);
    }, { timeout: 2000 });
  });

  test('should update intersection state for multiple elements', async () => {
    const TestComponent = () => {
      const { setRef, intersections } = useMultipleIntersectionObserver(2);
      return (
        <>
          <div ref={setRef(0)} data-index="0" data-intersecting={intersections.get(0)?.toString() || 'undefined'} />
          <div ref={setRef(1)} data-index="1" data-intersecting={intersections.get(1)?.toString() || 'undefined'} />
        </>
      );
    };

    const { container } = render(<TestComponent />);
    const elements = Array.from(container.children);

    await waitFor(() => {
      expect(mockObserveFn.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    act(() => {
      triggerIntersection(true);
    });

    await waitFor(() => {
      expect(elements[0].getAttribute('data-intersecting')).toBe('true');
      expect(elements[1].getAttribute('data-intersecting')).toBe('true');
    });
  });
});

describe('useVisibilityPercentage', () => {
  beforeEach(() => {
    intersectionCallback = null;
    mockObserver = null;
    observedElements.clear();
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
    const TestComponent = () => {
      const { ref, percentage } = useVisibilityPercentage();
      return <div ref={ref as any} data-percentage={percentage} />;
    };

    const { container } = render(<TestComponent />);
    const element = container.firstChild as Element;

    await waitFor(() => {
      expect(mockObserveFn).toHaveBeenCalledWith(element);
    });

    act(() => {
      triggerIntersection(true, 0.75);
    });

    await waitFor(() => {
      expect(element.getAttribute('data-percentage')).toBe('75');
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
