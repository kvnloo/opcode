import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getFontScalePreference, prefersHighContrast } from '@/lib/mobile/accessibility';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small' | 'caption';
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

interface AccessibleTextProps {
  /**
   * Text variant defining semantic meaning and base size
   */
  variant?: TextVariant;

  /**
   * Font weight
   */
  weight?: TextWeight;

  /**
   * Text content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * HTML element to render
   * Auto-determined from variant if not provided
   */
  as?: keyof JSX.IntrinsicElements;

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Whether text should scale with user preferences
   * @default true
   */
  scalable?: boolean;

  /**
   * Whether to enable high contrast mode support
   * @default true
   */
  highContrast?: boolean;

  /**
   * Screen reader only text (visually hidden but accessible)
   */
  srOnly?: boolean;

  /**
   * ARIA label for additional context
   */
  ariaLabel?: string;

  /**
   * ARIA level for headings (overrides semantic level)
   */
  ariaLevel?: number;
}

const variantStyles: Record<TextVariant, string> = {
  h1: 'text-4xl md:text-5xl font-bold leading-tight',
  h2: 'text-3xl md:text-4xl font-bold leading-tight',
  h3: 'text-2xl md:text-3xl font-semibold leading-snug',
  h4: 'text-xl md:text-2xl font-semibold leading-snug',
  h5: 'text-lg md:text-xl font-medium leading-normal',
  h6: 'text-base md:text-lg font-medium leading-normal',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-normal',
  caption: 'text-xs leading-tight',
};

const weightStyles: Record<TextWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const variantElements: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  small: 'span',
  caption: 'span',
};

/**
 * Accessible text component with font scaling and high contrast support
 * Follows WCAG 2.1 AA guidelines for text presentation
 *
 * @example
 * ```tsx
 * <AccessibleText variant="h1" weight="bold" highContrast>
 *   Welcome to Opcode
 * </AccessibleText>
 *
 * <AccessibleText variant="body" scalable>
 *   This text will scale based on user preferences
 * </AccessibleText>
 * ```
 */
export const AccessibleText: React.FC<AccessibleTextProps> = ({
  variant = 'body',
  weight,
  children,
  className,
  as,
  align = 'left',
  scalable = true,
  highContrast = true,
  srOnly = false,
  ariaLabel,
  ariaLevel,
}) => {
  // Get user's font scale preference
  const fontScale = useMemo(() => {
    return scalable ? getFontScalePreference() : 1;
  }, [scalable]);

  // Check if high contrast mode is enabled
  const isHighContrast = useMemo(() => {
    return highContrast ? prefersHighContrast() : false;
  }, [highContrast]);

  // Determine element to render
  const Element = as || variantElements[variant];

  // Determine if this is a heading
  const isHeading = variant.startsWith('h');

  // Build class names
  const textClasses = cn(
    // Base variant styles
    variantStyles[variant],

    // Weight override if provided
    weight && weightStyles[weight],

    // Alignment
    align === 'center' && 'text-center',
    align === 'right' && 'text-right',

    // High contrast support
    isHighContrast && [
      'contrast-more:text-black dark:contrast-more:text-white',
      'contrast-more:font-semibold',
    ],

    // Screen reader only
    srOnly && [
      'sr-only',
      'absolute w-px h-px p-0 -m-px overflow-hidden',
      'whitespace-nowrap border-0',
    ],

    // Ensure sufficient line height for readability
    'antialiased',

    // Color scheme support
    'text-gray-900 dark:text-gray-100',

    className
  );

  // Build ARIA attributes
  const ariaProps = {
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(isHeading && ariaLevel && { 'aria-level': ariaLevel }),
  };

  // Apply font scaling via inline style if needed
  const style = scalable && fontScale !== 1
    ? { fontSize: `calc(1em * ${fontScale})` }
    : undefined;

  return (
    <Element
      className={textClasses}
      style={style}
      {...ariaProps}
    >
      {children}
    </Element>
  );
};

/**
 * Screen reader only text component
 * Content is hidden visually but accessible to assistive technology
 *
 * @example
 * ```tsx
 * <ScreenReaderOnly>
 *   This text is only for screen readers
 * </ScreenReaderOnly>
 * ```
 */
export const ScreenReaderOnly: React.FC<{
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, as = 'span' }) => {
  return (
    <AccessibleText variant="body" as={as} srOnly>
      {children}
    </AccessibleText>
  );
};

/**
 * Visually hidden but focusable text
 * Useful for skip links and other navigation aids
 *
 * @example
 * ```tsx
 * <VisuallyHidden>
 *   <a href="#main-content">Skip to main content</a>
 * </VisuallyHidden>
 * ```
 */
export const VisuallyHidden: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-0 focus:left-0',
        'focus:z-50 focus:p-4',
        'focus:bg-white dark:focus:bg-gray-900',
        'focus:border focus:border-gray-300 dark:focus:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
};
