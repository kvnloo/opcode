import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Monitor,
  Smartphone,
  
  ChevronRight,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DeviceFrame = 'iphone' | 'android' | 'desktop';

export interface PreviewPaneProps {
  previewUrl: string;
  onUrlChange: (url: string) => void;
  onPublish: () => void;
  deviceFrame?: DeviceFrame;
  onDeviceChange?: (device: DeviceFrame) => void;
  className?: string;
}

export function PreviewPane({
  previewUrl,
  onUrlChange,
  onPublish,
  deviceFrame: initialDeviceFrame = 'iphone',
  onDeviceChange,
  className
}: PreviewPaneProps) {
  const [currentUrl, setCurrentUrl] = useState(previewUrl);
  const [inputUrl, setInputUrl] = useState('/');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>(initialDeviceFrame);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack] = useState(false);
  const [canGoForward] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update device frame
  const handleDeviceChange = (device: DeviceFrame) => {
    setDeviceFrame(device);
    onDeviceChange?.(device);
  };

  // Cycle through device frames
  const cycleDeviceFrame = () => {
    const frames: DeviceFrame[] = ['iphone', 'android', 'desktop'];
    const currentIndex = frames.indexOf(deviceFrame);
    const nextIndex = (currentIndex + 1) % frames.length;
    handleDeviceChange(frames[nextIndex]);
  };

  // Navigation handlers
  const handleBack = () => {
    // In a real implementation, this would use iframe history
    // For now, we'll just trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleForward = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleNavigate = () => {
    const fullUrl = inputUrl.startsWith('/') || inputUrl.startsWith('http')
      ? inputUrl
      : `/${inputUrl}`;

    setCurrentUrl(previewUrl + fullUrl);
    onUrlChange(fullUrl);
    setIsLoading(true);
  };

  const handleOpenExternal = async () => {
    // Use Tauri shell.open for external browser
    try {
      // @ts-ignore - Tauri API
      if (window.__TAURI__) {
        // @ts-expect-error - Dynamic import for Tauri shell
        const { open } = await import('@tauri-apps/api/shell');
        await open(currentUrl);
      } else {
        window.open(currentUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to open external browser:', error);
      window.open(currentUrl, '_blank');
    }
  };

  useEffect(() => {
    setCurrentUrl(previewUrl);
  }, [previewUrl]);

  const getDeviceFrameDimensions = () => {
    switch (deviceFrame) {
      case 'iphone':
        return { width: '375px', height: '667px', label: 'iPhone' };
      case 'android':
        return { width: '360px', height: '640px', label: 'Android' };
      case 'desktop':
        return { width: '100%', height: '100%', label: 'Desktop' };
    }
  };

  const dimensions = getDeviceFrameDimensions();

  const getDeviceIcon = () => {
    switch (deviceFrame) {
      case 'iphone':
        return <Smartphone size={16} />;
      case 'android':
        return <Smartphone size={16} />;
      case 'desktop':
        return <Monitor size={16} />;
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        {/* Publish Button */}
        <button
          onClick={onPublish}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload size={16} />
          Publish
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Monitor size={18} className="text-muted-foreground" />
          <span>Preview</span>
        </div>

        {/* Device Frame Toggle */}
        <button
          onClick={cycleDeviceFrame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          aria-label={`Current: ${dimensions.label}. Click to change`}
        >
          {getDeviceIcon()}
          <span className="hidden sm:inline">{dimensions.label}</span>
        </button>
      </div>

      {/* Browser Controls Bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/50">
        {/* Back Button */}
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className={cn(
            'p-2 rounded-lg transition-colors',
            canGoBack
              ? 'hover:bg-muted text-foreground'
              : 'text-muted-foreground/50 cursor-not-allowed'
          )}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Forward Button */}
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className={cn(
            'p-2 rounded-lg transition-colors',
            canGoForward
              ? 'hover:bg-muted text-foreground'
              : 'text-muted-foreground/50 cursor-not-allowed'
          )}
          aria-label="Go forward"
        >
          <ArrowRight size={18} />
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw size={18} className={cn(isLoading && 'animate-spin')} />
        </button>

        {/* URL Input Field */}
        <div className="flex-1 flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder="/"
          />
          <button
            onClick={handleNavigate}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Navigate to URL"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Open in Browser Link */}
        <button
          onClick={handleOpenExternal}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open in external browser"
        >
          <ExternalLink size={18} />
        </button>
      </div>

      {/* Main Preview Content */}
      <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={deviceFrame}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'bg-white shadow-2xl overflow-hidden relative',
              deviceFrame === 'iphone' && 'rounded-[3rem]',
              deviceFrame === 'android' && 'rounded-lg',
              deviceFrame === 'desktop' && 'rounded-none w-full h-full'
            )}
            style={{
              width: deviceFrame === 'desktop' ? '100%' : dimensions.width,
              height: deviceFrame === 'desktop' ? '100%' : dimensions.height
            }}
          >
            {/* iPhone Notch */}
            {deviceFrame === 'iphone' && (
              <div className="absolute top-0 left-0 right-0 h-8 bg-black flex items-center justify-center z-10">
                <div className="w-32 h-5 bg-black rounded-b-2xl" />
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-lg">
                  <RefreshCw size={16} className="animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              </div>
            )}

            {/* WebView/iframe */}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className={cn(
                'w-full h-full border-0',
                deviceFrame === 'iphone' && 'pt-8'
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
