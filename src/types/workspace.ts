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

// Tool pane component props
export interface ToolPaneProps {
  projectId: string;
  onBack: () => void;
}

// Workspace pane component props
export interface WorkspacePaneProps {
  projectId: string;
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
