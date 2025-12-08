import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  Camera,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DeviceFrame = 'iphone' | 'android' | 'tablet' | 'desktop' | 'none';

interface PreviewWebViewProps {
  url: string;
  onClose: () => void;
  className?: string;
}

interface ConsoleLog {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export function PreviewWebView({ url, onClose, className }: PreviewWebViewProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [inputUrl, setInputUrl] = useState(url);
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('iphone');
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleNavigate = () => {
    setCurrentUrl(inputUrl);
    setIsLoading(true);
  };

  const handleScreenshot = async () => {
    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // In a real implementation, you would capture the iframe content
    // For now, we'll just show a notification
    alert('Screenshot captured! (Implementation pending)');
  };

  const handleOpenExternal = () => {
    window.open(currentUrl, '_blank');
  };

  useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  // Simulate console logs for demo
  useEffect(() => {
    const demoLogs: ConsoleLog[] = [
      { type: 'info', message: 'Preview started', timestamp: Date.now() },
      { type: 'log', message: `Loading ${currentUrl}`, timestamp: Date.now() + 100 }
    ];
    setConsoleLogs(demoLogs);
  }, [currentUrl]);

  const getDeviceFrameDimensions = () => {
    switch (deviceFrame) {
      case 'iphone':
        return { width: '375px', height: '667px', scale: 0.8 };
      case 'android':
        return { width: '360px', height: '640px', scale: 0.8 };
      case 'tablet':
        return { width: '768px', height: '1024px', scale: 0.6 };
      case 'desktop':
        return { width: '1280px', height: '720px', scale: 0.5 };
      default:
        return { width: '100%', height: '100%', scale: 1 };
    }
  };

  const dimensions = getDeviceFrameDimensions();

  const deviceButtons: Array<{ frame: DeviceFrame; icon: React.ReactNode; label: string }> = [
    { frame: 'iphone', icon: <Smartphone size={16} />, label: 'iPhone' },
    { frame: 'android', icon: <Smartphone size={16} />, label: 'Android' },
    { frame: 'tablet', icon: <Tablet size={16} />, label: 'Tablet' },
    { frame: 'desktop', icon: <Monitor size={16} />, label: 'Desktop' }
  ];

  const getConsoleLogColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('fixed inset-0 z-50 bg-background flex flex-col', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-card">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          aria-label="Close preview"
        >
          <X size={20} />
        </button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder="Enter URL..."
          />
          <button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-background transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Device Frame Selector */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-1">
          {deviceButtons.map(({ frame, icon, label }) => (
            <button
              key={frame}
              onClick={() => setDeviceFrame(frame)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                deviceFrame === frame
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              )}
              aria-label={label}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScreenshot}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
            aria-label="Take screenshot"
          >
            <Camera size={18} />
          </button>
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showConsole ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
            )}
            aria-label="Toggle console"
          >
            <Terminal size={18} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
            aria-label="Open in new window"
          >
            <ExternalLink size={18} />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
        <motion.div
          key={deviceFrame}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'bg-white shadow-2xl overflow-hidden',
            deviceFrame === 'iphone' && 'rounded-[3rem]',
            deviceFrame === 'android' && 'rounded-lg',
            deviceFrame === 'tablet' && 'rounded-xl',
            deviceFrame === 'desktop' && 'rounded-lg',
            deviceFrame === 'none' && 'w-full h-full'
          )}
          style={{
            width: deviceFrame === 'none' ? '100%' : dimensions.width,
            height: deviceFrame === 'none' ? '100%' : dimensions.height
          }}
        >
          {/* Device Notch for iPhone */}
          {deviceFrame === 'iphone' && (
            <div className="h-8 bg-black flex items-center justify-center">
              <div className="w-32 h-5 bg-black rounded-b-2xl" />
            </div>
          )}

          {/* WebView */}
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </motion.div>
      </div>

      {/* Console Viewer */}
      <AnimatePresence>
        {showConsole && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '200px' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border bg-card overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                <h4 className="text-sm font-semibold">Console</h4>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2 space-y-1 font-mono text-xs">
                {consoleLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No console logs</p>
                ) : (
                  consoleLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 px-2 py-1 hover:bg-muted/50 rounded">
                      <span className={cn('font-semibold', getConsoleLogColor(log.type))}>
                        [{log.type}]
                      </span>
                      <span className="flex-1 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
