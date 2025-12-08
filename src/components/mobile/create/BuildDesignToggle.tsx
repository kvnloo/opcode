import { Wrench, Paintbrush } from 'lucide-react';

interface BuildDesignToggleProps {
  value: 'build' | 'design';
  onChange: (value: 'build' | 'design') => void;
}

export function BuildDesignToggle({ value, onChange }: BuildDesignToggleProps) {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex p-1"
        style={{
          backgroundColor: 'var(--mobile-bg-secondary)',
          borderRadius: 'var(--mobile-radius-lg)',
          gap: 'var(--mobile-space-1)',
        }}
      >
        <button
          onClick={() => onChange('build')}
          className="mobile-touch-target flex items-center gap-2 px-4 transition-all"
          style={{
            minHeight: 'var(--mobile-touch-target-min)',
            borderRadius: 'var(--mobile-radius-md)',
            fontSize: 'var(--mobile-font-size-md)',
            fontWeight: 'var(--mobile-font-weight-medium)',
            backgroundColor: value === 'build' ? 'var(--mobile-bg-primary)' : 'transparent',
            color: value === 'build' ? 'var(--mobile-text-primary)' : 'var(--mobile-text-tertiary)',
            boxShadow: value === 'build' ? 'var(--mobile-shadow-sm)' : 'none',
          }}
        >
          <Wrench size={16} />
          <span>Build</span>
        </button>
        <button
          onClick={() => onChange('design')}
          className="mobile-touch-target flex items-center gap-2 px-4 transition-all"
          style={{
            minHeight: 'var(--mobile-touch-target-min)',
            borderRadius: 'var(--mobile-radius-md)',
            fontSize: 'var(--mobile-font-size-md)',
            fontWeight: 'var(--mobile-font-weight-medium)',
            backgroundColor: value === 'design' ? 'var(--mobile-bg-primary)' : 'transparent',
            color: value === 'design' ? 'var(--mobile-text-primary)' : 'var(--mobile-text-tertiary)',
            boxShadow: value === 'design' ? 'var(--mobile-shadow-sm)' : 'none',
          }}
        >
          <Paintbrush size={16} />
          <span>Design</span>
          <span
            className="px-1.5 py-0.5 rounded"
            style={{
              fontSize: 'var(--mobile-font-size-xs)',
              backgroundColor: 'var(--mobile-accent-warning)',
              color: 'var(--mobile-bg-primary)',
              fontWeight: 'var(--mobile-font-weight-semibold)',
            }}
          >
            Beta
          </span>
        </button>
      </div>
    </div>
  );
}
