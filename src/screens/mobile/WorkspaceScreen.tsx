import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreVertical, Terminal, Bot, Rocket, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AgentPaneContainer } from '@/components/mobile/workspace/panes/AgentPaneContainer';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ToolsOverlay } from '@/components/mobile/workspace/ToolsOverlay';
import { AppStoragePane } from '@/components/mobile/workspace/panes/AppStoragePane';
import { AuthUsersPane } from '@/components/mobile/workspace/panes/AuthUsersPane';
import { DevToolsPane } from '@/components/mobile/workspace/panes/DevToolsPane';
import { IntegrationsPane } from '@/components/mobile/workspace/panes/IntegrationsPane';
import { KeyValueStorePane } from '@/components/mobile/workspace/panes/KeyValueStorePane';
import { MultiplayerPane } from '@/components/mobile/workspace/panes/MultiplayerPane';
import { SecretsPane } from '@/components/mobile/workspace/panes/SecretsPane';
import { SecurityScannerPane } from '@/components/mobile/workspace/panes/SecurityScannerPane';
import { WorkflowsPane } from '@/components/mobile/workspace/panes/WorkflowsPane';

// Workspace pane types
export type WorkspacePane = 'console' | 'agent' | 'deploy' | 'share' | 'preview';

interface WorkspacePaneConfig {
  id: WorkspacePane;
  icon: typeof Terminal;
  label: string;
  color: string;
}

// Pane configurations
const WORKSPACE_PANES: WorkspacePaneConfig[] = [
  { id: 'console', icon: Terminal, label: 'Console', color: 'text-blue-500' },
  { id: 'agent', icon: Bot, label: 'Agent', color: 'text-purple-500' },
  { id: 'deploy', icon: Rocket, label: 'Deploy', color: 'text-green-500' },
  { id: 'share', icon: Share2, label: 'Share', color: 'text-orange-500' },
  { id: 'preview', icon: Eye, label: 'Preview', color: 'text-pink-500' },
];

interface WorkspaceScreenProps {
  projectId: string;
  projectName: string;
  onBack: () => void;
}

// Tool pane component map
// All tool panes now have consistent projectId, onBack, and className props
const TOOL_PANE_MAP: Record<string, React.ComponentType<{projectId: string; onBack: () => void}>> = {
  'storage': AppStoragePane,
  'auth': AuthUsersPane,
  'developer': DevToolsPane,
  'integrations': IntegrationsPane,
  'kv-store': KeyValueStorePane,
  'multiplayer': MultiplayerPane,
  'secrets': SecretsPane,
  'security': SecurityScannerPane,
  'workflows': WorkflowsPane,
};

