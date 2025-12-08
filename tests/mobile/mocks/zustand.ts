/**
 * Zustand Store Mocks
 * Mock implementation for zustand state management
 */

import { act } from '@testing-library/react';

export type StateCreator<T> = (
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T,
  api: any
) => T;

export type StoreApi<T> = {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
};

/**
 * Create a mock Zustand store
 */
export const createStore = <T extends object>(
  initializer: StateCreator<T>
): StoreApi<T> => {
  const listeners = new Set<(state: T, prevState: T) => void>();
  let state: T;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const prevState = state;
    const partialState = typeof partial === 'function' ? partial(state) : partial;

    state = {
      ...state,
      ...partialState,
    };

    // Notify listeners
    listeners.forEach(listener => {
      listener(state, prevState);
    });
  };

  const getState = () => state;

  const subscribe = (listener: (state: T, prevState: T) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  // Initialize state
  state = initializer(setState, getState, { setState, getState, subscribe, destroy });

  return {
    getState,
    setState,
    subscribe,
    destroy,
  };
};

/**
 * Create mock useStore hook
 */
export const createUseStore = <T extends object>(store: StoreApi<T>) => {
  return <U>(selector?: (state: T) => U): U extends undefined ? T : U => {
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    React.useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        forceUpdate();
      });
      return unsubscribe;
    }, []);

    const state = store.getState();
    return (selector ? selector(state) : state) as any;
  };
};

/**
 * Create a complete mock store with hook
 */
export const createMockStore = <T extends object>(
  initializer: StateCreator<T>
) => {
  const store = createStore(initializer);
  const useStore = createUseStore(store);

  return {
    store,
    useStore,
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
    destroy: store.destroy,
  };
};

/**
 * Mock persist middleware
 */
export const persist = <T extends object>(
  config: StateCreator<T>,
  options: {
    name: string;
    storage?: any;
    partialize?: (state: T) => Partial<T>;
    onRehydrateStorage?: (state: T) => void;
  }
): StateCreator<T> => {
  return (set, get, api) => {
    const state = config(set, get, api);

    // Mock hydration
    if (options.onRehydrateStorage) {
      setTimeout(() => {
        options.onRehydrateStorage?.(get());
      }, 0);
    }

    return state;
  };
};

/**
 * Mock devtools middleware
 */
export const devtools = <T extends object>(
  config: StateCreator<T>,
  options?: {
    name?: string;
    enabled?: boolean;
  }
): StateCreator<T> => {
  return config;
};

/**
 * Mock combine utility
 */
export const combine = <T extends object, U extends object>(
  initialState: T,
  create: (set: any, get: any, api: any) => U
): StateCreator<T & U> => {
  return (set, get, api) => {
    const actions = create(set, get, api);
    return {
      ...initialState,
      ...actions,
    } as T & U;
  };
};

/**
 * Mock subscribeWithSelector middleware
 */
export const subscribeWithSelector = <T extends object>(
  config: StateCreator<T>
): StateCreator<T> => {
  return config;
};

/**
 * Test helpers
 */
export const testHelpers = {
  /**
   * Reset store to initial state
   */
  resetStore: <T extends object>(store: StoreApi<T>, initialState: T) => {
    act(() => {
      store.setState(initialState);
    });
  },

  /**
   * Wait for store update
   */
  waitForStoreUpdate: <T extends object>(
    store: StoreApi<T>,
    predicate: (state: T) => boolean,
    timeout = 1000
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Store update timeout'));
      }, timeout);

      const unsubscribe = store.subscribe((state) => {
        if (predicate(state)) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        }
      });

      // Check immediately
      if (predicate(store.getState())) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      }
    });
  },

  /**
   * Spy on store updates
   */
  spyOnStore: <T extends object>(store: StoreApi<T>) => {
    const updates: Array<{ state: T; prevState: T }> = [];

    const unsubscribe = store.subscribe((state, prevState) => {
      updates.push({ state: { ...state }, prevState: { ...prevState } });
    });

    return {
      updates,
      clear: () => updates.splice(0, updates.length),
      unsubscribe,
    };
  },
};

/**
 * Mock shallow compare
 */
export const shallow = <T>(objA: T, objB: T): boolean => {
  if (Object.is(objA, objB)) return true;

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is((objA as any)[key], (objB as any)[key])
    ) {
      return false;
    }
  }

  return true;
};

// React import for hooks
import React from 'react';

/**
 * Reset all Zustand mocks
 */
export const resetZustandMocks = () => {
  jest.clearAllMocks();
};
