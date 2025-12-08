import { useState } from 'react';
import { Star } from 'lucide-react';
import { BuildDesignToggle } from '@/components/mobile/create/BuildDesignToggle';
import { TemplateSelector } from '@/components/mobile/create/TemplateSelector';
import { PromptInput } from '@/components/mobile/create/PromptInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';

export function CreateScreen() {
  const [mode, setMode] = useState<'build' | 'design'>('build');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('web');
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsCreating(true);
    try {
      const project = await api.createProject(`/projects/${Date.now()}`);
      // Navigate to workspace after creation
      console.log('Created project:', project);
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="h-full flex flex-col mobile-safe-area-inset"
      style={{
        backgroundColor: 'var(--mobile-bg-primary)',
        fontFamily: 'var(--mobile-font-sans)',
      }}
    >
      <ScrollArea className="flex-1">
        <div
          className="space-y-8"
          style={{
            padding: 'var(--mobile-space-6)',
          }}
        >
          {/* Greeting */}
          <div
            className="text-center"
            style={{
              paddingTop: 'var(--mobile-space-8)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--mobile-font-size-xl)',
                color: 'var(--mobile-text-secondary)',
                fontWeight: 'var(--mobile-font-weight-regular)',
                marginBottom: 'var(--mobile-space-1)',
              }}
            >
              Hi there,
            </p>
            <h1
              style={{
                fontSize: 'var(--mobile-font-size-3xl)',
                fontWeight: 'var(--mobile-font-weight-bold)',
                color: 'var(--mobile-text-primary)',
                lineHeight: 'var(--mobile-line-height-tight)',
              }}
            >
              what do you want to make?
            </h1>
          </div>

          {/* Build/Design Toggle */}
          <BuildDesignToggle value={mode} onChange={setMode} />

          {/* Prompt Input */}
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleCreate}
            isLoading={isCreating}
            placeholder="Describe the idea you want to build..."
          />

          {/* Template Selector */}
          <TemplateSelector
            selected={selectedTemplate}
            onSelect={setSelectedTemplate}
          />

          {/* Footer */}
          <div
            className="text-center"
            style={{
              paddingTop: 'var(--mobile-space-4)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--mobile-font-size-sm)',
                color: 'var(--mobile-text-tertiary)',
                marginBottom: 'var(--mobile-space-2)',
              }}
            >
              Start creating for free
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{
                fontSize: 'var(--mobile-font-size-sm)',
                color: 'var(--mobile-accent-gold)',
                textDecoration: 'none',
                fontWeight: 'var(--mobile-font-weight-medium)',
              }}
            >
              <Star size={14} fill="currentColor" />
              <span>Join Core to unlock more usage</span>
            </a>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
