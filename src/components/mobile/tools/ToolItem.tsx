import { ChevronRight, LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'search' | 'tools';
}

interface ToolItemProps {
  tool: Tool;
  onClick?: () => void;
}

export function ToolItem({ tool, onClick }: ToolItemProps) {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
    >
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground">{tool.name}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tool.description}
        </p>
      </div>
      <ChevronRight size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
    </button>
  );
}
