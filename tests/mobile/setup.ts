import { expect, afterEach, vi } from 'vitest';
import { cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// Suppress React.lazy Promise errors in tests
// These errors occur because React.lazy components are not fully resolved in sync test environments
// The actual application works fine with Suspense boundaries
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific lazy loading related errors that occur in test environment
  const errorMessage = args[0]?.toString() || '';

  if (
    errorMessage.includes('Objects are not valid as a React child (found: [object Promise])') ||
    errorMessage.includes('LazyComponent Error')
  ) {
    // Silently suppress these test-specific errors
    return;
  }

  // Pass through all other errors
  originalConsoleError(...args);
};

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Tauri APIs
export const mockTauriInvoke = vi.fn();
export const mockTauriPlatform = vi.fn();

// Ensure navigator is available globally with clipboard BEFORE window mock
if (typeof global.navigator === 'undefined') {
  (global as any).navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Win32',
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    share: vi.fn(),
    vibrate: vi.fn(),
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    hardwareConcurrency: 4,
    maxTouchPoints: 0,
  };
} else {
  // Ensure clipboard exists on existing navigator
  if (!(global.navigator as any).clipboard) {
    (global.navigator as any).clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    };
  }
}

// Export clipboard mock for direct access in tests
export const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
};

// Mock Touch API for gesture tests
if (typeof global.Touch === 'undefined') {
  class TouchMock {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    radiusX: number;
    radiusY: number;
    rotationAngle: number;
    force: number;

    constructor(init: TouchInit) {
      this.identifier = init.identifier;
      this.target = init.target;
      this.clientX = init.clientX || 0;
      this.clientY = init.clientY || 0;
      this.pageX = init.pageX || init.clientX || 0;
      this.pageY = init.pageY || init.clientY || 0;
      this.screenX = init.screenX || init.clientX || 0;
      this.screenY = init.screenY || init.clientY || 0;
      this.radiusX = init.radiusX || 0;
      this.radiusY = init.radiusY || 0;
      this.rotationAngle = init.rotationAngle || 0;
      this.force = init.force || 1;
    }
  }

  (global as any).Touch = TouchMock;
}

// Mock TouchList
if (typeof global.TouchList === 'undefined') {
  class TouchListMock extends Array<Touch> {
    item(index: number): Touch | null {
      return this[index] || null;
    }
  }

  (global as any).TouchList = TouchListMock;
}

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
    platform: 'Win32',
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

// Setup global window mock - MUST happen before document is fully initialized
if (typeof global.window === 'undefined') {
  (global as any).window = createWindowMock();
} else {
  Object.assign(global.window, createWindowMock());
}

// CRITICAL: Immediately set document.defaultView to our mocked window
// This MUST happen before any elements are created or user-event is initialized
if (typeof document !== 'undefined') {
  // Force document.defaultView to be our global.window
  try {
    Object.defineProperty(document, 'defaultView', {
      get() { return global.window; },
      set() {}, // Prevent changes
      configurable: true,
    });
  } catch (e) {
    // If that fails, try writable property
    Object.defineProperty(document, 'defaultView', {
      value: global.window,
      writable: true,
      configurable: true,
    });
  }
  
  // Also ensure ownerDocument of body points to document with proper defaultView
  if (document.body && document.body.ownerDocument) {
    try {
      Object.defineProperty(document.body.ownerDocument, 'defaultView', {
        get() { return global.window; },
        set() {},
        configurable: true,
      });
    } catch (e) {
      // Ignore
    }
  }
}

// CRITICAL: Ensure global.navigator is the same reference as window.navigator
// This is required for @testing-library/user-event clipboard functionality
if (global.window && global.window.navigator) {
  (global as any).navigator = global.window.navigator;
}

// CRITICAL: Fix document.defaultView for @testing-library/user-event
// user-event's clipboard functions access view.ownerDocument.defaultView.navigator
// We must ensure document itself has a stable defaultView reference
if (typeof document !== 'undefined') {
  if (!document.defaultView) {
    Object.defineProperty(document, 'defaultView', {
      value: global.window,
      writable: true,
      configurable: true,
    });
  }
  // Also ensure the defaultView has navigator with clipboard
  if (document.defaultView) {
    const view = document.defaultView as any;
    if (!view.navigator) {
      view.navigator = global.navigator;
    } else if (!view.navigator.clipboard) {
      view.navigator.clipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(''),
      };
    }
  }
}

