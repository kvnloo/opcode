import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Search, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface KeyValue {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'json' | 'boolean';
  updatedAt: Date;
}

interface KeyValueStorePaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function KeyValueStorePane({ projectId: _projectId, onBack, className }: KeyValueStorePaneProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, _setItems] = useState<KeyValue[]>([
    { id: '1', key: 'user:preferences', value: '{"theme":"dark"}', type: 'json', updatedAt: new Date() },
    { id: '2', key: 'session:count', value: '42', type: 'number', updatedAt: new Date() },
    { id: '3', key: 'feature:enabled', value: 'true', type: 'boolean', updatedAt: new Date() },
  ]);

  const filteredItems = items.filter(item =>
    item.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div data-testid="pane-key-value-store" className={cn('h-full flex flex-col bg-background', className)}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-lg font-semibold">Key-Value Store</h2>
        <div className="ml-auto">
          <HapticButton
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Add key"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Key
          </HapticButton>
        </div>
      </header>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-muted border border-border text-sm"
          />
        </div>
      </div>

      {/* Keys list */}
      <div className="flex-1 overflow-auto px-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground border-b border-border">
              <th className="pb-2 font-medium">Key</th>
              <th className="pb-2 font-medium">Value</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-3 font-mono text-sm text-primary">{item.key}</td>
                <td className="py-3 font-mono text-sm truncate max-w-[150px]">
                  {item.value}
                </td>
                <td className="py-3">
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded',
                    item.type === 'json' && 'bg-blue-500/20 text-blue-400',
                    item.type === 'number' && 'bg-green-500/20 text-green-400',
                    item.type === 'boolean' && 'bg-yellow-500/20 text-yellow-400',
                    item.type === 'string' && 'bg-gray-500/20 text-gray-400',
                  )}>
                    {item.type}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-1">
                    <HapticButton
                      className="hover:bg-accent hover:text-accent-foreground"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </HapticButton>
                    <HapticButton
                      className="hover:bg-accent hover:text-accent-foreground text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </HapticButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-border text-sm text-muted-foreground">
        {items.length} keys • {(JSON.stringify(items).length / 1024).toFixed(1)} KB used
      </div>
    </div>
  );
}

export default KeyValueStorePane;
