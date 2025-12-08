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

      // Mobile color system from design tokens
      colors: {
        // Backgrounds
        'mobile-bg-primary': '#0F1419',
        'mobile-bg-secondary': '#1E2835',
        'mobile-bg-tertiary': '#2D3748',
        'mobile-bg-elevated': '#1E2835',
        'mobile-bg-card': '#1E2835',
        'mobile-bg-input': '#1E2835',
        'mobile-bg-overlay': '#0F1419E6',
        'mobile-bg-app-preview': '#1C2A3A',
        'mobile-bg-app-card': '#1E293B',

        // Text
        'mobile-text-primary': '#FFFFFF',
        'mobile-text-secondary': '#E2E8F0',
        'mobile-text-tertiary': '#6E7681',
        'mobile-text-muted': '#4A5568',
        'mobile-text-disabled': '#64748B',

        // Borders
        'mobile-border-default': '#2D3748',
        'mobile-border-subtle': '#1E2835',
        'mobile-border-active': '#0969DA',
        'mobile-border-focus': '#0969DA',
        'mobile-border-error': '#DA3633',
        'mobile-border-card': '#334155',

        // Accents
        'mobile-accent-primary': '#0969DA',
        'mobile-accent-primary-hover': '#0860CA',
        'mobile-accent-success': '#2EA043',
        'mobile-accent-warning': '#D29922',
        'mobile-accent-error': '#DA3633',
        'mobile-accent-agent': '#8B5CF6',
        'mobile-accent-assistant': '#06B6D4',
        'mobile-accent-gold': '#F59E0B',

        // Icons
        'mobile-icon-default': '#6E7681',
        'mobile-icon-active': '#FFFFFF',
        'mobile-icon-agent': '#8B5CF6',
        'mobile-icon-assistant': '#06B6D4',
        'mobile-icon-success': '#2EA043',
        'mobile-icon-error': '#DA3633',

        // Navigation
        'mobile-nav-active': '#FFFFFF',
        'mobile-nav-inactive': '#6E7681',
        'mobile-nav-indicator': '#0969DA',
      },

      // Border radius from design tokens
      borderRadius: {
        'mobile-sm': '4px',
        'mobile-base': '6px',
        'mobile-md': '8px',
        'mobile-lg': '12px',
        'mobile-xl': '16px',
        'mobile-full': '9999px',
      },

      // Font families from design tokens
      fontFamily: {
        'mobile-sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mobile-mono': ['SF Mono', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },

      // Font weights from design tokens
      fontWeight: {
        'mobile-regular': '400',
        'mobile-medium': '500',
        'mobile-semibold': '600',
        'mobile-bold': '700',
      },

      // Letter spacing from design tokens
      letterSpacing: {
        'mobile-tight': '-0.025em',
        'mobile-normal': '0em',
        'mobile-wide': '0.025em',
        'mobile-wider': '0.05em',
        'mobile-widest': '0.5px',
      },

      // Z-index from design tokens
      zIndex: {
        'mobile-base': '0',
        'mobile-dropdown': '1000',
        'mobile-sticky': '1100',
        'mobile-fixed': '1200',
        'mobile-modal-backdrop': '1300',
        'mobile-modal': '1400',
        'mobile-popover': '1500',
        'mobile-tooltip': '1600',
      },

      // Width/height for component specifications
      width: {
        'mobile-header': '56px',
        'mobile-nav': '64px',
        'mobile-nav-item': '48px',
        'mobile-icon-xs': '16px',
        'mobile-icon-sm': '20px',
        'mobile-icon-base': '24px',
        'mobile-icon-lg': '32px',
        'mobile-avatar-sm': '32px',
        'mobile-avatar-base': '48px',
        'mobile-avatar-lg': '64px',
        'mobile-avatar-xl': '96px',
      },

      height: {
        'mobile-header': '56px',
        'mobile-nav': '64px',
        'mobile-nav-item': '48px',
        'mobile-button-sm': '32px',
        'mobile-button-base': '40px',
        'mobile-button-md': '44px',
        'mobile-button-lg': '48px',
        'mobile-button-xl': '56px',
        'mobile-input-sm': '32px',
        'mobile-input-base': '40px',
        'mobile-input-md': '44px',
        'mobile-icon-xs': '16px',
        'mobile-icon-sm': '20px',
        'mobile-icon-base': '24px',
        'mobile-icon-lg': '32px',
        'mobile-avatar-sm': '32px',
        'mobile-avatar-base': '48px',
        'mobile-avatar-lg': '64px',
        'mobile-avatar-xl': '96px',
      },

      // Max width from design tokens
      maxWidth: {
        'mobile-sm': '320px',
        'mobile-md': '560px',
        'mobile-lg': '768px',
        'mobile-xl': '1024px',
      },

      // Gap utilities from design tokens
      gap: {
        'mobile-tight': '4px',
        'mobile-base': '8px',
        'mobile-relaxed': '12px',
        'mobile-loose': '16px',
      },

      // Transition duration from design tokens
      transitionDuration: {
        'mobile-instant': '100ms',
        'mobile-fast': '150ms',
        'mobile-base': '200ms',
        'mobile-slow': '300ms',
        'mobile-slower': '500ms',
      },

      // Transition timing functions from design tokens
      transitionTimingFunction: {
        'mobile-ease': 'ease',
        'mobile-ease-in': 'ease-in',
        'mobile-ease-out': 'ease-out',
        'mobile-ease-in-out': 'ease-in-out',
        'mobile-linear': 'linear',
      },

      // Scale from design tokens
      scale: {
        'mobile-active': '0.98',
        'mobile-hover': '1.02',
      },

      // Opacity from design tokens
      opacity: {
        'mobile-disabled': '0.4',
        'mobile-muted': '0.6',
        'mobile-hover': '0.8',
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
