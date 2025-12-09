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
        projectPath={currentProject.path || `/projects/${currentProject.id}`}
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
      {/* Header - Pixel-perfect header matching Replit specs */}
      <div
        className="flex items-center justify-center border-b"
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
            fontSize: 'var(--mobile-font-size-3xl)',
            fontWeight: 'var(--mobile-font-weight-medium)',
            color: 'var(--mobile-text-primary)',
            lineHeight: 'var(--mobile-line-height-tight)',
            margin: 0
          }}
        >
          Apps
        </h1>
      </div>

      {/* Filter Bar - Pixel-perfect filter with proper spacing */}
      <div
        style={{
          paddingTop: 'var(--mobile-space-5)',
          paddingBottom: 'var(--mobile-space-5)',
          marginLeft: 'calc(-1 * var(--mobile-layout-padding-screen))',
          marginRight: 'calc(-1 * var(--mobile-layout-padding-screen))',
          paddingLeft: 'var(--mobile-layout-padding-screen)',
          paddingRight: 'var(--mobile-layout-padding-screen)',
        }}
      >
        <button
          className="flex items-center gap-2 mobile-tap-highlight transition-colors mobile-touch-target"
          style={{
            color: 'var(--mobile-text-secondary)',
            fontSize: 'var(--mobile-font-size-md)',
            fontWeight: 'var(--mobile-font-weight-medium)',
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            minHeight: 'var(--mobile-touch-target-min)'
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
          {/* Loading State - Pixel-perfect with proper icon size and spacing */}
          {isLoadingProjects && (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                paddingTop: 'var(--mobile-space-8)',
                paddingBottom: 'var(--mobile-space-8)',
                gap: 'var(--mobile-gap-base)'
              }}
            >
              <Loader2
                className="animate-spin"
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
                  margin: 0
                }}
              >
                Loading projects...
              </p>
            </div>
          )}

          {/* Error State - Pixel-perfect error display with proper styling */}
          {error && !isLoadingProjects && (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                paddingTop: 'var(--mobile-space-8)',
                paddingBottom: 'var(--mobile-space-8)',
                gap: 'var(--mobile-space-3)'
              }}
            >
              <div
                style={{
                  fontSize: 'var(--mobile-font-size-5xl)',
                  marginBottom: 'var(--mobile-space-2)'
                }}
              >
                ⚠️
              </div>
              <h3
                style={{
                  fontSize: 'var(--mobile-font-size-lg)',
                  fontWeight: 'var(--mobile-font-weight-semibold)',
                  color: 'var(--mobile-text-primary)',
                  margin: 0
                }}
              >
                Failed to load projects
              </h3>
              <p
                className="text-center"
                style={{
                  fontSize: 'var(--mobile-font-size-sm)',
                  color: 'var(--mobile-text-tertiary)',
                  maxWidth: '280px',
                  margin: 0,
                  marginBottom: 'var(--mobile-space-4)',
                  lineHeight: 'var(--mobile-line-height-relaxed)'
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
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: 'var(--mobile-button-height-base)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary)'}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State - Pixel-perfect empty state with proper spacing */}
          {!isLoadingProjects && !error && projects.length === 0 && (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                paddingTop: 'var(--mobile-space-16)',
                paddingBottom: 'var(--mobile-space-16)',
                gap: 'var(--mobile-space-3)'
              }}
            >
              <div
                style={{
                  fontSize: 'var(--mobile-font-size-6xl)',
                  opacity: 'var(--mobile-animation-opacity-muted)',
                  marginBottom: 'var(--mobile-space-2)'
                }}
              >
                📦
              </div>
              <h3
                style={{
                  fontSize: 'var(--mobile-font-size-lg)',
                  fontWeight: 'var(--mobile-font-weight-semibold)',
                  color: 'var(--mobile-text-primary)',
                  margin: 0
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
                  margin: 0
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
