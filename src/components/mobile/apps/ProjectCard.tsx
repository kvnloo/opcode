import { Card } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  author: string;
  isPublic: boolean;
  previewImage?: string;
  status?: 'waiting' | 'running' | 'stopped';
  onClick?: () => void;
}

export function ProjectCard({
  name,
  author,
  isPublic,
  previewImage,
  status,
  onClick
}: ProjectCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {/* Preview Image */}
      <div className="aspect-video bg-muted relative">
        {previewImage ? (
          <img
            src={previewImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl">📱</span>
          </div>
        )}

        {/* Status Badge */}
        {status === 'waiting' && (
          <div className="absolute top-2 left-2 bg-yellow-500/90 text-white text-xs px-2 py-1 rounded">
            Waiting for you
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{author}</p>
          </div>

          {/* Public/Private Indicator */}
          <div className="flex items-center gap-1 text-muted-foreground">
            {isPublic ? (
              <>
                <Globe size={14} />
                <span className="text-xs">Public</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span className="text-xs">Private</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
