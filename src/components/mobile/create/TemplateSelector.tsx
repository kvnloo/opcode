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
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
              selected === template.id
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            {template.icon}
            <span>{template.name}</span>
            {template.badge && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {template.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected template description */}
      <p className="text-sm text-muted-foreground text-center">
        {TEMPLATES.find(t => t.id === selected)?.description}
      </p>
    </div>
  );
}
