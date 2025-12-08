import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutGrid,
  Terminal,
  Monitor,
  Radio,
  Share2,
  Plus,
  MoreVertical,
  Trash2,
  Smartphone,
} from 'lucide-react';
import { HapticButton } from '../common/HapticButton';
import { cn } from '@/lib/utils';

export type WorkspacePane =
  | 'agent'
  | 'console'
  | 'preview'
  | 'publishing'
  | 'share';

interface WorkspaceHeaderProps {
  /**
   * Currently active pane
   */
  activePane: WorkspacePane;

  /**
   * Project name to display
   */
  projectName: string;

  /**
   * Callback when back/exit button is pressed
   */
  onBack: () => void;

  /**
   * Callback when menu button is pressed
   */
  onMenuClick: () => void;

  /**
   * Optional custom actions for the current pane
   */
  paneActions?: ReactNode;

  /**
   * Optional className for additional styling
   */
  className?: string;
}

interface PaneConfig {
  title: string;
  icon: any; // Lucide icon component
  actions: (props: WorkspaceHeaderProps) => ReactNode;
}

// Pane-specific action components
const AgentActions = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <>
    <HapticButton
      hapticType="light"
      onClick={() => {
        // TODO: Implement add task functionality
      }}
      className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
      aria-label="Add task"
    >
      <Plus size={20} />
    </HapticButton>
    <HapticButton
      hapticType="light"
      onClick={onMenuClick}
      className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
      aria-label="Open menu"
    >
      <MoreVertical size={20} />
    </HapticButton>
  </>
);

const ConsoleActions = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <>
    <HapticButton
      hapticType="medium"
      onClick={() => {
        // TODO: Implement clear console functionality
      }}
      className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
      aria-label="Clear console"
    >
      <Trash2 size={20} />
    </HapticButton>
    <HapticButton
      hapticType="light"
      onClick={onMenuClick}
      className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
      aria-label="Open menu"
    >
      <MoreVertical size={20} />
    </HapticButton>
  </>
);

const PreviewActions = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const [showFrame, setShowFrame] = React.useState(true);

  return (
    <>
      <HapticButton
        hapticType="light"
        onClick={() => {
          setShowFrame(!showFrame);
          // TODO: Implement device frame toggle
        }}
        className={cn(
          'p-2 hover:text-foreground bg-transparent',
          showFrame ? 'text-primary' : 'text-muted-foreground'
        )}
        aria-label={showFrame ? 'Hide device frame' : 'Show device frame'}
      >
        <Smartphone size={20} />
      </HapticButton>
      <HapticButton
        hapticType="light"
        onClick={onMenuClick}
        className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
        aria-label="Open menu"
      >
        <MoreVertical size={20} />
      </HapticButton>
    </>
  );
};

const PublishingActions = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <HapticButton
    hapticType="light"
    onClick={onMenuClick}
    className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
    aria-label="Open menu"
  >
    <MoreVertical size={20} />
  </HapticButton>
);

const ShareActions = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <HapticButton
    hapticType="light"
    onClick={onMenuClick}
    className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
    aria-label="Open menu"
  >
    <MoreVertical size={20} />
  </HapticButton>
);

// Pane configurations
const PANE_CONFIGS: Record<WorkspacePane, PaneConfig> = {
  agent: {
    title: 'Agent',
    icon: LayoutGrid,
    actions: (props) => <AgentActions onMenuClick={props.onMenuClick} />,
  },
  console: {
    title: 'Console',
    icon: Terminal,
    actions: (props) => <ConsoleActions onMenuClick={props.onMenuClick} />,
  },
  preview: {
    title: 'Preview',
    icon: Monitor,
    actions: (props) => <PreviewActions onMenuClick={props.onMenuClick} />,
  },
  publishing: {
    title: 'Publishing',
    icon: Radio,
    actions: (props) => <PublishingActions onMenuClick={props.onMenuClick} />,
  },
  share: {
    title: 'Share',
    icon: Share2,
    actions: (props) => <ShareActions onMenuClick={props.onMenuClick} />,
  },
};

/**
 * WorkspaceHeader component for mobile workspace
 *
 * Provides navigation, pane identification, and pane-specific actions
 * with smooth transitions and haptic feedback.
 *
 * Features:
 * - Animated title transitions when pane changes
 * - Pane-specific action buttons
 * - Safe area support for notched devices
 * - Haptic feedback on interactions
 * - Dark theme with consistent styling
 *
 * @example
 * ```tsx
 * <WorkspaceHeader
 *   activePane="agent"
 *   projectName="My Project"
 *   onBack={() => navigate('/apps')}
 *   onMenuClick={() => setMenuOpen(true)}
 * />
 * ```
 */
export function WorkspaceHeader({
  activePane,
  projectName,
  onBack,
  onMenuClick,
  paneActions,
  className,
}: WorkspaceHeaderProps) {
  const config = PANE_CONFIGS[activePane];
  const Icon = config.icon;

  return (
    <header
      className={cn(
        'flex items-center justify-between',
        'bg-card border-b border-border',
        'px-4 h-14',
        // Safe area support for notched devices
        'pt-safe',
        className
      )}
    >
      {/* Left: Back/Exit button */}
      <HapticButton
        hapticType="medium"
        onClick={onBack}
        className="p-2 text-muted-foreground hover:text-foreground bg-transparent"
        aria-label="Exit workspace"
      >
        <X size={24} />
      </HapticButton>

      {/* Center: Pane title with icon */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePane}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="flex items-center gap-2"
          >
            <Icon size={20} className="text-foreground" />
            <h1 className="text-base font-semibold text-foreground">
              {config.title}
            </h1>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: Pane-specific actions */}
      <div className="flex items-center gap-1">
        {paneActions || config.actions({ activePane, projectName, onBack, onMenuClick })}
      </div>
    </header>
  );
}
