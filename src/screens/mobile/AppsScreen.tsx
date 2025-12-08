import { useState, useEffect } from 'react';
import { ProjectList } from '@/components/mobile/apps/ProjectList';
import { WorkspaceScreen } from '@/screens/mobile/WorkspaceScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSessionStore } from '@/stores/sessionStore';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { Project as APIProject } from '@/lib/api';

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

  // Connect to sessionStore for live project data
  const {
    projects: apiProjects,
    fetchProjects,
    isLoadingProjects,
    error
  } = useSessionStore();

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Sync showWorkspace with currentProject state
  // This ensures that when a project is set externally (e.g., in tests or deep links),
  // the workspace screen is shown automatically
  useEffect(() => {
    if (currentProject) {
      setShowWorkspace(true);
    }
  }, [currentProject]);

  // Transform API projects to UI format
  const projects: Project[] = apiProjects.map((apiProject: APIProject) => ({
    id: apiProject.id,
    name: apiProject.path.split('/').pop() || apiProject.id,
    author: 'You',
    isPublic: false,
    path: apiProject.path,
    status: undefined
  }));

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
    <div
      className="h-full flex flex-col mobile-safe-area-inset"
      style={{
        backgroundColor: 'var(--mobile-bg-primary)',
        padding: 'var(--mobile-layout-padding-screen)'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center border-b"
        style={{
          height: 'var(--mobile-header-height)',
          borderBottomColor: 'var(--mobile-border-default)',
          borderBottomWidth: '1px',
          marginLeft: 'calc(-1 * var(--mobile-layout-padding-screen))',
          marginRight: 'calc(-1 * var(--mobile-layout-padding-screen))',
          paddingLeft: 'var(--mobile-layout-padding-screen)',
          paddingRight: 'var(--mobile-layout-padding-screen)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--mobile-font-size-4xl)',
            fontWeight: 'var(--mobile-font-weight-bold)',
            color: 'var(--mobile-text-primary)',
            lineHeight: 'var(--mobile-line-height-tight)'
          }}
        >
          Apps
        </h1>
      </div>

      {/* Filter Bar */}
      <div
        className="border-b"
        style={{
          paddingTop: 'var(--mobile-space-4)',
          paddingBottom: 'var(--mobile-space-4)',
          borderBottomColor: 'var(--mobile-border-default)',
          borderBottomWidth: '1px',
          marginLeft: 'calc(-1 * var(--mobile-layout-padding-screen))',
          marginRight: 'calc(-1 * var(--mobile-layout-padding-screen))',
          paddingLeft: 'var(--mobile-layout-padding-screen)',
          paddingRight: 'var(--mobile-layout-padding-screen)',
        }}
      >
        <button
          className="flex items-center gap-2 mobile-tap-highlight transition-colors"
          style={{
            color: 'var(--mobile-text-secondary)',
            fontSize: 'var(--mobile-font-size-md)',
            fontWeight: 'var(--mobile-font-weight-medium)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mobile-text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mobile-text-secondary)'}
        >
          <span>All Apps</span>
          <ChevronDown
            style={{
              width: 'var(--mobile-icon-xs)',
              height: 'var(--mobile-icon-xs)',
            }}
          />
        </button>
      </div>

      {/* Project List */}
      <ScrollArea className="flex-1 mobile-smooth-scroll">
        <div
          className="space-y-4"
          style={{
            paddingTop: 'var(--mobile-space-4)',
          }}
        >
          {/* Loading State */}
          {isLoadingProjects && (
            <div
              className="flex flex-col items-center justify-center"
              style={{ paddingTop: 'var(--mobile-space-8)', paddingBottom: 'var(--mobile-space-8)' }}
            >
              <Loader2
                className="animate-spin mb-2"
                style={{
                  width: 'var(--mobile-icon-lg)',
                  height: 'var(--mobile-icon-lg)',
                  color: 'var(--mobile-accent-primary)',
                }}
              />
              <p
                style={{
                  color: 'var(--mobile-text-tertiary)',
                  fontSize: 'var(--mobile-font-size-md)',
                }}
              >
                Loading projects...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoadingProjects && (
            <div
              className="flex flex-col items-center justify-center"
              style={{ paddingTop: 'var(--mobile-space-8)', paddingBottom: 'var(--mobile-space-8)' }}
            >
              <div
                className="mb-4"
                style={{ color: 'var(--mobile-accent-error)' }}
              >
                <span style={{ fontSize: 'var(--mobile-font-size-5xl)' }}>⚠️</span>
              </div>
              <h3
                className="mb-2"
                style={{
                  fontSize: 'var(--mobile-font-size-lg)',
                  fontWeight: 'var(--mobile-font-weight-semibold)',
                  color: 'var(--mobile-text-primary)',
                }}
              >
                Failed to load projects
              </h3>
              <p
                className="mb-4 text-center"
                style={{
                  fontSize: 'var(--mobile-font-size-sm)',
                  color: 'var(--mobile-text-tertiary)',
                  maxWidth: '280px',
                }}
              >
                {error}
              </p>
              <button
                onClick={() => fetchProjects()}
                className="mobile-tap-highlight mobile-active-scale"
                style={{
                  padding: 'var(--mobile-button-padding-base)',
                  backgroundColor: 'var(--mobile-accent-primary)',
                  color: 'var(--mobile-text-primary)',
                  borderRadius: 'var(--mobile-button-radius)',
                  fontSize: 'var(--mobile-font-size-md)',
                  fontWeight: 'var(--mobile-font-weight-medium)',
                  transition: 'background-color var(--mobile-transition-base) var(--mobile-transition-ease)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary)'}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingProjects && !error && projects.length === 0 && (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                paddingTop: 'var(--mobile-space-16)',
                paddingBottom: 'var(--mobile-space-16)'
              }}
            >
              <div
                className="mb-4"
                style={{
                  fontSize: 'var(--mobile-font-size-6xl)',
                  opacity: 'var(--mobile-animation-opacity-muted)',
                }}
              >
                📦
              </div>
              <h3
                className="mb-2"
                style={{
                  fontSize: 'var(--mobile-font-size-lg)',
                  fontWeight: 'var(--mobile-font-weight-semibold)',
                  color: 'var(--mobile-text-primary)',
                }}
              >
                No projects yet
              </h3>
              <p
                className="text-center"
                style={{
                  fontSize: 'var(--mobile-font-size-sm)',
                  color: 'var(--mobile-text-tertiary)',
                  maxWidth: '280px',
                  lineHeight: 'var(--mobile-line-height-relaxed)',
                }}
              >
                Create your first project to get started
              </p>
            </div>
          )}

          {/* Project List */}
          {!isLoadingProjects && !error && projects.length > 0 && (
            <ProjectList projects={projects} onProjectClick={handleProjectSelect} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
