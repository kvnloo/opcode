import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type WorkspacePane = 'files' | 'editor' | 'terminal' | 'chat';

interface SwipeablePaneProps {
  children: React.ReactNode;
  paneId: WorkspacePane;
  isActive: boolean;
  direction?: 'left' | 'right';
}

export function SwipeablePane({ children, paneId, isActive, direction = 'right' }: SwipeablePaneProps) {
  const variants = {
    enter: (dir: string) => ({
      x: dir === 'right' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: string) => ({
      x: dir === 'right' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {isActive && (
        <motion.div
          key={paneId}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-0 h-full w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
