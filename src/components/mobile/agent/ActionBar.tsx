import { motion } from 'framer-motion';
import { Undo2, FileText, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  onRollback: () => void;
  onViewChanges: () => void;
  onPreview: () => void;
  status: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
  hasChanges: boolean;
  className?: string;
}

export function ActionBar({
  onRollback,
  onViewChanges,
  onPreview,
  status,
  hasChanges,
  className
}: ActionBarProps) {
  const isRunning = status === 'running';
  const canRollback = status === 'completed' || status === 'error';
  const canPreview = status === 'completed';

  const handleButtonTap = (action: () => void) => {
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'border-t border-border bg-card p-4 safe-area-bottom',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Rollback Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonTap(onRollback)}
          disabled={!canRollback || isRunning}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all',
            canRollback && !isRunning
              ? 'bg-muted hover:bg-muted/80 text-foreground active:bg-muted/60'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
          )}
          aria-label="Rollback changes"
        >
          <Undo2 size={18} />
          <span className="text-sm">Rollback</span>
        </motion.button>

        {/* View Changes Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonTap(onViewChanges)}
          disabled={!hasChanges}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all relative',
            hasChanges
              ? 'bg-primary/10 hover:bg-primary/20 text-primary active:bg-primary/30'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
          )}
          aria-label="View changes"
        >
          <FileText size={18} />
          <span className="text-sm">Changes</span>
          {hasChanges && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
            />
          )}
        </motion.button>

        {/* Preview Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonTap(onPreview)}
          disabled={!canPreview || isRunning}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all',
            canPreview && !isRunning
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:bg-primary/80'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
          )}
          aria-label="Preview"
        >
          <Play size={18} />
          <span className="text-sm">Preview</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
