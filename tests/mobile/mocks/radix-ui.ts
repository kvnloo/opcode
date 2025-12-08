/**
 * Radix UI Mocks
 * Mock implementations for Radix UI components
 */

import React from 'react';

// ============================================================================
// Dialog Mocks (@radix-ui/react-dialog)
// ============================================================================

export const Dialog = {
  Root: ({ children, open, onOpenChange, ...props }: any) =>
    React.createElement('div', {
      'data-radix-dialog-root': true,
      'data-state': open ? 'open' : 'closed',
      ...props
    }, children),

  Trigger: React.forwardRef<any, any>(({ children, asChild, ...props }, ref) =>
    asChild
      ? React.cloneElement(children, { ...props, ref, 'data-radix-dialog-trigger': true })
      : React.createElement('button', {
          ...props,
          ref,
          'data-radix-dialog-trigger': true
        }, children)
  ),

  Portal: ({ children, container }: any) =>
    React.createElement('div', { 'data-radix-dialog-portal': true }, children),

  Overlay: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-dialog-overlay': true
    }, children)
  ),

  Content: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-dialog-content': true,
      role: 'dialog'
    }, children)
  ),

  Title: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('h2', {
      ...props,
      ref,
      'data-radix-dialog-title': true
    }, children)
  ),

  Description: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('p', {
      ...props,
      ref,
      'data-radix-dialog-description': true
    }, children)
  ),

  Close: React.forwardRef<any, any>(({ children, asChild, ...props }, ref) =>
    asChild
      ? React.cloneElement(children, { ...props, ref, 'data-radix-dialog-close': true })
      : React.createElement('button', {
          ...props,
          ref,
          'data-radix-dialog-close': true
        }, children)
  ),
};

// ============================================================================
// Popover Mocks (@radix-ui/react-popover)
// ============================================================================

export const Popover = {
  Root: ({ children, open, onOpenChange, ...props }: any) =>
    React.createElement('div', {
      'data-radix-popover-root': true,
      'data-state': open ? 'open' : 'closed',
      ...props
    }, children),

  Trigger: React.forwardRef<any, any>(({ children, asChild, ...props }, ref) =>
    asChild
      ? React.cloneElement(children, { ...props, ref, 'data-radix-popover-trigger': true })
      : React.createElement('button', {
          ...props,
          ref,
          'data-radix-popover-trigger': true
        }, children)
  ),

  Portal: ({ children }: any) =>
    React.createElement('div', { 'data-radix-popover-portal': true }, children),

  Content: React.forwardRef<any, any>(({ children, align, side, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-popover-content': true,
      'data-align': align,
      'data-side': side,
      role: 'dialog'
    }, children)
  ),

  Arrow: React.forwardRef<any, any>(({ ...props }, ref) =>
    React.createElement('span', {
      ...props,
      ref,
      'data-radix-popover-arrow': true
    })
  ),

  Close: React.forwardRef<any, any>(({ children, asChild, ...props }, ref) =>
    asChild
      ? React.cloneElement(children, { ...props, ref, 'data-radix-popover-close': true })
      : React.createElement('button', {
          ...props,
          ref,
          'data-radix-popover-close': true
        }, children)
  ),
};

// ============================================================================
// Tabs Mocks (@radix-ui/react-tabs)
// ============================================================================

export const Tabs = {
  Root: ({ children, value, onValueChange, ...props }: any) =>
    React.createElement('div', {
      'data-radix-tabs-root': true,
      'data-value': value,
      ...props
    }, children),

  List: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-tabs-list': true,
      role: 'tablist'
    }, children)
  ),

  Trigger: React.forwardRef<any, any>(({ children, value, ...props }, ref) =>
    React.createElement('button', {
      ...props,
      ref,
      'data-radix-tabs-trigger': true,
      'data-value': value,
      role: 'tab'
    }, children)
  ),

  Content: React.forwardRef<any, any>(({ children, value, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-tabs-content': true,
      'data-value': value,
      role: 'tabpanel'
    }, children)
  ),
};

