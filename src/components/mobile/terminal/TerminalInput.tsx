import React from 'react';
import { Play, Loader2 } from 'lucide-react';

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting?: boolean;
}

export function TerminalInput({ value, onChange, onExecute, isExecuting }: TerminalInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onExecute();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-[#252526]">
      <span className="text-[#0dbc79] font-mono text-sm">$</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter command..."
        className="flex-1 bg-transparent text-[#d4d4d4] font-mono text-sm outline-none placeholder:text-[#666]"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        disabled={isExecuting}
      />
      <button
        onClick={onExecute}
        disabled={!value.trim() || isExecuting}
        className={`px-4 py-2 rounded font-medium text-sm flex items-center gap-2 ${
          value.trim() && !isExecuting
            ? 'bg-[#0dbc79] text-white hover:bg-[#0dbc79]/90'
            : 'bg-[#333] text-[#666] cursor-not-allowed'
        }`}
      >
        {isExecuting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Play size={16} />
        )}
        <span>Run</span>
      </button>
    </div>
  );
}
