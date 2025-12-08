import { motion } from 'framer-motion';
import { Globe, Lock } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  author: string;
  isPublic: boolean;
  previewImage?: string;
  status?: 'waiting' | 'running' | 'stopped';
  onClick?: () => void;
}

export function ProjectCard({
  name,
  author,
  isPublic,
  previewImage,
  status,
  onClick
}: ProjectCardProps) {
  return (
    <motion.div
      className="mobile-tap-highlight cursor-pointer"
      style={{
        background: 'var(--mobile-bg-app-card)',
        border: '1px solid var(--mobile-border-card)',
        borderRadius: 'var(--mobile-card-radius)',
        overflow: 'hidden',
        transition: `box-shadow var(--mobile-transition-fast) var(--mobile-transition-ease-out)`
      }}
      whileTap={{ scale: Number(getComputedStyle(document.documentElement).getPropertyValue('--mobile-animation-scale-active')) }}
      whileHover={{ boxShadow: 'var(--mobile-shadow-md)' }}
      onClick={onClick}
    >
      {/* Preview Image */}
      <div
        className="aspect-video relative"
        style={{
          background: 'var(--mobile-bg-app-preview)',
          borderTopLeftRadius: 'var(--mobile-card-radius)',
          borderTopRightRadius: 'var(--mobile-card-radius)'
        }}
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📱</span>
          </div>
        )}

        {/* Status Badge */}
        {status === 'waiting' && (
          <div
            className="absolute top-2 left-2"
            style={{
              background: 'rgba(210, 153, 34, 0.9)', // var(--mobile-accent-warning) with 90% opacity
              color: 'white',
              fontSize: 'var(--mobile-font-size-xs)',
              padding: '4px 8px',
              borderRadius: 'var(--mobile-radius-sm)',
              fontWeight: 'var(--mobile-font-weight-medium)'
            }}
          >
            Waiting for you
          </div>
        )}
      </div>

      {/* Project Info */}
      <div style={{ padding: 'var(--mobile-card-padding)' }}>
        <div className="flex items-start justify-between">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h3
              style={{
                fontSize: 'var(--mobile-font-size-md)',
                fontWeight: 'var(--mobile-font-weight-semibold)',
                color: 'var(--mobile-text-primary)',
                margin: 0
              }}
            >
              {name}
            </h3>
            <p
              style={{
                fontSize: 'var(--mobile-font-size-sm)',
                color: 'var(--mobile-text-tertiary)',
                margin: 0
              }}
            >
              {author}
            </p>
          </div>

          {/* Public/Private Indicator */}
          <div
            className="flex items-center"
            style={{
              gap: '4px',
              color: 'var(--mobile-text-tertiary)',
              fontSize: 'var(--mobile-font-size-xs)'
            }}
          >
            {isPublic ? (
              <>
                <Globe size={14} />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Private</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
