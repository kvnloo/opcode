import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { cn } from '@/lib/utils';
import { Terminal, Trash2, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface HistoryEntry {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  isError?: boolean;
}

interface ShellPaneProps {
  projectId: string;
  projectPath: string;
  onBack: () => void;
  className?: string;
}

export function ShellPane({ projectId, projectPath, onBack, className }: ShellPaneProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new output added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleExecute = async () => {
    if (!input.trim() || isExecuting) return;

    const command = input.trim();

    // Handle built-in commands
    if (command === 'clear' || command === 'cls') {
      setHistory([]);
      setInput('');
      setCommandHistory([...commandHistory, command]);
      setHistoryIndex(-1);
      return;
    }

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      command,
      output: '',
      timestamp: new Date(),
      isError: false,
    };

    // Handle help command
    if (command === 'help') {
      newEntry.output = `Available commands:
  help    - Show this help message
  clear   - Clear terminal history
  pwd     - Print working directory
  ls      - List files
  echo    - Echo text
  cd      - Change directory

${typeof window !== 'undefined' && (window as any).__TAURI__ ? 'Other commands are executed via terminal.' : 'Commands are currently mocked in development mode.'}`;
      setHistory([...history, newEntry]);
      setInput('');
      setCommandHistory([...commandHistory, command]);
      setHistoryIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setIsExecuting(true);
    setInput('');
    setCommandHistory([...commandHistory, command]);
    setHistoryIndex(-1);

    try {
      // Execute command via Tauri or use mock
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const result = await invoke<string>('execute_terminal_command', {
          command,
          cwd: projectPath,
          projectId,
        });
        newEntry.output = result;
      } else {
        // Fallback mock responses for development
        if (command === 'pwd') {
          newEntry.output = projectPath;
        } else if (command.startsWith('ls')) {
          newEntry.output = `src/
tests/
package.json
README.md
tsconfig.json`;
        } else if (command.startsWith('echo ')) {
          newEntry.output = command.slice(5);
        } else if (command.startsWith('cd ')) {
          newEntry.output = `Changed directory to: ${command.slice(3)}`;
        } else {
          newEntry.output = `[Mock] Would execute in ${projectPath}: ${command}`;
        }
      }
    } catch (error) {
      newEntry.output = `Error: ${error instanceof Error ? error.message : String(error)}`;
      newEntry.isError = true;
    } finally {
      setIsExecuting(false);
    }

    setHistory([...history, newEntry]);

    // Refocus input after execution
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate command history backwards
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate command history forwards
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const handleClear = () => {
    setHistory([]);
    inputRef.current?.focus();
  };

  return (
    <div className={cn('h-full flex flex-col bg-zinc-900', className)}>
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <Terminal className="w-5 h-5 text-green-400" />
        <h2 className="text-lg font-semibold text-zinc-100">Shell</h2>
        <div className="flex-1" />
        <HapticButton
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          onClick={handleClear}
          aria-label="Clear terminal"
        >
          <Trash2 className="w-4 h-4" />
        </HapticButton>
      </header>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
      >
        {history.length === 0 && (
          <div className="text-zinc-500 mb-4">
            <p>Welcome to Shell. Type 'help' for available commands.</p>
            <p className="mt-2 text-zinc-600">{projectPath}</p>
            <p className="mt-1">$ _</p>
          </div>
        )}

        {history.map((entry) => (
          <div key={entry.id} className="mb-4">
            {/* Command */}
            <div className="text-green-400">
              <span className="text-zinc-500">$ </span>
              {entry.command}
            </div>

            {/* Output */}
            {entry.output && (
              <div className={cn(
                "mt-1 whitespace-pre-wrap",
                entry.isError ? "text-red-400" : "text-zinc-300"
              )}>
                {entry.output}
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-zinc-600 mt-1">
              {entry.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isExecuting && (
          <div className="text-zinc-500 animate-pulse">
            Executing...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-mono text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-sm placeholder:text-zinc-600"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

export default ShellPane;
