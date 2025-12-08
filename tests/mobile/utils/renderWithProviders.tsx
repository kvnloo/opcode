import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TabProvider } from '@/contexts/TabContext';
import { OutputCacheProvider } from '@/lib/outputCache';

interface AllProvidersProps {
  children: ReactNode;
}

/**
 * Wraps components with all necessary providers for testing
 */
function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider>
      <OutputCacheProvider>
        <TabProvider>
          {children}
        </TabProvider>
      </OutputCacheProvider>
    </ThemeProvider>
  );
}

/**
 * Custom render function that wraps components with all providers
 * Use this instead of @testing-library/react's render
 *
 * @example
 * ```tsx
 * import { customRender } from '@/tests/mobile/utils/renderWithProviders';
 *
 * test('renders component', () => {
 *   customRender(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
