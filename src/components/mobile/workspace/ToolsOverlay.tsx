import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolItem, Tool } from '@/components/mobile/tools/ToolItem';
import {
  Bot, MessageSquare, Globe, HardDrive, Users,
  Terminal, Database, Code, GitBranch, Layers,
  UserPlus, Monitor, KeyRound, Lock, ShieldCheck,
  Shell, Settings, Play, Search as SearchIcon, FolderOpen
} from 'lucide-react';

const TOOLS: Tool[] = [
  // Search Section
  { id: 'search', name: 'Search', description: 'Search through your files', icon: SearchIcon, category: 'search' },
  { id: 'files', name: 'Files', description: 'Find a file', icon: FolderOpen, category: 'search' },

  // Tools Section
  { id: 'agent', name: 'Agent', description: 'Agent can make changes, review its work, and debug itself automatically', icon: Bot, category: 'tools' },
  { id: 'assistant', name: 'Assistant', description: 'Assistant answers questions, refines code, and makes precise edits', icon: MessageSquare, category: 'tools' },
  { id: 'publishing', name: 'Publishing', description: 'Publish a live, stable, public version of your App', icon: Globe, category: 'tools' },
  { id: 'storage', name: 'App Storage', description: 'Built-in object storage for images, videos, documents', icon: HardDrive, category: 'tools' },
  { id: 'auth', name: 'Auth', description: 'Let users log in to your App using a prebuilt login page', icon: Users, category: 'tools' },
  { id: 'console', name: 'Console', description: 'View the terminal output after running your code', icon: Terminal, category: 'tools' },
  { id: 'database', name: 'Database', description: 'Stores structured data such as user profiles, game scores', icon: Database, category: 'tools' },
  { id: 'developer', name: 'Developer', description: 'Developer tools and settings', icon: Code, category: 'tools' },
  { id: 'git', name: 'Git', description: 'Version control for your App', icon: GitBranch, category: 'tools' },
  { id: 'integrations', name: 'Integrations', description: 'Connect to Replit-native and external services', icon: Layers, category: 'tools' },
  { id: 'multiplayer', name: 'Multiplayer', description: 'Invite real-time collaborators and manage access', icon: UserPlus, category: 'tools' },
  { id: 'preview', name: 'Preview', description: 'Preview your App', icon: Monitor, category: 'tools' },
  { id: 'kv-store', name: 'Replit Key-Value Store', description: 'Easy-to-use key-value store for caching', icon: KeyRound, category: 'tools' },
  { id: 'secrets', name: 'Secrets', description: 'Store sensitive information like API keys securely', icon: Lock, category: 'tools' },
  { id: 'security', name: 'Security Scanner', description: 'Scan your app for vulnerabilities', icon: ShieldCheck, category: 'tools' },
  { id: 'shell', name: 'Shell', description: 'Directly access your App through CLI', icon: Shell, category: 'tools' },
  { id: 'settings', name: 'User Settings', description: 'Configure personal editor preferences', icon: Settings, category: 'tools' },
  { id: 'workflows', name: 'Workflows', description: 'Configure different ways to run your App', icon: Play, category: 'tools' },
];

interface ToolsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onToolSelect: (toolId: string) => void;
  onSearch?: (query: string) => void;
}

export function ToolsOverlay({ isOpen, onClose, onToolSelect, onSearch }: ToolsOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleToolSelect = (tool: Tool) => {
    onToolSelect(tool.id);
    onClose();
  };

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Slide-up Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Project Tools</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close tools overlay"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search for tools and files"
                  className="pl-10 pr-10"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Search Section */}
                {searchTools.length > 0 && (
                  <div className="mb-6">
                    {searchTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ToolItem
                          tool={tool}
                          onClick={() => handleToolSelect(tool)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Tools Section */}
                {otherTools.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                      Tools
                    </h3>
                    <div className="space-y-1">
                      {otherTools.map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (searchTools.length + index) * 0.03 }}
                        >
                          <ToolItem
                            tool={tool}
                            onClick={() => handleToolSelect(tool)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {filteredTools.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-muted-foreground">
                      <p className="text-sm mb-1">No tools found</p>
                      <p className="text-xs">Try a different search term</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
