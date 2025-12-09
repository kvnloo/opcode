import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  FileEdit,
  Clock,
  Code,
  Monitor,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
  Search,
  Lock,
  Database,
  Users,
  Plus,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import * as Collapsible from '@radix-ui/react-collapsible';

// Types
export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: string;
}

export interface Checkpoint {
  id: string;
  timestamp: number;
  summary: string;
  filesChanged: string[];
}

export type AgentStatus = 'idle' | 'running' | 'error' | 'complete';

export interface AgentPaneProps {
  tasks: Task[];
  currentTask: Task | null;
  agentStatus: AgentStatus;
  checkpoints?: Checkpoint[];
  workDuration?: number; // in minutes
  error?: string;
  onRollback?: (checkpointId: string) => void;
  onViewChanges?: () => void;
  onViewPreview?: () => void;
  onOpenTool?: (toolId: string) => void;
  className?: string;
}

export function AgentPane({
  tasks,
  currentTask,
  agentStatus,
  checkpoints = [],
  workDuration,
  error,
  onRollback,
  onViewChanges,
  onViewPreview,
  onOpenTool,
  className,
}: AgentPaneProps) {
  const [isProgressExpanded, setIsProgressExpanded] = useState(true);
  const [isTaskExpanded, setIsTaskExpanded] = useState(true);
  const [isDurationExpanded, setIsDurationExpanded] = useState(false);
  const [isUpgradeVisible, setIsUpgradeVisible] = useState(true);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div data-testid="pane-agent" className={cn('flex flex-col h-full bg-background', className)}>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 1. Task Progress Header */}
          <Collapsible.Root open={isProgressExpanded} onOpenChange={setIsProgressExpanded}>
            <Collapsible.Trigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 flex-1">
                  <motion.div
                    animate={{ rotate: isProgressExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} className="text-muted-foreground" />
                  </motion.div>
                  <span className="font-medium text-foreground">Task Progress</span>
                  {agentStatus === 'running' && (
                    <Loader2 size={16} className="text-blue-500 animate-spin" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
              </button>
            </Collapsible.Trigger>

            <Collapsible.Content>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'p-3 rounded-lg border transition-colors',
                        task.status === 'completed' && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900',
                        task.status === 'in_progress' && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900',
                        task.status === 'error' && 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900',
                        task.status === 'pending' && 'bg-card border-border'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {task.status === 'completed' && (
                          <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        {task.status === 'in_progress' && (
                          <Loader2 size={18} className="text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                        )}
                        {task.status === 'error' && (
                          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        {task.status === 'pending' && (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{task.description}</p>
                          {task.error && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{task.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* 2. Task Details Card */}
          {currentTask && (
            <Collapsible.Root open={isTaskExpanded} onOpenChange={setIsTaskExpanded}>
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Collapsible.Trigger asChild>
                  <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Task</span>
                      <motion.div
                        animate={{ rotate: isTaskExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-muted-foreground" />
                      </motion.div>
                    </div>
                  </button>
                </Collapsible.Trigger>

                <Collapsible.Content>
                  <div className="px-3 pb-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      {currentTask.description}
                    </p>
                  </div>
                </Collapsible.Content>
              </div>
            </Collapsible.Root>
          )}

          {/* 3. Current Action Section */}
          {currentTask && currentTask.status === 'in_progress' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900"
            >
              <div className="flex items-start gap-3">
                <Loader2 size={20} className="text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Now let me...
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <FileEdit size={16} />
                    <span>Making code changes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Agent encountered an error while running, we are investigating
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. Checkpoint Section */}
          {checkpoints.length > 0 && (
            <div className="space-y-3">
              {checkpoints.map((checkpoint) => (
                <motion.div
                  key={checkpoint.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {getRelativeTime(checkpoint.timestamp)}
                      </p>
                      <p className="text-sm font-medium text-foreground">{checkpoint.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <HapticButton
                      onClick={() => onRollback?.(checkpoint.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-md"
                      hapticType="light"
                    >
                      <Clock size={14} />
                      <span>Rollback here</span>
                    </HapticButton>

                    <HapticButton
                      onClick={onViewChanges}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-md"
                      hapticType="light"
                    >
                      <Code size={14} />
                      <span>Changes</span>
                    </HapticButton>

                    <HapticButton
                      onClick={onViewPreview}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-md"
                      hapticType="light"
                    >
                      <Monitor size={14} />
                      <span>View preview</span>
                    </HapticButton>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 6. Work Duration */}
          {workDuration && workDuration > 0 && (
            <Collapsible.Root open={isDurationExpanded} onOpenChange={setIsDurationExpanded}>
              <Collapsible.Trigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      Worked for {workDuration} minute{workDuration !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isDurationExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </motion.div>
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      Agent has been working on this task for {workDuration} minute
                      {workDuration !== 1 ? 's' : ''}. You can review progress above.
                    </p>
                  </div>
                </motion.div>
              </Collapsible.Content>
            </Collapsible.Root>
          )}

          {/* 7. Upgrade Card */}
          {isUpgradeVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-900 relative overflow-hidden"
            >
              <button
                onClick={() => setIsUpgradeVisible(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/50 dark:hover:bg-black/50 transition-colors"
                aria-label="Dismiss upgrade card"
              >
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>

              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Star size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Upgrade to Core</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Unlock unlimited agent runs, faster processing, and priority support
                  </p>
                  <ul className="space-y-1 mb-3">
                    <li className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />
                      <span>Unlimited agent executions</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />
                      <span>10x faster processing</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <HapticButton
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                    hapticType="medium"
                  >
                    Upgrade now
                  </HapticButton>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 8. QuickAccessBar (Fixed at bottom) */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-3 space-y-3">
        {/* Quick Tools Row */}
        <div className="grid grid-cols-4 gap-2">
          <HapticButton
            onClick={() => onOpenTool?.('secrets')}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
            hapticType="light"
          >
            <Lock size={20} />
            <span className="text-xs">Secrets</span>
          </HapticButton>

          <HapticButton
            onClick={() => onOpenTool?.('database')}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
            hapticType="light"
          >
            <Database size={20} />
            <span className="text-xs">Database</span>
          </HapticButton>

          <HapticButton
            onClick={() => onOpenTool?.('auth')}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
            hapticType="light"
          >
            <Users size={20} />
            <span className="text-xs">Auth</span>
          </HapticButton>

          <HapticButton
            onClick={() => onOpenTool?.('new-tab')}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
            hapticType="light"
          >
            <Plus size={20} />
            <span className="text-xs">New Tab</span>
          </HapticButton>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search tools and files..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
