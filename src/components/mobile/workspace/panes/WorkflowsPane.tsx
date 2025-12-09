import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, ChevronDown, ChevronRight, Search, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface Workflow {
  id: string;
  name: string;
  type: 'run-button' | 'scheduled' | 'webhook';
  status: 'generated' | 'custom' | 'active';
  expanded?: boolean;
}

interface WorkflowsPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function WorkflowsPane({ projectId: _projectId, onBack, className }: WorkflowsPaneProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [workflows, _setWorkflows] = useState<Workflow[]>([
    { id: '1', name: 'Project', type: 'run-button', status: 'generated' },
    { id: '2', name: 'Start Game', type: 'run-button', status: 'generated' },
  ]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['agent']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div data-testid="pane-workflows" className={cn('h-full flex flex-col bg-background', className)}>
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
        <h2 className="text-lg font-semibold">Workflows</h2>
      </header>
      <div className="flex-1 overflow-auto">
        {/* Search and New Workflow */}
        <div className="flex gap-2 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for a workflow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-muted border border-border text-sm"
            />
          </div>
          <HapticButton
            className="flex items-center gap-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="New Workflow"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </HapticButton>
        </div>

        {/* Learn more link */}
        <a
          href="#"
          className="text-primary text-sm px-4 py-2 hover:underline"
        >
          Learn more about configuring Workflows
        </a>

        {/* Agent Workflows Section */}
        <div>
          <HapticButton
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground"
            onClick={() => toggleSection('agent')}
            aria-expanded={expandedSections.includes('agent')}
          >
            <span className="text-sm font-medium">Agent Workflows</span>
            {expandedSections.includes('agent') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </HapticButton>

          {expandedSections.includes('agent') && (
            <div className="px-4 space-y-2">
              {workflows
                .filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((workflow) => (
                  <WorkflowItem key={workflow.id} workflow={workflow} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowItem({ workflow }: { workflow: Workflow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-card">
      <HapticButton
        className="w-full flex items-center justify-between p-3 hover:bg-accent hover:text-accent-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm">{workflow.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {workflow.type === 'run-button' && (
            <span className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground">
              Run Button
            </span>
          )}
          <span className={cn(
            'px-2 py-1 text-xs rounded',
            workflow.status === 'generated'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-green-500/20 text-green-400'
          )}>
            {workflow.status === 'generated' ? 'Generated' : 'Custom'}
          </span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform',
            expanded && 'rotate-180'
          )} />
        </div>
      </HapticButton>

      {expanded && (
        <div className="px-3 pb-3 text-sm text-muted-foreground">
          Workflow configuration details...
        </div>
      )}
    </div>
  );
}

export default WorkflowsPane;
