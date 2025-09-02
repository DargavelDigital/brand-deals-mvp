import React from 'react';
import { MediaPackData } from '@/lib/mediaPack/types';
import MPTracking from './MPTracking';

interface MPBaseProps {
  data: MediaPackData;
  children: React.ReactNode;
  isPublic?: boolean;
  mpId?: string;
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

export default function MPBase({ data, children, isPublic = false, mpId }: MPBaseProps) {
  const theme = data.theme || { variant: 'classic', dark: false };
  
  // Apply theme tokens
  const themeClass = theme.dark ? 'dark' : '';
  const brandColor = theme.brandColor || '#3b82f6';
  
  console.log('MPBase rendering with theme:', { themeClass, brandColor, theme });
  
  return (
    <div 
      className={`min-h-screen ${themeClass}`}
      style={{
        backgroundColor: theme.dark ? '#0b0c0f' : '#ffffff',
        color: theme.dark ? '#f5f6f7' : '#0b0b0c',
        '--brand-600': brandColor,
        '--bg': theme.dark ? '#0b0c0f' : '#ffffff',
        '--fg': theme.dark ? '#f5f6f7' : '#0b0b0c',
        '--surface': theme.dark ? '#121419' : '#f7f7f8',
        '--card': theme.dark ? '#121419' : '#ffffff',
        '--border': theme.dark ? '#2a2f39' : '#e6e7ea',
        '--muted-fg': theme.dark ? '#a6adbb' : '#666a71',
      } as React.CSSProperties}
    >
      {isPublic && mpId && <MPTracking mpId={mpId} isPublic={isPublic} />}
      {children}
    </div>
  );
}
