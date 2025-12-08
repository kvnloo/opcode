import { useState } from 'react';
import { BuildDesignToggle } from '@/components/mobile/create/BuildDesignToggle';
import { TemplateSelector } from '@/components/mobile/create/TemplateSelector';
import { PromptInput } from '@/components/mobile/create/PromptInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';

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
      {/* Header - matching AppsScreen style */}
      <div
        className="flex items-center justify-center border-b"
        style={{
          height: 'var(--mobile-header-height)',
          borderBottomColor: 'var(--mobile-border-default)',
          borderBottomWidth: '1px',
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
          Create
        </h1>
      </div>

      <ScrollArea className="flex-1">
        <div
          className="space-y-6"
          style={{
            padding: 'var(--mobile-space-6)',
          }}
        >
          {/* Greeting */}
          <div
            className="text-center"
            style={{
              paddingTop: 'var(--mobile-space-4)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--mobile-font-size-2xl)',
                color: 'var(--mobile-text-primary)',
                fontWeight: 'var(--mobile-font-weight-regular)',
                marginBottom: 'var(--mobile-space-1)',
                lineHeight: 'var(--mobile-line-height-normal)',
              }}
            >
              Hi there,
            </p>
            <h2
              style={{
                fontSize: 'var(--mobile-font-size-2xl)',
                fontWeight: 'var(--mobile-font-weight-regular)',
                color: 'var(--mobile-text-primary)',
                lineHeight: 'var(--mobile-line-height-normal)',
              }}
            >
              what do you want to make?
            </h2>
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
              paddingBottom: 'var(--mobile-space-8)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--mobile-font-size-md)',
                color: 'var(--mobile-text-tertiary)',
                marginBottom: 'var(--mobile-space-1)',
              }}
            >
              Start creating for free
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{
                fontSize: 'var(--mobile-font-size-md)',
                color: 'var(--mobile-accent-primary)',
                textDecoration: 'underline',
                fontWeight: 'var(--mobile-font-weight-medium)',
              }}
            >
              <span>Join Opcode Core</span>
            </a>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
