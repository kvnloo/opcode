import { expect, afterEach, vi } from 'vitest';
import { cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Tauri APIs
export const mockTauriInvoke = vi.fn();
export const mockTauriPlatform = vi.fn();

// Create event listener system for proper event handling
const eventListeners = new Map<string, Set<EventListener>>();

const createWindowMock = () => ({
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: (event: string, listener: EventListener) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)!.add(listener);
  },
  removeEventListener: (event: string, listener: EventListener) => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  },
  dispatchEvent: (event: Event) => {
    const listeners = eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        if (typeof listener === 'function') {
          listener(event);
        } else {
          listener.handleEvent(event);
        }
      });
    }
    return true;
  },
  matchMedia: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    share: undefined,
  },
  __TAURI__: {
    invoke: mockTauriInvoke,
  },
});

// Setup global window mock
if (typeof global.window === 'undefined') {
  (global as any).window = createWindowMock();
} else {
  Object.assign(global.window, createWindowMock());
}

// Clear event listeners after each test
afterEach(() => {
  eventListeners.clear();
});

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockTauriInvoke,
}));

// Mock @tauri-apps/plugin-os
vi.mock('@tauri-apps/plugin-os', () => ({
  platform: mockTauriPlatform,
}));

// Mock @tauri-apps/api/shell
export const mockTauriOpen = vi.fn();
vi.mock('@tauri-apps/api/shell', () => ({
  open: mockTauriOpen,
}));

// Complete Framer Motion mock with all motion elements and hooks
vi.mock('framer-motion', () => {
  // Helper to create motion component mock
  const createMotionComponent = (type: string) => {
    const Component = React.forwardRef<any, any>((props, ref) => {
      const { children, animate, initial, exit, variants, transition, whileHover, whileTap, ...restProps } = props;
      return React.createElement(type, { ...restProps, ref }, children);
    });
    Component.displayName = `motion.${type}`;
    return Component;
  };

  return {
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      p: createMotionComponent('p'),
      a: createMotionComponent('a'),
      button: createMotionComponent('button'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      h4: createMotionComponent('h4'),
      h5: createMotionComponent('h5'),
      h6: createMotionComponent('h6'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      section: createMotionComponent('section'),
      article: createMotionComponent('article'),
      nav: createMotionComponent('nav'),
      header: createMotionComponent('header'),
      footer: createMotionComponent('footer'),
      main: createMotionComponent('main'),
      aside: createMotionComponent('aside'),
      form: createMotionComponent('form'),
      input: createMotionComponent('input'),
      textarea: createMotionComponent('textarea'),
      select: createMotionComponent('select'),
      img: createMotionComponent('img'),
      svg: createMotionComponent('svg'),
      path: createMotionComponent('path'),
      circle: createMotionComponent('circle'),
      rect: createMotionComponent('rect'),
    },
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useMotionValue: (initial: any) => ({
      get: () => initial,
      set: vi.fn(),
      onChange: vi.fn(),
    }),
    useTransform: (value: any, input: any, output: any) => ({
      get: () => output[0],
      set: vi.fn(),
      onChange: vi.fn(),
    }),
    useSpring: (value: any) => ({
      get: () => value,
      set: vi.fn(),
      onChange: vi.fn(),
    }),
    useScroll: () => ({
      scrollX: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
      scrollY: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
      scrollXProgress: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
      scrollYProgress: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    }),
    useInView: () => true,
    useDragControls: () => ({
      start: vi.fn(),
    }),
  };
});

// Fix JSDOM document activeElement issues
Object.defineProperty(document, 'activeElement', {
  configurable: true,
  get() {
    return document.body;
  },
});

// Mock HTMLElement for JSDOM
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLElement.prototype.scrollTo = vi.fn();
}

// Custom matchers
expect.extend({
  toHavePlatformClass(received: HTMLElement, platformType: 'mobile' | 'tablet' | 'desktop') {
    const classes = received.className.split(' ');
    const hasClass = classes.some(cls => cls.includes(platformType));
    return {
      pass: hasClass,
      message: () =>
        hasClass
          ? `Expected element not to have ${platformType} class`
          : `Expected element to have ${platformType} class`,
    };
  },
});

// Reset window dimensions
export function setWindowDimensions(width: number, height: number) {
  // Update window properties
  (global.window as any).innerWidth = width;
  (global.window as any).innerHeight = height;

  // Trigger resize event wrapped in act for React state updates
  act(() => {
    const resizeEvent = new Event('resize');
    global.window.dispatchEvent(resizeEvent);
  });
}

// Mock user agent
export function setUserAgent(userAgent: string) {
  if (!global.window.navigator) {
    (global.window as any).navigator = {};
  }
  (global.window.navigator as any).userAgent = userAgent;
}

// Common test utilities
export const MOBILE_WIDTH = 375;
export const TABLET_WIDTH = 768;
export const DESKTOP_WIDTH = 1024;

export const USER_AGENTS = {
  MOBILE_IOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  MOBILE_ANDROID: 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36',
  TABLET_IPAD: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  DESKTOP_CHROME: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

// Mock IntersectionObserver for JSDOM
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  private callback: IntersectionObserverCallback;
  private elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    if (options) {
      this.root = options.root ?? null;
      this.rootMargin = options.rootMargin ?? '0px';
      this.thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold ?? 0];
    }
  }

  observe(target: Element): void {
    this.elements.add(target);
    // Immediately trigger callback with intersecting: true for testing
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    };
    this.callback([entry], this);
  }

  unobserve(target: Element): void {
    this.elements.delete(target);
  }

  disconnect(): void {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // Helper method for tests to simulate intersection changes
  simulateIntersection(target: Element, isIntersecting: boolean, intersectionRatio: number = isIntersecting ? 1 : 0): void {
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting,
      intersectionRatio,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    };
    this.callback([entry], this);
  }
}

// Install the mock globally
global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver for JSDOM
class MockResizeObserver implements ResizeObserver {
  private callback: ResizeObserverCallback;
  private elements: Set<Element> = new Set();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.elements.add(target);
  }

  unobserve(target: Element): void {
    this.elements.delete(target);
  }

  disconnect(): void {
    this.elements.clear();
  }
}

global.ResizeObserver = MockResizeObserver as any;
