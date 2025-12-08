import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SwipeablePane, WorkspacePane } from '@/components/mobile/workspace/SwipeablePane';

describe('SwipeablePane', () => {
  const defaultProps = {
    paneId: 'editor' as WorkspacePane,
    isActive: true,
  };

  describe('Rendering', () => {
    it('should render children when active', () => {
      render(
        <SwipeablePane {...defaultProps}>
          <div>Test Content</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should not render children when inactive', () => {
      render(
        <SwipeablePane {...defaultProps} isActive={false}>
          <div>Test Content</div>
        </SwipeablePane>
      );

      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('should render with correct paneId', () => {
      const { rerender } = render(
        <SwipeablePane paneId="files" isActive={true}>
          <div>Files Content</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Files Content')).toBeInTheDocument();

      rerender(
        <SwipeablePane paneId="terminal" isActive={true}>
          <div>Terminal Content</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Terminal Content')).toBeInTheDocument();
      expect(screen.queryByText('Files Content')).not.toBeInTheDocument();
    });
  });

  describe('Direction handling', () => {
    it('should accept right direction', () => {
      render(
        <SwipeablePane {...defaultProps} direction="right">
          <div>Content</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept left direction', () => {
      render(
        <SwipeablePane {...defaultProps} direction="left">
          <div>Content</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should default to right direction', () => {
      render(
        <SwipeablePane paneId="editor" isActive={true}>
          <div>Content</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have absolute positioning for full screen', () => {
      const { container } = render(
        <SwipeablePane {...defaultProps}>
          <div>Content</div>
        </SwipeablePane>
      );

      const pane = container.querySelector('div');
      expect(pane).toHaveClass('absolute');
      expect(pane).toHaveClass('inset-0');
    });

    it('should have full width and height', () => {
      const { container } = render(
        <SwipeablePane {...defaultProps}>
          <div>Content</div>
        </SwipeablePane>
      );

      const pane = container.querySelector('div');
      expect(pane).toHaveClass('h-full');
      expect(pane).toHaveClass('w-full');
    });
  });

  describe('Multiple panes', () => {
    it('should only show active pane when multiple panes exist', () => {
      const { rerender } = render(
        <>
          <SwipeablePane paneId="files" isActive={true}>
            <div>Files</div>
          </SwipeablePane>
          <SwipeablePane paneId="editor" isActive={false}>
            <div>Editor</div>
          </SwipeablePane>
          <SwipeablePane paneId="terminal" isActive={false}>
            <div>Terminal</div>
          </SwipeablePane>
        </>
      );

      expect(screen.getByText('Files')).toBeInTheDocument();
      expect(screen.queryByText('Editor')).not.toBeInTheDocument();
      expect(screen.queryByText('Terminal')).not.toBeInTheDocument();

      // Switch to editor
      rerender(
        <>
          <SwipeablePane paneId="files" isActive={false}>
            <div>Files</div>
          </SwipeablePane>
          <SwipeablePane paneId="editor" isActive={true}>
            <div>Editor</div>
          </SwipeablePane>
          <SwipeablePane paneId="terminal" isActive={false}>
            <div>Terminal</div>
          </SwipeablePane>
        </>
      );

      expect(screen.queryByText('Files')).not.toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.queryByText('Terminal')).not.toBeInTheDocument();
    });
  });

  describe('Pane types', () => {
    const paneTypes: WorkspacePane[] = ['files', 'editor', 'terminal', 'chat'];

    paneTypes.forEach(paneType => {
      it(`should render ${paneType} pane`, () => {
        render(
          <SwipeablePane paneId={paneType} isActive={true}>
            <div>{paneType} content</div>
          </SwipeablePane>
        );

        expect(screen.getByText(`${paneType} content`)).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty children', () => {
      const { container } = render(
        <SwipeablePane {...defaultProps}>
          {null}
        </SwipeablePane>
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <SwipeablePane {...defaultProps}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should handle rapid active state changes', () => {
      const { rerender } = render(
        <SwipeablePane {...defaultProps} isActive={true}>
          <div>Content</div>
        </SwipeablePane>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      // Rapid toggling
      rerender(
        <SwipeablePane {...defaultProps} isActive={false}>
          <div>Content</div>
        </SwipeablePane>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <SwipeablePane {...defaultProps} isActive={true}>
          <div>Content</div>
        </SwipeablePane>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
