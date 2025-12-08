import { Square, Terminal, Grid3x3, Share2, Monitor, Network } from 'lucide-react';
import { useHaptics } from '@/hooks/mobile/useHaptics';

export type WorkspacePane = 'console' | 'agent' | 'deploy' | 'share' | 'preview';

interface WorkspaceToolbarProps {
  activePane: WorkspacePane;
  onPaneChange: (pane: WorkspacePane) => void;
  onStop: () => void;
  isAgentRunning: boolean;
}

/**
 * WorkspaceToolbar - 6-icon fixed bottom toolbar for mobile workspace
 *
 * Based on Replit mobile design with:
 * - Stop (square) - stops agent operation
 * - Console (terminal) - shows console output
 * - Agent (grid) - main AI interaction view
 * - Deploy (network) - deployment/publishing
 * - Share (share) - sharing options
 * - Preview (monitor) - preview pane
 *
 * Features:
 * - Blue underline for active pane
 * - Haptic feedback on tap
 * - Touch-optimized 44x44 targets
 * - Safe area bottom padding
 */
export function WorkspaceToolbar({
  activePane,
  onPaneChange,
  onStop,
  isAgentRunning,
}: WorkspaceToolbarProps) {
  const { selection } = useHaptics();

  const panes = [
    { id: 'console' as WorkspacePane, Icon: Terminal, label: 'Console' },
    { id: 'agent' as WorkspacePane, Icon: Grid3x3, label: 'Agent' },
    { id: 'deploy' as WorkspacePane, Icon: Network, label: 'Deploy' },
    { id: 'share' as WorkspacePane, Icon: Share2, label: 'Share' },
    { id: 'preview' as WorkspacePane, Icon: Monitor, label: 'Preview' },
  ];

  const handlePanePress = (pane: WorkspacePane) => {
    selection();
    onPaneChange(pane);
  };

  const handleStopPress = () => {
    selection();
    onStop();
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center bg-zinc-900 border-t border-zinc-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Stop button - only shown when agent is running */}
      <button
        onClick={handleStopPress}
        disabled={!isAgentRunning}
        className={`
          flex flex-col items-center justify-center
          flex-1 h-14 relative
          transition-all duration-200
          ${
            isAgentRunning
              ? 'text-red-400 hover:text-red-300 active:bg-zinc-800'
              : 'text-zinc-700 cursor-not-allowed'
          }
        `}
        aria-label="Stop agent"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Square
          size={20}
          className="transition-colors"
          fill={isAgentRunning ? 'currentColor' : 'none'}
        />
        <span className="text-[10px] mt-0.5 font-medium">Stop</span>
      </button>

      {/* Pane selector buttons */}
      {panes.map((pane) => {
        const isActive = activePane === pane.id;
        return (
          <button
            key={pane.id}
            onClick={() => handlePanePress(pane.id)}
            className={`
              flex flex-col items-center justify-center
              flex-1 h-14 relative
              transition-all duration-200
              ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-300 active:bg-zinc-800'
              }
            `}
            aria-label={pane.label}
            aria-current={isActive ? 'page' : undefined}
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <pane.Icon size={20} className="transition-colors" />
            <span className="text-[10px] mt-0.5 font-medium">{pane.label}</span>

            {/* Blue active indicator */}
            {isActive && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-blue-500 rounded-full"
                style={{ width: 32 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