export function WorkspaceScreen({ projectId, projectName, onBack }: WorkspaceScreenProps) {
  // Use workspace store for activePane to sync across tests and app
  const activePane = useWorkspaceStore((state) => state.activePane);
  const setActivePane = useWorkspaceStore((state) => state.setActivePane);
  const initAgentListeners = useWorkspaceStore((state) => state.initAgentListeners);
  const [showToolsOverlay, setShowToolsOverlay] = useState(false);
  const [activeToolPane, setActiveToolPane] = useState<string | null>(null);

  // Initialize agent event listeners on mount
  useEffect(() => {
    initAgentListeners();
  }, [initAgentListeners]);

  const handlePaneChange = useCallback((pane: WorkspacePane) => {
    setActivePane(pane);
  }, [setActivePane]);

  const handleToolsToggle = useCallback(() => {
    setShowToolsOverlay((prev) => !prev);
  }, []);

  const handleToolSelect = useCallback((toolId: string) => {
    setActiveToolPane(toolId);
    setShowToolsOverlay(false);
  }, []);

  const handleToolPaneBack = useCallback(() => {
    setActiveToolPane(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <WorkspaceHeader
        projectName={projectName}
        onBack={onBack}
        onMenuClick={handleToolsToggle}
      />

      {/* Active Pane Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeToolPane ? (
          // Render active tool pane
          <AnimatePresence mode="wait">
            <motion.div
              key={activeToolPane}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {renderToolPane(activeToolPane, projectId, handleToolPaneBack)}
            </motion.div>
          </AnimatePresence>
        ) : (
          // Render normal workspace pane
          <AnimatePresence mode="wait">
            <motion.div
              key={activePane}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {renderPaneContent(activePane, projectId)}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Tools Overlay */}
        <ToolsOverlay
          isOpen={showToolsOverlay}
          onClose={() => setShowToolsOverlay(false)}
          onToolSelect={handleToolSelect}
        />
      </div>

      {/* Bottom Toolbar */}
      <WorkspaceToolbar
        activePane={activePane}
        onPaneChange={handlePaneChange}
      />
    </div>
  );
}

// Header Component
interface WorkspaceHeaderProps {
  projectName: string;
  onBack: () => void;
  onMenuClick: () => void;
}

function WorkspaceHeader({ projectName, onBack, onMenuClick }: WorkspaceHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold truncate">{projectName}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 -mr-2"
            aria-label="More options"
          >
            <MoreVertical size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onMenuClick}>
            Show Tools
          </DropdownMenuItem>
          <DropdownMenuItem>Project Settings</DropdownMenuItem>
          <DropdownMenuItem>Share Project</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

// Toolbar Component
interface WorkspaceToolbarProps {
  activePane: WorkspacePane;
  onPaneChange: (pane: WorkspacePane) => void;
}

function WorkspaceToolbar({ activePane, onPaneChange }: WorkspaceToolbarProps) {
  return (
    <nav
      className="flex items-center justify-around bg-card border-t border-border py-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {WORKSPACE_PANES.map((pane) => {
        const isActive = activePane === pane.id;
        const Icon = pane.icon;

        return (
          <button
            key={pane.id}
            onClick={() => onPaneChange(pane.id)}
            className={`
              flex flex-col items-center justify-center
              p-2 rounded-lg transition-all duration-200
              min-w-[64px] min-h-[48px]
              ${isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
            aria-label={pane.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={22}
              className={isActive ? pane.color : undefined}
            />
            <span className="text-xs mt-1 font-medium">{pane.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// Pane Content Renderer
function renderPaneContent(pane: WorkspacePane, projectId: string) {
  switch (pane) {
    case 'console':
      return <ConsolePane projectId={projectId} />;
    case 'agent':
      return <AgentPaneContainer projectId={projectId} />;
    case 'deploy':
      return <DeployPane projectId={projectId} />;
    case 'share':
      return <SharePane projectId={projectId} />;
    case 'preview':
      return <PreviewPane projectId={projectId} />;
    default:
      return null;
  }
}

// Tool Pane Renderer
function renderToolPane(toolId: string, projectId: string, onBack: () => void) {
  const PaneComponent = TOOL_PANE_MAP[toolId];
  if (!PaneComponent) return null;
  return <PaneComponent projectId={projectId} onBack={onBack} />;
}

// Placeholder Pane Components (to be implemented separately)
function ConsolePane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Terminal size={48} className="mx-auto mb-4 text-blue-500" />
        <h2 className="text-xl font-semibold mb-2">Console</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">Terminal output will appear here</p>
      </div>
    </div>
  );
}

// Agent pane is imported from separate component file
// See: src/components/mobile/workspace/panes/AgentPane.tsx

function DeployPane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Rocket size={48} className="mx-auto mb-4 text-green-500" />
        <h2 className="text-xl font-semibold mb-2">Deploy</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">Deployment controls will appear here</p>
      </div>
    </div>
  );
}

function SharePane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Share2 size={48} className="mx-auto mb-4 text-orange-500" />
        <h2 className="text-xl font-semibold mb-2">Share</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">Sharing options will appear here</p>
      </div>
    </div>
  );
}

function PreviewPane({ projectId }: { projectId: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <Eye size={48} className="mx-auto mb-4 text-pink-500" />
        <h2 className="text-xl font-semibold mb-2">Preview</h2>
        <p className="text-muted-foreground">Project: {projectId}</p>
        <p className="text-sm text-muted-foreground mt-2">Live preview will appear here</p>
      </div>
    </div>
  );
}

