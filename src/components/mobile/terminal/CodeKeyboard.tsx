
interface CodeKeyboardProps {
  onInsert: (char: string) => void;
}

const CODE_KEYS = [
  { label: '⇥', value: '\t' },
  { label: '|', value: '|' },
  { label: '&', value: '&' },
  { label: ';', value: ';' },
  { label: '-', value: '-' },
  { label: '/', value: '/' },
  { label: '~', value: '~' },
  { label: '"', value: '"' },
  { label: "'", value: "'" },
  { label: '`', value: '`' },
  { label: '{', value: '{' },
  { label: '}', value: '}' },
  { label: '[', value: '[' },
  { label: ']', value: ']' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '$', value: '$' },
  { label: '\\', value: '\\' },
];

export function CodeKeyboard({ onInsert }: CodeKeyboardProps) {
  return (
    <div className="flex gap-1 p-2 bg-[#252526] overflow-x-auto">
      {CODE_KEYS.map((key) => (
        <button
          key={key.label}
          onClick={() => onInsert(key.value)}
          className="min-w-[36px] h-[36px] bg-[#333] hover:bg-[#444] text-[#d4d4d4] rounded font-mono text-sm flex items-center justify-center transition-colors active:scale-95"
        >
          {key.label}
        </button>
      ))}
    </div>
  );
}
