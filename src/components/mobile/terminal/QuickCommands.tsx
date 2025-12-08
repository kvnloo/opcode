
interface QuickCommandsProps {
  onSelect: (command: string) => void;
}

const QUICK_COMMANDS = [
  { label: 'claude', cmd: 'claude' },
  { label: 'git', cmd: 'git' },
  { label: 'npm', cmd: 'npm' },
  { label: 'bun', cmd: 'bun' },
  { label: 'cd', cmd: 'cd' },
  { label: 'ls', cmd: 'ls' },
  { label: 'cat', cmd: 'cat' },
  { label: 'mkdir', cmd: 'mkdir' },
];

export function QuickCommands({ onSelect }: QuickCommandsProps) {
  return (
    <div className="flex gap-2 p-2 overflow-x-auto bg-[#1e1e1e]">
      {QUICK_COMMANDS.map((item) => (
        <button
          key={item.label}
          onClick={() => onSelect(item.cmd)}
          className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-[#d4d4d4] rounded text-sm font-mono whitespace-nowrap transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
