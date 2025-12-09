import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, MessageSquare, Video, Mic, MicOff, VideoOff, UserPlus, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  cursor?: { x: number; y: number };
  color: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface MultiplayerPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function MultiplayerPane({ projectId: _projectId, onBack, className }: MultiplayerPaneProps) {
  const [activeTab, setActiveTab] = useState<'participants' | 'chat' | 'voice'>('participants');
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [participants, _setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', status: 'active', color: '#10b981' },
    { id: '2', name: 'Alice', status: 'active', color: '#3b82f6' },
    { id: '3', name: 'Bob', status: 'idle', color: '#f59e0b' },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', userId: '2', userName: 'Alice', message: 'Hey! Working on the auth system', timestamp: new Date() },
    { id: '2', userId: '3', userName: 'Bob', message: 'Cool, I am fixing the UI bugs', timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const getStatusColor = (status: Participant['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        userId: '1',
        userName: 'You',
        message: newMessage,
        timestamp: new Date(),
      }]);
      setNewMessage('');
    }
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
        <h2 className="text-lg font-semibold">Multiplayer</h2>
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
          {participants.filter(p => p.status === 'active').length} online
        </span>
        <div className="ml-auto">
          <HapticButton
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Invite"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Invite
          </HapticButton>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <HapticButton
          className={cn(
            'flex-1 py-3 rounded-none border-b-2 hover:bg-accent hover:text-accent-foreground',
            activeTab === 'participants' ? 'border-primary' : 'border-transparent'
          )}
          onClick={() => setActiveTab('participants')}
        >
          <Users className="w-4 h-4 mr-2" />
          Participants
        </HapticButton>
        <HapticButton
          className={cn(
            'flex-1 py-3 rounded-none border-b-2 hover:bg-accent hover:text-accent-foreground',
            activeTab === 'chat' ? 'border-primary' : 'border-transparent'
          )}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </HapticButton>
        <HapticButton
          className={cn(
            'flex-1 py-3 rounded-none border-b-2 hover:bg-accent hover:text-accent-foreground',
            activeTab === 'voice' ? 'border-primary' : 'border-transparent'
          )}
          onClick={() => setActiveTab('voice')}
        >
          <Video className="w-4 h-4 mr-2" />
          Voice
        </HapticButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'participants' && (
          <div className="p-4 space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.name[0]}
                  </div>
                  <div className={cn(
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
                    getStatusColor(participant.status)
                  )} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{participant.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {participant.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  'flex flex-col',
                  msg.userId === '1' ? 'items-end' : 'items-start'
                )}>
                  <div className="text-xs text-muted-foreground mb-1">
                    {msg.userName} • {msg.timestamp.toLocaleTimeString()}
                  </div>
                  <div className={cn(
                    'max-w-[80%] px-3 py-2 rounded-lg',
                    msg.userId === '1'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm"
                />
                <HapticButton
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSendMessage}
                  aria-label="Send message"
                >
                  Send
                </HapticButton>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Voice & Video Chat</h3>
              <p className="text-sm text-muted-foreground">
                Connect with your team in real-time
              </p>
            </div>
            <div className="flex gap-4">
              <HapticButton
                onClick={() => setMicOn(!micOn)}
                aria-label={micOn ? 'Mute' : 'Unmute'}
                className={cn(
                  "w-16 h-16 rounded-full",
                  micOn ? 'bg-primary text-primary-foreground' : 'border border-input bg-background'
                )}
              >
                {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </HapticButton>
              <HapticButton
                onClick={() => setVideoOn(!videoOn)}
                aria-label={videoOn ? 'Stop video' : 'Start video'}
                className={cn(
                  "w-16 h-16 rounded-full",
                  videoOn ? 'bg-primary text-primary-foreground' : 'border border-input bg-background'
                )}
              >
                {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </HapticButton>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {participants.slice(0, 4).map((participant) => (
                <div
                  key={participant.id}
                  className="aspect-video rounded-lg bg-muted flex items-center justify-center"
                  style={{ borderColor: participant.color, borderWidth: 2 }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.name[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiplayerPane;
