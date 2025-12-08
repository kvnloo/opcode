import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolItem, Tool } from './ToolItem';
import {
  Bot, MessageSquare, Globe, HardDrive, Users,
  Terminal, Database, Code, GitBranch, Puzzle,
  UserPlus, Monitor, KeyRound, Lock, Shield,
  Shell, Settings, Workflow, Search as SearchIcon, FolderOpen
} from 'lucide-react';

const TOOLS: Tool[] = [
  // Search Section
  { id: 'search', name: 'Search', description: 'Search through your files', icon: SearchIcon, category: 'search' },
  { id: 'files', name: 'Files', description: 'Find a file', icon: FolderOpen, category: 'search' },

  // Tools Section
  { id: 'agent', name: 'Agent', description: 'Agent can make changes, review its work, and debug itself automatically', icon: Bot, category: 'tools' },
  { id: 'assistant', name: 'Assistant', description: 'Assistant answers questions, refines code, and makes precise edits', icon: MessageSquare, category: 'tools' },
  { id: 'publishing', name: 'Publishing', description: 'Publish a live, stable, public version of your App', icon: Globe, category: 'tools' },
  { id: 'storage', name: 'App Storage', description: "App Storage is Claudia's built-in object storage for uploads", icon: HardDrive, category: 'tools' },
  { id: 'auth', name: 'Auth', description: 'Let users log in to your App using a prebuilt login page', icon: Users, category: 'tools' },
  { id: 'console', name: 'Console', description: 'View the terminal output after running your code', icon: Terminal, category: 'tools' },
  { id: 'database', name: 'Database', description: 'Stores structured data such as user profiles and game scores', icon: Database, category: 'tools' },
  { id: 'developer', name: 'Developer', description: 'Developer tools and debugging', icon: Code, category: 'tools' },
  { id: 'git', name: 'Git', description: 'Version control for your App', icon: GitBranch, category: 'tools' },
  { id: 'integrations', name: 'Integrations', description: 'Connect to external services', icon: Puzzle, category: 'tools' },
  { id: 'multiplayer', name: 'Multiplayer', description: 'Invite real-time collaborators and manage access to your App', icon: UserPlus, category: 'tools' },
  { id: 'preview', name: 'Preview', description: 'Preview your App', icon: Monitor, category: 'tools' },
  { id: 'kv-store', name: 'Key-Value Store', description: 'Free, easy-to-use key-value store for caching and session management', icon: KeyRound, category: 'tools' },
  { id: 'secrets', name: 'Secrets', description: 'Store sensitive information like API keys securely in your App', icon: Lock, category: 'tools' },
  { id: 'security', name: 'Security Scanner', description: 'Scan your app for vulnerabilities', icon: Shield, category: 'tools' },
  { id: 'shell', name: 'Shell', description: 'Directly access your App through a command line interface', icon: Shell, category: 'tools' },
  { id: 'settings', name: 'User Settings', description: 'Configure personal editor preferences and workspace settings', icon: Settings, category: 'tools' },
  { id: 'workflows', name: 'Workflows', description: 'Configure different ways to run your App', icon: Workflow, category: 'tools' },
];

interface ToolsMenuProps {
  onSelectTool?: (tool: Tool) => void;
  onClose?: () => void;
}

export function ToolsMenu({ onSelectTool, onClose }: ToolsMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;

    const query = searchQuery.toLowerCase();
    return TOOLS.filter(
      tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const searchTools = filteredTools.filter(t => t.category === 'search');
  const otherTools = filteredTools.filter(t => t.category === 'tools');

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tools and files"
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        )}
      </div>

      {/* Tools List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Search Section */}
          {searchTools.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">Search</h3>
              {searchTools.map(tool => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  onClick={() => onSelectTool?.(tool)}
                />
              ))}
            </div>
          )}

          {/* Tools Section */}
          {otherTools.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">Tools</h3>
              {otherTools.map(tool => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  onClick={() => onSelectTool?.(tool)}
                />
              ))}
            </div>
          )}

          {filteredTools.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tools found for "{searchQuery}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
