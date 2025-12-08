import React, { useRef } from 'react';
import { Paperclip, Mic, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Describe what you want to build..."
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[120px] border-0 resize-none focus-visible:ring-0 bg-transparent"
          disabled={isLoading}
        />

        {/* Action Bar */}
        <div className="flex items-center justify-between p-3 border-t border-border">
          <div className="flex gap-2">
            <button
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
              aria-label="Attach file"
            >
              <Paperclip size={20} />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
              aria-label="Voice input"
            >
              <Mic size={20} />
            </button>
          </div>

          <button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              value.trim() && !isLoading
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating App...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Create</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
