/**
 * Mobile Polish Demo
 * Demonstrates the usage of haptics, performance, and accessibility features
 * This file serves as both documentation and a working example
 */

import React, { useState } from 'react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { AccessibleText, ScreenReaderOnly, VisuallyHidden } from '@/components/mobile/common/AccessibleText';
import { LazyComponent } from '@/components/mobile/common/LazyComponent';
import { TabletLayout } from '@/components/mobile/layout/TabletLayout';
import { useHaptics } from '@/hooks/mobile/useHaptics';
import { announceToScreenReader, focusManagement } from '@/lib/mobile/accessibility';
import { cn } from '@/lib/utils';
import { debounce, throttle, getDeviceCapabilities } from '@/lib/mobile/performance';

/**
 * Example: Haptic Feedback Demo
 */
export const HapticDemo: React.FC = () => {
  const { light, medium, heavy, success, error, selection, isSupported, isEnabled, setEnabled } = useHaptics();
  const [message, setMessage] = useState('');

  const handleHapticTest = (type: string, callback: () => void) => {
    callback();
    setMessage(`${type} haptic triggered`);
    announceToScreenReader(`${type} haptic feedback triggered`, 'polite');
  };

  return (
    <div className="p-4 space-y-4">
      <AccessibleText variant="h2" weight="bold">
        Haptic Feedback Demo
      </AccessibleText>

      <AccessibleText variant="body">
        Haptics supported: {isSupported ? 'Yes' : 'No'}
        {isSupported && ` (${isEnabled ? 'Enabled' : 'Disabled'})`}
      </AccessibleText>

      {isSupported && (
        <HapticButton
          onClick={() => setEnabled(!isEnabled)}
          hapticType="selection"
          className="bg-blue-600 text-white"
        >
          {isEnabled ? 'Disable' : 'Enable'} Haptics
        </HapticButton>
      )}

      <div className="grid grid-cols-2 gap-3">
        <HapticButton
          hapticType="light"
          onClick={() => handleHapticTest('Light', light)}
          className="bg-gray-200 dark:bg-gray-700"
        >
          Light
        </HapticButton>

        <HapticButton
          hapticType="medium"
          onClick={() => handleHapticTest('Medium', medium)}
          className="bg-gray-300 dark:bg-gray-600"
        >
          Medium
        </HapticButton>

        <HapticButton
          hapticType="heavy"
          onClick={() => handleHapticTest('Heavy', heavy)}
          className="bg-gray-400 dark:bg-gray-500"
        >
          Heavy
        </HapticButton>

        <HapticButton
          hapticType="success"
          onClick={() => handleHapticTest('Success', success)}
          className="bg-green-600 text-white"
        >
          Success
        </HapticButton>

        <HapticButton
          hapticType="error"
          onClick={() => handleHapticTest('Error', error)}
          className="bg-red-600 text-white"
        >
          Error
        </HapticButton>

        <HapticButton
          hapticType="selection"
          onClick={() => handleHapticTest('Selection', selection)}
          className="bg-blue-600 text-white"
        >
          Selection
        </HapticButton>
      </div>

      {message && (
        <AccessibleText variant="small" className="text-gray-600 dark:text-gray-400">
          {message}
        </AccessibleText>
      )}

      <ScreenReaderOnly>
        This demo allows you to test different haptic feedback patterns. Each button triggers a different vibration pattern when pressed.
      </ScreenReaderOnly>
    </div>
  );
};

/**
 * Example: Accessible Text Demo
 */
export const AccessibleTextDemo: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <AccessibleText variant="h1" weight="bold" align="center">
        Heading Level 1
      </AccessibleText>

      <AccessibleText variant="h2" highContrast>
        Heading Level 2 (High Contrast)
      </AccessibleText>

      <AccessibleText variant="h3">
        Heading Level 3
      </AccessibleText>

      <AccessibleText variant="body" scalable>
        This is body text that scales with user preferences. It will automatically adjust based on the user's font size settings.
      </AccessibleText>

      <AccessibleText variant="small" className="text-gray-600 dark:text-gray-400">
        This is small text, useful for captions and helper text.
      </AccessibleText>

      <AccessibleText variant="caption" className="text-gray-500 dark:text-gray-500">
        Caption text - smallest size
      </AccessibleText>

      <VisuallyHidden>
        <a href="#main-content" className="text-blue-600 underline">
          Skip to main content (appears on focus)
        </a>
      </VisuallyHidden>
    </div>
  );
};

