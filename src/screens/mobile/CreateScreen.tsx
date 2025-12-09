import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Code,
  Globe,
  Smartphone,
  Server,
  Database,
  ArrowRight,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { invoke } from '@tauri-apps/api/core';
import { motion, AnimatePresence } from 'framer-motion';

type ProjectType = 'web' | 'api' | 'mobile' | 'fullstack' | 'custom';

interface Template {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  icon: React.ReactNode;
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'nextjs',
    name: 'Next.js App',
    description: 'React framework with SSR, routing, and API routes',
    type: 'web',
    icon: <Globe className="w-5 h-5" />,
    tags: ['react', 'typescript', 'tailwind'],
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'RESTful API with Express.js and TypeScript',
    type: 'api',
    icon: <Server className="w-5 h-5" />,
    tags: ['nodejs', 'typescript', 'rest'],
  },
  {
    id: 'react-native',
    name: 'React Native',
    description: 'Cross-platform mobile app with Expo',
    type: 'mobile',
    icon: <Smartphone className="w-5 h-5" />,
    tags: ['react', 'typescript', 'expo'],
  },
  {
    id: 'fullstack',
    name: 'Full Stack',
    description: 'Next.js frontend with Prisma and PostgreSQL',
    type: 'fullstack',
    icon: <Database className="w-5 h-5" />,
    tags: ['nextjs', 'prisma', 'postgres'],
  },
];

type CreationStep = 'describe' | 'template' | 'creating' | 'done';

export function CreateScreen() {
  const [step, setStep] = useState<CreationStep>('describe');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedTemplates, setSuggestedTemplates] = useState<Template[]>([]);
  const [creationProgress, setCreationProgress] = useState(0);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Analyze description and suggest templates
  const analyzeDescription = useCallback(async () => {
    if (!description.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call backend to analyze and suggest templates
      const suggestions = await invoke<string[]>('analyze_project_description', {
        description,
      });

      // Map suggestion IDs to templates
      const suggested = templates.filter(t =>
        suggestions.includes(t.id) ||
        t.tags.some(tag => description.toLowerCase().includes(tag))
      );

      setSuggestedTemplates(suggested.length > 0 ? suggested : templates);
      setStep('template');
    } catch (err) {
      // Fallback to keyword matching if backend fails
      const keywords = description.toLowerCase();
      const suggested = templates.filter(t =>
        t.tags.some(tag => keywords.includes(tag)) ||
        t.name.toLowerCase().includes(keywords) ||
        t.description.toLowerCase().includes(keywords)
      );
      setSuggestedTemplates(suggested.length > 0 ? suggested : templates);
      setStep('template');
    } finally {
      setIsAnalyzing(false);
    }
  }, [description]);

  // Create the project
  const handleCreateProject = useCallback(async () => {
    if (!selectedTemplate || !projectName.trim()) return;

    setStep('creating');
    setCreationProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCreationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Create project via backend
      const project = await invoke<any>('create_ai_project', {
        name: projectName,
        description,
        template: selectedTemplate.id,
      });

      clearInterval(progressInterval);
      setCreationProgress(100);
      setCreatedProject(project);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setStep('template');
    }
  }, [selectedTemplate, projectName, description]);

  // Generate project name from description
  const generateProjectName = useCallback(() => {
    const words = description.split(' ').slice(0, 3);
    const name = words.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    setProjectName(name || 'my-project');
  }, [description]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold">Create</h1>
      </header>

      <AnimatePresence mode="wait">
        {/* Step 1: Describe your project */}
        {step === 'describe' && (
          <motion.div
            key="describe"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-4"
          >
            <h2 className="text-lg font-medium mb-2">
              What do you want to make?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Describe your project idea and we'll suggest the best templates.
            </p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A task management app with user authentication, real-time updates, and a mobile-friendly interface..."
              className="flex-1 min-h-[200px] p-4 rounded-lg bg-muted border border-border text-sm resize-none"
              autoFocus
            />

            <HapticButton
              className="mt-4 w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={analyzeDescription}
              disabled={!description.trim() || isAnalyzing}
              aria-label="Continue to template selection"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </HapticButton>
          </motion.div>
        )}

        {/* Step 2: Select template */}
        {step === 'template' && (
          <motion.div
            key="template"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-4"
          >
            <h2 className="text-lg font-medium mb-2">
              Choose a template
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {suggestedTemplates.length > 0
                ? 'Based on your description, we recommend these templates:'
                : 'Select a template to get started:'}
            </p>

            <div className="flex-1 overflow-auto space-y-3 mb-4">
              {suggestedTemplates.map((template) => (
                <HapticButton
                  key={template.id}
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground',
                    'w-full flex items-start gap-3 p-4 rounded-lg border text-left',
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card'
                  )}
                  onClick={() => {
                    setSelectedTemplate(template);
                    if (!projectName) generateProjectName();
                  }}
                  aria-selected={selectedTemplate?.id === template.id}
                >
                  <div className="flex-shrink-0 p-2 rounded-md bg-muted">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.description}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </HapticButton>
              ))}
            </div>

            {selectedTemplate && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full px-4 py-2 rounded-md bg-muted border border-border text-sm"
                />

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <HapticButton
                  className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleCreateProject}
                  disabled={!projectName.trim()}
                  aria-label="Create project"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Create Project
                </HapticButton>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Creating */}
        {step === 'creating' && (
          <motion.div
            key="creating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-lg font-medium mb-2">Creating your project</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Setting up {projectName} with {selectedTemplate?.name}...
            </p>

            <div className="w-full max-w-xs">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${creationProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {creationProgress}%
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-lg font-medium mb-2">Project created!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {projectName} is ready to go.
            </p>

            <HapticButton
              className="w-full max-w-xs py-3 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                // Navigate to project - would use router in production
                console.log('Opening project:', createdProject);
              }}
              aria-label="Open project"
            >
              Open Project
              <ArrowRight className="w-4 h-4 ml-2" />
            </HapticButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CreateScreen;
