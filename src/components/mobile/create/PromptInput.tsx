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
      <div
        className="overflow-hidden"
        style={{
          border: '1px solid var(--mobile-border-default)',
          borderRadius: 'var(--mobile-radius-xl)',
          backgroundColor: 'var(--mobile-bg-input)',
        }}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-0 resize-none focus-visible:ring-0 bg-transparent"
          disabled={isLoading}
          style={{
            minHeight: '120px',
            fontSize: 'var(--mobile-font-size-md)',
            color: 'var(--mobile-text-primary)',
            fontFamily: 'var(--mobile-font-sans)',
            padding: 'var(--mobile-space-4)',
          }}
        />

        {/* Action Bar */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: 'var(--mobile-space-3)',
            borderTop: '1px solid var(--mobile-border-default)',
          }}
        >
          <div
            className="flex"
            style={{
              gap: 'var(--mobile-space-2)',
            }}
          >
            <button
              className="rounded-lg mobile-active-scale transition-all"
              aria-label="Attach file"
              style={{
                padding: 'var(--mobile-space-2)',
                color: 'var(--mobile-icon-default)',
                minHeight: 'var(--mobile-touch-target-min)',
                minWidth: 'var(--mobile-touch-target-min)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Paperclip size={20} />
            </button>
            <button
              className="rounded-lg mobile-active-scale transition-all"
              aria-label="Voice input"
              style={{
                padding: 'var(--mobile-space-2)',
                color: 'var(--mobile-icon-default)',
                minHeight: 'var(--mobile-touch-target-min)',
                minWidth: 'var(--mobile-touch-target-min)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mic size={20} />
            </button>
          </div>

          <button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className="flex items-center gap-2 rounded-lg font-medium transition-all mobile-active-scale"
            style={{
              padding: '10px 20px',
              fontSize: 'var(--mobile-font-size-md)',
              fontWeight: 'var(--mobile-font-weight-semibold)',
              borderRadius: 'var(--mobile-radius-md)',
              backgroundColor: value.trim() && !isLoading
                ? 'var(--mobile-accent-primary)'
                : 'var(--mobile-bg-tertiary)',
              color: value.trim() && !isLoading
                ? '#FFFFFF'
                : 'var(--mobile-text-disabled)',
              cursor: !value.trim() || isLoading ? 'not-allowed' : 'pointer',
              opacity: !value.trim() || isLoading ? 0.6 : 1,
            }}
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