/**
 * Example: Performance Optimization Demo
 */
export const PerformanceDemo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const capabilities = getDeviceCapabilities();

  // Debounced search (waits for user to stop typing)
  const handleSearch = React.useMemo(
    () => debounce((value: string) => {
      console.log('Searching for:', value);
      announceToScreenReader(`Searching for ${value}`, 'polite');
    }, 300),
    []
  );

  // Throttled scroll handler (limits execution rate)
  const handleScroll = React.useMemo(
    () => throttle((event: React.UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      setScrollPosition(element.scrollTop);
    }, 100),
    []
  );

  return (
    <div className="p-4 space-y-4">
      <AccessibleText variant="h2" weight="bold">
        Performance Optimization Demo
      </AccessibleText>

      <div>
        <AccessibleText variant="h3">Device Capabilities</AccessibleText>
        <AccessibleText variant="small" className="space-y-1">
          <div>High Quality: {capabilities.canHandleHighQuality ? 'Yes' : 'No'}</div>
          <div>Reduce Animations: {capabilities.shouldReduceAnimations ? 'Yes' : 'No'}</div>
          <div>Slow Network: {capabilities.isSlowNetwork ? 'Yes' : 'No'}</div>
          <div>Device Memory: {capabilities.deviceMemory || 'Unknown'} GB</div>
          <div>CPU Cores: {capabilities.hardwareConcurrency || 'Unknown'}</div>
        </AccessibleText>
      </div>

      <div>
        <label htmlFor="search-input" className="block mb-2">
          <AccessibleText variant="body" weight="medium">
            Debounced Search
          </AccessibleText>
        </label>
        <input
          id="search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full px-4 py-2 border rounded-lg min-h-[44px]"
          placeholder="Type to search..."
          aria-label="Search input with debouncing"
        />
        <AccessibleText variant="small" className="text-gray-500 mt-1">
          Search executes 300ms after you stop typing
        </AccessibleText>
      </div>

      <div>
        <AccessibleText variant="body" weight="medium" className="mb-2">
          Throttled Scroll (scroll position: {Math.round(scrollPosition)}px)
        </AccessibleText>
        <div
          onScroll={handleScroll}
          className="h-32 overflow-y-auto border rounded-lg p-4"
          role="region"
          aria-label="Scrollable content area"
        >
          <div className="space-y-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <AccessibleText key={i} variant="body">
                Scroll item {i + 1}
              </AccessibleText>
            ))}
          </div>
        </div>
        <AccessibleText variant="small" className="text-gray-500 mt-1">
          Scroll handler throttled to 100ms intervals
        </AccessibleText>
      </div>
    </div>
  );
};

/**
 * Example: Lazy Loading Demo
 */
const HeavyComponent: React.FC = () => (
  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
    <AccessibleText variant="h3" className="text-green-700 dark:text-green-400">
      Heavy Component Loaded!
    </AccessibleText>
    <AccessibleText variant="body" className="text-green-600 dark:text-green-300">
      This component was lazy-loaded with retry capability.
    </AccessibleText>
  </div>
);

export const LazyLoadingDemo: React.FC = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <AccessibleText variant="h2" weight="bold">
        Lazy Loading Demo
      </AccessibleText>

      <HapticButton
        onClick={() => setShouldLoad(!shouldLoad)}
        hapticType="medium"
        className="bg-blue-600 text-white"
      >
        {shouldLoad ? 'Unload' : 'Load'} Component
      </HapticButton>

      {shouldLoad && (
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: HeavyComponent })}
          onLoad={() => {
            console.log('Component loaded successfully');
            announceToScreenReader('Component loaded successfully', 'polite');
          }}
          onError={(error) => {
            console.error('Failed to load component:', error);
            announceToScreenReader('Failed to load component', 'assertive');
          }}
        />
      )}
    </div>
  );
};

/**
 * Example: Tablet Layout Demo
 */
