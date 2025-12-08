import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { AccessibleText, ScreenReaderOnly, VisuallyHidden } from '@/components/mobile/common/AccessibleText';

// Mock accessibility utilities - use vi.hoisted for proper hoisting
const { mockGetFontScalePreference, mockPrefersHighContrast } = vi.hoisted(() => ({
  mockGetFontScalePreference: vi.fn(() => 1.2),
  mockPrefersHighContrast: vi.fn(() => false),
}));

vi.mock('@/lib/mobile/accessibility', () => ({
  getFontScalePreference: mockGetFontScalePreference,
  prefersHighContrast: mockPrefersHighContrast,
}));

describe('AccessibleText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default variant (body)', () => {
      render(<AccessibleText>Test text</AccessibleText>);
      expect(screen.getByText('Test text')).toBeInTheDocument();
    });

    it('should render h1 element for h1 variant', () => {
      render(<AccessibleText variant="h1">Heading 1</AccessibleText>);
      const heading = screen.getByText('Heading 1');
      expect(heading.tagName).toBe('H1');
    });

    it('should render h2 element for h2 variant', () => {
      render(<AccessibleText variant="h2">Heading 2</AccessibleText>);
      const heading = screen.getByText('Heading 2');
      expect(heading.tagName).toBe('H2');
    });

    it('should render p element for body variant', () => {
      render(<AccessibleText variant="body">Body text</AccessibleText>);
      const text = screen.getByText('Body text');
      expect(text.tagName).toBe('P');
    });

    it('should render span element for small variant', () => {
      render(<AccessibleText variant="small">Small text</AccessibleText>);
      const text = screen.getByText('Small text');
      expect(text.tagName).toBe('SPAN');
    });

    it('should use custom element when as prop is provided', () => {
      render(
        <AccessibleText variant="body" as="div">
          Custom element
        </AccessibleText>
      );
      const text = screen.getByText('Custom element');
      expect(text.tagName).toBe('DIV');
    });
  });

  describe('Font Scaling', () => {
    it('should apply font scale from user preferences by default', () => {
      mockGetFontScalePreference.mockReturnValue(1.5);

      render(<AccessibleText>Scaled text</AccessibleText>);
      const text = screen.getByText('Scaled text');

      // Check if inline style with fontSize is applied
      expect(text).toHaveStyle({ fontSize: 'calc(1em * 1.5)' });
    });

    it('should not scale when scalable is false', () => {
      mockGetFontScalePreference.mockReturnValue(1.5);

      render(<AccessibleText scalable={false}>Unscaled text</AccessibleText>);
      const text = screen.getByText('Unscaled text');

      // When scalable is false, fontSize should not be applied via inline style
      const style = text.getAttribute('style');
      if (style) {
        expect(style).not.toContain('font-size');
      } else {
        // If style is null/empty, it's also correct (no inline style)
        expect(style).toBeFalsy();
      }
    });

    it('should not apply scale when font scale is 1', () => {
      mockGetFontScalePreference.mockReturnValue(1);

      render(<AccessibleText>Normal text</AccessibleText>);
      const text = screen.getByText('Normal text');

      // When font scale is 1, no inline style should be applied
      const style = text.getAttribute('style');
      expect(style).toBeFalsy();
    });
  });

  describe('High Contrast Support', () => {
    it('should apply high contrast styles when enabled', () => {
      mockPrefersHighContrast.mockReturnValue(true);

      render(<AccessibleText>High contrast text</AccessibleText>);
      const text = screen.getByText('High contrast text');

      // Check for contrast-more classes in className
      expect(text.className).toContain('contrast-more:text-black');
      expect(text.className).toContain('dark:contrast-more:text-white');
    });

    it('should not apply high contrast when highContrast is false', () => {
      mockPrefersHighContrast.mockReturnValue(true);

      render(<AccessibleText highContrast={false}>Text</AccessibleText>);
      const text = screen.getByText('Text');

      expect(text.className).not.toContain('contrast-more:text-black');
      expect(text.className).not.toContain('dark:contrast-more:text-white');
    });
  });

  describe('Variants and Styling', () => {
    it('should apply correct styles for h1 variant', () => {
      render(<AccessibleText variant="h1">Heading</AccessibleText>);
      const heading = screen.getByText('Heading');
      expect(heading.className).toContain('text-4xl');
      expect(heading.className).toContain('font-bold');
    });

    it('should apply correct styles for body variant', () => {
      render(<AccessibleText variant="body">Body</AccessibleText>);
      const text = screen.getByText('Body');
      expect(text.className).toContain('text-base');
    });

    it('should apply correct styles for caption variant', () => {
      render(<AccessibleText variant="caption">Caption</AccessibleText>);
      const text = screen.getByText('Caption');
      expect(text.className).toContain('text-xs');
    });

    it('should apply weight override when provided', () => {
      render(<AccessibleText weight="bold">Bold text</AccessibleText>);
      const text = screen.getByText('Bold text');
      expect(text.className).toContain('font-bold');
    });

    it('should apply custom className', () => {
      render(<AccessibleText className="custom-class">Text</AccessibleText>);
      const text = screen.getByText('Text');
      expect(text.className).toContain('custom-class');
    });
  });

  describe('Text Alignment', () => {
    it('should align left by default', () => {
      render(<AccessibleText>Left aligned</AccessibleText>);
      const text = screen.getByText('Left aligned');
      expect(text.className).not.toContain('text-center');
      expect(text.className).not.toContain('text-right');
    });

    it('should center align when align is center', () => {
      render(<AccessibleText align="center">Centered</AccessibleText>);
      const text = screen.getByText('Centered');
      expect(text.className).toContain('text-center');
    });

    it('should right align when align is right', () => {
      render(<AccessibleText align="right">Right aligned</AccessibleText>);
      const text = screen.getByText('Right aligned');
      expect(text.className).toContain('text-right');
    });
  });

  describe('Screen Reader Only', () => {
    it('should apply sr-only classes when srOnly is true', () => {
      render(<AccessibleText srOnly>Screen reader only</AccessibleText>);
      const text = screen.getByText('Screen reader only');
      expect(text.className).toContain('sr-only');
      expect(text.className).toContain('absolute');
    });

    it('should not apply sr-only classes by default', () => {
      render(<AccessibleText>Visible text</AccessibleText>);
      const text = screen.getByText('Visible text');
      expect(text.className).not.toContain('sr-only');
    });
  });

  describe('ARIA Attributes', () => {
    it('should apply aria-label when provided', () => {
      render(<AccessibleText ariaLabel="Custom label">Text</AccessibleText>);
      const text = screen.getByText('Text');
      expect(text).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should apply aria-level for headings when provided', () => {
      render(<AccessibleText variant="h3" ariaLevel={2}>Heading</AccessibleText>);
      const heading = screen.getByText('Heading');
      expect(heading).toHaveAttribute('aria-level', '2');
    });

    it('should not apply aria-level for non-heading variants', () => {
      render(<AccessibleText variant="body" ariaLevel={2}>Text</AccessibleText>);
      const text = screen.getByText('Text');
      expect(text).not.toHaveAttribute('aria-level');
    });
  });

  describe('Color Scheme Support', () => {
    it('should include dark mode text color', () => {
      render(<AccessibleText>Text</AccessibleText>);
      const text = screen.getByText('Text');
      expect(text.className).toContain('dark:text-gray-100');
    });

    it('should include light mode text color', () => {
      render(<AccessibleText>Text</AccessibleText>);
      const text = screen.getByText('Text');
      expect(text.className).toContain('text-gray-900');
    });
  });
});

