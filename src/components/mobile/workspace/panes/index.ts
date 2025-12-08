// Export all workspace panes
export { AgentPane } from './AgentPane';
export { ConsolePane } from './ConsolePane';
export { PreviewPane } from './PreviewPane';
export { PublishingPane } from './PublishingPane';
export { SharePane } from './SharePane';

// Re-export types from AgentPane
export type {
  Task,
  Checkpoint,
  AgentStatus,
  AgentPaneProps,
} from './AgentPane';

// Re-export types from ConsolePane
export type { ConsolePaneProps } from './ConsolePane';

// Re-export types from PreviewPane
export type { PreviewPaneProps } from './PreviewPane';

// Re-export types from PublishingPane
export type { PublishingPaneProps, Deployment } from './PublishingPane';

// Re-export types from SharePane
export type { SharePaneProps, Collaborator } from './SharePane';
