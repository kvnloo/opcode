import React from 'react';
import {
  BarChart3,
  User,
  Moon,
  Users,
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
  rightContent?: React.ReactNode;
}

interface SettingsSection {
  title?: string;
  items: SettingsItem[];
}

export function SettingsList() {
  const sections: SettingsSection[] = [
    {
      items: [
        {
          icon: <BarChart3 size={20} />,
          label: 'Usage',
          onClick: () => console.log('Usage'),
        },
      ],
    },
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
          label: 'Theme - Dark',
          onClick: () => console.log('Theme'),
          rightContent: <ChevronRight size={16} className="text-muted-foreground" />,
        },
      ],
    },
    {
      title: 'TEAMS',
      items: [
        {
          icon: <Users size={20} />,
          label: 'Get Teams',
          external: true,
          onClick: () => console.log('Teams'),
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
        {
          icon: <LogOut size={20} />,
          label: 'Log Out',
          destructive: true,
          onClick: () => console.log('Logout'),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.title && (
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {section.title}
            </h3>
          )}
          <div className="bg-card rounded-lg overflow-hidden divide-y divide-border">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors ${
                  item.destructive ? 'text-destructive' : 'text-foreground'
                }`}
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.external && <ExternalLink size={16} className="text-muted-foreground" />}
                {item.rightContent}
                {!item.external && !item.rightContent && !item.destructive && (
                  <ChevronRight size={16} className="text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