const SidebarContent: React.FC = () => (
  <div className="p-4 space-y-4">
    <AccessibleText variant="h3">Sidebar</AccessibleText>
    <nav aria-label="Main navigation">
      <ul className="space-y-2">
        {['Home', 'Projects', 'Settings', 'Help'].map((item) => (
          <li key={item}>
            <HapticButton
              hapticType="selection"
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {item}
            </HapticButton>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

const MainContent: React.FC = () => (
  <div className="p-4 space-y-4">
    <AccessibleText variant="h2">Main Content Area</AccessibleText>
    <AccessibleText variant="body">
      This is the main content area of the tablet layout. The sidebar can be resized by dragging the divider, or collapsed using the toggle button.
    </AccessibleText>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg">
        <AccessibleText variant="h3">Card 1</AccessibleText>
        <AccessibleText variant="body">Content goes here</AccessibleText>
      </div>
      <div className="p-4 border rounded-lg">
        <AccessibleText variant="h3">Card 2</AccessibleText>
        <AccessibleText variant="body">Content goes here</AccessibleText>
      </div>
    </div>
  </div>
);

export const TabletLayoutDemo: React.FC = () => {
  return (
    <div className="h-screen">
      <TabletLayout
        sidebar={<SidebarContent />}
        defaultSidebarWidth={320}
        sidebarPosition="left"
        resizable
        collapsible
        onSidebarWidthChange={(width) => console.log('Sidebar width:', width)}
        onCollapsedChange={(collapsed) => console.log('Sidebar collapsed:', collapsed)}
      >
        <MainContent />
      </TabletLayout>
    </div>
  );
};

/**
 * Example: Focus Management Demo
 */
export const FocusManagementDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  const openModal = () => {
    previousFocusRef.current = focusManagement.getCurrentFocus();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    focusManagement.returnFocus(previousFocusRef.current);
  };

  React.useEffect(() => {
    if (showModal && modalRef.current) {
      const cleanup = focusManagement.trapFocus(modalRef.current);
      return cleanup;
    }
  }, [showModal]);

  return (
    <div className="p-4 space-y-4">
      <AccessibleText variant="h2" weight="bold">
        Focus Management Demo
      </AccessibleText>

      <HapticButton
        onClick={openModal}
        hapticType="medium"
        className="bg-blue-600 text-white"
        aria-haspopup="dialog"
      >
        Open Modal
      </HapticButton>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="presentation"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md mx-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <AccessibleText
              variant="h3"
              weight="bold"
              className="mb-4"
              as="h2"
              ariaLevel={1}
            >
              <span id="modal-title">Modal Dialog</span>
            </AccessibleText>

            <AccessibleText variant="body" className="mb-4">
              Focus is trapped within this modal. Try pressing Tab to navigate through the focusable elements.
            </AccessibleText>

            <div className="flex gap-3 justify-end">
              <HapticButton
                onClick={closeModal}
                hapticType="light"
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
              >
                Cancel
              </HapticButton>

              <HapticButton
                onClick={() => {
                  announceToScreenReader('Action confirmed', 'polite');
                  closeModal();
                }}
                hapticType="success"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Confirm
              </HapticButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Complete Demo - All Features
 */
export const MobilePolishCompleteDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { selection } = useHaptics();

  const tabs = [
    { name: 'Haptics', component: HapticDemo },
    { name: 'Text', component: AccessibleTextDemo },
    { name: 'Performance', component: PerformanceDemo },
    { name: 'Lazy Load', component: LazyLoadingDemo },
    { name: 'Focus', component: FocusManagementDemo },
    { name: 'Tablet', component: TabletLayoutDemo },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <AccessibleText variant="h1" weight="bold" align="center">
            Mobile Polish Features
          </AccessibleText>
          <AccessibleText variant="body" align="center" className="text-gray-600 dark:text-gray-400">
            Haptics, Performance, and Accessibility
          </AccessibleText>
        </div>

        <nav
          role="tablist"
          aria-label="Feature demos"
          className="flex overflow-x-auto bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              role="tab"
              aria-selected={activeTab === index}
              aria-controls={`panel-${index}`}
              onClick={() => {
                selection();
                setActiveTab(index);
                announceToScreenReader(`${tab.name} tab selected`, 'polite');
              }}
              className={cn(
                'px-4 py-3 min-h-[44px] whitespace-nowrap transition-colors',
                'border-b-2 font-medium',
                activeTab === index
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="bg-white dark:bg-gray-800"
        >
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};
