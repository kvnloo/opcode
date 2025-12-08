import { useState, useCallback } from 'react';
import { PublishingPane, Deployment } from './PublishingPane';

/**
 * Example usage of PublishingPane component
 *
 * This demonstrates:
 * - Subdomain availability checking with debounced input
 * - Publishing flow with loading states
 * - Success/error toast notifications
 * - Deployment history tracking
 */
export function PublishingPaneExample() {
  const [subdomain, setSubdomain] = useState('my-awesome-app');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'unpublished' | 'publishing' | 'published'>('unpublished');
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      subdomain: 'previous-app',
      status: 'active',
      timestamp: new Date(Date.now() - 86400000),
      url: 'https://previous-app.opcode.app',
    },
  ]);

  // Simulate subdomain availability check
  const handleSubdomainChange = useCallback((value: string) => {
    setSubdomain(value);
    setIsChecking(true);

    // Simulate API call
    setTimeout(() => {
      // Mock: subdomains containing 'taken' are unavailable
      setIsAvailable(!value.includes('taken'));
      setIsChecking(false);
    }, 1000);
  }, []);

  // Simulate publishing
  const handlePublish = useCallback(() => {
    setPublishStatus('publishing');

    // Simulate deployment
    setTimeout(() => {
      setPublishStatus('published');

      // Add to deployment history
      const newDeployment: Deployment = {
        id: Date.now().toString(),
        subdomain,
        status: 'active',
        timestamp: new Date(),
        url: `https://${subdomain}.opcode.app`,
      };

      setDeployments([newDeployment, ...deployments]);

      // Show success toast
      handleShowToast?.('App published successfully!', 'success');
    }, 2000);
  }, [subdomain, deployments]);

  const handleShowToast = useCallback((message: string, type: 'success' | 'error') => {
    console.log(`[${type.toUpperCase()}]`, message);
    // In a real app, this would trigger a toast notification
  }, []);

  const handleBack = useCallback(() => {
    console.log('Back button clicked');
  }, []);

  return (
    <div className="h-screen bg-background">
      <PublishingPane
        subdomain={subdomain}
        onSubdomainChange={handleSubdomainChange}
        isAvailable={isAvailable}
        isChecking={isChecking}
        publishStatus={publishStatus}
        onPublish={handlePublish}
        onBack={handleBack}
        deploymentHistory={deployments}
        onShowToast={handleShowToast}
        suffix=".opcode.app"
      />
    </div>
  );
}

/**
 * Example with custom domain suffix (e.g., for Replit)
 */
export function PublishingPaneReplitExample() {
  const [subdomain, setSubdomain] = useState('hex-conquest--veeman961');
  const [isAvailable] = useState(true);
  const [isChecking] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'unpublished' | 'publishing' | 'published'>('unpublished');

  const handleSubdomainChange = useCallback((value: string) => {
    setSubdomain(value);
  }, []);

  const handlePublish = useCallback(() => {
    setPublishStatus('publishing');
    setTimeout(() => {
      setPublishStatus('published');
    }, 2000);
  }, []);

  return (
    <div className="h-screen bg-background">
      <PublishingPane
        subdomain={subdomain}
        onSubdomainChange={handleSubdomainChange}
        isAvailable={isAvailable}
        isChecking={isChecking}
        publishStatus={publishStatus}
        onPublish={handlePublish}
        suffix=".replit.app"
      />
    </div>
  );
}
