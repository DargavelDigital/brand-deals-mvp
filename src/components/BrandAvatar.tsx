'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BrandAvatarProps {
  name: string;
  domain?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}

export function BrandAvatar({ 
  name, 
  domain, 
  logoUrl, 
  size = 32, 
  className 
}: BrandAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [clearbitError, setClearbitError] = useState(false);

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate tokenized background color
  const getTokenizedColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Try logoUrl first, then Clearbit, then fallback to initials
  const shouldShowLogo = logoUrl && !imageError;
  const shouldShowClearbit = domain && !clearbitError && !shouldShowLogo;
  const shouldShowInitials = !shouldShowLogo && !shouldShowClearbit;

  const clearbitUrl = domain ? `https://logo.clearbit.com/${domain}?size=${size * 2}` : null;

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-md overflow-hidden",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: shouldShowInitials ? getTokenizedColor(name) : 'transparent'
      }}
    >
      {shouldShowLogo && (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      )}
      
      {shouldShowClearbit && (
        <img
          src={clearbitUrl!}
          alt={`${name} logo`}
          className="w-full h-full object-contain"
          onError={() => setClearbitError(true)}
        />
      )}
      
      {shouldShowInitials && (
        <span 
          className="text-xs font-semibold text-gray-700"
          style={{ fontSize: Math.max(10, size * 0.4) }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
