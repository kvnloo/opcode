import React from 'react';
import { Globe, Smartphone, BarChart3, Gamepad2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

const TEMPLATES: Template[] = [
  { id: 'web', name: 'Web app', icon: <Globe size={20} />, description: 'Full-stack web applications' },
  { id: 'mobile', name: 'Mobile app', icon: <Smartphone size={20} />, description: 'Native apps for iOS and Android', badge: 'Beta' },
  { id: 'data', name: 'Data app', icon: <BarChart3 size={20} />, description: 'Data analysis and visualization' },
  { id: '3d', name: '3D Game', icon: <Gamepad2 size={20} />, description: 'Interactive 3D experiences' },
];

interface TemplateSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div
      className="space-y-2"
      style={{
        gap: 'var(--mobile-space-2)',
      }}
    >
      <div
        className="flex gap-2 overflow-x-auto pb-2 mobile-smooth-scroll"
        style={{
          marginLeft: 'calc(var(--mobile-space-6) * -1)',
          marginRight: 'calc(var(--mobile-space-6) * -1)',
          paddingLeft: 'var(--mobile-space-6)',
          paddingRight: 'var(--mobile-space-6)',
          gap: 'var(--mobile-space-2)',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap transition-all mobile-active-scale"
            style={{
              borderRadius: 'var(--mobile-radius-lg)',
              fontSize: 'var(--mobile-font-size-md)',
              fontWeight: 'var(--mobile-font-weight-medium)',
              border: '1px solid',
              borderColor: selected === template.id
                ? 'var(--mobile-accent-primary)'
                : 'var(--mobile-border-default)',
              backgroundColor: selected === template.id
                ? 'rgba(9, 105, 218, 0.1)'
                : 'transparent',
              color: selected === template.id
                ? 'var(--mobile-accent-primary)'
                : 'var(--mobile-text-tertiary)',
              scrollSnapAlign: 'start',
            }}
          >
            {template.icon}
            <span>{template.name}</span>
            {template.badge && (
              <span
                className="px-1.5 py-0.5 rounded"
                style={{
                  fontSize: 'var(--mobile-font-size-xs)',
                  backgroundColor: 'rgba(9, 105, 218, 0.1)',
                  color: 'var(--mobile-accent-primary)',
                  fontWeight: 'var(--mobile-font-weight-semibold)',
                }}
              >
                {template.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected template description */}
      <p
        className="text-center"
        style={{
          fontSize: 'var(--mobile-font-size-sm)',
          color: 'var(--mobile-text-tertiary)',
        }}
      >
        {TEMPLATES.find(t => t.id === selected)?.description}
      </p>
    </div>
  );
}
