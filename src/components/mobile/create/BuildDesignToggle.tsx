import { Wrench, Paintbrush } from 'lucide-react';

interface BuildDesignToggleProps {
  value: 'build' | 'design';
  onChange: (value: 'build' | 'design') => void;
}

export function BuildDesignToggle({ value, onChange }: BuildDesignToggleProps) {
  return (
    <div className="flex">
      <div
        className="inline-flex"
        style={{
          gap: 'var(--mobile-space-3)',
        }}
      >
        <button
          onClick={() => onChange('build')}
          className="flex items-center gap-2 transition-all mobile-active-scale"
          style={{
            padding: '12px 20px',
            minHeight: 'var(--mobile-touch-target-min)',
            borderRadius: 'var(--mobile-radius-md)',
            fontSize: 'var(--mobile-font-size-md)',
            fontWeight: 'var(--mobile-font-weight-medium)',
            border: '1px solid',
            borderColor: value === 'build' ? 'transparent' : 'var(--mobile-border-default)',
            backgroundColor: value === 'build' ? 'var(--mobile-accent-primary)' : 'var(--mobile-bg-secondary)',
            color: value === 'build' ? '#FFFFFF' : 'var(--mobile-text-tertiary)',
            transitionProperty: 'all',
            transitionDuration: 'var(--mobile-transition-base)',
            transitionTimingFunction: 'ease-in-out',
          }}
        >
          <Wrench size={20} />
          <span>Build</span>
        </button>
        <button
          onClick={() => onChange('design')}
          className="flex items-center gap-2 transition-all mobile-active-scale"
          style={{
            padding: '12px 20px',
            minHeight: 'var(--mobile-touch-target-min)',
            borderRadius: 'var(--mobile-radius-md)',
            fontSize: 'var(--mobile-font-size-md)',
            fontWeight: 'var(--mobile-font-weight-medium)',
            border: '1px solid',
            borderColor: value === 'design' ? 'transparent' : 'var(--mobile-border-default)',
            backgroundColor: value === 'design' ? 'var(--mobile-accent-primary)' : 'var(--mobile-bg-secondary)',
            color: value === 'design' ? '#FFFFFF' : 'var(--mobile-text-tertiary)',
            transitionProperty: 'all',
            transitionDuration: 'var(--mobile-transition-base)',
            transitionTimingFunction: 'ease-in-out',
          }}
        >
          <Paintbrush size={20} />
          <span>Design</span>
          <span
            className="px-1.5 py-0.5 rounded"
            style={{
              fontSize: 'var(--mobile-font-size-xs)',
              backgroundColor: 'var(--mobile-accent-primary)',
              color: '#FFFFFF',
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
