/**
 * Workspace Type Definitions
 * Based on Replit mobile workspace architecture
 */

// ============================================================================
// Workspace Panes
// ============================================================================

/**
 * Available workspace panes that users can switch between
 */
export type WorkspacePane = 'console' | 'agent' | 'deploy' | 'share' | 'preview';

// ============================================================================
// Task Management
// ============================================================================

/**
 * Task status states
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * Individual task within an agent workflow
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration?: number; // seconds
  actualDuration?: number; // seconds
  error?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Agent State
// ============================================================================

/**
 * Agent execution status
 */
export type AgentStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

/**
 * State management for AI Agent pane
 */
export interface AgentState {
  status: AgentStatus;
  tasks: Task[];
  currentTask: Task | null;
  duration: number; // Total execution time in seconds
  tokensUsed?: number;
  model?: string;
  sessionId?: string;
  error?: string;
}

// ============================================================================
// Console State
// ============================================================================

/**
 * Console log entry types
 */
export type ConsoleLogType = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'system';

/**
 * Individual console log entry
 */
export interface ConsoleLog {
  id: string;
  type: ConsoleLogType;
  message: string;
  timestamp: Date;
  source?: string;
  stackTrace?: string;
}

/**
 * Console pane state
 */
export interface ConsoleState {
  logs: ConsoleLog[];
  isRunning: boolean;
  autoScroll: boolean;
  filter: ConsoleLogType | 'all';
}

// ============================================================================
// Preview State
// ============================================================================

/**
 * Device frame options for preview
 */
export type DeviceFrame = 'none' | 'mobile' | 'tablet' | 'desktop';

/**
 * Preview pane state
 */
export interface PreviewState {
  url: string | null;
  deviceFrame: DeviceFrame;
  isLoading: boolean;
  error?: string;
  refreshKey: number; // Increment to force refresh
}

// ============================================================================
// Deploy/Publishing State
// ============================================================================

/**
 * Publishing status states
 */
export type PublishingStatus = 'idle' | 'checking' | 'publishing' | 'published' | 'error';

/**
 * Deploy/Share pane state
 */
export interface PublishingState {
  subdomain: string;
  isAvailable: boolean;
  status: PublishingStatus;
  publishedUrl?: string;
  error?: string;
  lastPublished?: Date;
}

// ============================================================================
// Tools System
// ============================================================================

/**
 * All available workspace tools (18 tools from Replit)
 */
export enum WorkspaceTool {
  // File Management
  FILES = 'files',
  NEW_FILE = 'new_file',
  NEW_FOLDER = 'new_folder',
  UPLOAD = 'upload',

  // Development Tools
  TERMINAL = 'terminal',
  SEARCH = 'search',
  PACKAGES = 'packages',
  SETTINGS = 'settings',

  // Database & Backend
  SECRETS = 'secrets',
  DATABASE = 'database',
  AUTH = 'auth',
  STORAGE = 'storage',

  // Collaboration
  THREADS = 'threads',
  HISTORY = 'history',

  // Testing & Monitoring
  DEBUGGER = 'debugger',
  PERFORMANCE = 'performance',

  // AI & Automation
  AI_ASSISTANT = 'ai_assistant',
  WORKFLOWS = 'workflows',
}

/**
 * Tool metadata and configuration
 */
export interface Tool {
  id: WorkspaceTool;
  name: string;
  icon: string; // Icon name or path
  description: string;
  category: 'files' | 'dev' | 'backend' | 'collab' | 'testing' | 'ai';
  isQuickAccess?: boolean; // Show in quick access bar
  requiresAuth?: boolean;
  isEnabled?: boolean;
}

// ============================================================================
// Workspace State
// ============================================================================

/**
 * Quick access bar tools (shown above workspace panes)
 */
export interface QuickAccessTool {
  id: WorkspaceTool;
  label: string;
  icon: string;
}

/**
 * Overall workspace state management
 */
export interface WorkspaceState {
  // Current active pane
  activePane: WorkspacePane;

  // Pane states
  console: ConsoleState;
  agent: AgentState;
  preview: PreviewState;
  publishing: PublishingState;

  // Tools overlay
  isToolsOverlayOpen: boolean;
  tools: Tool[];

  // Quick access bar
  quickAccessTools: QuickAccessTool[];

  // Project context
  projectId: string;
  projectName: string;
  isRunning: boolean;
}

// ============================================================================
// Workspace Actions
// ============================================================================

/**
 * Workspace action types for state updates
 */
export interface WorkspaceActions {
  // Pane switching
  setActivePane: (pane: WorkspacePane) => void;

  // Console actions
  addConsoleLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void;
  clearConsole: () => void;
  setConsoleFilter: (filter: ConsoleLogType | 'all') => void;
  toggleAutoScroll: () => void;

  // Agent actions
  startAgent: (prompt: string) => void;
  pauseAgent: () => void;
  resumeAgent: () => void;
  stopAgent: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;

  // Preview actions
  setPreviewUrl: (url: string) => void;
  setDeviceFrame: (frame: DeviceFrame) => void;
  refreshPreview: () => void;

  // Publishing actions
  checkSubdomainAvailability: (subdomain: string) => Promise<boolean>;
  publishProject: (subdomain: string) => Promise<void>;

  // Tools actions
  toggleToolsOverlay: () => void;
  openTool: (toolId: WorkspaceTool) => void;

  // Project control
  startProject: () => void;
  stopProject: () => void;
}

// ============================================================================
// Navigation & Routing
// ============================================================================

/**
 * Workspace navigation parameters
 */
export interface WorkspaceNavigationParams {
  projectId: string;
  initialPane?: WorkspacePane;
  autoStart?: boolean;
}

/**
 * Tool navigation parameters
 */
export interface ToolNavigationParams {
  toolId: WorkspaceTool;
  context?: Record<string, unknown>;
}

// ============================================================================
// UI Component Props
// ============================================================================

/**
 * Props for WorkspaceToolbar component
 */
export interface WorkspaceToolbarProps {
  activePane: WorkspacePane;
  isRunning: boolean;
  onPaneChange: (pane: WorkspacePane) => void;
  onStop: () => void;
}

/**
 * Props for ToolsOverlay component
 */
export interface ToolsOverlayProps {
  isOpen: boolean;
  tools: Tool[];
  onClose: () => void;
  onToolSelect: (toolId: WorkspaceTool) => void;
}

/**
 * Props for QuickAccessBar component
 */
export interface QuickAccessBarProps {
  tools: QuickAccessTool[];
  onToolSelect: (toolId: WorkspaceTool) => void;
}

/**
 * Props for individual pane components
 */
export interface PaneComponentProps<T = unknown> {
  isActive: boolean;
  state: T;
  onUpdate: (updates: Partial<T>) => void;
}