// CRITICAL: Ensure document.defaultView exists and is immutable for @testing-library/user-event
// user-event's clipboard functions access view.ownerDocument.defaultView.navigator
if (typeof document !== 'undefined') {
  // First ensure defaultView exists
  if (!document.defaultView) {
    Object.defineProperty(document, 'defaultView', {
      value: global.window,
      writable: false,
      configurable: false,
    });
  }
  
  // Ensure all future elements have proper ownerDocument
  const originalGetElementById = document.getElementById.bind(document);
  document.getElementById = function(id: string) {
    const element = originalGetElementById(id);
    if (element && element.ownerDocument && !element.ownerDocument.defaultView) {
      try {
        Object.defineProperty(element.ownerDocument, 'defaultView', {
          value: global.window,
          configurable: true,
        });
      } catch (e) {
        // Ignore if already defined
      }
    }
    return element;
  };
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

// Mock @tauri-apps/api/event
export const mockTauriListen = vi.fn().mockResolvedValue(() => {});
export const mockTauriEmit = vi.fn().mockResolvedValue(undefined);
vi.mock('@tauri-apps/api/event', () => ({
  listen: mockTauriListen,
  emit: mockTauriEmit,
  once: vi.fn().mockResolvedValue(() => {}),
  TauriEvent: {},
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

// Mock HTMLIFrameElement properties that JSDOM doesn't fully support
if (typeof HTMLIFrameElement !== 'undefined') {
  Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
    get() {
      return {
        location: { reload: vi.fn() },
        postMessage: vi.fn(),
      };
    },
    configurable: true,
  });
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

// Export spy functions for IntersectionObserver methods
export const mockIntersectionObserve = vi.fn();
export const mockIntersectionUnobserve = vi.fn();
export const mockIntersectionDisconnect = vi.fn();

// Reset these in afterEach
afterEach(() => {
  mockIntersectionObserve.mockClear();
  mockIntersectionUnobserve.mockClear();
  mockIntersectionDisconnect.mockClear();
});

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
    mockIntersectionObserve(target);
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
    mockIntersectionUnobserve(target);
    this.elements.delete(target);
  }

  disconnect(): void {
    mockIntersectionDisconnect();
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

// Mock sessionStore with default test data using vi.hoisted() for proper module hoisting
// Note: The AppsScreen transforms path to name using path.split('/').pop()
// So path '/projects/Test Project' will display as 'Test Project'
const mockSessionStoreState = vi.hoisted(() => () => {
  const projects = [
    {
      id: 'test-project-1',
      path: '/projects/Test Project',
      name: 'Test Project',
      sessions: ['session-1', 'session-2'],
      created_at: Date.now() - 86400000,
      most_recent_session: Date.now()
    },
    {
      id: 'test-project-2',
      path: '/projects/Another Project',
      name: 'Another Project',
      sessions: ['session-3'],
      created_at: Date.now() - 172800000,
      most_recent_session: Date.now() - 3600000
    }
  ];

  const sessions = {
    'test-project-1': [
      {
        id: 'session-1',
        project_id: 'test-project-1',
        started_at: Date.now() - 7200000,
        last_active: Date.now() - 3600000,
        status: 'idle'
      },
      {
        id: 'session-2',
        project_id: 'test-project-1',
        started_at: Date.now() - 86400000,
        last_active: Date.now() - 43200000,
        status: 'idle'
      }
    ],
    'test-project-2': [
      {
        id: 'session-3',
        project_id: 'test-project-2',
        started_at: Date.now() - 172800000,
        last_active: Date.now() - 86400000,
        status: 'idle'
      }
    ]
  };

  return {
    projects,
    sessions,
    currentSessionId: null,
    currentSession: null,
    sessionOutputs: {},
    isLoadingProjects: false,
    isLoadingSessions: false,
    isLoadingOutputs: false,
    error: null,
    fetchProjects: vi.fn().mockResolvedValue(undefined),
    fetchProjectSessions: vi.fn().mockResolvedValue(undefined),
    setCurrentSession: vi.fn(),
    fetchSessionOutput: vi.fn().mockResolvedValue(undefined),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    handleSessionUpdate: vi.fn(),
    handleOutputUpdate: vi.fn()
  };
});

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: Object.assign(
    (selector?: any) => {
      const state = mockSessionStoreState();
      return selector ? selector(state) : state;
    },
    {
      getState: () => mockSessionStoreState()
    }
  )
}));

