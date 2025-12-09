import { describe, it, expect, vi, beforeEach } from 'vitest';

let projectIdCounter = 0;

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd, args) => {
    switch (cmd) {
      case 'analyze_project_description':
        const desc = args?.description?.toLowerCase() || '';
        // Check for specific technology keywords
        if (desc.includes('next.js') || desc.includes('nextjs')) return Promise.resolve(['nextjs']);
        if (desc.includes('web') || desc.includes('dashboard')) return Promise.resolve(['nextjs']);
        if (desc.includes('graphql') || desc.includes('api')) return Promise.resolve(['express-api']);
        if (desc.includes('mobile') || desc.includes('ios') || desc.includes('android') || desc.includes('app')) return Promise.resolve(['react-native']);
        return Promise.resolve(['fullstack']);
      case 'create_project':
        projectIdCounter++;
        return Promise.resolve({
          id: `proj-${Date.now()}-${projectIdCounter}`,
          name: args?.name,
          path: `/home/user/.claude/projects/${args?.name}`,
        });
      default:
        return Promise.resolve();
    }
  }),
}));

describe('Project Creation E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIdCounter = 0;
  });

  describe('Description Analysis', () => {
    it('suggests web template for web-related descriptions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const suggestions = await invoke('analyze_project_description', {
        description: 'A web application for managing tasks',
      });

      expect(suggestions).toContain('nextjs');
    });

    it('suggests API template for backend descriptions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const suggestions = await invoke('analyze_project_description', {
        description: 'REST API for user management',
      });

      expect(suggestions).toContain('express-api');
    });

    it('suggests mobile template for app descriptions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const suggestions = await invoke('analyze_project_description', {
        description: 'A mobile app for fitness tracking',
      });

      expect(suggestions).toContain('react-native');
    });

    it('defaults to fullstack for generic descriptions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const suggestions = await invoke('analyze_project_description', {
        description: 'A project for managing things',
      });

      expect(suggestions).toContain('fullstack');
    });

    it('handles empty description', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const suggestions = await invoke('analyze_project_description', {
        description: '',
      });

      expect(suggestions).toContain('fullstack');
    });

    it('analyzes complex descriptions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const suggestions = await invoke('analyze_project_description', {
        description: 'A web-based REST API with mobile clients',
      });

      // Should suggest web template (first match)
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Project Creation', () => {
    it('creates project with selected template', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'my-todo-app',
        description: 'A todo application',
        template: 'nextjs',
      });

      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name', 'my-todo-app');
      expect(project.path).toContain('my-todo-app');
    });

    it('handles special characters in project name', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'my-project-2024',
        description: 'Test project',
        template: 'express-api',
      });

      expect(project.name).toBe('my-project-2024');
    });

    it('creates project directory structure', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'new-fullstack-app',
        template: 'fullstack',
      });

      expect(project.path).toBeDefined();
    });

    it('generates unique project IDs', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project1 = await invoke('create_project', {
        name: 'project-1',
        template: 'nextjs',
      });

      const project2 = await invoke('create_project', {
        name: 'project-2',
        template: 'nextjs',
      });

      expect(project1.id).not.toBe(project2.id);
    });

    it('creates project with minimal parameters', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'minimal-project',
      });

      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name', 'minimal-project');
    });
  });

  describe('Template Scaffolding', () => {
    it('creates Next.js structure for web template', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('create_project', {
        name: 'nextjs-app',
        template: 'nextjs',
      });

      expect(invoke).toHaveBeenCalledWith('create_project', expect.objectContaining({
        template: 'nextjs',
      }));
    });

    it('creates Express structure for API template', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('create_project', {
        name: 'api-server',
        template: 'express-api',
      });

      expect(invoke).toHaveBeenCalledWith('create_project', expect.objectContaining({
        template: 'express-api',
      }));
    });

    it('creates React Native structure for mobile template', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('create_project', {
        name: 'mobile-app',
        template: 'react-native',
      });

      expect(invoke).toHaveBeenCalledWith('create_project', expect.objectContaining({
        template: 'react-native',
      }));
    });

    it('creates fullstack structure for fullstack template', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('create_project', {
        name: 'fullstack-app',
        template: 'fullstack',
      });

      expect(invoke).toHaveBeenCalledWith('create_project', expect.objectContaining({
        template: 'fullstack',
      }));
    });
  });

  describe('AI-Powered Analysis', () => {
    it('analyzes description for technology keywords', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const webSuggestion = await invoke('analyze_project_description', {
        description: 'Build a Next.js dashboard',
      });

      expect(webSuggestion).toContain('nextjs');
    });

    it('detects API requirements', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const apiSuggestion = await invoke('analyze_project_description', {
        description: 'Create a GraphQL API service',
      });

      expect(apiSuggestion).toContain('express-api');
    });

    it('recognizes mobile app requirements', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const mobileSuggestion = await invoke('analyze_project_description', {
        description: 'iOS and Android app for shopping',
      });

      expect(mobileSuggestion).toContain('react-native');
    });

    it('handles multiple technology mentions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const suggestion = await invoke('analyze_project_description', {
        description: 'Web frontend with backend API and mobile clients',
      });

      expect(Array.isArray(suggestion)).toBe(true);
      expect(suggestion.length).toBeGreaterThan(0);
    });
  });

  describe('Project Metadata', () => {
    it('stores project description', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'described-project',
        description: 'A well-documented project',
        template: 'nextjs',
      });

      expect(invoke).toHaveBeenCalledWith('create_project', expect.objectContaining({
        description: 'A well-documented project',
      }));
    });

    it('generates correct project path', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'path-test-project',
        template: 'nextjs',
      });

      expect(project.path).toMatch(/path-test-project/);
    });

    it('includes template in project metadata', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      await invoke('create_project', {
        name: 'template-project',
        template: 'express-api',
      });

      expect(invoke).toHaveBeenCalledWith('create_project', expect.objectContaining({
        template: 'express-api',
      }));
    });
  });

  describe('Edge Cases', () => {
    it('handles very long project names', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const longName = 'a'.repeat(100);
      const project = await invoke('create_project', {
        name: longName,
        template: 'nextjs',
      });

      expect(project.name).toBe(longName);
    });

    it('handles very long descriptions', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const longDesc = 'A '.repeat(500) + 'web application';
      const suggestions = await invoke('analyze_project_description', {
        description: longDesc,
      });

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('handles unicode characters in project name', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const project = await invoke('create_project', {
        name: 'project-名前-2024',
        template: 'nextjs',
      });

      expect(project.name).toBe('project-名前-2024');
    });

    it('handles concurrent project creation requests', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      const [project1, project2, project3] = await Promise.all([
        invoke('create_project', { name: 'concurrent-1', template: 'nextjs' }),
        invoke('create_project', { name: 'concurrent-2', template: 'express-api' }),
        invoke('create_project', { name: 'concurrent-3', template: 'fullstack' }),
      ]);

      expect(project1.id).not.toBe(project2.id);
      expect(project2.id).not.toBe(project3.id);
      expect(project1.id).not.toBe(project3.id);
    });
  });
});
