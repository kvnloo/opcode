import React from 'react';
import {
  BarChart3,
  User,
  Moon,
  Bell,
  HelpCircle,
  BookOpen,
  Info,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SettingsItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  external?: boolean;
  destructive?: boolean;
  hasToggle?: boolean;
}

interface SettingsSection {
  title?: string;
  items: SettingsItem[];
}

export function SettingsList() {
  const sections: SettingsSection[] = [
    {
      title: 'PROFILE',
      items: [
        {
          icon: <User size={20} />,
          label: 'Edit Profile',
          onClick: () => console.log('Edit Profile'),
        },
      ],
    },
    {
      title: 'THEME',
      items: [
        {
          icon: <Moon size={20} />,
          label: 'Theme',
          onClick: () => console.log('Theme'),
        },
      ],
    },
    {
      title: 'PLAN',
      items: [
        {
          icon: <BarChart3 size={20} />,
          label: 'Usage',
          onClick: () => console.log('Usage'),
        },
      ],
    },
    {
      title: 'NOTIFICATIONS',
      items: [
        {
          icon: <Bell size={20} />,
          label: 'Notifications',
          onClick: () => console.log('Notifications'),
          hasToggle: true,
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          icon: <HelpCircle size={20} />,
          label: 'Help',
          onClick: () => console.log('Help'),
        },
        {
          icon: <BookOpen size={20} />,
          label: 'Docs',
          external: true,
          onClick: () => console.log('Docs'),
        },
      ],
    },
    {
      title: 'OTHER',
      items: [
        {
          icon: <Info size={20} />,
          label: 'About',
          onClick: () => console.log('About'),
        },
        {
          icon: <Settings size={20} />,
          label: 'Manage Account',
          onClick: () => console.log('Manage'),
        },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mobile-space-6)' }}>
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {/* Section header - 11px, bold, uppercase, 0.5px letter spacing */}
          {section.title && (
            <h3
              style={{
                fontSize: 'var(--mobile-font-size-xs)', // 11px
                fontWeight: 'var(--mobile-font-weight-bold)', // 600
                fontFamily: 'var(--mobile-font-sans)',
                color: 'var(--mobile-text-tertiary)', // #6E7681
                textTransform: 'uppercase',
                letterSpacing: 'var(--mobile-letter-spacing-widest)', // 0.5px
                paddingLeft: 'var(--mobile-space-4)', // 16px per Replit
                margin: 0,
                marginTop: sectionIndex > 0 ? 'var(--mobile-space-6)' : 0, // 24px between sections
                marginBottom: 'var(--mobile-space-2)', // 8px per Replit
              }}
            >
              {section.title}
            </h3>
          )}
          {/* Items container - transparent background, no card style */}
          <div
            style={{
              backgroundColor: 'transparent', // Transparent per Replit
              borderRadius: 0,
              overflow: 'hidden',
            }}
          >
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.onClick}
                className="mobile-tap-highlight mobile-no-select"
                style={{
                  width: '100%',
                  height: '56px', // Exact 56px height per Replit
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--mobile-space-3)', // 12px gap
                  padding: '0 var(--mobile-space-4)', // 16px padding
                  backgroundColor: 'transparent',
                  borderWidth: '0',
                  borderBottomWidth: itemIndex < section.items.length - 1 ? '1px' : '0',
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'var(--mobile-border-subtle)', // #1E2835
                  color: item.destructive ? 'var(--mobile-accent-error)' : 'var(--mobile-text-primary)',
                  fontSize: 'var(--mobile-font-size-xl)', // 16px per Replit
                  fontFamily: 'var(--mobile-font-sans)',
                  fontWeight: 'var(--mobile-font-weight-regular)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color var(--mobile-transition-fast) var(--mobile-transition-ease)', // 150ms
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-bg-secondary)'} // #1E2835
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label={item.label}
              >
                {/* Icon - 20x20px */}
                <span
                  style={{
                    color: item.destructive ? 'var(--mobile-accent-error)' : 'var(--mobile-icon-default)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </span>

                {/* Label - 16px */}
                <span style={{ flex: 1 }}>
                  {item.label}
                </span>

                {/* Right content - chevron or external link icon */}
                {item.external && (
                  <ExternalLink size={16} style={{ color: 'var(--mobile-icon-default)', flexShrink: 0 }} aria-hidden="true" />
                )}
                {!item.external && !item.hasToggle && !item.destructive && (
                  <ChevronRight size={20} style={{ color: 'var(--mobile-icon-default)', flexShrink: 0 }} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Log Out - Separate at bottom, transparent background */}
      <div
        style={{
          backgroundColor: 'transparent',
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => console.log('Logout')}
          className="mobile-tap-highlight mobile-no-select"
          style={{
            width: '100%',
            height: '56px', // Exact 56px height per Replit
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--mobile-space-3)', // 12px gap
            padding: '0 var(--mobile-space-4)', // 16px padding
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--mobile-accent-error)', // #DA3633
            fontSize: 'var(--mobile-font-size-xl)', // 16px per Replit
            fontFamily: 'var(--mobile-font-sans)',
            fontWeight: 'var(--mobile-font-weight-regular)',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background-color var(--mobile-transition-fast) var(--mobile-transition-ease)', // 150ms
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-bg-secondary)'} // #1E2835
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Log out, warning"
          role="button"
        >
          {/* Icon - 20x20px, red color */}
          <span
            style={{
              color: 'var(--mobile-accent-error)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={20} />
          </span>

          {/* Label - Red color */}
          <span style={{ flex: 1 }}>
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
}
