import { ProjectCard } from './ProjectCard';

interface Project {
  id: string;
  name: string;
  author: string;
  isPublic: boolean;
  previewImage?: string;
  status?: 'waiting' | 'running' | 'stopped';
}

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function ProjectList({ projects, onProjectClick }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-6xl mb-4">🚀</span>
        <h3 className="text-lg font-semibold mb-2">No apps yet</h3>
        <p className="text-muted-foreground">
          Create your first app to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          name={project.name}
          author={project.author}
          isPublic={project.isPublic}
          previewImage={project.previewImage}
          status={project.status}
          onClick={() => onProjectClick?.(project)}
        />
      ))}
    </div>
  );
}
