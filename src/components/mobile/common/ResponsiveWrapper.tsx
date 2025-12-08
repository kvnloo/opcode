import React from 'react';
import { usePlatform } from '@/hooks/mobile/usePlatform';

interface ResponsiveWrapperProps {
  mobile: React.ReactNode;
  tablet?: React.ReactNode;
  desktop: React.ReactNode;
}

export function ResponsiveWrapper({ mobile, tablet, desktop }: ResponsiveWrapperProps) {
  const platform = usePlatform();

  switch (platform) {
    case 'mobile':
      return <>{mobile}</>;
    case 'tablet':
      return <>{tablet || mobile}</>;
    case 'desktop':
    default:
      return <>{desktop}</>;
  }
}
