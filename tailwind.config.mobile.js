/**
 * Mobile-Specific Tailwind Configuration
 *
 * Optimizations for mobile performance and user experience:
 * - Touch target sizes (min 44x44px)
 * - Safe area padding for notched devices
 * - Reduced motion variants
 * - Dark mode optimizations
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // Mobile-optimized spacing scale
      spacing: {
        safe: 'env(safe-area-inset-top)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // Minimum touch target sizes (44x44px for iOS, 48x48px for Android)
      minWidth: {
        touch: '44px',
        'touch-android': '48px',
      },
      minHeight: {
        touch: '44px',
        'touch-android': '48px',
      },

      // Mobile-optimized typography
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
      },

      // Performance-optimized animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },

      // Mobile-optimized shadows (lighter for performance)
      boxShadow: {
        'mobile-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        mobile: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'mobile-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'mobile-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'mobile-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },

      // Dark mode color optimizations
      colors: {
        'mobile-bg-light': '#ffffff',
        'mobile-bg-dark': '#0a0a0a',
        'mobile-surface-light': '#f5f5f5',
        'mobile-surface-dark': '#1a1a1a',
        'mobile-border-light': '#e5e5e5',
        'mobile-border-dark': '#2a2a2a',
      },
    },
  },

  plugins: [
    // Custom plugin for mobile utilities
    function ({ addUtilities, addVariant, theme }) {
      // Safe area utilities
      addUtilities({
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-x': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-y': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-all': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },

        // Touch target utilities
        '.touch-target': {
          minWidth: '44px',
          minHeight: '44px',
        },
        '.touch-target-android': {
          minWidth: '48px',
          minHeight: '48px',
        },

        // Performance utilities
        '.gpu-accelerate': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
        '.will-change-transform': {
          willChange: 'transform',
        },
        '.will-change-opacity': {
          willChange: 'opacity',
        },

        // Smooth scrolling
        '.scroll-smooth-mobile': {
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        },

        // Disable text selection
        '.no-select': {
          WebkitUserSelect: 'none',
          userSelect: 'none',
        },

        // Active state for touch
        '.active-scale': {
          '&:active': {
            transform: 'scale(0.97)',
          },
        },

        // Shimmer loading effect
        '.shimmer': {
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 2s infinite',
        },
        '.shimmer-dark': {
          background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 2s infinite',
        },
      });

      // Reduced motion variant
      addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');

      // Dark mode with better specificity
      addVariant('dark-mobile', '.dark &');

      // Landscape orientation
      addVariant('landscape', '@media (orientation: landscape)');
      addVariant('portrait', '@media (orientation: portrait)');

      // Device-specific variants
      addVariant('ios', '.ios &');
      addVariant('android', '.android &');

      // Touch-specific variants
      addVariant('touch', '@media (hover: none) and (pointer: coarse)');
      addVariant('no-touch', '@media (hover: hover) and (pointer: fine)');
    },

    // Typography plugin with mobile optimizations
    function ({ addBase, theme }) {
      addBase({
        // Base font size for mobile
        html: {
          fontSize: '16px',
          '@media (max-width: 640px)': {
            fontSize: '14px',
          },
        },

        // Optimize tap highlight
        'a, button, input, textarea, select': {
          WebkitTapHighlightColor: 'transparent',
        },

        // Prevent text size adjustment on orientation change
        body: {
          WebkitTextSizeAdjust: '100%',
        },

        // Smooth font rendering
        '*': {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      });
    },
  ],

  // Optimize for mobile bundle size
  corePlugins: {
    preflight: true,
    container: false, // Use custom container classes
  },

  // Safelist for dynamic classes
  safelist: [
    'safe-top',
    'safe-bottom',
    'safe-left',
    'safe-right',
    'touch-target',
    'gpu-accelerate',
    'animate-fade-in',
    'animate-slide-up',
  ],
};
