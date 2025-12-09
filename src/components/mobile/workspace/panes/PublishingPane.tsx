import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Radio,
  MoreVertical,
  Check,
  X,
  Star,
  Link2,
  DollarSign,
  
  ChevronRight,
  ChevronDown,
  Globe,
  PlayCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Deployment {
  id: string;
  subdomain: string;
  status: 'active' | 'building' | 'failed';
  timestamp: Date;
  url: string;
}

export interface PublishingPaneProps {
  subdomain: string;
  onSubdomainChange: (value: string) => void;
  isAvailable: boolean;
  isChecking: boolean;
  publishStatus: 'unpublished' | 'publishing' | 'published';
  onPublish: () => void;
  onBack?: () => void;
  deploymentHistory?: Deployment[];
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  suffix?: string; // Default: ".opcode.app"
}

export function PublishingPane({
  subdomain,
  onSubdomainChange,
  isAvailable,
  isChecking,
  publishStatus,
  onPublish,
  onBack,
  deploymentHistory = [],
  
  suffix = '.opcode.app',
}: PublishingPaneProps) {
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [_debouncedSubdomain, setDebouncedSubdomain] = useState(subdomain);

  // Debounce subdomain changes for availability checking
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSubdomain(subdomain);
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain]);

  const handleSubdomainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      onSubdomainChange(value);
    },
    [onSubdomainChange]
  );

  const handlePublish = useCallback(() => {
    if (!isAvailable || !subdomain.trim() || publishStatus === 'publishing') {
      return;
    }
    onPublish();
  }, [isAvailable, subdomain, publishStatus, onPublish]);

  const canPublish = isAvailable && subdomain.trim().length > 0 && publishStatus !== 'publishing';

  return (
    <div data-testid="pane-publishing" className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Publishing</h1>
          </div>
        </div>
        <button
          className="p-2 -mr-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-6">
          {/* Main Heading */}
          <div>
            <h2 className="text-2xl font-bold mb-1">Publish your app</h2>
            <p className="text-sm text-muted-foreground">
              Make your application available to the world
            </p>
          </div>

          {/* Primary URL Section */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Primary URL</label>
              <p className="text-xs text-muted-foreground mb-3">
                You can add your own custom domain after publishing
              </p>
            </div>

            {/* URL Input Row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center border border-input rounded-md overflow-hidden bg-background">
                <Input
                  type="text"
                  value={subdomain}
                  onChange={handleSubdomainChange}
                  placeholder="my-awesome-app"
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 px-3"
                  disabled={publishStatus === 'publishing'}
                />
                <span className="px-3 py-2 text-sm text-muted-foreground border-l border-input bg-muted/30">
                  {suffix}
                </span>
              </div>
            </div>

            {/* Availability Indicator */}
            {subdomain.trim() && (
              <div className="flex items-center gap-2 text-sm">
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Checking availability...</span>
                  </>
                ) : isAvailable ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">Available</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-destructive" />
                    <span className="text-destructive font-medium">
                      This subdomain is already taken
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Upgrade Promo Card */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Limited time offer: Free '.com' domain
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to get a professional domain and unlock premium features
                  </p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Free '.com' domain up to $13</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Monthly credits for Opcode Agent</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Radio className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Publish and persist live apps</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Access powerful models and more</span>
                </div>
              </div>

              {/* Badge */}
              <div className="inline-block px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-xs font-medium text-primary">Free domain included</span>
              </div>

              {/* CTA Button */}
              <Button className="w-full bg-primary hover:bg-primary/90">Upgrade now</Button>
            </CardContent>
          </Card>

          {/* Publish Button */}
          {publishStatus !== 'published' && (
            <Button
              onClick={handlePublish}
              disabled={!canPublish}
              className="w-full"
              size="lg"
            >
              {publishStatus === 'publishing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 mr-2" />
                  Publish app
                </>
              )}
            </Button>
          )}

          {/* Published Status */}
          {publishStatus === 'published' && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-500">App published successfully!</span>
                </div>
                <a
                  href={`https://${subdomain}${suffix}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  {subdomain}
                  {suffix}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          )}

          {/* Info Section (Expandable) */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setInfoExpanded(!infoExpanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
            >
              <span className="font-medium">What does publishing do?</span>
              {infoExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {infoExpanded && (
              <div className="px-4 pb-4 pt-2 space-y-4 border-t border-border">
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-1">
                      Publishing your app makes it available to anyone on the internet. Your app
                      will be hosted on a secure, fast, and reliable infrastructure.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-1">
                      Costs are included in Core subscriptions. Free users get limited monthly
                      publishing quotas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Watch video
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Learn more
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Deployment History */}
          {deploymentHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Recent Deployments</h3>
              <div className="space-y-2">
                {deploymentHistory.slice(0, 5).map((deployment) => (
                  <Card key={deployment.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            deployment.status === 'active' && 'bg-green-500',
                            deployment.status === 'building' && 'bg-yellow-500 animate-pulse',
                            deployment.status === 'failed' && 'bg-destructive'
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{deployment.subdomain}</p>
                          <p className="text-xs text-muted-foreground">
                            {deployment.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {deployment.status === 'active' && (
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
