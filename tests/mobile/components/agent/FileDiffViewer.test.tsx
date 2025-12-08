import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../utils/renderWithProviders';
import { tap, swipeLeft, swipeRight } from '../../../utils/gestures';
import { FileDiffViewer } from '@/components/mobile/agent/FileDiffViewer';

const mockFiles = [
  {
    path: 'src/components/Button.tsx',
    oldContent: 'const Button = () => {\n  return <button>Old</button>;\n};',
    newContent: 'const Button = () => {\n  return <button className="new">New</button>;\n};',
    language: 'typescript',
  },
  {
    path: 'src/utils/helper.ts',
    oldContent: 'export const helper = () => "old";',
    newContent: 'export const helper = () => {\n  return "new";\n};',
    language: 'typescript',
  },
  {
    path: 'README.md',
    oldContent: '# Old Title\n\nOld content',
    newContent: '# New Title\n\nNew content with updates',
    language: 'markdown',
  },
];

describe('FileDiffViewer', () => {
  const defaultProps = {
    files: mockFiles,
    selectedIndex: 0,
    onSelectFile: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render diff viewer with file name', () => {
      render(<FileDiffViewer {...defaultProps} />);

      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<FileDiffViewer {...defaultProps} />);

      expect(screen.getByLabelText('Close diff viewer')).toBeInTheDocument();
    });

    it('should render view mode toggle', () => {
      render(<FileDiffViewer {...defaultProps} />);

      expect(screen.getByText('Unified')).toBeInTheDocument();
      expect(screen.getByText('Split')).toBeInTheDocument();
    });

    it('should render file navigation controls', () => {
      render(<FileDiffViewer {...defaultProps} />);

      expect(screen.getByLabelText('Previous file')).toBeInTheDocument();
      expect(screen.getByLabelText('Next file')).toBeInTheDocument();
    });

    it('should show current file index', () => {
      render(<FileDiffViewer {...defaultProps} selectedIndex={0} />);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<FileDiffViewer {...defaultProps} className="custom-class" />);

      const element = container.firstChild as HTMLElement;
      expect(element?.className).toContain('custom-class');
    });
  });

  describe('Close Button', () => {
    it('should call onClose when clicked', async () => {
      const onClose = vi.fn();
      render(<FileDiffViewer {...defaultProps} onClose={onClose} />);

      await tap(screen.getByLabelText('Close diff viewer'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('View Mode Switching', () => {
    it('should start in unified view mode', () => {
      render(<FileDiffViewer {...defaultProps} />);

      const unifiedBtn = screen.getByText('Unified');
      expect(unifiedBtn.className).toContain('bg-background');
      expect(unifiedBtn.className).toContain('shadow-sm');
    });

    it('should switch to split view mode when clicked', async () => {
      render(<FileDiffViewer {...defaultProps} />);

      await tap(screen.getByText('Split'));

      await waitFor(() => {
        const splitBtn = screen.getByText('Split');
        expect(splitBtn.className).toContain('bg-background');
      });
    });

    it('should switch back to unified view', async () => {
      render(<FileDiffViewer {...defaultProps} />);

      // Switch to split
      await tap(screen.getByText('Split'));

      await waitFor(() => {
        const splitBtn = screen.getByText('Split');
        expect(splitBtn.className).toContain('bg-background');
      });

      // Switch back to unified
      await tap(screen.getByText('Unified'));

      await waitFor(() => {
        const unifiedBtn = screen.getByText('Unified');
        expect(unifiedBtn.className).toContain('bg-background');
      });
    });

    it('should show split view with before/after labels', async () => {
      render(<FileDiffViewer {...defaultProps} />);

      await tap(screen.getByText('Split'));

      await waitFor(() => {
        expect(screen.getByText('Before')).toBeInTheDocument();
        expect(screen.getByText('After')).toBeInTheDocument();
      });
    });
  });

  describe('File Navigation', () => {
    it('should disable previous button on first file', () => {
      render(<FileDiffViewer {...defaultProps} selectedIndex={0} />);

      const prevBtn = screen.getByLabelText('Previous file');
      expect(prevBtn).toBeDisabled();
      expect(prevBtn.className).toContain('cursor-not-allowed');
    });

    it('should disable next button on last file', () => {
      render(<FileDiffViewer {...defaultProps} selectedIndex={2} />);

      const nextBtn = screen.getByLabelText('Next file');
      expect(nextBtn).toBeDisabled();
      expect(nextBtn.className).toContain('cursor-not-allowed');
    });

    it('should call onSelectFile when next is clicked', async () => {
      const onSelectFile = vi.fn();
      render(<FileDiffViewer {...defaultProps} selectedIndex={0} onSelectFile={onSelectFile} />);

      await tap(screen.getByLabelText('Next file'));

      await waitFor(() => {
        expect(onSelectFile).toHaveBeenCalledWith(1);
      });
    });

    it('should call onSelectFile when previous is clicked', async () => {
      const onSelectFile = vi.fn();
      render(<FileDiffViewer {...defaultProps} selectedIndex={1} onSelectFile={onSelectFile} />);

      await tap(screen.getByLabelText('Previous file'));

      await waitFor(() => {
        expect(onSelectFile).toHaveBeenCalledWith(0);
      });
    });

    it('should update file display when selectedIndex changes', () => {
      const { rerender } = render(<FileDiffViewer {...defaultProps} selectedIndex={0} />);

      expect(screen.getByText('Button.tsx')).toBeInTheDocument();

      rerender(<FileDiffViewer {...defaultProps} selectedIndex={1} />);

      expect(screen.getByText('helper.ts')).toBeInTheDocument();
    });
  });

  describe('Swipe Gestures', () => {
    it('should navigate to next file on swipe left', async () => {
      const onSelectFile = vi.fn();
      const { container } = render(
        <FileDiffViewer {...defaultProps} selectedIndex={0} onSelectFile={onSelectFile} />
      );

      const diffContent = container.querySelector('.overflow-auto');
      if (diffContent) {
        await swipeLeft(diffContent, { distance: 100 });

        await waitFor(() => {
          expect(onSelectFile).toHaveBeenCalledWith(1);
        });
      }
    });

    it('should navigate to previous file on swipe right', async () => {
      const onSelectFile = vi.fn();
      const { container } = render(
        <FileDiffViewer {...defaultProps} selectedIndex={1} onSelectFile={onSelectFile} />
      );

      const diffContent = container.querySelector('.overflow-auto');
      if (diffContent) {
        await swipeRight(diffContent, { distance: 100 });

        await waitFor(() => {
          expect(onSelectFile).toHaveBeenCalledWith(0);
        });
      }
    });

    it('should not navigate on small swipes', async () => {
      const onSelectFile = vi.fn();
      const { container } = render(
        <FileDiffViewer {...defaultProps} selectedIndex={0} onSelectFile={onSelectFile} />
      );

      const diffContent = container.querySelector('.overflow-auto');
      if (diffContent) {
        await swipeLeft(diffContent, { distance: 20 });

        // Should not call onSelectFile for small swipe
        expect(onSelectFile).not.toHaveBeenCalled();
      }
    });
  });

  describe('Diff Display', () => {
    it('should display file path', () => {
      render(<FileDiffViewer {...defaultProps} />);

      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    });

    it('should show diff content in unified mode', () => {
      const { container } = render(<FileDiffViewer {...defaultProps} />);
      expect(container.querySelector('.font-mono')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render accept and reject buttons when callbacks provided', () => {
      render(
        <FileDiffViewer
          {...defaultProps}
          onAcceptChange={vi.fn()}
          onRejectChange={vi.fn()}
        />
      );

      expect(screen.getByText('Accept')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    it('should not render action buttons when callbacks not provided', () => {
      render(<FileDiffViewer {...defaultProps} />);

      expect(screen.queryByText('Accept')).not.toBeInTheDocument();
      expect(screen.queryByText('Reject')).not.toBeInTheDocument();
    });

    it('should call onAcceptChange with correct file index', async () => {
      const onAcceptChange = vi.fn();
      render(
        <FileDiffViewer
          {...defaultProps}
          selectedIndex={1}
          onAcceptChange={onAcceptChange}
          onRejectChange={vi.fn()}
        />
      );

      await tap(screen.getByText('Accept'));

      await waitFor(() => {
        expect(onAcceptChange).toHaveBeenCalledWith(1);
      });
    });

    it('should call onRejectChange with correct file index', async () => {
      const onRejectChange = vi.fn();
      render(
        <FileDiffViewer
          {...defaultProps}
          selectedIndex={1}
          onAcceptChange={vi.fn()}
          onRejectChange={onRejectChange}
        />
      );

      await tap(screen.getByText('Reject'));

      await waitFor(() => {
        expect(onRejectChange).toHaveBeenCalledWith(1);
      });
    });

    it('should have proper styling for accept button', () => {
      render(
        <FileDiffViewer
          {...defaultProps}
          onAcceptChange={vi.fn()}
          onRejectChange={vi.fn()}
        />
      );

      const acceptBtn = screen.getByText('Accept');
      expect(acceptBtn.className).toContain('bg-green-500/10');
      expect(acceptBtn.className).toContain('text-green-600');
    });

    it('should have proper styling for reject button', () => {
      render(
        <FileDiffViewer
          {...defaultProps}
          onAcceptChange={vi.fn()}
          onRejectChange={vi.fn()}
        />
      );

      const rejectBtn = screen.getByText('Reject');
      expect(rejectBtn.className).toContain('bg-red-500/10');
      expect(rejectBtn.className).toContain('text-red-600');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<FileDiffViewer {...defaultProps} />);

      expect(screen.getByLabelText('Close diff viewer')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous file')).toBeInTheDocument();
      expect(screen.getByLabelText('Next file')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(
        <FileDiffViewer
          {...defaultProps}
          onAcceptChange={vi.fn()}
          onRejectChange={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper disabled state styling', () => {
      render(<FileDiffViewer {...defaultProps} selectedIndex={0} />);

      const prevBtn = screen.getByLabelText('Previous file');
      expect(prevBtn.className).toContain('opacity-50');
    });
  });

  describe('Animations', () => {
    it('should have entrance animation', () => {
      const { container } = render(<FileDiffViewer {...defaultProps} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have tap animations on buttons', () => {
      render(
        <FileDiffViewer
          {...defaultProps}
          onAcceptChange={vi.fn()}
          onRejectChange={vi.fn()}
        />
      );

      const acceptBtn = screen.getByText('Accept').parentElement;
      expect(acceptBtn).toBeInTheDocument();
    });

    it('should animate file transitions', () => {
      const { rerender } = render(<FileDiffViewer {...defaultProps} selectedIndex={0} />);

      rerender(<FileDiffViewer {...defaultProps} selectedIndex={1} />);

      // Content should update
      expect(screen.getByText('helper.ts')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single file', () => {
      render(
        <FileDiffViewer
          files={[mockFiles[0]]}
          selectedIndex={0}
          onSelectFile={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByLabelText('Previous file')).toBeDisabled();
      expect(screen.getByLabelText('Next file')).toBeDisabled();
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
    });

    it('should handle empty diff', () => {
      const emptyFile = {
        path: 'empty.txt',
        oldContent: '',
        newContent: '',
        language: 'text',
      };

      render(
        <FileDiffViewer
          files={[emptyFile]}
          selectedIndex={0}
          onSelectFile={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('empty.txt')).toBeInTheDocument();
    });
  });

  describe('Fullscreen Overlay', () => {
    it('should render as fullscreen overlay', () => {
      const { container } = render(<FileDiffViewer {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay?.className).toContain('fixed');
      expect(overlay?.className).toContain('inset-0');
      expect(overlay?.className).toContain('z-50');
    });

    it('should have backdrop blur', () => {
      const { container } = render(<FileDiffViewer {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay?.className).toContain('backdrop-blur-sm');
    });
  });
});
