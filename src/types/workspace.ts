/**
 * Type definitions for workspace navigation and pane management
 * Used throughout the Tauri 2 mobile application
 */

// Toolbar pane types (bottom navigation in workspace)
export type WorkspacePaneId = 'console' | 'agent' | 'deploy' | 'share' | 'preview';

// Tool pane types (accessible via ToolsOverlay)
export type ToolPaneId =
  | 'storage'
  | 'auth'
  | 'developer'
  | 'integrations'
  | 'kv-store'
  | 'multiplayer'
  | 'secrets'
  | 'security'
  | 'workflows';

// All pane types combined
export type AnyPaneId = WorkspacePaneId | ToolPaneId;

// Base props for all tool pane components
export interface BaseToolPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

// Tool pane component props (standard)
export interface ToolPaneProps extends BaseToolPaneProps {}

// Tool pane props with optional project path (for Assistant, Shell, etc.)
export interface ToolPanePropsWithPath extends BaseToolPaneProps {
  projectPath?: string;
}

// Workspace pane component props (for WorkspaceScreen)
export interface WorkspacePaneProps {
  projectId: string;
  projectName: string;
  projectPath: string;
  onBack: () => void;
}

// Navigation state
export interface WorkspaceNavigationState {
  activePane: WorkspacePaneId;
  activeToolPane: ToolPaneId | null;
  toolsOverlayOpen: boolean;
}

// Tool configuration (from ToolsOverlay)
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: 'search' | 'tools';
}

// Type guard for tool panes
export const isToolPaneId = (id: string): id is ToolPaneId => {
  const toolPaneIds: ToolPaneId[] = [
    'storage', 'auth', 'developer', 'integrations',
    'kv-store', 'multiplayer', 'secrets', 'security', 'workflows'
  ];
  return toolPaneIds.includes(id as ToolPaneId);
};

// Type guard for workspace panes
export const isWorkspacePaneId = (id: string): id is WorkspacePaneId => {
  const workspacePaneIds: WorkspacePaneId[] = [
    'console', 'agent', 'deploy', 'share', 'preview'
  ];
  return workspacePaneIds.includes(id as WorkspacePaneId);
};
