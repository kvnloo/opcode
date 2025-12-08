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
          {section.title && (
            <h3
              style={{
                fontSize: 'var(--mobile-font-size-xs)',
                fontWeight: 'var(--mobile-font-weight-semibold)',
                fontFamily: 'var(--mobile-font-sans)',
                color: 'var(--mobile-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--mobile-letter-spacing-wider)',
                marginBottom: 'var(--mobile-space-2)',
                paddingLeft: 'var(--mobile-space-1)',
              }}
            >
              {section.title}
            </h3>
          )}
          <div
            style={{
              backgroundColor: 'var(--mobile-bg-card)',
              borderRadius: 'var(--mobile-card-radius)',
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
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--mobile-space-3)',
                  padding: '0 var(--mobile-space-4)',
                  backgroundColor: 'transparent',
                  borderWidth: '0',
                  borderBottomWidth: itemIndex < section.items.length - 1 ? '1px' : '0',
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'var(--mobile-border-subtle)',
                  color: item.destructive ? 'var(--mobile-accent-error)' : 'var(--mobile-text-primary)',
                  fontSize: 'var(--mobile-font-size-md)',
                  fontFamily: 'var(--mobile-font-sans)',
                  fontWeight: 'var(--mobile-font-weight-regular)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color var(--mobile-transition-base) var(--mobile-transition-ease)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Icon */}
                <span style={{ color: item.destructive ? 'var(--mobile-accent-error)' : 'var(--mobile-icon-default)', flexShrink: 0 }}>
                  {item.icon}
                </span>

                {/* Label */}
                <span style={{ flex: 1 }}>
                  {item.label}
                </span>

                {/* Right content */}
                {item.external && (
                  <ExternalLink size={16} style={{ color: 'var(--mobile-icon-default)', flexShrink: 0 }} />
                )}
                {!item.external && !item.hasToggle && !item.destructive && (
                  <ChevronRight size={16} style={{ color: 'var(--mobile-icon-default)', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Log Out - Separate at bottom */}
      <div
        style={{
          backgroundColor: 'var(--mobile-bg-card)',
          borderRadius: 'var(--mobile-card-radius)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => console.log('Logout')}
          className="mobile-tap-highlight mobile-no-select"
          style={{
            width: '100%',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--mobile-space-3)',
            padding: '0 var(--mobile-space-4)',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--mobile-accent-error)',
            fontSize: 'var(--mobile-font-size-md)',
            fontFamily: 'var(--mobile-font-sans)',
            fontWeight: 'var(--mobile-font-weight-regular)',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background-color var(--mobile-transition-base) var(--mobile-transition-ease)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* Icon */}
          <span style={{ color: 'var(--mobile-accent-error)', flexShrink: 0 }}>
            <LogOut size={20} />
          </span>

          {/* Label */}
          <span style={{ flex: 1 }}>
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
}
