import { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { AgentPane, type Task } from './AgentPane';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, StopCircle } from 'lucide-react';

interface AgentPaneContainerProps {
  projectId: string;
}

interface ClaudeOutputEvent {
  session_id: string;
  content: string;
}

interface ClaudeSessionEvent {
  session_id: string;
  project_path?: string;
  error?: string;
}

export function AgentPaneContainer({ projectId: _projectId }: AgentPaneContainerProps) {
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const {
    currentProject,
    agentStatus,
    tasks,
    currentTaskId,
    startAgent,
    stopAgent,
    updateTask,
  } = useWorkspaceStore();

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  // Set up event listeners for Claude Code execution
  useEffect(() => {
    let unlistenOutput: (() => void) | null = null;
    let unlistenStarted: (() => void) | null = null;
    let unlistenCompleted: (() => void) | null = null;
    let unlistenError: (() => void) | null = null;

    const setupListeners = async () => {
      // Listen for real-time output
      unlistenOutput = await listen<ClaudeOutputEvent>('claude-output', (event) => {
        const { session_id, content } = event.payload;
        if (session_id === sessionId || !sessionId) {
          setOutput((prev) => prev + content);
        }
      });

      // Listen for session started
      unlistenStarted = await listen<ClaudeSessionEvent>('claude-session-started', (event) => {
        const { session_id } = event.payload;
        setSessionId(session_id);
        setIsExecuting(true);
      });

      // Listen for session completed
      unlistenCompleted = await listen<ClaudeSessionEvent>('claude-session-completed', (event) => {
        const { session_id } = event.payload;
        if (session_id === sessionId) {
          setIsExecuting(false);
          if (currentTaskId) {
            updateTask(currentTaskId, {
              status: 'completed',
              completedAt: new Date(),
            });
          }
        }
      });

      // Listen for session error
      unlistenError = await listen<ClaudeSessionEvent>('claude-session-error', (event) => {
        const { session_id, error } = event.payload;
        if (session_id === sessionId) {
          setIsExecuting(false);
          if (currentTaskId) {
            updateTask(currentTaskId, {
              status: 'error',
              error: error || 'Unknown error occurred',
              completedAt: new Date(),
            });
          }
        }
      });
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      if (unlistenOutput) unlistenOutput();
      if (unlistenStarted) unlistenStarted();
      if (unlistenCompleted) unlistenCompleted();
      if (unlistenError) unlistenError();
    };
  }, [sessionId, currentTaskId, updateTask]);

  // Execute Claude Code
  const handleExecute = async () => {
    if (!prompt.trim() || !currentProject) return;

    setIsExecuting(true);
    setOutput('');

    // Start agent in workspace store
    startAgent(prompt);

    try {
      // Execute Claude Code with streaming output
      await api.executeClaudeCode(
        currentProject.path,
        prompt,
        'sonnet' // Default model
      );
    } catch (error) {
      console.error('Failed to execute Claude Code:', error);
      setIsExecuting(false);
      setOutput((prev) => prev + '\n\nError: Failed to start execution\n');
      stopAgent();
    }
  };

  // Stop execution
  const handleStop = async () => {
    if (sessionId) {
      try {
        await api.cancelClaudeExecution(sessionId);
        setIsExecuting(false);
        stopAgent();
      } catch (error) {
        console.error('Failed to cancel execution:', error);
      }
    }
  };

  // Get current task from tasks array
  const currentTask = tasks.find((t) => t.id === currentTaskId) || null;

  // Convert workspace tasks to AgentPane tasks
  const agentTasks: Task[] = tasks.map((task) => ({
    id: task.id,
    description: task.title,
    status: task.status === 'running' ? 'in_progress' : task.status,
    startTime: task.startedAt?.getTime(),
    endTime: task.completedAt?.getTime(),
    error: task.error,
  }));

  const currentAgentTask = currentTask
    ? {
        id: currentTask.id,
        description: currentTask.title,
        status: currentTask.status === 'running' ? 'in_progress' as const : currentTask.status,
        startTime: currentTask.startedAt?.getTime(),
        endTime: currentTask.completedAt?.getTime(),
        error: currentTask.error,
      }
    : null;

  // Show agent UI if we have tasks or are executing
  if (agentTasks.length > 0 || isExecuting) {
    return (
      <div className="h-full flex flex-col">
        {/* Output Display */}
        <ScrollArea className="flex-1 p-4 bg-black/95">
          <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
            {output || 'Waiting for output...'}
          </pre>
          <div ref={outputEndRef} />
        </ScrollArea>

        {/* Agent Status Panel */}
        <div className="border-t border-border">
          <AgentPane
            tasks={agentTasks}
            currentTask={currentAgentTask}
            agentStatus={agentStatus}
            checkpoints={[]}
            className="max-h-[40vh]"
          />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Continue the conversation..."
              className="flex-1 min-h-[80px] resize-none"
              disabled={isExecuting}
            />
            <div className="flex flex-col gap-2">
              {!isExecuting ? (
                <Button
                  onClick={handleExecute}
                  disabled={!prompt.trim()}
                  size="icon"
                  className="h-full aspect-square"
                >
                  <Send size={20} />
                </Button>
              ) : (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="icon"
                  className="h-full aspect-square"
                >
                  <StopCircle size={20} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial prompt input UI
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
            <Send size={32} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">What would you like to build?</h2>
          <p className="text-muted-foreground">
            Describe your task and the AI agent will help you implement it
          </p>
        </div>

        <div className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a React component for a user profile card with avatar, name, and bio..."
            className="min-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleExecute();
              }
            }}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to send
            </p>
            <Button
              onClick={handleExecute}
              disabled={!prompt.trim() || !currentProject}
              className="min-w-[120px]"
            >
              <Send size={16} className="mr-2" />
              Start Agent
            </Button>
          </div>
        </div>

        {!currentProject && (
          <div className="text-center mt-4">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Please select a project first
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
