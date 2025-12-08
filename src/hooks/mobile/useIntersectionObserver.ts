/**
 * Intersection Observer Hook
 *
 * Provides lazy loading triggers, visibility tracking, and animation triggers
 * using the Intersection Observer API.
 */

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
  triggerOnce?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: RefObject<Element>;
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
}

/**
 * Hook for observing element visibility and intersection
 *
 * @example
 * ```tsx
 * // Basic lazy loading
 * const { ref, isIntersecting } = useIntersectionObserver();
 * <img ref={ref} src={isIntersecting ? imageSrc : placeholder} />
 *
 * // Animation trigger
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });
 * <div ref={ref} className={isIntersecting ? 'animate-fade-in' : 'opacity-0'} />
 *
 * // Infinite scroll
 * const { ref } = useIntersectionObserver({
 *   onChange: (entry) => {
 *     if (entry.isIntersecting) loadMore();
 *   }
 * });
 * ```
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
  onChange,
  triggerOnce = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const ref = useRef<Element>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const frozen = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip if frozen
    if (frozen.current) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      setIsIntersecting(true); // Fallback to always visible
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;

        setEntry(entry);
        setIsIntersecting(isElementIntersecting);

        // Call onChange callback
        if (onChange) {
          onChange(entry);
        }

        // Freeze observation if element is visible and freezeOnceVisible is true
        if (isElementIntersecting && freezeOnceVisible) {
          frozen.current = true;
          observer.disconnect();
        }

        // Disconnect if triggerOnce and element is intersecting
        if (isElementIntersecting && triggerOnce) {
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, onChange, triggerOnce]);

  return { ref, isIntersecting, entry };
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(
  src: string,
  placeholder?: string,
  options?: UseIntersectionObserverOptions
) {
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    triggerOnce: true,
  });

  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isIntersecting) return;

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isIntersecting, src]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    hasError,
    isIntersecting,
  };
}

/**
 * Hook for triggering animations on scroll
 */
export function useScrollAnimation(
  animationClass: string,
  options?: UseIntersectionObserverOptions
) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
    ...options,
    triggerOnce: true,
  });

  const [className, setClassName] = useState('');

  useEffect(() => {
    if (isIntersecting) {
      setClassName(animationClass);
    }
  }, [isIntersecting, animationClass]);

  return { ref, className, isIntersecting };
}

/**
 * Hook for infinite scroll
 */
export function useInfiniteScroll(
  onLoadMore: () => void | Promise<void>,
  options?: UseIntersectionObserverOptions & {
    enabled?: boolean;
    hasMore?: boolean;
  }
) {
  const { enabled = true, hasMore = true, ...intersectionOptions } = options || {};
  const isLoadingRef = useRef(false);

  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: '100px',
    ...intersectionOptions,
  });

  useEffect(() => {
    if (!isIntersecting || !enabled || !hasMore || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;

    const result = onLoadMore();

    if (result instanceof Promise) {
      result.finally(() => {
        isLoadingRef.current = false;
      });
    } else {
      isLoadingRef.current = false;
    }
  }, [isIntersecting, enabled, hasMore, onLoadMore]);

  return { ref, isIntersecting };
}

/**
 * Hook for tracking multiple elements
 */
export function useMultipleIntersectionObserver(
  elementsCount: number,
  options?: UseIntersectionObserverOptions
) {
  const refs = useRef<(Element | null)[]>(
    Array(elementsCount).fill(null)
  );
  const [intersections, setIntersections] = useState<Map<number, boolean>>(
    new Map()
  );

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIntersections((prev) => {
          const next = new Map(prev);
          entries.forEach((entry) => {
            const index = refs.current.indexOf(entry.target);
            if (index !== -1) {
              next.set(index, entry.isIntersecting);
            }
          });
          return next;
        });
      },
      {
        threshold: options?.threshold || 0,
        root: options?.root || null,
        rootMargin: options?.rootMargin || '0px',
      }
    );

    refs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [elementsCount, options]);

  const setRef = (index: number) => (element: Element | null) => {
    refs.current[index] = element;
  };

  return { setRef, intersections };
}

/**
 * Hook for visibility percentage tracking
 */
export function useVisibilityPercentage(
  options?: Omit<UseIntersectionObserverOptions, 'threshold'>
) {
  const [percentage, setPercentage] = useState(0);

  const { ref, entry } = useIntersectionObserver({
    ...options,
    threshold: Array.from({ length: 101 }, (_, i) => i / 100),
  });

  useEffect(() => {
    if (entry) {
      setPercentage(Math.round(entry.intersectionRatio * 100));
    }
  }, [entry]);

  return { ref, percentage, entry };
}