// ============================================================================
// ScrollArea Mocks (@radix-ui/react-scroll-area)
// ============================================================================

export const ScrollArea = {
  Root: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-scroll-area-root': true
    }, children)
  ),

  Viewport: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-scroll-area-viewport': true
    }, children)
  ),

  Scrollbar: React.forwardRef<any, any>(({ children, orientation = 'vertical', ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-scroll-area-scrollbar': true,
      'data-orientation': orientation
    }, children)
  ),

  Thumb: React.forwardRef<any, any>(({ ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-scroll-area-thumb': true
    })
  ),

  Corner: React.forwardRef<any, any>(({ ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-scroll-area-corner': true
    })
  ),
};

// ============================================================================
// Dropdown Menu Mocks (@radix-ui/react-dropdown-menu)
// ============================================================================

export const DropdownMenu = {
  Root: ({ children, open, onOpenChange, ...props }: any) =>
    React.createElement('div', {
      'data-radix-dropdown-root': true,
      'data-state': open ? 'open' : 'closed',
      ...props
    }, children),

  Trigger: React.forwardRef<any, any>(({ children, asChild, ...props }, ref) =>
    asChild
      ? React.cloneElement(children, { ...props, ref, 'data-radix-dropdown-trigger': true })
      : React.createElement('button', {
          ...props,
          ref,
          'data-radix-dropdown-trigger': true
        }, children)
  ),

  Portal: ({ children }: any) =>
    React.createElement('div', { 'data-radix-dropdown-portal': true }, children),

  Content: React.forwardRef<any, any>(({ children, align, side, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-dropdown-content': true,
      'data-align': align,
      'data-side': side,
      role: 'menu'
    }, children)
  ),

  Item: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-dropdown-item': true,
      role: 'menuitem'
    }, children)
  ),

  Separator: React.forwardRef<any, any>(({ ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-dropdown-separator': true,
      role: 'separator'
    })
  ),

  Label: React.forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-dropdown-label': true
    }, children)
  ),

  CheckboxItem: React.forwardRef<any, any>(({ children, checked, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-dropdown-checkbox-item': true,
      'data-state': checked ? 'checked' : 'unchecked',
      role: 'menuitemcheckbox'
    }, children)
  ),
};

// ============================================================================
// Tooltip Mocks (@radix-ui/react-tooltip)
// ============================================================================

export const Tooltip = {
  Provider: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-radix-tooltip-provider': true, ...props }, children),

  Root: ({ children, open, onOpenChange, ...props }: any) =>
    React.createElement('div', {
      'data-radix-tooltip-root': true,
      'data-state': open ? 'open' : 'closed',
      ...props
    }, children),

  Trigger: React.forwardRef<any, any>(({ children, asChild, ...props }, ref) =>
    asChild
      ? React.cloneElement(children, { ...props, ref, 'data-radix-tooltip-trigger': true })
      : React.createElement('button', {
          ...props,
          ref,
          'data-radix-tooltip-trigger': true
        }, children)
  ),

  Portal: ({ children }: any) =>
    React.createElement('div', { 'data-radix-tooltip-portal': true }, children),

  Content: React.forwardRef<any, any>(({ children, side, align, ...props }, ref) =>
    React.createElement('div', {
      ...props,
      ref,
      'data-radix-tooltip-content': true,
      'data-side': side,
      'data-align': align,
      role: 'tooltip'
    }, children)
  ),

  Arrow: React.forwardRef<any, any>(({ ...props }, ref) =>
    React.createElement('span', {
      ...props,
      ref,
      'data-radix-tooltip-arrow': true
    })
  ),
};

/**
 * Reset all Radix mocks
 */
export const resetRadixMocks = () => {
  jest.clearAllMocks();
};
