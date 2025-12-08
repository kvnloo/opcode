import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Diff from 'diff';

interface FileDiff {
  path: string;
  oldContent: string;
  newContent: string;
  language: string;
}

interface FileDiffViewerProps {
  files: FileDiff[];
  selectedIndex: number;
  onSelectFile: (index: number) => void;
  onClose: () => void;
  onAcceptChange?: (fileIndex: number) => void;
  onRejectChange?: (fileIndex: number) => void;
  className?: string;
}

type DiffViewMode = 'unified' | 'split';

export function FileDiffViewer({
  files,
  selectedIndex,
  onSelectFile,
  onClose,
  onAcceptChange,
  onRejectChange,
  className
}: FileDiffViewerProps) {
  const [viewMode, setViewMode] = useState<DiffViewMode>('unified');
  const currentFile = files[selectedIndex];

  const handleSwipe = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && selectedIndex > 0) {
      onSelectFile(selectedIndex - 1);
    } else if (info.offset.x < -threshold && selectedIndex < files.length - 1) {
      onSelectFile(selectedIndex + 1);
    }
  };

  const getDiffLines = () => {
    const diff = Diff.diffLines(currentFile.oldContent, currentFile.newContent);
    return diff;
  };

  const renderUnifiedDiff = () => {
    const diffLines = getDiffLines();
    let oldLineNum = 1;
    let newLineNum = 1;

    return (
      <div className="font-mono text-xs">
        {diffLines.map((part, index) => {
          const lines = part.value.split('\n').filter(Boolean);
          return lines.map((line, lineIndex) => {
            const key = `${index}-${lineIndex}`;
            let oldNum = '';
            let newNum = '';
            let bgColor = '';
            let textColor = '';

            if (part.added) {
              newNum = String(newLineNum++);
              bgColor = 'bg-green-500/10';
              textColor = 'text-green-600 dark:text-green-400';
            } else if (part.removed) {
              oldNum = String(oldLineNum++);
              bgColor = 'bg-red-500/10';
              textColor = 'text-red-600 dark:text-red-400';
            } else {
              oldNum = String(oldLineNum++);
              newNum = String(newLineNum++);
              bgColor = 'bg-transparent';
              textColor = 'text-foreground';
            }

            return (
              <div
                key={key}
                className={cn('flex items-start', bgColor)}
              >
                <span className="w-10 text-right px-2 text-muted-foreground select-none flex-shrink-0">
                  {oldNum}
                </span>
                <span className="w-10 text-right px-2 text-muted-foreground select-none flex-shrink-0">
                  {newNum}
                </span>
                <span className={cn('px-2 flex-1 whitespace-pre-wrap break-all', textColor)}>
                  {part.added && '+ '}
                  {part.removed && '- '}
                  {line}
                </span>
              </div>
            );
          });
        })}
      </div>
    );
  };

  const renderSplitDiff = () => {
    return (
      <div className="grid grid-cols-2 gap-px bg-border">
        {/* Old Content */}
        <div className="bg-background">
          <div className="bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 border-b border-border">
            Before
          </div>
          <div className="overflow-auto max-h-[60vh]">
            <SyntaxHighlighter
              language={currentFile.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '0.5rem',
                fontSize: '0.75rem',
                background: 'transparent'
              }}
              showLineNumbers
              wrapLines
            >
              {currentFile.oldContent}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* New Content */}
        <div className="bg-background">
          <div className="bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-600 dark:text-green-400 border-b border-border">
            After
          </div>
          <div className="overflow-auto max-h-[60vh]">
            <SyntaxHighlighter
              language={currentFile.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '0.5rem',
                fontSize: '0.75rem',
                background: 'transparent'
              }}
              showLineNumbers
              wrapLines
            >
              {currentFile.newContent}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('fixed inset-0 z-50 bg-background/95 backdrop-blur-sm', className)}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
              aria-label="Close diff viewer"
            >
              <X size={20} />
            </button>
            <h3 className="font-semibold text-sm truncate max-w-[200px]">
              {currentFile.path.split('/').pop()}
            </h3>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('unified')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                viewMode === 'unified'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Unified
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                viewMode === 'split'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Split
            </button>
          </div>
        </div>

        {/* File Navigation */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
          <button
            onClick={() => onSelectFile(Math.max(0, selectedIndex - 1))}
            disabled={selectedIndex === 0}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              selectedIndex === 0
                ? 'text-muted-foreground cursor-not-allowed opacity-50'
                : 'hover:bg-muted text-foreground'
            )}
            aria-label="Previous file"
          >
            <ChevronLeft size={16} />
          </button>

          <p className="text-xs text-muted-foreground">
            {selectedIndex + 1} / {files.length}
          </p>

          <button
            onClick={() => onSelectFile(Math.min(files.length - 1, selectedIndex + 1))}
            disabled={selectedIndex === files.length - 1}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              selectedIndex === files.length - 1
                ? 'text-muted-foreground cursor-not-allowed opacity-50'
                : 'hover:bg-muted text-foreground'
            )}
            aria-label="Next file"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Diff Content */}
        <motion.div
          key={selectedIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleSwipe}
          className="flex-1 overflow-auto bg-background"
        >
          {viewMode === 'unified' ? renderUnifiedDiff() : renderSplitDiff()}
        </motion.div>

        {/* Actions */}
        {(onAcceptChange || onRejectChange) && (
          <div className="flex items-center gap-3 p-4 border-t border-border bg-card">
            {onRejectChange && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onRejectChange(selectedIndex)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium transition-colors"
              >
                <XCircle size={18} />
                Reject
              </motion.button>
            )}
            {onAcceptChange && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onAcceptChange(selectedIndex)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 font-medium transition-colors"
              >
                <Check size={18} />
                Accept
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
