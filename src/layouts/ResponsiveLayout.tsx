import React from 'react';
import { useIsMobile } from '@/hooks/mobile/usePlatform';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout, MobilePane } from './MobileLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  desktopChildren?: React.ReactNode;
  mobileChildren?: React.ReactNode;
  activePane?: MobilePane;
  onPaneChange?: (pane: MobilePane) => void;
}

export function ResponsiveLayout({
  children,
  desktopChildren,
  mobileChildren,
  activePane,
  onPaneChange
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout activePane={activePane} onPaneChange={onPaneChange}>
        {mobileChildren || children}
      </MobileLayout>
    );
  }

  return (
    <DesktopLayout>
      {desktopChildren || children}
    </DesktopLayout>
  );
}
