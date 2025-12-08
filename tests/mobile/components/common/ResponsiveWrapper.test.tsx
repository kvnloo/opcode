import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { ResponsiveWrapper } from '@/components/mobile/common/ResponsiveWrapper';

// Mock usePlatform hook
vi.mock('@/hooks/mobile/usePlatform', () => ({
  usePlatform: vi.fn(() => 'mobile'),
}));

describe('ResponsiveWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Platform-based Rendering', () => {
    it('should render mobile component on mobile platform', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('mobile');

      render(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      expect(screen.getByText('Mobile View')).toBeInTheDocument();
      expect(screen.queryByText('Desktop View')).not.toBeInTheDocument();
    });

    it('should render desktop component on desktop platform', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('desktop');

      render(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      expect(screen.getByText('Desktop View')).toBeInTheDocument();
      expect(screen.queryByText('Mobile View')).not.toBeInTheDocument();
    });

    it('should render tablet component on tablet platform when provided', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('tablet');

      render(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          tablet={<div>Tablet View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      expect(screen.getByText('Tablet View')).toBeInTheDocument();
      expect(screen.queryByText('Mobile View')).not.toBeInTheDocument();
      expect(screen.queryByText('Desktop View')).not.toBeInTheDocument();
    });

    it('should fallback to mobile view on tablet when tablet prop not provided', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('tablet');

      render(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      expect(screen.getByText('Mobile View')).toBeInTheDocument();
      expect(screen.queryByText('Desktop View')).not.toBeInTheDocument();
    });
  });

  describe('Component Types', () => {
    it('should render React elements', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('mobile');

      const MobileComponent = () => <div>Mobile Component</div>;
      const DesktopComponent = () => <div>Desktop Component</div>;

      render(
        <ResponsiveWrapper
          mobile={<MobileComponent />}
          desktop={<DesktopComponent />}
        />
      );

      expect(screen.getByText('Mobile Component')).toBeInTheDocument();
    });

    it('should render complex components', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('mobile');

      render(
        <ResponsiveWrapper
          mobile={
            <div>
              <h1>Mobile</h1>
              <p>Mobile content</p>
            </div>
          }
          desktop={
            <div>
              <h1>Desktop</h1>
              <p>Desktop content</p>
            </div>
          }
        />
      );

      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('Mobile content')).toBeInTheDocument();
    });

    it('should handle null as valid ReactNode', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('mobile');

      render(
        <ResponsiveWrapper
          mobile={null}
          desktop={<div>Desktop View</div>}
        />
      );

      expect(screen.queryByText('Desktop View')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown platform gracefully', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('unknown' as any);

      render(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      // Should default to desktop view
      expect(screen.getByText('Desktop View')).toBeInTheDocument();
    });

    it('should re-render when platform changes', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('mobile');

      const { rerender } = render(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      expect(screen.getByText('Mobile View')).toBeInTheDocument();

      // Change platform
      vi.mocked(usePlatform).mockReturnValue('desktop');

      rerender(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      expect(screen.getByText('Desktop View')).toBeInTheDocument();
      expect(screen.queryByText('Mobile View')).not.toBeInTheDocument();
    });
  });

  describe('Fragment Rendering', () => {
    it('should render content without wrapper element', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('mobile');

      const { container } = render(
        <ResponsiveWrapper
          mobile={<div>Mobile View</div>}
          desktop={<div>Desktop View</div>}
        />
      );

      // Should use Fragment, so no extra wrapper
      const mobileDiv = container.querySelector('div');
      expect(mobileDiv?.textContent).toBe('Mobile View');
    });
  });

  describe('Type Safety', () => {
    it('should accept any valid ReactNode', () => {
      const { usePlatform } = require('@/hooks/mobile/usePlatform');
      vi.mocked(usePlatform).mockReturnValue('mobile');

      render(
        <ResponsiveWrapper
          mobile="String content"
          desktop={123}
        />
      );

      expect(screen.getByText('String content')).toBeInTheDocument();
    });
  });
});
