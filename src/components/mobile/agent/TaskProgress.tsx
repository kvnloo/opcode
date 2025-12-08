import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentTask } from './AgentExecutionView';

interface TaskProgressProps {
  tasks: AgentTask[];
  currentTaskIndex: number;
  className?: string;
}

export function TaskProgress({ tasks, currentTaskIndex, className }: TaskProgressProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const getTaskIcon = (task: AgentTask, _index: number) => {
    if (task.status === 'completed') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </motion.div>
      );
    }

    if (task.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }

    if (task.status === 'in_progress') {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }

    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const getTaskDuration = (task: AgentTask) => {
    if (!task.startTime) return null;
    const end = task.endTime || Date.now();
    const duration = Math.round((end - task.startTime) / 1000);
    return `${duration}s`;
  };

  return (
    <div className={cn('px-4 py-3 space-y-2', className)}>
      {tasks.map((task, index) => {
        const isExpanded = expandedTasks.has(task.id);
        const hasDetails = task.details || task.error;
        const isCurrent = index === currentTaskIndex;

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-lg border transition-colors',
              isCurrent ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
            )}
          >
            <div
              className={cn(
                'flex items-start gap-3 p-3',
                hasDetails && 'cursor-pointer'
              )}
              onClick={() => hasDetails && toggleTaskExpand(task.id)}
            >
              {/* Icon */}
              <div className="mt-0.5">{getTaskIcon(task, index)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      task.status === 'completed' && 'text-green-600',
                      task.status === 'error' && 'text-red-600',
                      task.status === 'in_progress' && 'text-blue-600',
                      task.status === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    {task.description}
                  </p>

                  {hasDetails && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                    </motion.div>
                  )}
                </div>

                {/* Timing */}
                {task.startTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTaskDuration(task)}
                  </p>
                )}
              </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {isExpanded && hasDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-0">
                    <div className="pl-8 border-l-2 border-muted">
                      <div className="pl-3">
                        {task.error && (
                          <div className="bg-red-50 dark:bg-red-950/30 rounded-md p-2 mb-2">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                              Error
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300">
                              {task.error}
                            </p>
                          </div>
                        )}
                        {task.details && (
                          <div className="bg-muted/50 rounded-md p-2">
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                              {task.details}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Generating state */}
      {tasks.length === 0 || tasks.every((t) => t.status === 'pending') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Generating tasks...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
