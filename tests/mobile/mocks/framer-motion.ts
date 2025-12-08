/**
 * Framer Motion Mocks
 * Complete mock implementation of framer-motion for testing
 */

import React from 'react';

/**
 * Create a mock motion component
 */
const createMockMotionComponent = (tag: string) => {
  return React.forwardRef<any, any>((props, ref) => {
    const {
      children,
      initial,
      animate,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileDrag,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      onDragStart,
      onDragEnd,
      onDrag,
      layout,
      layoutId,
      ...restProps
    } = props;

    // Pass through essential props for testing
    const testProps = {
      ...restProps,
      ref,
      'data-motion-component': tag,
      'data-initial': initial ? JSON.stringify(initial) : undefined,
      'data-animate': animate ? JSON.stringify(animate) : undefined,
    };

    return React.createElement(tag, testProps, children);
  });
};

// Mock all common motion components
export const motion = {
  div: createMockMotionComponent('div'),
  span: createMockMotionComponent('span'),
  button: createMockMotionComponent('button'),
  a: createMockMotionComponent('a'),
  nav: createMockMotionComponent('nav'),
  ul: createMockMotionComponent('ul'),
  li: createMockMotionComponent('li'),
  section: createMockMotionComponent('section'),
  article: createMockMotionComponent('article'),
  header: createMockMotionComponent('header'),
  footer: createMockMotionComponent('footer'),
  main: createMockMotionComponent('main'),
  aside: createMockMotionComponent('aside'),
  form: createMockMotionComponent('form'),
  input: createMockMotionComponent('input'),
  textarea: createMockMotionComponent('textarea'),
  img: createMockMotionComponent('img'),
  svg: createMockMotionComponent('svg'),
  path: createMockMotionComponent('path'),
  circle: createMockMotionComponent('circle'),
  rect: createMockMotionComponent('rect'),
  p: createMockMotionComponent('p'),
  h1: createMockMotionComponent('h1'),
  h2: createMockMotionComponent('h2'),
  h3: createMockMotionComponent('h3'),
  h4: createMockMotionComponent('h4'),
  h5: createMockMotionComponent('h5'),
  h6: createMockMotionComponent('h6'),
};

/**
 * Mock AnimatePresence component
 */
export const AnimatePresence = jest.fn(({ children, mode, initial, onExitComplete }) => {
  return React.createElement(
    'div',
    { 'data-animate-presence': true, 'data-mode': mode },
    children
  );
});

/**
 * Mock animation controls
 */
export class AnimationControls {
  private listeners: Set<() => void> = new Set();

  start = jest.fn(async (definition?: any) => {
    this.listeners.forEach(listener => listener());
    return Promise.resolve();
  });

  stop = jest.fn(() => {});

  set = jest.fn(() => {});

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

/**
 * Mock useAnimation hook
 */
export const useAnimation = jest.fn(() => new AnimationControls());

/**
 * Mock motion value
 */
export class MotionValue<T = any> {
  private value: T;
  private listeners: Set<(value: T) => void> = new Set();

  constructor(initial: T) {
    this.value = initial;
  }

  get = () => this.value;

  set = (value: T) => {
    this.value = value;
    this.listeners.forEach(listener => listener(value));
  };

  onChange = (listener: (value: T) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  stop = jest.fn(() => {});
  destroy = jest.fn(() => {});
}

/**
 * Mock useMotionValue hook
 */
export const useMotionValue = jest.fn(<T,>(initial: T) => new MotionValue(initial));

/**
 * Mock useTransform hook
 */
export const useTransform = jest.fn(
  <T,>(value: MotionValue<any>, inputRange: number[], outputRange: T[]) => {
    const transformedValue = new MotionValue(outputRange[0]);

    value.onChange((v) => {
      // Simple linear interpolation for testing
      const index = Math.min(inputRange.indexOf(v), outputRange.length - 1);
      transformedValue.set(outputRange[Math.max(0, index)]);
    });

    return transformedValue;
  }
);

/**
 * Mock drag controls
 */
export class DragControls {
  start = jest.fn((event: any, options?: any) => {});
  stop = jest.fn(() => {});
}

/**
 * Mock useDragControls hook
 */
export const useDragControls = jest.fn(() => new DragControls());

/**
 * Mock useScroll hook
 */
export const useScroll = jest.fn(() => ({
  scrollX: new MotionValue(0),
  scrollY: new MotionValue(0),
  scrollXProgress: new MotionValue(0),
  scrollYProgress: new MotionValue(0),
}));

/**
 * Mock useSpring hook
 */
export const useSpring = jest.fn((source: MotionValue<number>, config?: any) => {
  return new MotionValue(source.get());
});

/**
 * Mock useVelocity hook
 */
export const useVelocity = jest.fn((value: MotionValue<number>) => {
  return new MotionValue(0);
});

/**
 * Mock useInView hook
 */
export const useInView = jest.fn((options?: any) => {
  return [React.useRef(null), true];
});

/**
 * Mock animate function
 */
export const animate = jest.fn((
  target: any,
  values: any,
  options?: any
) => {
  return {
    stop: jest.fn(),
    then: jest.fn((callback) => {
      callback && callback();
      return Promise.resolve();
    }),
  };
});

/**
 * Mock stagger utility
 */
export const stagger = jest.fn((duration: number, options?: any) => duration);

/**
 * Common animation variants for testing
 */
export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
};

/**
 * Reset all motion mocks
 */
export const resetMotionMocks = () => {
  jest.clearAllMocks();
};
