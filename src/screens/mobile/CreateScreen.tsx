import { useState } from 'react';
import { BuildDesignToggle } from '@/components/mobile/create/BuildDesignToggle';
import { TemplateSelector } from '@/components/mobile/create/TemplateSelector';
import { PromptInput } from '@/components/mobile/create/PromptInput';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CreateScreen() {
  const [mode, setMode] = useState<'build' | 'design'>('build');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('web');
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsCreating(true);
    // TODO: Implement actual creation logic
    console.log('Creating:', { mode, selectedTemplate, prompt });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Greeting */}
          <div className="text-center pt-8">
            <p className="text-xl text-muted-foreground">Hi there,</p>
            <h1 className="text-2xl font-bold mt-1">what do you want to make?</h1>
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
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Start creating for free</p>
            <a href="#" className="text-primary hover:underline">
              Join Core to unlock more usage
            </a>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
