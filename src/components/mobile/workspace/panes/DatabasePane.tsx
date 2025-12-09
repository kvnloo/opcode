import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Database,
  Table2,
  Play,
  RefreshCw,
  Check,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface TableSchema {
  name: string;
  columns: { name: string; type: string; nullable: boolean }[];
  rowCount: number;
}

interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
}

interface DatabasePaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

// Mock data
const MOCK_TABLES: string[] = ['users', 'posts', 'comments'];

const MOCK_SCHEMAS: Record<string, TableSchema> = {
  users: {
    name: 'users',
    columns: [
      { name: 'id', type: 'INTEGER', nullable: false },
      { name: 'email', type: 'VARCHAR(255)', nullable: false },
      { name: 'username', type: 'VARCHAR(50)', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: true },
    ],
    rowCount: 1247,
  },
  posts: {
    name: 'posts',
    columns: [
      { name: 'id', type: 'INTEGER', nullable: false },
      { name: 'user_id', type: 'INTEGER', nullable: false },
      { name: 'title', type: 'VARCHAR(200)', nullable: false },
      { name: 'content', type: 'TEXT', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
    ],
    rowCount: 5832,
  },
  comments: {
    name: 'comments',
    columns: [
      { name: 'id', type: 'INTEGER', nullable: false },
      { name: 'post_id', type: 'INTEGER', nullable: false },
      { name: 'user_id', type: 'INTEGER', nullable: false },
      { name: 'content', type: 'TEXT', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
    ],
    rowCount: 12459,
  },
};

const MOCK_QUERY_RESULT: QueryResult = {
  columns: ['id', 'email', 'username', 'created_at'],
  rows: [
    { id: 1, email: 'alice@example.com', username: 'alice', created_at: '2024-01-15 10:30:00' },
    { id: 2, email: 'bob@example.com', username: 'bob', created_at: '2024-01-16 14:22:00' },
    { id: 3, email: 'charlie@example.com', username: 'charlie', created_at: '2024-01-17 09:15:00' },
  ],
};

export function DatabasePane({ projectId, onBack, className }: DatabasePaneProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRunQuery = () => {
    // Simulate query execution
    setQueryResult(MOCK_QUERY_RESULT);
  };

  const selectedSchema = selectedTable ? MOCK_SCHEMAS[selectedTable] : null;

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      {/* Header */}
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
        <Database className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold flex-1">Database</h2>

        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-sm">
          {isConnected ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Connected</span>
            </>
          ) : (
            <>
              <X className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-600 dark:text-red-400">Disconnected</span>
            </>
          )}
        </div>

        {/* Refresh button */}
        <HapticButton
          className="hover:bg-accent hover:text-accent-foreground"
          onClick={handleRefresh}
          aria-label="Refresh database"
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
        </HapticButton>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tables list */}
        <div className="border-b border-border bg-card">
          <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
            Tables ({MOCK_TABLES.length})
          </div>
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {MOCK_TABLES.map((table) => (
              <HapticButton
                key={table}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md border transition-colors',
                  selectedTable === table
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setSelectedTable(table)}
              >
                <Table2 className="w-4 h-4" />
                <span className="font-mono text-sm whitespace-nowrap">{table}</span>
              </HapticButton>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4">
          {selectedSchema ? (
            <div className="space-y-4">
              {/* Table info */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-mono">{selectedSchema.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {selectedSchema.rowCount.toLocaleString()} rows
                </span>
              </div>

              {/* Schema table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Column</th>
                      <th className="px-4 py-2 text-left font-semibold">Type</th>
                      <th className="px-4 py-2 text-left font-semibold">Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSchema.columns.map((column, idx) => (
                      <tr
                        key={column.name}
                        className={cn(
                          'border-t border-border',
                          idx % 2 === 1 && 'bg-muted/30'
                        )}
                      >
                        <td className="px-4 py-2 font-mono">{column.name}</td>
                        <td className="px-4 py-2 font-mono text-muted-foreground">
                          {column.type}
                        </td>
                        <td className="px-4 py-2">
                          {column.nullable ? (
                            <span className="text-muted-foreground">Yes</span>
                          ) : (
                            <span className="text-primary font-medium">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Table2 className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Select a table to view its schema</p>
            </div>
          )}
        </div>

        {/* Query section */}
        <div className="border-t border-border bg-card">
          {/* Query header - collapsible */}
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
            onClick={() => setIsQueryExpanded(!isQueryExpanded)}
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="font-medium text-sm">Query</span>
            </div>
            {isQueryExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Query content - expandable */}
          {isQueryExpanded && (
            <div className="px-4 pb-4 space-y-3">
              <div className="flex gap-2">
                <textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="SELECT * FROM table_name;"
                  className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono resize-none"
                  rows={3}
                />
              </div>
              <HapticButton
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                onClick={handleRunQuery}
              >
                <Play className="w-4 h-4" />
                <span>Run Query</span>
              </HapticButton>

              {/* Query results */}
              {queryResult && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">
                    Results ({queryResult.rows.length} rows)
                  </div>
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {queryResult.columns.map((col) => (
                            <th key={col} className="px-3 py-2 text-left font-semibold font-mono whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row, idx) => (
                          <tr
                            key={idx}
                            className={cn(
                              'border-t border-border',
                              idx % 2 === 1 && 'bg-muted/30'
                            )}
                          >
                            {queryResult.columns.map((col) => (
                              <td key={col} className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                                {row[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DatabasePane;
