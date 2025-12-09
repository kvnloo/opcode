import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

interface SecurityScannerPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function SecurityScannerPane({ projectId: _projectId, onBack, className }: SecurityScannerPaneProps) {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(new Date());
  const [vulnerabilities, _setVulnerabilities] = useState<Vulnerability[]>([
    {
      id: '1',
      title: 'SQL Injection vulnerability',
      severity: 'critical',
      description: 'Unsanitized user input in database query',
      file: 'src/api/users.ts',
      line: 45,
      recommendation: 'Use parameterized queries or prepared statements',
    },
    {
      id: '2',
      title: 'Outdated dependency: express@4.17.1',
      severity: 'high',
      description: 'Known security vulnerabilities in this version',
      recommendation: 'Update to express@4.18.2 or later',
    },
    {
      id: '3',
      title: 'Weak password policy',
      severity: 'medium',
      description: 'Password requirements are too permissive',
      file: 'src/auth/password.ts',
      line: 23,
      recommendation: 'Enforce minimum 12 characters with complexity requirements',
    },
  ]);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    if (severity === 'critical' || severity === 'high') {
      return <XCircle className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const scanResults = {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length,
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setLastScan(new Date());
    }, 3000);
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
        <h2 className="text-lg font-semibold">Security Scanner</h2>
        <div className="ml-auto">
          <HapticButton
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleScan}
            disabled={scanning}
            aria-label="Scan now"
          >
            <RefreshCw className={cn('w-4 h-4 mr-1', scanning && 'animate-spin')} />
            {scanning ? 'Scanning...' : 'Scan Now'}
          </HapticButton>
        </div>
      </header>

      {/* Summary */}
      <div className="p-4 bg-muted/50">
        <div className="grid grid-cols-5 gap-2 text-center text-sm">
          <div>
            <div className="text-2xl font-bold">{scanResults.total}</div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{scanResults.critical}</div>
            <div className="text-muted-foreground">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{scanResults.high}</div>
            <div className="text-muted-foreground">High</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{scanResults.medium}</div>
            <div className="text-muted-foreground">Medium</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{scanResults.low}</div>
            <div className="text-muted-foreground">Low</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Last scan: {lastScan.toLocaleString()}
        </div>
      </div>

      {/* Vulnerabilities list */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {vulnerabilities.map((vuln) => (
          <div
            key={vuln.id}
            className={cn(
              'p-4 rounded-lg border-l-4',
              getSeverityColor(vuln.severity)
            )}
          >
            <div className="flex items-start gap-3">
              {getSeverityIcon(vuln.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{vuln.title}</h3>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded uppercase font-semibold',
                    getSeverityColor(vuln.severity)
                  )}>
                    {vuln.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {vuln.description}
                </p>
                {vuln.file && (
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    {vuln.file}:{vuln.line}
                  </p>
                )}
                <div className="text-sm bg-background/50 p-2 rounded">
                  <span className="text-green-400 font-medium">Recommendation:</span>{' '}
                  {vuln.recommendation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {scanResults.total === 0 && !scanning && (
        <div className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
          <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
          <p className="text-sm text-muted-foreground">
            No security vulnerabilities detected
          </p>
        </div>
      )}
    </div>
  );
}

export default SecurityScannerPane;
