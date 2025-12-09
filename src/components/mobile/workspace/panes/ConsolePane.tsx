import { useState, useRef, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TerminalInput } from '@/components/mobile/terminal/TerminalInput';
import { CodeKeyboard } from '@/components/mobile/terminal/CodeKeyboard';
import { QuickCommands } from '@/components/mobile/terminal/QuickCommands';

interface TerminalLine {
  id: number;
  content: string;
  type: 'input' | 'output' | 'error';
}

export interface ConsolePaneProps {
  projectId: string;
  projectPath: string;
  onOutput?: (output: string) => void;
}

/**
 * Console/Terminal pane for shell access in workspace context
 *
 * This component wraps the terminal functionality with workspace-specific context:
 * - Executes commands in the project directory
 * - Provides quick access to common project operations
 * - Integrates with workspace state and project context
 */
export function ConsolePane({ projectId, projectPath, onOutput }: ConsolePaneProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, content: `Console: ${projectPath}`, type: 'output' },
    { id: 1, content: 'Type a command or use quick commands below', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(2);

  // Auto-scroll to bottom when new lines added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = useCallback((content: string, type: TerminalLine['type']) => {
    setLines(prev => [...prev, { id: lineIdRef.current++, content, type }]);

    // Notify parent of output
    if (onOutput && type === 'output') {
      onOutput(content);
    }
  }, [onOutput]);

  const handleExecute = async () => {
    if (!input.trim() || isExecuting) return;

    const command = input.trim();
    addLine(`$ ${command}`, 'input');
    setInput('');
    setIsExecuting(true);

    try {
      // Execute command in project context
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const result = await invoke<string>('execute_terminal_command', {
          command,
          cwd: projectPath,
          projectId,
        });
        addLine(result, 'output');
      } else {
        // Fallback for web/development
        addLine(`[Mock] Would execute in ${projectPath}: ${command}`, 'output');

        // Simulate some common commands for development
        if (command === 'pwd') {
          addLine(projectPath, 'output');
        } else if (command.startsWith('cd ')) {
          addLine(`Changed directory (simulated)`, 'output');
        } else if (command === 'ls' || command === 'ls -la') {
          addLine('src/\ntests/\npackage.json\nREADME.md', 'output');
        }
      }
    } catch (error) {
      const errorMsg = `Error: ${error}`;
      addLine(errorMsg, 'error');
      if (onOutput) {
        onOutput(errorMsg);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setInput(prev => prev + cmd + ' ');
  };

  const handleKeyboardInsert = (char: string) => {
    setInput(prev => prev + char);
  };

  const handleClear = () => {
    setLines([
      { id: lineIdRef.current++, content: `Console: ${projectPath}`, type: 'output' },
      { id: lineIdRef.current++, content: 'Type a command or use quick commands below', type: 'output' },
    ]);
  };

  return (
    <div
      data-testid="pane-console" className="h-full flex flex-col"
      style={{ backgroundColor: 'var(--mobile-bg-primary)' }}
    >
      {/* Terminal Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: `1px solid var(--mobile-border-default)`,
          backgroundColor: 'var(--mobile-bg-card)'
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--mobile-text-primary)' }}
          >
            Console
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--mobile-text-tertiary)' }}
          >
            •
          </span>
          <span
            className="text-xs truncate max-w-[200px]"
            style={{ color: 'var(--mobile-text-tertiary)' }}
          >
            {projectPath}
          </span>
        </div>
        <button
          onClick={handleClear}
          className="text-xs px-2 py-1 transition-colors"
          style={{
            color: 'var(--mobile-text-tertiary)',
            transitionDuration: 'var(--mobile-transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mobile-text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mobile-text-tertiary)'}
        >
          Clear
        </button>
      </div>

      {/* Terminal Output */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div
          className="p-4 text-sm"
          style={{ fontFamily: 'var(--mobile-font-mono)' }}
        >
          {lines.map((line) => (
            <div
              key={line.id}
              className="whitespace-pre-wrap break-all"
              style={{
                color: line.type === 'input'
                  ? 'var(--mobile-accent-info)'
                  : line.type === 'error'
                    ? 'var(--mobile-accent-error)'
                    : 'var(--mobile-text-primary)'
              }}
            >
              {line.content}
            </div>
          ))}
          {isExecuting && (
            <div
              className="animate-pulse"
              style={{ color: 'var(--mobile-text-tertiary)' }}
            >
              Executing...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div style={{ borderTop: `1px solid var(--mobile-border-default)` }}>
        {/* Quick Commands */}
        <QuickCommands onSelect={handleQuickCommand} />

        {/* Terminal Input */}
        <TerminalInput
          value={input}
          onChange={setInput}
          onExecute={handleExecute}
          isExecuting={isExecuting}
        />

        {/* Code Keyboard */}
        <CodeKeyboard onInsert={handleKeyboardInsert} />
      </div>
    </div>
  );
}