// Mock workspaceStore with default test data
vi.mock('@/stores/workspaceStore', () => {
  const mockStore = {
    currentProject: null,
    activePane: 'agent' as const,
    toolsOverlayOpen: false,
    agentStatus: 'idle' as const,
    tasks: [],
    currentTaskId: null,
    checkpoints: [],
    workDurationSeconds: 0,
    previewUrl: '/',
    deviceFrame: 'iphone' as const,
    isPreviewLoading: false,
    subdomain: '',
    subdomainAvailable: null,
    publishStatus: 'unpublished' as const,
    publishError: null,
    setProject: vi.fn((project) => { mockStore.currentProject = project; }),
    setActivePane: vi.fn((pane) => { mockStore.activePane = pane; }),
    openToolsOverlay: vi.fn(),
    closeToolsOverlay: vi.fn(),
    startAgent: vi.fn(),
    stopAgent: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    addCheckpoint: vi.fn(),
    rollbackToCheckpoint: vi.fn(),
    incrementWorkDuration: vi.fn(),
    clearTasks: vi.fn(),
    setPreviewUrl: vi.fn(),
    setDeviceFrame: vi.fn(),
    setPreviewLoading: vi.fn(),
    refreshPreview: vi.fn(),
    setSubdomain: vi.fn(),
    checkSubdomainAvailability: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    resetWorkspace: vi.fn(() => {
      mockStore.currentProject = null;
      mockStore.activePane = 'agent';
      mockStore.toolsOverlayOpen = false;
      mockStore.agentStatus = 'idle';
      mockStore.tasks = [];
      mockStore.currentTaskId = null;
      mockStore.checkpoints = [];
      mockStore.workDurationSeconds = 0;
    }),
  };

  // Create a Zustand-like store object
  const mockUseWorkspaceStore = Object.assign(
    vi.fn((selector?: (state: any) => any) =>
      selector ? selector(mockStore) : mockStore
    ),
    {
      getState: () => mockStore,
      setState: (updates: any) => {
        Object.assign(mockStore, typeof updates === 'function' ? updates(mockStore) : updates);
      },
      subscribe: vi.fn(),
      destroy: vi.fn(),
    }
  );

  return {
    useWorkspaceStore: mockUseWorkspaceStore,
    useCurrentProject: vi.fn(() => mockStore.currentProject),
    useActivePane: vi.fn(() => mockStore.activePane),
    useAgentStatus: vi.fn(() => mockStore.agentStatus),
    useTasks: vi.fn(() => mockStore.tasks),
    useCurrentTask: vi.fn(() => null),
    usePreview: vi.fn(() => ({
      url: mockStore.previewUrl,
      deviceFrame: mockStore.deviceFrame,
      isLoading: mockStore.isPreviewLoading
    })),
    usePublishing: vi.fn(() => ({
      subdomain: mockStore.subdomain,
      subdomainAvailable: mockStore.subdomainAvailable,
      status: mockStore.publishStatus,
      error: mockStore.publishError
    }))
  };
});

// Fix for @testing-library/user-event clipboard access
// user-event tries to access view.ownerDocument.defaultView.navigator.clipboard
// Ensure all elements have proper ownerDocument.defaultView
if (typeof document !== 'undefined') {
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName: string, options?: any) {
    const element = originalCreateElement(tagName, options);
    // Ensure ownerDocument.defaultView exists and has navigator
    if (element.ownerDocument && !element.ownerDocument.defaultView) {
      Object.defineProperty(element.ownerDocument, 'defaultView', {
        value: global.window,
        writable: true,
        configurable: true,
      });
    }
    return element;
  } as any;
}

// FINAL FIX: Wrap any window-like object to ensure it has navigator.clipboard
// This catches cases where JSDOM creates window instances we don't control
const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
Object.getOwnPropertyDescriptor = function(obj: any, prop: string | symbol) {
  const desc = originalGetOwnPropertyDescriptor.call(this, obj, prop);
  
  // If someone is accessing 'navigator' on a window-like object, ensure it exists
  if (prop === 'navigator' && obj && typeof obj === 'object') {
    if (!desc || !desc.value || !desc.value.clipboard) {
      // Return a descriptor with our mocked navigator
      return {
        value: global.navigator,
        writable: true,
        enumerable: true,
        configurable: true,
      };
    }
  }
  
  return desc;
};

// ULTIMATE FIX: Ensure navigator is always available on global, even if window is replaced
// Some tests reset global.window, so we need to make navigator resilient
Object.defineProperty(global, 'navigator', {
  get() {
    // Always return the navigator we set up, even if window changes
    if (!this._mockNavigator) {
      this._mockNavigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
          readText: vi.fn().mockResolvedValue(''),
        },
        share: vi.fn(),
        vibrate: vi.fn(),
        language: 'en-US',
        languages: ['en-US', 'en'],
        onLine: true,
        hardwareConcurrency: 4,
        maxTouchPoints: 0,
      };
    }
    return this._mockNavigator;
  },
  set(value) {
    // Allow setting but preserve clipboard
    if (value && !value.clipboard) {
      value.clipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(''),
      };
    }
    this._mockNavigator = value;
  },
  configurable: true,
});
