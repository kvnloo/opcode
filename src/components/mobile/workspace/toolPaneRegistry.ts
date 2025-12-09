import { ComponentType } from 'react';
import { AppStoragePane } from './panes/AppStoragePane';
import { AuthUsersPane } from './panes/AuthUsersPane';
import { DevToolsPane } from './panes/DevToolsPane';
import { IntegrationsPane } from './panes/IntegrationsPane';
import { KeyValueStorePane } from './panes/KeyValueStorePane';
import { MultiplayerPane } from './panes/MultiplayerPane';
import { SecretsPane } from './panes/SecretsPane';
import { SecurityScannerPane } from './panes/SecurityScannerPane';
import { WorkflowsPane } from './panes/WorkflowsPane';
// Phase 2: New pane components
import { AssistantPane } from './panes/AssistantPane';
import { ShellPane } from './panes/ShellPane';
import { UserSettingsPane } from './panes/UserSettingsPane';
import { GitPane } from './panes/GitPane';
import { DatabasePane } from './panes/DatabasePane';

/**
 * Base props interface for tool pane components
 * All panes require projectId, onBack, and optional className
 */
export interface BaseToolPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

/**
 * Extended tool pane props with optional projectPath
 * Some panes (AssistantPane, ShellPane) may use projectPath
 */
export type ToolPaneProps = BaseToolPaneProps & {
  projectPath?: string;
};

/**
 * Registry mapping tool IDs (from ToolsOverlay TOOLS array) to their corresponding pane components
 * This ensures type-safe routing from tool selection to pane rendering in WorkspaceScreen
 * Uses ComponentType<any> to accommodate varying prop requirements across panes
 */
export const TOOL_PANE_REGISTRY: Record<string, ComponentType<any>> = {
  // Phase 1: Original tool panes (9)
  'storage': AppStoragePane,
  'auth': AuthUsersPane,
  'developer': DevToolsPane,
  'integrations': IntegrationsPane,
  'kv-store': KeyValueStorePane,
  'multiplayer': MultiplayerPane,
  'secrets': SecretsPane,
  'security': SecurityScannerPane,
  'workflows': WorkflowsPane,
  // Phase 2: New tool panes (5)
  'assistant': AssistantPane,
  'shell': ShellPane,
  'settings': UserSettingsPane,
  'git': GitPane,
  'database': DatabasePane,
};

/**
 * Check if a tool ID corresponds to a registered pane component
 * @param toolId - The tool ID from ToolsOverlay
 * @returns true if the tool has a registered pane component
 */
export const isToolPane = (toolId: string): boolean => {
  return toolId in TOOL_PANE_REGISTRY;
};

/**
 * Get the pane component for a given tool ID
 * @param toolId - The tool ID from ToolsOverlay
 * @returns The pane component or null if not found
 */
export const getToolPane = (toolId: string): ComponentType<any> | null => {
  return TOOL_PANE_REGISTRY[toolId] || null;
};

/**
 * Get all registered tool IDs
 * Useful for validation and testing
 * @returns Array of all registered tool IDs
 */
export const getRegisteredToolIds = (): string[] => {
  return Object.keys(TOOL_PANE_REGISTRY);
};
