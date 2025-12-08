import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskProgress } from './TaskProgress';
import { ActionBar } from './ActionBar';
import { FileDiffViewer } from './FileDiffViewer';

export interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  error?: string;
  details?: string;
}

export interface AgentExecutionState {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  taskDescription: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
  tasks: AgentTask[];
  currentTaskIndex: number;
  changedFiles?: Array<{
    path: string;
    oldContent: string;
    newContent: string;
    language: string;
  }>;
}

interface AgentExecutionViewProps {
  execution: AgentExecutionState;
  onCancel: () => void;
  onRollback: () => void;
  onViewChanges: () => void;
  onPreview: () => void;
  className?: string;
}

export function AgentExecutionView({
  execution,
  onCancel,
  onRollback,
  onViewChanges,
  onPreview,
  className
}: AgentExecutionViewProps) {
  const [showDiff, setShowDiff] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const getStatusColor = (status: AgentExecutionState['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: AgentExecutionState['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleViewChanges = () => {
    setShowDiff(true);
    onViewChanges();
  };

  return (
    <div className={cn('fixed inset-0 z-50 bg-background flex flex-col', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-border bg-card"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Agent Avatar */}
          <div className="relative">
            {execution.agentAvatar ? (
              <img
                src={execution.agentAvatar}
                alt={execution.agentName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {execution.agentName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Status indicator */}
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center',
                getStatusColor(execution.status)
              )}
            >
              {getStatusIcon(execution.status)}
            </div>
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {execution.agentName}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">
              {execution.status}
            </p>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Cancel execution"
        >
          <X size={20} />
        </button>
      </motion.div>

      {/* Task Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-3 bg-muted/50 border-b border-border"
      >
        <p className="text-sm text-foreground">{execution.taskDescription}</p>
      </motion.div>

      {/* Task Progress List */}
      <div className="flex-1 overflow-y-auto">
        <TaskProgress
          tasks={execution.tasks}
          currentTaskIndex={execution.currentTaskIndex}
        />
      </div>

      {/* Action Bar */}
      <ActionBar
        onRollback={onRollback}
        onViewChanges={handleViewChanges}
        onPreview={onPreview}
        status={execution.status}
        hasChanges={(execution.changedFiles?.length || 0) > 0}
      />

      {/* File Diff Viewer Modal */}
      <AnimatePresence>
        {showDiff && execution.changedFiles && execution.changedFiles.length > 0 && (
          <FileDiffViewer
            files={execution.changedFiles}
            selectedIndex={selectedFileIndex}
            onSelectFile={setSelectedFileIndex}
            onClose={() => setShowDiff(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
