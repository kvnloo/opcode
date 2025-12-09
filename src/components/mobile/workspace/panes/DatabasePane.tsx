import { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  Loader2,
} from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface TableInfo {
  name: string;
  type: string;
  sql: string;
}

interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

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

// Mock data for fallback
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

// Memoized table button component
const TableButton = memo(({
  table,
  isSelected,
  onClick
}: {
  table: string;
  isSelected: boolean;
  onClick: () => void
}) => (
  <HapticButton
    className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-md border transition-colors',
      isSelected
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-card border-border hover:bg-accent hover:text-accent-foreground'
    )}
    onClick={onClick}
  >
    <Table2 className="w-4 h-4" />
    <span className="font-mono text-sm whitespace-nowrap">{table}</span>
  </HapticButton>
));
TableButton.displayName = 'TableButton';

// Memoized column row component
const ColumnRow = memo(({
  column,
  index
}: {
  column: { name: string; type: string; nullable: boolean };
  index: number
}) => (
  <tr
    className={cn(
      'border-t border-border',
      index % 2 === 1 && 'bg-muted/30'
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
));
ColumnRow.displayName = 'ColumnRow';

// Memoized query result row component
const QueryResultRow = memo(({
  row,
  columns,
  index
}: {
  row: Record<string, any>;
  columns: string[];
  index: number
}) => (
  <tr
    className={cn(
      'border-t border-border',
      index % 2 === 1 && 'bg-muted/30'
    )}
  >
    {columns.map((col) => (
      <td key={col} className="px-3 py-2 font-mono text-xs whitespace-nowrap">
        {row[col]}
      </td>
    ))}
  </tr>
));
QueryResultRow.displayName = 'QueryResultRow';

export function DatabasePane({ projectId, onBack, className }: DatabasePaneProps) {
  // Check if running in Tauri environment (done inside component to allow testing)
  const isTauriEnvironment = typeof window !== 'undefined' && (window as any).__TAURI__;
  const [isConnected, setIsConnected] = useState(true);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const [queryInput, setQueryInput] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter(t => !t.startsWith('sqlite_'));
  }, [tables]);

  const loadTables = useCallback(async () => {
    if (!isTauriEnvironment) {
      // Use mock data for non-Tauri environments
      setTables(MOCK_TABLES);
      setIsConnected(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const tableList = await api.storageListTables();
      if (!tableList || !Array.isArray(tableList)) {
        // Fallback to mock data if API returns invalid data
        setTables(MOCK_TABLES);
        setIsConnected(true);
        return;
      }
      const tableNames = tableList
        .filter((t: TableInfo) => t.type === 'table' && !t.name.startsWith('sqlite_'))
        .map((t: TableInfo) => t.name);
      setTables(tableNames);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load tables:', err);
      setError('Failed to load database tables');
      setIsConnected(false);
      // Fallback to mock data on error
      setTables(MOCK_TABLES);
    } finally {
      setIsLoading(false);
    }
  }, [isTauriEnvironment]);

  const loadTableSchema = useCallback(async (tableName: string) => {
    if (!isTauriEnvironment) {
      // Use mock schema for non-Tauri environments
      setTableSchema(MOCK_SCHEMAS[tableName] || null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Get table schema using PRAGMA
      const schemaResult = await api.storageExecuteSql(`PRAGMA table_info(${tableName})`);

      // Get row count
      const countResult = await api.storageExecuteSql(`SELECT COUNT(*) as count FROM ${tableName}`);
      const rowCount = countResult?.rows?.[0]?.count || 0;

      // Transform schema data
      const columns = (schemaResult?.rows || []).map((col: ColumnInfo) => ({
        name: col.name,
        type: col.type,
        nullable: col.notnull === 0,
      }));

      setTableSchema({
        name: tableName,
        columns,
        rowCount,
      });
    } catch (err) {
      console.error('Failed to load table schema:', err);
      setError(`Failed to load schema for table: ${tableName}`);
      // Fallback to mock schema on error
      setTableSchema(MOCK_SCHEMAS[tableName] || null);
    } finally {
      setIsLoading(false);
    }
  }, [isTauriEnvironment]);

  // Load tables on mount
  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Load table schema when selection changes
  useEffect(() => {
    if (selectedTable) {
      loadTableSchema(selectedTable);
    } else {
      setTableSchema(null);
    }
  }, [selectedTable, loadTableSchema]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTables();
    if (selectedTable) {
      await loadTableSchema(selectedTable);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  }, [loadTables, selectedTable, loadTableSchema]);

  const handleRunQuery = useCallback(async () => {
    if (!queryInput.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    if (!isTauriEnvironment) {
      // Use mock result for non-Tauri environments
      setQueryResult(MOCK_QUERY_RESULT);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await api.storageExecuteSql(queryInput);

      if (result?.rows && Array.isArray(result.rows)) {
        // Extract column names from first row
        const columns = result.rows.length > 0 ? Object.keys(result.rows[0]) : [];
        setQueryResult({
          columns,
          rows: result.rows,
        });
      } else {
        setQueryResult({ columns: [], rows: [] });
      }
    } catch (err) {
      console.error('Failed to execute query:', err);
      setError(`Query error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setQueryResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryInput, isTauriEnvironment]);

  const selectedSchema = tableSchema;

  // Memoized table selection handler
  const handleTableSelect = useCallback((table: string) => {
    setSelectedTable(table);
  }, []);

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
          <div className="px-4 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
            Tables ({tables.length})
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </div>
          {error && (
            <div className="px-4 pb-2 text-sm text-red-500">{error}</div>
          )}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {filteredTables.map((table) => (
              <TableButton
                key={table}
                table={table}
                isSelected={selectedTable === table}
                onClick={() => handleTableSelect(table)}
              />
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && !selectedSchema ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">Loading table schema...</p>
            </div>
          ) : selectedSchema ? (
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
                      <ColumnRow
                        key={column.name}
                        column={column}
                        index={idx}
                      />
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Running...' : 'Run Query'}</span>
              </HapticButton>

              {/* Query error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

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
                          <QueryResultRow
                            key={idx}
                            row={row}
                            columns={queryResult.columns}
                            index={idx}
                          />
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
