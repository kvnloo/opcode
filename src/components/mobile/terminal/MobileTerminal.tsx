import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TerminalInput } from './TerminalInput';
import { CodeKeyboard } from './CodeKeyboard';
import { QuickCommands } from './QuickCommands';

interface TerminalLine {
  id: number;
  content: string;
  type: 'input' | 'output' | 'error';
}

export function MobileTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, content: 'Welcome to Claude Code Mobile Terminal', type: 'output' },
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

  const addLine = (content: string, type: TerminalLine['type']) => {
    setLines(prev => [...prev, { id: lineIdRef.current++, content, type }]);
  };

  const handleExecute = async () => {
    if (!input.trim() || isExecuting) return;

    const command = input.trim();
    addLine(`$ ${command}`, 'input');
    setInput('');
    setIsExecuting(true);

    try {
      // Try to execute via Tauri if available
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const result = await invoke<string>('execute_terminal_command', { command });
        addLine(result, 'output');
      } else {
        // Fallback for web/development
        addLine(`[Mock] Would execute: ${command}`, 'output');
      }
    } catch (error) {
      addLine(`Error: ${error}`, 'error');
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

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Terminal Output */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 font-mono text-sm">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`whitespace-pre-wrap break-all ${
                line.type === 'input'
                  ? 'text-[#4fc3f7]'
                  : line.type === 'error'
                    ? 'text-[#f44336]'
                    : 'text-[#d4d4d4]'
              }`}
            >
              {line.content}
            </div>
          ))}
          {isExecuting && (
            <div className="text-[#888] animate-pulse">Executing...</div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="border-t border-[#333]">
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
