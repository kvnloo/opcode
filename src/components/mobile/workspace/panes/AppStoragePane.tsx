import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Download, Trash2, File, Image, Video, Music, FileText, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface StorageFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  uploadedAt: Date;
  url: string;
}

interface AppStoragePaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function AppStoragePane({ projectId: _projectId, onBack, className }: AppStoragePaneProps) {
  const [files, _setFiles] = useState<StorageFile[]>([
    { id: '1', name: 'avatar.png', type: 'image', size: 245760, uploadedAt: new Date(), url: '#' },
    { id: '2', name: 'demo.mp4', type: 'video', size: 5242880, uploadedAt: new Date(), url: '#' },
    { id: '3', name: 'report.pdf', type: 'document', size: 102400, uploadedAt: new Date(), url: '#' },
  ]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: StorageFile['type']) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-lg font-semibold">App Storage</h2>
        <div className="ml-auto">
          <HapticButton
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Upload file"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </HapticButton>
        </div>
      </header>

      {/* Storage stats */}
      <div className="p-4 bg-muted/50">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Storage used</span>
          <span className="font-medium">{formatSize(totalSize)} / 10 GB</span>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(totalSize / (10 * 1024 * 1024 * 1024)) * 100}%` }}
          />
        </div>
      </div>

      {/* Files list */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
          >
            <div className="flex-shrink-0 p-2 rounded-md bg-muted">
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{file.name}</div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{formatSize(file.size)}</span>
                <span>•</span>
                <span>{file.uploadedAt.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <HapticButton
                className="hover:bg-accent hover:text-accent-foreground"
                aria-label="Download"
              >
                <Download className="w-4 h-4" />
              </HapticButton>
              <HapticButton
                className="hover:bg-accent hover:text-accent-foreground text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </HapticButton>
            </div>
          </div>
        ))}
      </div>

      {/* Upload area */}
      <div className="p-4 border-t border-border">
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here
          </p>
          <HapticButton className="border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            Browse Files
          </HapticButton>
        </div>
      </div>
    </div>
  );
}

export default AppStoragePane;
