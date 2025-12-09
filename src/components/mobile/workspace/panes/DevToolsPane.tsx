import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Terminal, Network, Activity, AlertCircle, Info, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

type LogLevel = 'info' | 'warn' | 'error' | 'success';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  details?: string;
}

interface DevToolsPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function DevToolsPane({ projectId, onBack, className }: DevToolsPaneProps) {
  const [activeTab, setActiveTab] = useState<'console' | 'network' | 'performance'>('console');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: new Date(), level: 'info', message: 'Server started on port 3000' },
    { id: '2', timestamp: new Date(), level: 'success', message: 'Connected to database' },
    { id: '3', timestamp: new Date(), level: 'warn', message: 'Deprecated API usage detected' },
    { id: '4', timestamp: new Date(), level: 'error', message: 'Failed to fetch user data', details: 'Network timeout after 30s' },
  ]);

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'warn': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
    }
  };

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
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
        <h2 className="text-lg font-semibold">Developer Tools</h2>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <HapticButton
          className={cn(
            'flex-1 py-3 rounded-none border-b-2 hover:bg-accent hover:text-accent-foreground',
            activeTab === 'console' ? 'border-primary' : 'border-transparent'
          )}
          onClick={() => setActiveTab('console')}
        >
          <Terminal className="w-4 h-4 mr-2" />
          Console
        </HapticButton>
        <HapticButton
          className={cn(
            'flex-1 py-3 rounded-none border-b-2 hover:bg-accent hover:text-accent-foreground',
            activeTab === 'network' ? 'border-primary' : 'border-transparent'
          )}
          onClick={() => setActiveTab('network')}
        >
          <Network className="w-4 h-4 mr-2" />
          Network
        </HapticButton>
        <HapticButton
          className={cn(
            'flex-1 py-3 rounded-none border-b-2 hover:bg-accent hover:text-accent-foreground',
            activeTab === 'performance' ? 'border-primary' : 'border-transparent'
          )}
          onClick={() => setActiveTab('performance')}
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </HapticButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'console' && (
          <div className="p-2 font-mono text-sm space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 p-2 hover:bg-muted/50 rounded">
                <span className="text-muted-foreground flex-shrink-0">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                {getLevelIcon(log.level)}
                <div className="flex-1">
                  <div className={getLevelColor(log.level)}>{log.message}</div>
                  {log.details && (
                    <div className="text-muted-foreground text-xs mt-1">{log.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'network' && (
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2">api/users</td>
                  <td className="py-2 text-green-400">200</td>
                  <td className="py-2">1.2 KB</td>
                  <td className="py-2">245 ms</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2">api/posts</td>
                  <td className="py-2 text-green-400">200</td>
                  <td className="py-2">5.4 KB</td>
                  <td className="py-2">412 ms</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2">api/auth</td>
                  <td className="py-2 text-red-400">401</td>
                  <td className="py-2">0.3 KB</td>
                  <td className="py-2">89 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>FCP (First Contentful Paint)</span>
                <span className="text-green-400">1.2s</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>LCP (Largest Contentful Paint)</span>
                <span className="text-yellow-400">2.5s</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>CLS (Cumulative Layout Shift)</span>
                <span className="text-green-400">0.05</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '95%' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear button */}
      <div className="p-4 border-t border-border">
        <HapticButton className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          Clear {activeTab === 'console' ? 'Console' : activeTab === 'network' ? 'Network' : 'Performance'}
        </HapticButton>
      </div>
    </div>
  );
}

export default DevToolsPane;
