'use client';

import BrandLogo from '@/components/media/BrandLogo';

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
  return (
    <BrandLogo 
      name={name}
      domain={domain || logoUrl}
      size={size}
      className={className}
    />
  );
}
