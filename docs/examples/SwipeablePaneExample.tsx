/**
 * Example: Swipeable Workspace Panes
 *
 * This example demonstrates how to use the PaneContainer and SwipeablePane
 * components to create a mobile-friendly workspace with swipeable navigation
 * similar to Replit mobile.
 */

import React, { useState } from 'react';
import { PaneContainer, WorkspacePane } from '@/components/mobile/workspace';
import { useSwipeNavigation } from '@/hooks/mobile';

// Example content components for each pane
function FilesPane() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Files</h2>
      <div className="space-y-2">
        <div className="p-3 bg-muted rounded-lg">src/App.tsx</div>
        <div className="p-3 bg-muted rounded-lg">src/components/</div>
        <div className="p-3 bg-muted rounded-lg">package.json</div>
      </div>
    </div>
  );
}

function EditorPane() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editor</h2>
      <div className="bg-muted p-4 rounded-lg font-mono text-sm">
        <div>function App() {'{'}</div>
        <div className="ml-4">return &lt;div&gt;Hello World&lt;/div&gt;</div>
        <div>{'}'}</div>
      </div>
    </div>
  );
}

function TerminalPane() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Terminal</h2>
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
        <div>$ npm run dev</div>
        <div>Starting development server...</div>
        <div>Server running at http://localhost:5173</div>
      </div>
    </div>
  );
}

function ChatPane() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">AI Chat</h2>
      <div className="space-y-3">
        <div className="bg-muted p-3 rounded-lg">
          <div className="font-semibold text-sm mb-1">AI</div>
          <div>How can I help you with your code?</div>
        </div>
        <div className="bg-primary text-primary-foreground p-3 rounded-lg ml-8">
          <div className="font-semibold text-sm mb-1">You</div>
          <div>Explain this function</div>
        </div>
      </div>
    </div>
  );
}

// Example 1: Using PaneContainer directly
export function BasicSwipeableWorkspace() {
  const [activePane, setActivePane] = useState<WorkspacePane>('editor');

  return (
    <div className="h-screen w-full">
      <PaneContainer
        activePane={activePane}
        onPaneChange={setActivePane}
      >
        {{
          files: <FilesPane />,
          editor: <EditorPane />,
          terminal: <TerminalPane />,
          chat: <ChatPane />,
        }}
      </PaneContainer>
    </div>
  );
}

// Example 2: Using the useSwipeNavigation hook for custom implementation
export function CustomSwipeableWorkspace() {
  const {
    currentItem,
    currentIndex,
    direction,
    goTo,
    goNext,
    goPrevious,
    canGoNext,
    canGoPrevious,
  } = useSwipeNavigation({
    items: ['files', 'editor', 'terminal', 'chat'] as WorkspacePane[],
    initialItem: 'editor',
    threshold: 50,
    velocityThreshold: 500,
  });

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Custom header with navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={goPrevious}
          disabled={!canGoPrevious}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          ← Prev
        </button>
        <div className="font-semibold capitalize">{currentItem}</div>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          className="px-3 py-1 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Pane content */}
      <div className="flex-1">
        <PaneContainer
          activePane={currentItem}
          onPaneChange={goTo}
        >
          {{
            files: <FilesPane />,
            editor: <EditorPane />,
            terminal: <TerminalPane />,
            chat: <ChatPane />,
          }}
        </PaneContainer>
      </div>

      {/* Custom footer */}
      <div className="p-2 border-t flex justify-center gap-2">
        {(['files', 'editor', 'terminal', 'chat'] as WorkspacePane[]).map((pane) => (
          <button
            key={pane}
            onClick={() => goTo(pane)}
            className={`px-4 py-2 rounded capitalize ${
              currentItem === pane
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {pane}
          </button>
        ))}
      </div>
    </div>
  );
}

// Example 3: Integration with BottomNavigation
export function MobileWorkspaceWithNav() {
  const [activePane, setActivePane] = useState<WorkspacePane>('editor');

  const handleNavigation = (pane: WorkspacePane) => {
    setActivePane(pane);
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Main content area */}
      <div className="flex-1 relative">
        <PaneContainer
          activePane={activePane}
          onPaneChange={setActivePane}
        >
          {{
            files: <FilesPane />,
            editor: <EditorPane />,
            terminal: <TerminalPane />,
            chat: <ChatPane />,
          }}
        </PaneContainer>
      </div>

      {/* Bottom navigation bar */}
      <nav className="border-t bg-background">
        <div className="flex items-center justify-around p-2">
          {(['files', 'editor', 'terminal', 'chat'] as WorkspacePane[]).map((pane) => (
            <button
              key={pane}
              onClick={() => handleNavigation(pane)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded capitalize ${
                activePane === pane
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="text-xs">{pane}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
