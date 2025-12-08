import { useState } from 'react';
import { ProjectList } from '@/components/mobile/apps/ProjectList';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkspaceStore } from '@/stores/workspaceStore';

interface Project {
  id: string;
  name: string;
  author: string;
  isPublic: boolean;
  previewImage?: string;
  status?: 'waiting' | 'running' | 'stopped';
  path?: string;
}

export function AppsScreen() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const { setProject, currentProject } = useWorkspaceStore();

  // Placeholder data - will be wired to actual data source later
  const projects: Project[] = [];

  const handleProjectSelect = (project: Project) => {
    // Set the project in the workspace store
    setProject({
      id: project.id,
      name: project.name,
      path: project.path || `/projects/${project.id}`
    });

    // Show the workspace screen
    setShowWorkspace(true);
  };

  const handleWorkspaceBack = () => {
    // Return to apps list
    setShowWorkspace(false);

    // Clear the current project
    setProject(null);
  };

  // If workspace is active and we have a current project, show WorkspaceScreen
  if (showWorkspace && currentProject) {
    return (
      <WorkspaceScreen
        projectId={currentProject.id}
        projectName={currentProject.name}
        onBack={handleWorkspaceBack}
      />
    );
  }

  // Otherwise, show the apps list
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Apps</h1>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border-b border-border">
        <button className="flex items-center gap-2 text-muted-foreground">
          <span>All Apps</span>
          <span>→</span>
        </button>
      </div>

      {/* Project List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <ProjectList projects={projects} onProjectClick={handleProjectSelect} />
        </div>
      </ScrollArea>
    </div>
  );
}
