/**
 * Shared test data and fixtures for mobile tests
 */

export const mockProjects = [
  {
    id: 'test-project-1',
    path: '/projects/Test Project',
    name: 'Test Project',
    sessions: ['session-1', 'session-2'],
    created_at: Date.now() - 86400000, // 1 day ago
    most_recent_session: Date.now()
  },
  {
    id: 'test-project-2',
    path: '/projects/Another Project',
    name: 'Another Project',
    sessions: ['session-3'],
    created_at: Date.now() - 172800000, // 2 days ago
    most_recent_session: Date.now() - 3600000 // 1 hour ago
  }
];

export const mockSessions = {
  'test-project-1': [
    {
      id: 'session-1',
      project_id: 'test-project-1',
      started_at: Date.now() - 7200000, // 2 hours ago
      last_active: Date.now() - 3600000, // 1 hour ago
      status: 'idle' as const
    },
    {
      id: 'session-2',
      project_id: 'test-project-1',
      started_at: Date.now() - 86400000, // 1 day ago
      last_active: Date.now() - 43200000, // 12 hours ago
      status: 'idle' as const
    }
  ],
  'test-project-2': [
    {
      id: 'session-3',
      project_id: 'test-project-2',
      started_at: Date.now() - 172800000, // 2 days ago
      last_active: Date.now() - 86400000, // 1 day ago
      status: 'idle' as const
    }
  ]
};

export const mockSessionOutputs = {
  'session-1': 'Test output for session 1',
  'session-2': 'Test output for session 2',
  'session-3': 'Test output for session 3'
};

export const mockWorkspace = {
  currentProject: {
    id: 'test-project-1',
    name: 'Test Project',
    path: '/projects/Test Project'
  }
};
