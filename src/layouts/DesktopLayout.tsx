import React from 'react';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      {children}
    </div>
  );
}