describe('ScreenReaderOnly', () => {
  it('should render with sr-only styles', () => {
    render(<ScreenReaderOnly>SR only text</ScreenReaderOnly>);
    const text = screen.getByText('SR only text');
    expect(text.className).toContain('sr-only');
  });

  it('should use span by default', () => {
    render(<ScreenReaderOnly>Text</ScreenReaderOnly>);
    const text = screen.getByText('Text');
    expect(text.tagName).toBe('SPAN');
  });

  it('should use custom element when provided', () => {
    render(<ScreenReaderOnly as="div">Text</ScreenReaderOnly>);
    const text = screen.getByText('Text');
    expect(text.tagName).toBe('DIV');
  });
});

describe('VisuallyHidden', () => {
  it('should render with sr-only class', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.className).toContain('sr-only');
  });

  it('should be focusable', () => {
    const { container } = render(<VisuallyHidden>Focusable hidden</VisuallyHidden>);
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('focus:not-sr-only');
  });

  it('should show on focus', () => {
    const { container } = render(<VisuallyHidden>Focus to show</VisuallyHidden>);
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('focus:absolute');
    expect(wrapper?.className).toContain('focus:z-50');
  });

  it('should apply custom className', () => {
    const { container } = render(<VisuallyHidden className="custom">Text</VisuallyHidden>);
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('custom');
  });

  it('should have proper dark mode support', () => {
    const { container } = render(<VisuallyHidden>Text</VisuallyHidden>);
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('dark:focus:bg-gray-900');
  });
});
