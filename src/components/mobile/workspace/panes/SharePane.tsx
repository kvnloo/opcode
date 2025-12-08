import { useState, useCallback } from 'react';
import { Share2, Copy, Users, Code, QrCode, Send, X, Check } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { cn } from '@/lib/utils';

export interface Collaborator {
  id: string;
  email: string;
  name?: string;
  permission: 'view' | 'edit' | 'admin';
  avatarUrl?: string;
  joinedAt: Date;
}

export interface SharePaneProps {
  projectUrl: string;
  projectName: string;
  collaborators: Collaborator[];
  onInvite: (email: string, permission: 'view' | 'edit' | 'admin') => void;
  onShare: (platform: 'twitter' | 'linkedin' | 'system') => void;
  onCopyLink: () => void;
  onRemoveCollaborator?: (id: string) => void;
  onUpdatePermission?: (id: string, permission: 'view' | 'edit' | 'admin') => void;
}

type EmbedSize = 'small' | 'medium' | 'large';

const EMBED_SIZES = {
  small: { width: 400, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 },
};

export function SharePane({
  projectUrl,
  projectName,
  collaborators,
  onInvite,
  onShare,
  onCopyLink,
  onRemoveCollaborator,
  onUpdatePermission,
}: SharePaneProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<'view' | 'edit' | 'admin'>('edit');
  const [embedSize, setEmbedSize] = useState<EmbedSize>('medium');
  const [showQrCode, setShowQrCode] = useState(false);
  const [copiedState, setCopiedState] = useState<{
    link: boolean;
    embed: boolean;
  }>({ link: false, embed: false });

  // Generate embed code
  const embedCode = `<iframe src="${projectUrl}" width="${EMBED_SIZES[embedSize].width}" height="${EMBED_SIZES[embedSize].height}" frameborder="0"></iframe>`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(projectUrl);
    onCopyLink();
    setCopiedState(prev => ({ ...prev, link: true }));
    setTimeout(() => setCopiedState(prev => ({ ...prev, link: false })), 2000);
  }, [projectUrl, onCopyLink]);

  const handleCopyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode);
    setCopiedState(prev => ({ ...prev, embed: true }));
    setTimeout(() => setCopiedState(prev => ({ ...prev, embed: false })), 2000);
  }, [embedCode]);

  const handleSystemShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: projectName,
          text: `Check out my project: ${projectName}`,
          url: projectUrl,
        });
        onShare('system');
      } catch (err) {
        // User cancelled or share failed
        console.error('Share failed:', err);
      }
    }
  }, [projectName, projectUrl, onShare]);

  const handleInvite = useCallback(() => {
    if (inviteEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      onInvite(inviteEmail, invitePermission);
      setInviteEmail('');
    }
  }, [inviteEmail, invitePermission, onInvite]);

  const handleSocialShare = useCallback((platform: 'twitter' | 'linkedin') => {
    const encodedUrl = encodeURIComponent(projectUrl);
    const encodedText = encodeURIComponent(`Check out my project: ${projectName}`);

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      onShare(platform);
    }
  }, [projectUrl, projectName, onShare]);

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Share</h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Share Link Section */}
        <section>
          <h3 className="text-sm font-semibold mb-3">Share your app</h3>

          {/* Link Preview Card */}
          <div className="bg-muted rounded-lg p-3 mb-3">
            <p className="text-xs text-muted-foreground mb-1">Project URL</p>
            <p className="text-sm font-mono truncate">{projectUrl}</p>
          </div>

          <div className="flex gap-2">
            <HapticButton
              onClick={handleCopyLink}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              hapticType="light"
            >
              {copiedState.link ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </HapticButton>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <HapticButton
                onClick={handleSystemShare}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                hapticType="light"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </HapticButton>
            )}
          </div>
        </section>

        {/* Collaboration Section */}
        <section>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Invite collaborators
          </h3>

          <div className="space-y-3">
            {/* Invite Form */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 bg-background rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex gap-2">
                <select
                  value={invitePermission}
                  onChange={(e) => setInvitePermission(e.target.value as 'view' | 'edit' | 'admin')}
                  className="flex-1 px-3 py-2 bg-background rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="view">View Only</option>
                  <option value="edit">Can Edit</option>
                  <option value="admin">Admin</option>
                </select>

                <HapticButton
                  onClick={handleInvite}
                  disabled={!inviteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  hapticType="medium"
                >
                  <Send className="w-4 h-4" />
                </HapticButton>
              </div>
            </div>

            {/* Current Collaborators */}
            {collaborators.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
                </p>
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                      {collab.name?.[0] || collab.email[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {collab.name || collab.email}
                      </p>
                      {collab.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {collab.email}
                        </p>
                      )}
                    </div>

                    {/* Permission */}
                    <select
                      value={collab.permission}
                      onChange={(e) => onUpdatePermission?.(collab.id, e.target.value as any)}
                      className="px-2 py-1 bg-background rounded text-xs border"
                      disabled={!onUpdatePermission}
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Remove */}
                    {onRemoveCollaborator && (
                      <button
                        onClick={() => onRemoveCollaborator(collab.id)}
                        className="p-1 hover:bg-destructive/10 rounded"
                        aria-label="Remove collaborator"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Embed Options */}
        <section>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Embed
          </h3>

          <div className="space-y-3">
            {/* Size Options */}
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as EmbedSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setEmbedSize(size)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    embedSize === size
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>

            {/* Embed Code Preview */}
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">
                {EMBED_SIZES[embedSize].width} × {EMBED_SIZES[embedSize].height}
              </p>
              <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
            </div>

            <HapticButton
              onClick={handleCopyEmbed}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              hapticType="light"
            >
              {copiedState.embed ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Embed Code
                </>
              )}
            </HapticButton>
          </div>
        </section>

        {/* Social Sharing */}
        <section>
          <h3 className="text-sm font-semibold mb-3">Share on social</h3>

          <div className="grid grid-cols-2 gap-2">
            <HapticButton
              onClick={() => handleSocialShare('twitter')}
              className="bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90"
              hapticType="light"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter/X
            </HapticButton>

            <HapticButton
              onClick={() => handleSocialShare('linkedin')}
              className="bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
              hapticType="light"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </HapticButton>

            <HapticButton
              onClick={handleCopyLink}
              className="bg-muted text-foreground hover:bg-muted/80"
              hapticType="light"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </HapticButton>

            <HapticButton
              onClick={() => setShowQrCode(!showQrCode)}
              className="bg-muted text-foreground hover:bg-muted/80"
              hapticType="light"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </HapticButton>
          </div>

          {/* QR Code Display */}
          {showQrCode && (
            <div className="mt-4 p-4 bg-white rounded-lg text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-lg">
                <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                  <QrCode className="w-full h-full" strokeWidth={0.5} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan to open project
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
