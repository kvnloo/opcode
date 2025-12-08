import React, { useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { SwipeablePane, WorkspacePane } from './SwipeablePane';

interface PaneContainerProps {
  activePane: WorkspacePane;
  onPaneChange: (pane: WorkspacePane) => void;
  children: {
    files: React.ReactNode;
    editor: React.ReactNode;
    terminal: React.ReactNode;
    chat: React.ReactNode;
  };
}

const PANE_ORDER: WorkspacePane[] = ['files', 'editor', 'terminal', 'chat'];
const SWIPE_THRESHOLD = 50;

export function PaneContainer({ activePane, onPaneChange, children }: PaneContainerProps) {
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const currentIndex = PANE_ORDER.indexOf(activePane);

  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Check if swipe is significant enough
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && currentIndex > 0) {
        // Swiped right - go to previous pane
        setDirection('left');
        onPaneChange(PANE_ORDER[currentIndex - 1]);
      } else if (offset.x < 0 && currentIndex < PANE_ORDER.length - 1) {
        // Swiped left - go to next pane
        setDirection('right');
        onPaneChange(PANE_ORDER[currentIndex + 1]);
      }
    }
  }, [currentIndex, onPaneChange]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="h-full w-full touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <SwipeablePane paneId="files" isActive={activePane === 'files'} direction={direction}>
          {children.files}
        </SwipeablePane>
        <SwipeablePane paneId="editor" isActive={activePane === 'editor'} direction={direction}>
          {children.editor}
        </SwipeablePane>
        <SwipeablePane paneId="terminal" isActive={activePane === 'terminal'} direction={direction}>
          {children.terminal}
        </SwipeablePane>
        <SwipeablePane paneId="chat" isActive={activePane === 'chat'} direction={direction}>
          {children.chat}
        </SwipeablePane>
      </motion.div>

      {/* Pane Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {PANE_ORDER.map((pane, index) => (
          <button
            key={pane}
            onClick={() => {
              setDirection(index > currentIndex ? 'right' : 'left');
              onPaneChange(pane);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              activePane === pane
                ? 'bg-primary w-4'
                : 'bg-muted-foreground/30'
            }`}
            aria-label={`Go to ${pane}`}
          />
        ))}
      </div>
    </div>
  );
}
