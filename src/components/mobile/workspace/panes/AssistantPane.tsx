import { useState, useRef, useEffect, useCallback } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { cn } from '@/lib/utils';
import { MessageSquare, Send, Trash2, ChevronLeft, Loader2 } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantPaneProps {
  projectId: string;
  projectPath: string;
  onBack: () => void;
  className?: string;
}

export function AssistantPane({ projectId, projectPath, onBack, className }: AssistantPaneProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! How can I help you with your project today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const unlistenRefs = useRef<UnlistenFn[]>([]);
  const isTauriEnvironment = typeof window !== 'undefined' && (window as any).__TAURI__;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentAssistantMessage]);

  // Setup event listeners for Claude output
  useEffect(() => {
    if (!isTauriEnvironment) return;

    const setupListeners = async () => {
      try {
        // Listen for streaming Claude output
        const unlistenOutput = await listen('claude-output', (event: any) => {
          const { content } = event.payload;
          if (content) {
            setCurrentAssistantMessage(prev => prev + content);
          }
        });
        unlistenRefs.current.push(unlistenOutput);

        // Listen for session completion
        const unlistenCompleted = await listen('claude-session-completed', (event: any) => {
          if (currentAssistantMessage.trim()) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content: currentAssistantMessage.trim(),
                timestamp: new Date(),
              },
            ]);
            setCurrentAssistantMessage('');
          }
          setIsLoading(false);
        });
        unlistenRefs.current.push(unlistenCompleted);

        // Listen for errors
        const unlistenError = await listen('claude-session-error', (event: any) => {
          const errorMessage = event.payload?.error || 'An error occurred while processing your request.';
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Error: ${errorMessage}`,
              timestamp: new Date(),
            },
          ]);
          setCurrentAssistantMessage('');
          setIsLoading(false);
        });
        unlistenRefs.current.push(unlistenError);
      } catch (error) {
        console.error('Failed to setup event listeners:', error);
      }
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      unlistenRefs.current.forEach(unlisten => unlisten());
      unlistenRefs.current = [];
    };
  }, [isTauriEnvironment, currentAssistantMessage]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const userPrompt = input.trim();
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentAssistantMessage('');

    try {
      if (isTauriEnvironment) {
        // Real API call using Claude Code
        await api.executeClaudeCode(
          projectPath,
          userPrompt,
          'claude-sonnet-4-5-20250929' // Default model
        );
        // Response will come through event listeners
      } else {
        // Fallback mock for web/dev environment
        setTimeout(() => {
          const mockResponse = `I received your message: "${userPrompt}". This is a development mode response. In production, this would be connected to the Claude API.`;
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: mockResponse,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: Failed to send message. ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  }, [input, isLoading, messages, projectPath, isTauriEnvironment]);

  const clearConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Conversation cleared. How can I help you?',
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <MessageSquare size={20} className="text-primary" />
        <h2 className="text-lg font-semibold flex-1">AI Assistant</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          className="p-2 -mr-2"
          aria-label="Clear conversation"
        >
          <Trash2 size={18} className="text-destructive" />
        </Button>
      </header>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col gap-1',
              message.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              )}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
            <span className="text-xs text-muted-foreground px-2">
              {formatTime(message.timestamp)}
            </span>
          </div>
        ))}

        {/* Streaming assistant message */}
        {currentAssistantMessage && (
          <div className="flex flex-col gap-1 items-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2 bg-muted text-foreground">
              <p className="text-sm whitespace-pre-wrap break-words">
                {currentAssistantMessage}
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-1">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-2 rounded-full bg-muted border border-border text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Message input"
          />
          <HapticButton
            className={cn(
              'px-4 bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'rounded-full'
            )}
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </HapticButton>
        </div>
      </div>
    </div>
  );
}

export default AssistantPane;
