import { Wrench, Paintbrush } from 'lucide-react';

interface BuildDesignToggleProps {
  value: 'build' | 'design';
  onChange: (value: 'build' | 'design') => void;
}

export function BuildDesignToggle({ value, onChange }: BuildDesignToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex bg-muted rounded-lg p-1">
        <button
          onClick={() => onChange('build')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            value === 'build'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wrench size={16} />
          <span>Build</span>
        </button>
        <button
          onClick={() => onChange('design')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            value === 'design'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Paintbrush size={16} />
          <span>Design</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            Beta
          </span>
        </button>
      </div>
    </div>
  );
}
