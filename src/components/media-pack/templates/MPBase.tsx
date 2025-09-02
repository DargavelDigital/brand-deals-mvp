import React from 'react';
import { MediaPackData } from '@/lib/mediaPack/types';

interface MPBaseProps {
  data: MediaPackData;
  children: React.ReactNode;
}

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export function Page({ children, className = '' }: PageProps) {
  return (
    <div className={`max-w-4xl mx-auto px-6 py-12 ${className}`}>
      {children}
    </div>
  );
}

export default function MPBase({ data, children }: MPBaseProps) {
  const theme = data.theme || { variant: 'classic', dark: false };
  
  // Apply theme tokens
  const themeClass = theme.dark ? 'dark' : '';
  const brandColor = theme.brandColor || 'var(--brand-600)';
  
  return (
    <div 
      className={`min-h-screen bg-[var(--bg)] text-[var(--fg)] ${themeClass}`}
      style={{
        '--brand-600': brandColor,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
